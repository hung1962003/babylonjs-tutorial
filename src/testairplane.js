import {
  Engine,
  Mesh,
  Scene,
  Vector3,
  SceneLoader,
  ArcRotateCamera,
  HemisphericLight,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
import "@babylonjs/core/Helpers/sceneHelpers";
import "./style.css";
import { Inspector } from "@babylonjs/inspector";

const scaffoldRootUrl = "/assets/";
const scaffoldFileName = "tang2block.glb";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
engine.runRenderLoop(() => {
  scene.render();
});
window.addEventListener("resize", () => {
  engine.resize();
});
fetch(`${scaffoldRootUrl}${scaffoldFileName}`)
  .then((res) => res.arrayBuffer())
  .then((buf) =>
    console.log(`${scaffoldFileName} byteLength:`, buf.byteLength),
  );

new HemisphericLight("hemilight", new Vector3(0, 1, 0), scene);
const camera = new ArcRotateCamera(
  "camera",
  0,
  1,
  10,
  new Vector3(0, 0, 0),
  scene,
);
camera.attachControl(canvas, true);
camera.wheelPrecision = 20;

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

    
  })
  .catch((error) => {
    console.error("Failed to load scaffold:", error);
  });

Inspector.Show(scene, {});
