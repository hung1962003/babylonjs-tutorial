import {
  AbstractMesh,
  Color3,
  MeshBuilder,
  PointerEventTypes,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

/** When true, `reconstructionScene` skips LMB orbit drag so LMB can place models. */
export const PLACEMENT_BLOCKS_LMB_CAMERA_DRAG_KEY =
  "__reconPlacementBlocksLmbCameraDrag";

export const RECONSTRUCTION_PLACEMENT_METADATA_KEY =
  "reconstructionPlacement";

const DEFAULT_PLACEMENT_SCALE = 1;

const PREVIEW_COLOR = new Color3(0.55, 0.85, 1);
const CONTAINER_COLOR = new Color3(0.35, 1, 0.5);
const BLOCKED_COLOR = new Color3(1, 0.25, 0.2);
const PREVIEW_ALPHA = 0.32;

/** XZ inset so pointer must be clearly inside a parent container AABB. */
const CONTAINER_XZ_MARGIN = 0.05;

/**
 * @typedef {import('@babylonjs/core').Mesh} Mesh
 * @typedef {import('@babylonjs/core').Scene} Scene
 * @typedef {import('@babylonjs/core').TransformNode} TransformNode
 *
 * @typedef {Object} ReconstructionPlacementApi
 * @property {(modelName: string) => void} startPlacing
 * @property {() => void} stopPlacing
 * @property {() => boolean} isPlacing
 * @property {() => void} dispose
 */

/** Serializable snapshot of a placed root for React UI (segment panel, etc.). */
/**
 * @typedef {Object} PlacedModelInfo
 * @property {number} uniqueId
 * @property {string} modelName
 * @property {string} role
 * @property {number|null} parentContainerId
 * @property {string|null} parentContainerName
 */

/**
 * @param {TransformNode} placed
 * @returns {PlacedModelInfo}
 */
export function buildPlacedModelInfo(placed) {
  const m = placed.metadata ?? {};
  return {
    uniqueId: placed.uniqueId,
    modelName: typeof m.modelName === "string" ? m.modelName : placed.name,
    role: typeof m.role === "string" ? m.role : "",
    parentContainerId:
      typeof m.parentContainerId === "number" ? m.parentContainerId : null,
    parentContainerName:
      typeof m.parentContainerName === "string" ? m.parentContainerName : null,
  };
}

/**
 * @typedef {Object} CreateReconstructionPlacementControllerArgs
 * @property {Scene} scene
 * @property {HTMLCanvasElement} canvas
 * @property {AbstractMesh} floorMesh
 * @property {(name: string) => (TransformNode|null)} getPrototype
 * @property {Map<string, Vector3>} modelSizeByName
 * @property {Map<string, number>} modelScaleByName
 * @property {Map<string, number>} modelYOffsetByName
 * @property {Map<string, string>} modelRoleByName
 * @property {(placed: TransformNode, modelName: string) => void=} onPlaced
 */

/**
 * @param {AbstractMesh} floor
 * @returns {number}
 */
function getFloorSurfaceWorldY(floor) {
  floor.computeWorldMatrix(true);
  const bi = floor.getBoundingInfo();
  return bi.boundingBox.maximumWorld.y;
}

/**
 * @param {TransformNode} root
 * @returns {number|null}
 */
function getRenderableMinimumWorldY(root) {
  const meshes = root
    .getChildMeshes(false)
    .filter((m) => m.isEnabled() && m.getTotalVertices() > 0);
  if (
    meshes.length === 0 &&
    root instanceof AbstractMesh &&
    root.isEnabled() &&
    root.getTotalVertices() > 0
  ) {
    meshes.push(root);
  }
  if (meshes.length === 0) return null;

  let minY = Number.POSITIVE_INFINITY;
  for (const m of meshes) {
    m.computeWorldMatrix(true);
    const y = m.getBoundingInfo().boundingBox.minimumWorld.y;
    if (y < minY) minY = y;
  }
  return Number.isFinite(minY) ? minY : null;
}

/**
 * @param {CreateReconstructionPlacementControllerArgs} args
 * @returns {ReconstructionPlacementApi}
 */
export function createReconstructionPlacementController({
  scene,
  canvas,
  floorMesh,
  getPrototype,
  modelSizeByName,
  modelScaleByName,
  modelYOffsetByName,
  modelRoleByName,
  onPlaced,
}) {
  let isPlacing = false;
  /** @type {string|null} */
  let placingName = null;
  let rotationSteps = 0;
  /** @type {{x:number, z:number} | null} */
  let lastSnapped = null;
  /** @type {TransformNode | null} */
  let containerTarget = null;
  let canPlace = true;

  /** @type {TransformNode[]} */
  const placedRoots = [];

  const setPreviewColor = (color) => {
    if (!boxMat) return;
    boxMat.diffuseColor.copyFrom(color);
    boxMat.emissiveColor.copyFrom(color);
  };

  /** Smallest-area parent root whose XZ footprint contains the point. */
  const findContainerAtPoint = (
    worldX,
    worldZ,
  ) => {
    /** @type {TransformNode | null} */
    let best = null;
    let bestArea = Infinity;

    for (const root of placedRoots) {
      if (root.metadata?.role !== "parent") continue;

      root.computeWorldMatrix(true);
      const { min, max } = root.getHierarchyBoundingVectors(true);
      if (
        worldX > min.x + CONTAINER_XZ_MARGIN &&
        worldX < max.x - CONTAINER_XZ_MARGIN &&
        worldZ > min.z + CONTAINER_XZ_MARGIN &&
        worldZ < max.z - CONTAINER_XZ_MARGIN
      ) {
        const area = (max.x - min.x) * (max.z - min.z);
        if (area < bestArea) {
          bestArea = area;
          best = root;
        }
      }
    }
    return best;
  };

  /** Half-extents on XZ for a unit box scaled by `size` and rotated by k·90° around Y. */
  const getPreviewHalfExtentsXZ = (size, rotationSteps) => {
    const q = ((rotationSteps % 4) + 4) % 4;
    if (q === 0 || q === 2) {
      return { hx: size.x / 2, hz: size.z / 2 };
    }
    return { hx: size.z / 2, hz: size.x / 2 };
  };

  const aabbsOverlapXZ = (
    minAx,
    maxAx,
    minAz,
    maxAz,
    minBx,
    maxBx,
    minBz,
    maxBz,
  ) =>
    minAx < maxBx && maxAx > minBx && minAz < maxBz && maxAz > minBz;

  /**
   * True if the placing preview's XZ footprint (center + size + Y rotation) intersects
   * any placed child hierarchy AABB. Point-only checks miss partial overlaps when the
   * pointer stays outside the obstacle's bounds.
   */
  const doesPreviewOverlapAnyPlacedChild = (
    centerX,
    centerZ,
    previewSize,
    previewRotationSteps,
  ) => {
    const { hx, hz } = getPreviewHalfExtentsXZ(
      previewSize,
      previewRotationSteps,
    );
    const pMinX = centerX - hx;
    const pMaxX = centerX + hx;
    const pMinZ = centerZ - hz;
    const pMaxZ = centerZ + hz;

    for (const root of placedRoots) {
      if (root.metadata?.role !== "child") continue;

      root.computeWorldMatrix(true);
      const { min, max } = root.getHierarchyBoundingVectors(true);

      if (
        aabbsOverlapXZ(pMinX, pMaxX, pMinZ, pMaxZ, min.x, max.x, min.z, max.z)
      ) {
        return true;
      }
    }
    return false;
  };

  /** @type {Mesh | null} */
  let box = null;
  /** @type {StandardMaterial | null} */
  let boxMat = null;

  const pickFloorOnly = (mesh) =>
    !!mesh && mesh === floorMesh;

  const ensurePreviewBox = () => {
    if (box) return;
    box = MeshBuilder.CreateBox("recon.placementPreview", { size: 1 }, scene);
    box.isPickable = false;
    box.renderingGroupId = 1;
    boxMat = new StandardMaterial("recon.placementPreviewMat", scene);
    boxMat.diffuseColor = PREVIEW_COLOR.clone();
    boxMat.emissiveColor = PREVIEW_COLOR.clone();
    boxMat.alpha = PREVIEW_ALPHA;
    boxMat.backFaceCulling = false;
    box.material = boxMat;
    box.setEnabled(false);
  };

  const resizePreviewToModel = (name) => {
    ensurePreviewBox();
    const size = modelSizeByName.get(name);
    if (!box || !size) return;
    box.scaling.copyFrom(size);
  };

  const setPlacementDragBlock = (blocked) => {
    scene.metadata = {
      ...(scene.metadata ?? {}),
      [PLACEMENT_BLOCKS_LMB_CAMERA_DRAG_KEY]: blocked,
    };
  };

  const refreshPreviewFromPointer = () => {
    if (!isPlacing || !placingName || !box) return;

    const pick = scene.pick(scene.pointerX, scene.pointerY, pickFloorOnly);

    if (!pick?.hit || !pick.pickedPoint) {
      box.setEnabled(false);
      lastSnapped = null;
      containerTarget = null;
      canPlace = false;
      return;
    }

    const size = modelSizeByName.get(placingName);
    const halfY = size ? size.y / 2 : 0.5;
    const floorTop = getFloorSurfaceWorldY(floorMesh);

    lastSnapped = {
      x: pick.pickedPoint.x,
      z: pick.pickedPoint.z,
    };

    containerTarget = findContainerAtPoint(lastSnapped.x, lastSnapped.z);

    const placingRole = modelRoleByName.get(placingName) ?? "";
    const isChild = placingRole === "child";
    const previewSize = size ?? new Vector3(1, 1, 1);
    const overlapsChild =
      isChild &&
      doesPreviewOverlapAnyPlacedChild(
        lastSnapped.x,
        lastSnapped.z,
        previewSize,
        rotationSteps,
      );

    if (overlapsChild) {
      canPlace = false;
      setPreviewColor(BLOCKED_COLOR);
    } else if (containerTarget) {
      canPlace = true;
      setPreviewColor(CONTAINER_COLOR);
    } else {
      canPlace = true;
      setPreviewColor(PREVIEW_COLOR);
    }

    box.position.x = lastSnapped.x;
    box.position.z = lastSnapped.z;
    box.position.y = floorTop + halfY;
    box.rotation.y = rotationSteps * (Math.PI / 2);
    box.setEnabled(true);
  };

  const pointerObserver = scene.onPointerObservable.add((pi) => {
    if (!isPlacing) return;
    if (pi.type === PointerEventTypes.POINTERMOVE) {
      refreshPreviewFromPointer();
    }
  });

  const onCanvasPointerDown = (e) => {
    if (!isPlacing) return;
    if (e.button === 2) {
      e.preventDefault();
      stopPlacing();
      return;
    }
    if (e.button !== 0) return;
    refreshPreviewFromPointer();
    if (!lastSnapped || !placingName) return;
    if (!canPlace) return;

    const proto = getPrototype(placingName);
    if (!proto) {
      console.warn(
        `[Placement] No prototype for "${placingName}" (catalog still loading?)`,
      );
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    /** @type {TransformNode | null} */
    let placed = null;
    try {
      placed = proto.instantiateHierarchy(null, undefined, (source, clone) => {
        clone.name = `placed_${source.name}_${Date.now()}`;
      });
    } catch (err) {
      console.error("[Placement] instantiateHierarchy failed:", err);
    }
    if (!placed) return;

    placed.setEnabled(true);
    if (placed.getChildMeshes) {
      placed.getChildMeshes(false).forEach((m) => m.setEnabled(true));
    }

    placed.position = Vector3.Zero();
    const baseRot = placed.rotation?.clone?.() ?? placed.rotation;
    placed.rotation = new Vector3(
      baseRot.x ?? placed.rotation.x ?? 0,
      rotationSteps * (Math.PI / 2),
      baseRot.z ?? placed.rotation.z ?? 0,
    );
    const placeScale =
      modelScaleByName.get(placingName) ?? DEFAULT_PLACEMENT_SCALE;
    placed.scaling.scaleInPlace(placeScale);

    placed.computeWorldMatrix(true);
    const { min, max } = placed.getHierarchyBoundingVectors(true);
    const center = min.add(max).scale(0.5);
    const floorTop = getFloorSurfaceWorldY(floorMesh);
    const renderableMinY = getRenderableMinimumWorldY(placed);
    const bottomY = renderableMinY ?? min.y;
    const placementYOffset = modelYOffsetByName.get(placingName) ?? 0;

    placed.position = new Vector3(
      lastSnapped.x - center.x,
      floorTop - bottomY + placementYOffset,
      lastSnapped.z - center.z,
    );
    placed.computeWorldMatrix(true);

    const role = modelRoleByName.get(placingName) ?? "";
    const parentContainer = containerTarget;

    placed.metadata = {
      ...(placed.metadata ?? {}),
      isPlaced: true,
      isPlacedRoot: true,
      modelName: placingName,
      role,
      parentContainerId: parentContainer?.uniqueId ?? null,
      parentContainerName: parentContainer?.metadata?.modelName ?? null,
    };

    if (parentContainer) {
      const existing = parentContainer.metadata?.childPlacedIds ?? [];
      parentContainer.metadata = {
        ...(parentContainer.metadata ?? {}),
        childPlacedIds: [...existing, placed.uniqueId],
      };
    }
    if (placed instanceof AbstractMesh) {
      placed.isPickable = true;
    }
    placed.getChildMeshes(false).forEach((m) => {
      m.metadata = { ...(m.metadata ?? {}), isPlaced: true };
      m.isPickable = true;
    });

    placedRoots.push(placed);
    onPlaced?.(placed, placingName);
  };

  const onKeyDown = (e) => {
    if (!isPlacing) return;
    if (e.key === "Escape") {
      stopPlacing();
      return;
    }
    if (e.key === "r" || e.key === "R") {
      rotationSteps = (rotationSteps + 1) % 4;
      if (box) box.rotation.y = rotationSteps * (Math.PI / 2);
      refreshPreviewFromPointer();
    }
  };

  const onContextMenu = (e) => {
    if (isPlacing) e.preventDefault();
  };

  canvas.addEventListener("pointerdown", onCanvasPointerDown, true);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("contextmenu", onContextMenu);

  const startPlacing = (modelName) => {
    const proto = getPrototype(modelName);
    if (!proto) {
      console.warn(
        `[Placement] Cannot start placing "${modelName}": prototype not found.`,
      );
      return;
    }
    if (!modelSizeByName.has(modelName)) {
      console.warn(
        `[Placement] No size entry for "${modelName}"; using default preview.`,
      );
    }

    isPlacing = true;
    placingName = modelName;
    rotationSteps = 0;
    lastSnapped = null;
    containerTarget = null;
    canPlace = true;
    setPlacementDragBlock(true);

    ensurePreviewBox();
    resizePreviewToModel(modelName);
    refreshPreviewFromPointer();
  };

  const stopPlacing = () => {
    isPlacing = false;
    placingName = null;
    rotationSteps = 0;
    lastSnapped = null;
    containerTarget = null;
    canPlace = true;
    setPlacementDragBlock(false);
    if (box) box.setEnabled(false);
  };

  const dispose = () => {
    stopPlacing();
    scene.onPointerObservable.remove(pointerObserver);
    canvas.removeEventListener("pointerdown", onCanvasPointerDown, true);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("contextmenu", onContextMenu);
    box?.dispose();
    boxMat?.dispose();
    box = null;
    boxMat = null;
    delete scene.metadata?.[PLACEMENT_BLOCKS_LMB_CAMERA_DRAG_KEY];
  };

  return {
    startPlacing,
    stopPlacing,
    isPlacing: () => isPlacing,
    dispose,
  };
}
