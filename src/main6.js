import {
  ArcRotateCamera,
  Color3,
  Constants,
  CreateGreasedLine,
  CreateText,
  CubeTexture,
  Engine,
  GlowLayer,
  GreasedLineMeshColorMode,
  GreasedLineMeshMaterialType,
  GreasedLineTools,
  HemisphericLight,
  MeshBuilder,
  PBRMaterial,
  Scene,
  Space,
  SSRRenderingPipeline,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import earcut from "earcut";
import "./style.css";
const room = "/assets/night.env";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
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

const envTexture = CubeTexture.CreateFromPrefilteredData(room, scene);
scene.environmentTexture = envTexture;
scene.createDefaultSkybox(envTexture, false, 5000);

const ground = MeshBuilder.CreateGround(
  "ground",
  { width: 100, height: 100 },
  scene,
);
const groundMat = new PBRMaterial("groundMat", scene);
groundMat.metallic = 1;
groundMat.roughness = 0;
ground.material = groundMat;

const getFont = async () => {
  const response = await fetch(
    "https://res.cloudinary.com/edorblewebvr/raw/upload/v1688485231/Tilt_Neon_Regular_ubg5mu.json",
  );
  return response.json();
};
function drawText(points) {
  const textLines = CreateGreasedLine(
    "textLines",
    { points },
    {
      materialType: GreasedLineMeshMaterialType.MATERIAL_TYPE_PBR,
      colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
      width: 0.8,
    },
  );
  return textLines;
}
getFont().then((font) => {
  const greasedLinePoints = GreasedLineTools.GetPointsFromText(
    "BabyLon Journey",
    8,
    64,
    font,
  );
  const greasedLineOne = drawText(greasedLinePoints);
  greasedLineOne.position.y = 30;
  greasedLineOne.rotation.x = -Math.PI / 0.5;
  const pbr1 = greasedLineOne.material;
  pbr1.metallic = 0.8;
  pbr1.roughness = 0.4;
  pbr1.emissiveColor = Color3.Yellow();
  pbr1.emissiveIntensity = 0.5;

  const greasedLinePointsTwo = GreasedLineTools.GetPointsFromText(
    "Babylon Journey",
    8,
    64,
    font,
  );

  const greasedLineTwo = drawText(greasedLinePointsTwo);
  greasedLineTwo.position.y = 40;
  greasedLineTwo.position.x = 20;
  greasedLineTwo.rotation.x = Math.PI / 0.5;
  const pbr2 = greasedLineTwo.material;

  pbr2.metallic = 0;
  pbr2.roughness = 0;

  pbr2.subSurface.isRefractionEnabled = true;
  pbr2.subSurface.indexOfRefraction = 1.5;
  pbr2.subSurface.tintColor = new Color3(0.53, 0.04, 0.93);
  pbr2.emissiveColor = new Color3(0.53, 0.04, 0.93);
  pbr2.emissiveIntensity = 0.5;

  const geoText = CreateText(
    "myText",
    "Babylon Journey",
    font,
    {
      size: 8,
      resolution: 64,
      depth: 3,
    },
    scene,
    earcut,
  );
  geoText.position.y = 20;
  geoText.position.x = -10;

  const pbrmaterial = new PBRMaterial();
  pbrmaterial.metallic = 0.9;
  pbrmaterial.albedoColor = Color3.Yellow();
  pbrmaterial.roughness = 0;
  geoText.material = pbrmaterial;

  const glow = new GlowLayer("glow", scene, {
    blurKernelSize: 128
  });
  glow.intensity = 1;

  glow.referenceMeshToUseItsOwnMaterial(greasedLineOne);
  glow.referenceMeshToUseItsOwnMaterial(greasedLineTwo);
  glow.referenceMeshToUseItsOwnMaterial(geoText);

  const ssr = new SSRRenderingPipeline(
    "ssr",
    scene,
    [scene.activeCamera],
    false,
    Constants.TEXTURETYPE_UNSIGNED_BYTE
  );

  ssr.environmentTexture = scene.environmentTexture;
  ssr.strength = 1;
  ssr.step = 10;

  scene.onBeforeRenderObservable.add(() => {
    geoText.rotate(Vector3.Up(), 0.0002, Space.LOCAL);
    // adjust these values to change the speed and intensity of the flicker
    let minIntensity = 0.3; 
    let maxIntensity = 0.8; 

    // every few frames, change the intensity
    if (Math.random() < 0.1) {
      // calculate a random intensity
      let intensity =
        minIntensity +
        Math.random() * (maxIntensity - minIntensity);

      // set the new intensity
      glow.intensity = intensity;
    }
  });
});


