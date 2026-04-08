import {
  ActionManager,
  ArcRotateCamera,
  ExecuteCodeAction,
  CreateGround,
  Engine,
  HemisphericLight,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import "./style.css";
import "@babylonjs/loaders/glTF";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});

scene.createDefaultEnvironment({
  createGround: false,
  createSkybox: false,
});

// ✅ FIX ground
CreateGround("ground", { width: 10, height: 10 }, scene);

const camera = new ArcRotateCamera(
  "camera",
  0,
  1,
  10,
  new Vector3(0, 0, 0),
  scene,
);

camera.speed = 0.1;
camera.wheelPrecision = 10;
camera.attachControl(canvas, true);

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

// ✅ FIX load model
const loadModel = async () => {
  try {
    const model = await SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "HVGirl.glb",
      scene,
    );

    const player = model.meshes[0];

    // 🎯 ví dụ: đặt vị trí
    player.position = new Vector3(0, 0, 0);
    player.scaling.setAll(0.1);
    camera.setTarget(player);
    const walkAnimation = scene.getAnimationGroupByName("Walking"); //một Animation Group trong scene có tên "walking"

    //Nếu tồn tại → trả về animation
    //Nếu không → trả về null

    const walkBackAnimation = scene.getAnimationGroupByName("WalkingBack");
    const idle = scene.getAnimationGroupByName("Idle");
    const sambaAnim = scene.getAnimationGroupByName("Samba"); 

    const playerWalkSpeed = 0.01;
    const playerRunSpeed = 0.1;
    const playerSpeedBackWards = 0.01;
    const playerRotationSpeed = 0.01;
    const runAnimSpeed = 5;
    const walkAnimSpeed = 1;

    let speed;
    let animaSpeed;
     
    let keyStatus ={
      w:false,
      s:false,
      a:false,
      d:false,
      b:false,
      space:false,
      Shift:false,
      ctrl:false,
      alt:false,
      tab:false 
    }
   
    scene.actionManager = new ActionManager(scene);// listen to keyboard events 
    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
      let key = evt.sourceEvent.key;
      if(key !== "Shift"){
        key = key.toLowerCase();
      }
      if(key in keyStatus){
        keyStatus[key] = true; 
      }
      console.log(keyStatus);
    }));
    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
      let key = evt.sourceEvent.key;
      if(key !== "Shift"){
        key = key.toLowerCase();
      }
      if(key in keyStatus){
        keyStatus[key] = false;
      }
    }));

    
    let moving = false;
    scene.onBeforeRenderObservable.add(() => {
      if(keyStatus.w || keyStatus.s || keyStatus.a || keyStatus.d || keyStatus.b){
        moving = true;
        if(keyStatus.s && !keyStatus.w){
          speed = playerSpeedBackWards;
          walkBackAnimation.start(true, 1, walkBackAnimation.from, walkBackAnimation.to, false);
        } else if(keyStatus.a || keyStatus.d || keyStatus.w){
          speed = keyStatus.Shift ? playerRunSpeed : playerWalkSpeed;
          animaSpeed = keyStatus.Shift ? runAnimSpeed : walkAnimSpeed;
          walkAnimation.speedRatio = animaSpeed;
          walkAnimation.start(true, animaSpeed, walkAnimation.from, walkAnimation.to, false);
        }

        if(keyStatus.a){
          player.rotate(Vector3.Up(), -playerRotationSpeed);
        }
        if(keyStatus.d){
          player.rotate(Vector3.Up(), playerRotationSpeed);
        }
        if(keyStatus.b){
          sambaAnim.start(true, 1, sambaAnim.from, sambaAnim.to, false);
        }
        player.moveWithCollisions(player.forward.scaleInPlace(speed));
        //"Đi theo hướng mình đang nhìn, với tốc độ X, và không xuyên vật thể"
      }else if (moving){
        moving = false;
        idle.start(true, 1, idle.from, idle.to, false);
        sambaAnim.stop();
        walkAnimation.stop();
        walkBackAnimation.stop();
      }
      
    });
  } catch (error) {
    console.error("Failed to load HVGirl.glb:", error);
  }
};

loadModel();
