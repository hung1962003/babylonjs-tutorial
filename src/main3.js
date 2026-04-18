import {
  Engine,
  Mesh,
  Scene,
  Vector3,
  SceneLoader,
  ArcRotateCamera,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
import "@babylonjs/core/Helpers/sceneHelpers";
import "./style.css";

const scaffoldRootUrl = "/assets/";
const scaffoldFileName = "1.glb";
const forest = "/assets/forest.env";

fetch(`${scaffoldRootUrl}${scaffoldFileName}`)
  .then((res) => res.arrayBuffer())
  .then((buf) => console.log(`${scaffoldFileName} byteLength:`, buf.byteLength));

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const scene = new Scene(engine);
const camera = new ArcRotateCamera("camera", 1, 1, 4, new Vector3(0, 0, 0));
camera.attachControl(canvas, true);
camera.wheelPrecision = 10;
scene.createDefaultEnvironment({
  environmentTexture: forest,
  skyboxTexture: forest,
});

engine.runRenderLoop(function () {
  scene.render();
});
window.addEventListener("resize", () => {
  engine.resize();
});

SceneLoader.ImportMeshAsync("", scaffoldRootUrl, scaffoldFileName, scene)
  .then((result) => {
    const realMeshes = result.meshes.filter(
      (mesh) => mesh instanceof Mesh && mesh.getTotalVertices() > 0,
    );

    console.log("Mesh count:", realMeshes.length);

    if (realMeshes.length === 0) {
      console.warn("No renderable meshes found in scaffold GLB.");
      return;
    }

    const merged = Mesh.MergeMeshes(
      realMeshes,
      true,
      true,
      undefined,
      false,
      true,
    );
    const mainMesh = merged ?? realMeshes[0];

    mainMesh.position.y = 2;
    camera.setTarget(mainMesh);

    scene.onBeforeRenderObservable.add(() => {
      mainMesh.rotate(Vector3.Up(), 0.001);
    });
  })
  .catch((error) => {
    console.error("Failed to load scaffold:", error);
  });
