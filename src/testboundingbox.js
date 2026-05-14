import {
  ArcRotateCamera,
  Engine,
  Color3,
  HemisphericLight,
  MeshBuilder,
  PointerEventTypes,
  Ray,
  Scene,
  StandardMaterial,
  Vector3,
  VertexBuffer,
} from "@babylonjs/core";
import "./style.css";
import { createModelListGui } from "./scripts/modelListGui";
import { MODEL_LIST } from "./scripts/modelDefs";
import {
  buildPlacedModelInfo,
  createReconstructionPlacementController,
} from "./scripts/placementController";
import { loadModelsToScene } from "./scripts/loadModels";
import { Inspector } from "@babylonjs/inspector";
import { createModelContextGui } from "./scripts/modelContextGui";

/** @typedef {import("@babylonjs/core").AbstractMesh} AbstractMesh */

const MODEL_DEF_BY_NAME = new Map(MODEL_LIST.map((def) => [def.name, def]));
const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

new HemisphericLight("light", new Vector3(0, 1, 0), scene);
const camera = new ArcRotateCamera(
  "camera",
  0,
  0.5,
  120,
  new Vector3(0, 0, 0),
  scene,
);
camera.attachControl(canvas, true);
camera.speed = 10;
camera.wheelPrecision = 10;
// camera.lowerRadiusLimit = 5;
// camera.upperBetaLimit = Math.PI / 2.05;
// camera.beta = 1.35;
// camera.radius = 18;
// camera.target = new Vector3(0, 0, 0);
engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});

Inspector.Show(scene, {});

/**
 * @param {AbstractMesh} root
 * @returns {AbstractMesh[]}
 */
function getRenderableMeshes(root) {
  const meshes = root
    .getChildMeshes(false)
    .filter((mesh) => mesh.getTotalVertices() > 0);
  if (root.getTotalVertices() > 0 && !meshes.includes(root)) {
    meshes.unshift(root);
  }
  return meshes;
}

/**
 * @param {AbstractMesh} root
 * @returns {Vector3}
 */
function getHierarchyAabbSize(root) {
  root.computeWorldMatrix(true);
  const { min, max } = root.getHierarchyBoundingVectors(true);
  return max.subtract(min);
}

/**
 * Build a tighter size from actual mesh vertices instead of the coarse
 * hierarchy AABB.
 *
 * @param {AbstractMesh} root
 * @returns {Vector3}
 */
function getGeometrySize(root) {
  const renderableMeshes = getRenderableMeshes(root);
  if (renderableMeshes.length === 0) {
    return getHierarchyAabbSize(root);
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const mesh of renderableMeshes) {
    mesh.computeWorldMatrix(true);
    const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
    if (!positions || positions.length === 0) {
      const { minimumWorld, maximumWorld } = mesh.getBoundingInfo().boundingBox;
      minX = Math.min(minX, minimumWorld.x);
      minY = Math.min(minY, minimumWorld.y);
      minZ = Math.min(minZ, minimumWorld.z);
      maxX = Math.max(maxX, maximumWorld.x);
      maxY = Math.max(maxY, maximumWorld.y);
      maxZ = Math.max(maxZ, maximumWorld.z);
      continue;
    }

    const worldMatrix = mesh.getWorldMatrix();
    for (let index = 0; index < positions.length; index += 3) {
      const worldPoint = Vector3.TransformCoordinates(
        new Vector3(
          positions[index],
          positions[index + 1],
          positions[index + 2],
        ),
        worldMatrix,
      );
      minX = Math.min(minX, worldPoint.x);
      minY = Math.min(minY, worldPoint.y);
      minZ = Math.min(minZ, worldPoint.z);
      maxX = Math.max(maxX, worldPoint.x);
      maxY = Math.max(maxY, worldPoint.y);
      maxZ = Math.max(maxZ, worldPoint.z);
    }
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(minZ) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY) ||
    !Number.isFinite(maxZ)
  ) {
    return getHierarchyAabbSize(root);
  }

  return new Vector3(maxX - minX, maxY - minY, maxZ - minZ);
}

/**
 * @param {AbstractMesh} root
 * @returns {Vector3}
 */
function getPlacementSize(root) {
  return getGeometrySize(root);
}

/**
 * @param {AbstractMesh} root
 * @returns {{min: Vector3, max: Vector3, center: Vector3, size: Vector3}}
 */
function getGeometryWorldBounds(root) {
  root.computeWorldMatrix(true);
  const renderableMeshes = getRenderableMeshes(root);

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const mesh of renderableMeshes) {
    mesh.computeWorldMatrix(true);
    const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
    if (!positions || positions.length === 0) {
      const { minimumWorld, maximumWorld } = mesh.getBoundingInfo().boundingBox;
      minX = Math.min(minX, minimumWorld.x);
      minY = Math.min(minY, minimumWorld.y);
      minZ = Math.min(minZ, minimumWorld.z);
      maxX = Math.max(maxX, maximumWorld.x);
      maxY = Math.max(maxY, maximumWorld.y);
      maxZ = Math.max(maxZ, maximumWorld.z);
      continue;
    }

    const worldMatrix = mesh.getWorldMatrix();
    for (let index = 0; index < positions.length; index += 3) {
      const worldPoint = Vector3.TransformCoordinates(
        new Vector3(
          positions[index],
          positions[index + 1],
          positions[index + 2],
        ),
        worldMatrix,
      );
      minX = Math.min(minX, worldPoint.x);
      minY = Math.min(minY, worldPoint.y);
      minZ = Math.min(minZ, worldPoint.z);
      maxX = Math.max(maxX, worldPoint.x);
      maxY = Math.max(maxY, worldPoint.y);
      maxZ = Math.max(maxZ, worldPoint.z);
    }
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(minZ) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY) ||
    !Number.isFinite(maxZ)
  ) {
    const { min, max } = root.getHierarchyBoundingVectors(true);
    return {
      min,
      max,
      center: min.add(max).scale(0.5),
      size: max.subtract(min),
    };
  }

  const min = new Vector3(minX, minY, minZ);
  const max = new Vector3(maxX, maxY, maxZ);
  return {
    min,
    max,
    center: min.add(max).scale(0.5),
    size: max.subtract(min),
  };
}

function createGround() {
  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 50, height: 50 },
    scene,
  );
  ground.isPickable = true;

  const groundMat = new StandardMaterial("groundMaterial", scene);
  groundMat.diffuseColor = new Color3(0.18, 0.2, 0.24);
  groundMat.specularColor = Color3.Black();
  ground.material = groundMat;

  return ground;
}

async function initPlacementScene() {
  const ground = createGround();
  /** @type {Map<string, AbstractMesh>} */
  const protoByName = new Map();
  const modelSizeByName = new Map();
  const modelScaleByName = new Map();
  const modelYOffsetByName = new Map();
  const modelRoleByName = new Map();

  const prototypes = await loadModelsToScene({
    scene,
    modelList: MODEL_LIST,
    assetsBaseUrl: "/assets/",
    onModelLoaded: (_index, _total, root) => {
      const def = MODEL_DEF_BY_NAME.get(root.name);
      if (!def) return;

      root.setEnabled(false);
      root.isPickable = false;
      root.metadata = {
        ...(root.metadata ?? {}),
        modelName: def.name,
        role: def.role,
        isPrototype: true,
      };

      protoByName.set(def.name, root);
      modelSizeByName.set(def.name, getPlacementSize(root));
      modelScaleByName.set(def.name, def.placementScale ?? 1);
      modelYOffsetByName.set(def.name, def.placementYOffset ?? 0);
      modelRoleByName.set(def.name, def.role ?? "");
    },
  });

  if (prototypes.length === 0) {
    throw new Error("No placement prototypes were loaded from /assets/.");
  }

  const placement = createReconstructionPlacementController({
    scene,
    canvas,
    floorMesh: ground,
    getPrototype: (name) => protoByName.get(name) ?? null,
    modelSizeByName,
    modelScaleByName,
    modelYOffsetByName,
    modelRoleByName,
    onPlaced: (placed, modelName) => {
      console.log("[Placement]", modelName, buildPlacedModelInfo(placed));
    },
  });

  const ctxGui = createModelContextGui({ scene });
  let isMovingMesh = false;
  let movingMesh = null;
  let movingOrigPos = null;
  let movingLastValidPos = null;

  const getPlacedRoot = (mesh) => {
    let current = mesh;
    while (current) {
      if (current.metadata?.isPlacedRoot) {
        return current;
      }
      current = current.parent;
    }
    return null;
  };

  const isDescendantOf = (candidate, root) => {
    let cur = candidate;
    while (cur) {
      if (cur === root) return true;
      cur = cur.parent;
    }
    return false;
  };

  const getFloorSurfaceWorldY = (floorMesh) => {
    floorMesh.computeWorldMatrix(true);
    return floorMesh.getBoundingInfo().boundingBox.maximumWorld.y;
  };

  const getSupportYFromParent = (parentRoot, movingRoot) => {
    if (!parentRoot) {
      return null;
    }

    const parentBounds = getGeometryWorldBounds(parentRoot);
    const movingBounds = getGeometryWorldBounds(movingRoot);
    const corners = [
      [movingBounds.min.x, movingBounds.min.z],
      [movingBounds.min.x, movingBounds.max.z],
      [movingBounds.max.x, movingBounds.min.z],
      [movingBounds.max.x, movingBounds.max.z],
    ];
    const rayOriginY = Math.max(parentBounds.max.y, movingBounds.max.y) + 2;
    const rayLength = Math.max(10, rayOriginY - parentBounds.min.y + 2);
    const down = new Vector3(0, -1, 0);

    let supportY = Number.NEGATIVE_INFINITY;
    for (const [x, z] of corners) {
      const ray = new Ray(new Vector3(x, rayOriginY, z), down, rayLength);
      const hit = scene.pickWithRay(
        ray,
        (candidate) => !!candidate && isDescendantOf(candidate, parentRoot),
      );
      if (!hit?.hit || !hit.pickedPoint) {
        return null;
      }
      supportY = Math.max(supportY, hit.pickedPoint.y);
    }

    return Number.isFinite(supportY) ? supportY : null;
  };

  const moveMeshToPointer = (mesh) => {
    const originalPosition = mesh.position.clone();
    const pick = scene.pick(
      scene.pointerX,
      scene.pointerY,
      (m) =>
        !!m &&
        !isDescendantOf(m, mesh) &&
        (m === ground || !!m.metadata?.isPlaced),
    );
    if (!pick?.hit || !pick.pickedPoint) {
      return false;
    }

    const initialBounds = getGeometryWorldBounds(mesh);
    const center = initialBounds.center;
    mesh.position.x += pick.pickedPoint.x - center.x;
    mesh.position.z += pick.pickedPoint.z - center.z;

    const pickedRoot =
      pick.pickedMesh === ground ? null : getPlacedRoot(pick.pickedMesh);
    const surfaceY =
      pick.pickedMesh === ground
        ? getFloorSurfaceWorldY(ground)
        : getSupportYFromParent(pickedRoot, mesh);
    if (surfaceY == null) {
      mesh.position.copyFrom(originalPosition);
      return false;
    }

    const modelName = mesh.metadata?.modelName;
    const yOffset = modelYOffsetByName.get(modelName) ?? 0;
    const targetBottomY = surfaceY + yOffset;

    const movedBounds = getGeometryWorldBounds(mesh);
    mesh.position.y += targetBottomY - movedBounds.min.y;
    movingLastValidPos = mesh.position.clone();

    return true;
  };

  const deletePlacedRoot = (mesh) => {
    ctxGui.hide();
    placement.removePlacedRoot(mesh);
    mesh.dispose(false, false);
  };

  createModelListGui({
    scene,
    models: prototypes,
    title: "Placement Models",
    onSelect: (modelRoot) => {
      ctxGui.hide();
      placement.startPlacing(modelRoot.name);
    },
  });

  scene.onPointerObservable.add((pi) => {
    if (pi.type !== PointerEventTypes.POINTERDOWN) return;
    if (pi.event.button !== 0) return;
    if (placement.isPlacing()) return;

    if (isMovingMesh && movingMesh) {
      if (!moveMeshToPointer(movingMesh) && movingLastValidPos) {
        movingMesh.position.copyFrom(movingLastValidPos);
      }
      isMovingMesh = false;
      movingMesh = null;
      movingOrigPos = null;
      movingLastValidPos = null;
      return;
    }

    const pick = scene.pick(
      scene.pointerX,
      scene.pointerY,
      (mesh) => !!mesh?.metadata?.isPlaced,
    );
    if (pick?.hit && pick.pickedMesh) {
      const root = getPlacedRoot(pick.pickedMesh);
      if (root) {
        ctxGui.showForMesh(root);
        return;
      }
    }

    ctxGui.hide();
  });

  scene.onPointerObservable.add((pi) => {
    if (pi.type !== PointerEventTypes.POINTERMOVE) return;
    if (!isMovingMesh || !movingMesh) return;
    if (!moveMeshToPointer(movingMesh) && movingLastValidPos) {
      movingMesh.position.copyFrom(movingLastValidPos);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (isMovingMesh && movingMesh && movingOrigPos) {
        movingMesh.position.copyFrom(movingOrigPos);
        isMovingMesh = false;
        movingMesh = null;
        movingOrigPos = null;
        movingLastValidPos = null;
      }
      ctxGui.hide();
      return;
    }

    if (event.key !== "Delete" && event.key !== "Backspace") {
      return;
    }

    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable)
    ) {
      return;
    }

    if (!ctxGui.isVisible()) return;
    const mesh = ctxGui.getCurrentMesh();
    if (!mesh) return;

    event.preventDefault();
    deletePlacedRoot(mesh);
  });

  ctxGui.setHandlers({
    onMove: (mesh) => {
      isMovingMesh = true;
      movingMesh = mesh;
      movingOrigPos = mesh.position.clone();
      movingLastValidPos = mesh.position.clone();
      ctxGui.hide();
    },
    onDelete: (mesh) => {
      deletePlacedRoot(mesh);
    },
  });
}

initPlacementScene().catch((err) => {
  console.error(err);
});
