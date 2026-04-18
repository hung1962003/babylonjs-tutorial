import "@babylonjs/core/Physics/physicsEngineComponent.js";
import HavokPhysics from "@babylonjs/havok";
import {
  ArcRotateCamera,
  Engine,
  HavokPlugin,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeConvexHull,
  PhysicsShapeMesh,
  PhysicsShapeSphere,
  PhysicsShapeType,
  PhysicsViewer,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import "./style.css";
import { Inspector, ShowInspector } from "@babylonjs/inspector";

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
camera.lowerRadiusLimit = 5;
camera.upperBetaLimit = Math.PI / 2.05;
camera.beta = 1.35;
camera.radius = 18;
camera.target = new Vector3(0, 0, 0);
engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});

async function initPhysics() {
  const havok = await HavokPhysics({
    locateFile: (file) =>
      file === "HavokPhysics.wasm" ? "/HavokPhysics.wasm" : file,
  });

  scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, havok));

  const viewer = new PhysicsViewer(scene);
  const showPhysicsDebug = false;

  const { meshes } = await SceneLoader.ImportMeshAsync(
    "",
    "/assets/",
    "F2.glb",
    scene,
  );

  const { meshes: meshes1 } = await SceneLoader.ImportMeshAsync(
    "",
    "/assets/",
    "12.glb",
    scene,
  );
  const mesh = meshes[0];
  const mesh1 = meshes1[0];
  if (!mesh || !mesh1) {
    throw new Error("F2.glb or b2.glb: no meshes in file");
  }
  const realMeshes = meshes.filter((m) => m.getTotalVertices() > 0);
  const merged = Mesh.MergeMeshes(
    realMeshes,
    true, // dispose source
    true, // allow32bitsIndices
    undefined,
    false,
    true,
  );
  if (!merged) {
    throw new Error("F2.glb: unable to merge renderable meshes");
  }
  merged.position.y = 5;
  const realMeshes1 = meshes1.filter((m) => m.getTotalVertices() > 0);
  const merged1 = Mesh.MergeMeshes(
    realMeshes1,
    true, // dispose source
    true, // allow32bitsIndices
    undefined,
    false,
    true,
  );
  if (!merged1) {
    throw new Error("12.glb: unable to merge renderable meshes");
  }
  merged1.position.y = 10;

  // merged.computeWorldMatrix(true);
  // merged.bakeCurrentTransformIntoVertices();
  // merged1.computeWorldMatrix(true);
  // merged1.bakeCurrentTransformIntoVertices();

  const body = new PhysicsBody(merged, PhysicsMotionType.DYNAMIC, false, scene);
  body.setMassProperties({ mass: 1 });

  const shape = new PhysicsShapeMesh(merged, scene);
  body.shape = shape;
  const body1 = new PhysicsBody(
    merged1,
    PhysicsMotionType.DYNAMIC,
    false,
    scene,
  );
  body1.setMassProperties({ mass: 1 });

  const shape1 = new PhysicsShapeMesh(merged1, scene);
  body1.shape = shape1;

  if (showPhysicsDebug) {
    viewer.showBody(body);
    viewer.showBody(body1);
  }

  mesh.position.y = 5;

  const initialShape = new PhysicsShapeSphere(new Vector3(0, 0, 0), 1.5, scene);

  if (showPhysicsDebug) {
    viewer.showBody(body);
  }

  // setTimeout(() => {
  //   viewer.hideBody(body);
  //   body.disablePreStep = false;
  //   const newShape = new PhysicsShapeConvexHull(mesh, scene);
  //   body.shape = newShape;
  //   viewer.showBody(body);
  //   mesh.position.y = 3;
  // }, 2000);

  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 6, height: 6 },
    scene,
  );
  new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 });
}

initPhysics().catch((err) => {
  console.error(err);
});
// Inspector.Show(scene, {});
