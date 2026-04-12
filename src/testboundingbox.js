import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { MODEL_LIST } from "./scripts/modelDefs";
import { loadModelsToScene } from "./scripts/loadModels";
import { createModelListGui } from "./scripts/modelListGui";
import { createReconstructionPlacementController } from "./scripts/placementController";
import "./style.css";
const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});

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
camera.lowerRadiusLimit = 5;

// const ground = MeshBuilder.CreateGround(
//   "ground",
//   {
//     width: 100,
//     height: 100,
//   },
//   scene,
// );
// ground.isPickable = true;
SceneLoader.ImportMesh(
  "",
  "public/assets/",
  "F2.glb",
  scene,
  (meshes) => {
    meshes.forEach((mesh) => {
      mesh.showBoundingBox = true;
    });
  },
);
// const models = await loadModelsToScene({ scene, modelList: MODEL_LIST });

// /** @type {Map<string, import("@babylonjs/core").TransformNode>} */
// const prototypeByName = new Map();
// /** @type {Map<string, Vector3>} */
// const modelSizeByName = new Map();
// const modelScaleByName = new Map();
// const modelYOffsetByName = new Map();
// const modelRoleByName = new Map();

// for (const def of MODEL_LIST) {
//   modelScaleByName.set(def.name, def.placementScale ?? 1);
//   modelYOffsetByName.set(def.name, def.placementYOffset ?? 0);
//   modelRoleByName.set(def.name, def.role ?? "");
// }

// for (const root of models) {
//   prototypeByName.set(root.name, root);

//   root.computeWorldMatrix(true);
//   const { min, max } = root.getHierarchyBoundingVectors(true);
//   const size = max.subtract(min);
//   modelSizeByName.set(
//     root.name,
//     new Vector3(
//       Math.max(size.x, 0.2),
//       Math.max(size.y, 0.2),
//       Math.max(size.z, 0.2),
//     ),
//   );
// }

// const placement = createReconstructionPlacementController({
//   scene,
//   canvas,
//   floorMesh: ground,
//   getPrototype: (name) => prototypeByName.get(name) ?? null,
//   modelSizeByName,
//   modelScaleByName,
//   modelYOffsetByName,
//   modelRoleByName,
//   onPlaced: (placed, modelName) => {
//     placed.name = `placed_${modelName}_${placed.uniqueId}`;
//   },
// });

// createModelListGui({
//   scene,
//   models,
//   title: "Model Catalog",
//   onSelect: (modelRoot) => {
//     placement.startPlacing(modelRoot.name);
//   },
// });

// window.addEventListener("beforeunload", () => {
//   placement.dispose();
// });
