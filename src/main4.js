import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    PBRMaterial,
    CubeTexture,
    Color3,
    CreateTorusKnot,
    CreateBox,
    CreateCylinder,
    StandardMaterial
  } from "@babylonjs/core";
  
  import {
    AdvancedDynamicTexture,
    TextBlock,
    StackPanel,
    Control,
    Slider,
    Checkbox
  } from "@babylonjs/gui";
  import './style.css';
  const canyon = "../canyon.env";

  const canvas = document.getElementById('renderCanvas');
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  engine.runRenderLoop(() => {
    scene.render();
  });
  window.addEventListener('resize', () => {
    engine.resize();
  });
  new HemisphericLight('hemilight', new Vector3(0, 1, 0), scene);
  const camera = new ArcRotateCamera('camera', 0, 1, 10, new Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);

  const hdrTexture = CubeTexture.CreateFromPrefilteredData(
    canyon,
    scene
  );
  scene.environmentTexture = hdrTexture;
  scene.createDefaultSkybox(scene.environmentTexture);

  const pbr = new PBRMaterial('pbr', scene);
  pbr.metallic = 0; // between 0 and 1
  pbr.roughness= 1; // between 0 and 1
  pbr.subSurface.isRefractionEnabled= true;// khúc xạ
  pbr.subSurface.indexOfRefraction=1.7; //mức độ ánh sáng bị bẻ cong.
  pbr.subSurface.tintColor= new Color3.Green(); //màu nhuộm của vật liệu trong suốt.

  const standard = new StandardMaterial("standard", scene);
  standard.diffuseColor = Color3.Green();
  standard.reflectionTexture = hdrTexture;

  let primitives = [];

  let sphere = CreateTorusKnot( //hình vòng xoắn 3D
    `sphere`,
    { segments: 128 },
    scene
  );
  sphere.position = new Vector3(-6, 3, 0);
  sphere.material = pbr;
  primitives.push(sphere);

  let box = CreateBox(`box`, {}, scene);
  box.position = new Vector3(3, 3, 0);
  box.material = pbr;
  primitives.push(box);

  let cylinder = CreateCylinder(`cylinder`, {}, scene);
  cylinder.position = new Vector3(0, 3, 0);
  cylinder.material = pbr;
  primitives.push(cylinder);

  // Create GUI
const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI(
  "UI"
);

const panel = new StackPanel();
panel.width = "220px";
panel.horizontalAlignment =
  Control.HORIZONTAL_ALIGNMENT_RIGHT;
panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
advancedTexture.addControl(panel);


const addSlider = (
  text,
  min,
  max,
  value,
  onValueChanged
) => {
  const textBlock = new TextBlock();
  textBlock.height = "20px";
  textBlock.text = text + value;
  panel.addControl(textBlock);
  const slider = new Slider();
  slider.minimum = min;
  slider.maximum = max;
  slider.value = value;
  slider.height = "20px";
  slider.onValueChangedObservable.add(function (value) {
    onValueChanged(value);
    textBlock.text = text + value.toFixed(2);
  });
  panel.addControl(slider);
}

addSlider("Metallic: ", 0, 1, pbr.metallic, (value) => {
  pbr.metallic = value;
});
addSlider("Roughness: ", 0, 1, pbr.roughness, (value) => {
  pbr.roughness = value;
});
addSlider("Alpha: ", 0, 1, pbr.alpha, (value) => {
  standard.alpha = value;
  pbr.alpha = value;
})