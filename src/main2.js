import {
  Engine,
  CubeTexture,
  Scene,
  UniversalCamera,
  Vector3,
  HemisphericLight,
  CreateSphere,
  CreatePlane,
  CreateGround,
  CreateAudioEngineAsync,
  CreateSoundAsync
} from "@babylonjs/core";

import {
  AdvancedDynamicTexture,
  TextBlock,
  Button,
  StackPanel
} from "@babylonjs/gui";

const appa = "/assets/Appa.mp3";
const bounce = "/assets/Bounce.mp3";
const goleta = "/assets/Goleta.mp3";
const heretostay = "/assets/HereToStay.mp3";
const orpheus = "/assets/Orpheus.mp3";
const suburra = "/assets/Suburra.mp3";
const thisisforsure = "/assets/ThisIsForSure.mp3";
const tranqi = "/assets/Tranqi.mp3";
const waves = "/assets/Waves.mp3";
const worlds = "/assets/Worlds.mp3";
const canyonBackground = "/assets/canyon.env";
import './style.css';


const songs = [
  { url: bounce, title: "Bounce" },
  { url: goleta, title: "Goleta" },
  { url: appa, title: "Appa" },
  { url: heretostay, title: "Here To Stay" },
  { url: orpheus, title: "Orpheus" },
  { url: suburra, title: "Suburra" },
  { url: thisisforsure, title: "This is for Sure" },
  { url: tranqi, title: "Tranqi" },
  { url: waves, title: "Waves" },
  { url: worlds, title: "Worlds" }
];
const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// Khởi tạo audio engine (v2) một lần cho toàn app
const audioEnginePromise = CreateAudioEngineAsync();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});

const camera = new UniversalCamera('camera', new Vector3(0, 10, -20), scene);
camera.speed=0.1;
camera.attachControl(canvas, true);

CreateGround("ground",{
  height: 50,
  width: 50,
  subdivisions: 4
})

scene.onBeforeRenderObservable.add(() => {
  camera.position.y = 1;
});


const texture = new CubeTexture(canyonBackground, scene);
scene.createDefaultSkybox(texture, false, 1000);

new HemisphericLight("hemiLight", new Vector3(1, 1, 0), scene);

// Lưu Promise<Sound> để tạo sound bất đồng bộ cho từng bài hát
let sounds = [];

songs.forEach((song, index) => {
const sphere = CreateSphere(
  "sphere",
  {diameter:1},
  scene
);
if(index <5){
  sphere.position = new Vector3(-7,2.6,index *6);
}else{
  sphere.position = new Vector3(7,2.6,(index-5) *6);
}
sphere.billboardMode=7; //object sẽ tự xoay để luôn nhìn về camera.

// Tạo sound bất đồng bộ cho từng bài hát, gắn vào sphere khi đã sẵn sàng
const soundPromise = (async () => {
  const audioEngine = await audioEnginePromise;

  const sound = await CreateSoundAsync(
    "Music",
    song.url,
    {
      spatialEnabled: true
    }
  );

  // Gắn sound vào mesh để tạo spatial sound
  if (sound.spatial && sound.spatial.attach) {
    sound.spatial.attach(sphere);
  } else if (sound.attachToMesh) {
    sound.attachToMesh(sphere);
  }

  return sound;
})();

sounds.push(soundPromise);

// Create a simple plane to host the GUI controls
const plane = CreatePlane(
  "plane",
  { height: 4, width: 4 },
  scene
);
plane.parent = sphere;//Điều này tạo quan hệ parent-child.
plane.position = new Vector3(0, -1.5, 0);

const advancedTexture = AdvancedDynamicTexture.CreateForMesh(
  plane
);

// const advancedTexture = new DynamicTexture(
//   "dynamic",
//   {width:512,height:512},
//   scene
//  );

// Create a stack panel to hold buttons
const panel = new StackPanel();
 advancedTexture.addControl(panel);

// Create buttons
const heading = new TextBlock(
  "heading",
  `Song Title: ${song.title}`
);
heading.height = "110px";
heading.fontSize = 60;
heading.fontWeight = 700;
heading.paddingBottomInPixels = 30;
panel.addControl(heading);

const playButton = Button.CreateSimpleButton(
  "playButton",
  "PLAY"
);
playButton.width = 0.5;
playButton.height = "80px";
playButton.color = "white";
playButton.fontSize = 40;
playButton.fontWeight = 700;
playButton.background = "green";
playButton.onPointerUpObservable.add(async () => {
  // Khởi tạo và unlock audio engine sau tương tác người dùng
  const audioEngine = await audioEnginePromise;
  if (audioEngine.unlockAsync) {
    await audioEngine.unlockAsync();
  }

  // Dừng tất cả các sound khác
  for (const sPromise of sounds) {
    const s = await sPromise;
    s.stop();
  }

  // Lấy sound của bài hát hiện tại và phát
  const currentSound = await soundPromise;
  currentSound.play();
});
panel.addControl(playButton);

const stopButton = Button.CreateSimpleButton(
  "stopButton",
  "STOP"
);
stopButton.width = 0.5;
stopButton.height = "80px";
stopButton.color = "white";
stopButton.fontSize = 40;
stopButton.fontWeight = 700;
stopButton.background = "red";
stopButton.onPointerUpObservable.add(() => {
  soundPromise.then((s) => s.stop());
});
panel.addControl(stopButton);
});