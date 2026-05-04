import {
  ArcRotateCamera,
  Engine,
  Color3,
  HemisphericLight,
  MeshBuilder,
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
  const meshes = root.getChildMeshes(false).filter((mesh) => mesh.getTotalVertices() > 0);
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

  createModelListGui({
    scene,
    models: prototypes,
    title: "Placement Models",
    onSelect: (modelRoot) => {
      placement.startPlacing(modelRoot.name);
    },
  });
}

initPlacementScene().catch((err) => {
  console.error(err);
});
