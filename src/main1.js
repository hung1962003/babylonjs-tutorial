import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    PointLight,
    DirectionalLight,
    SpotLight,
    MeshBuilder,
    Color3
  } from "@babylonjs/core";
  import {
    AdvancedDynamicTexture,
    TextBlock,
    Rectangle,
    Control
  } from "@babylonjs/gui";
  import './style.css';

  const canvas = document.getElementById('renderCanvas');
  // create engine(render the scene in the canvas element)
  const engine = new Engine(canvas, true);
  // create scene
  const scene = new Scene(engine);
  // create a basic camera so the scene can render
  const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 10, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });

  const directionalLight = new DirectionalLight('directionalLight', new Vector3(0, -1, 1), scene);

  const hemisphereLight = new HemisphericLight('hemisphereLight', new Vector3(0, 1, 0), scene);
 
  const pointLight = new PointLight('pointLight', new Vector3(0, 1, 0), scene);

  const spotLight = new SpotLight('spotLight', new Vector3(0, 10, 0), new Vector3(0, -1, 0), Math.PI / 4, 1, scene);

  directionalLight.diffuse = new Color3(1, 0.5, 0);
  hemisphereLight.diffuse = new Color3(0.5, 0.5, 1);
  pointLight.diffuse = new Color3(0, 1, 0);
  spotLight.diffuse = new Color3(1, 0, 1);

  // create UI
  const ui = AdvancedDynamicTexture.CreateFullscreenUI('UI');
  const text = new TextBlock();
  text.text =  "Press 1, 2, 3, 4 to switch between light types. \nCurrent Light: All";
  text.color = 'white';
  text.fontSize = 20;


  const rectangle = new Rectangle();
  rectangle.width = 0.7;
  rectangle.height = '100px';
  rectangle.color = 'red';
  rectangle.thickness = 2;
  rectangle.background = 'blue';
  rectangle.cornerRadius = 10;
  //rectangle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  rectangle.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  // add text to rectangle
  rectangle.addControl(text);
  ui.addControl(rectangle);

  window.addEventListener('keydown', (event) => {
    // disable all lights
    directionalLight.setEnabled(false);
    hemisphereLight.setEnabled(false);
    pointLight.setEnabled(false);
    spotLight.setEnabled(false);

    // Enable selected light
  switch (event.key) {
    case "1":
      directionalLight.setEnabled(true);
      text.text =
        "Press 1, 2, 3, 4 to switch between light types. \nCurrent Light: Directional";
      break;
    case "2":
      hemisphereLight.setEnabled(true);
      text.text =
        "Press 1, 2, 3, 4 to switch between light types. \nCurrent Light: Hemispheric";
      break;
    case "3":
      pointLight.setEnabled(true);
      text.text =
        "Press 1, 2, 3, 4 to switch between light types. \nCurrent Light: Point";
      break;
    case "4":
      spotLight.setEnabled(true);
      text.text =
        "Press 1, 2, 3, 4 to switch between light types. \nCurrent Light: Spot";
      break;
    default:
      console.log("nothing");
    }
});
  
  // create some simple primitives
  const primitives =[];
  for (let i = 0; i < 30; i++) {
    const sphere = MeshBuilder.CreateSphere(`sphere${i} `, {}, scene);
    sphere.position= new Vector3(
        Math.random () * 20 -10,
        Math.random () * 20 -10,
        Math.random () * 20 -10
    ) 
    primitives.push(sphere);
    let box = MeshBuilder.CreateBox(`box${i}`, {}, scene);
    box.position = new Vector3(
      Math.random() * 20 - 10,
      Math.random() * 20 - 10,
      Math.random() * 20 - 10
    );
    primitives.push(box);
  
    let cylinder = MeshBuilder.CreateCylinder(`cylinder${i}`, {}, scene);
    cylinder.position = new Vector3(
      Math.random() * 20 - 10,
      Math.random() * 20 - 10,
      Math.random() * 20 - 10
    );
    primitives.push(cylinder);
  }
  // animate the primitives
  let counter =0;
  scene.onBeforeRenderObservable.add(() => {
    counter += 0.01;
    primitives.forEach((primitive, index) => {
        primitive.position.x += Math.sin(index + counter) / 100;
        primitive.position.y += Math.cos(index + counter) / 100;
        primitive.position.z += Math.sin(index + counter) / 100;
    });

    // Rotate spotlight
    if (spotLight.isEnabled()) {
        spotLight.direction = new Vector3(Math.sin(counter), -1, 0);
    }
  });

  
  