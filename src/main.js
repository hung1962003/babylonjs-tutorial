import * as BABYLON from "babylonjs";
import "./style.css";
import earcut from "earcut";
import "@babylonjs/loaders/glTF";
import { Inspector } from "@babylonjs/inspector";
const forest = "/assets/forest.env";
window.earcut = earcut;
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true); // bien engine thanh render the scene trong canvas element  tham số true bật anti-aliasing (làm mịn hình)

const createScene = async function () {
  const scene = new BABYLON.Scene(engine);
  //scene.createDefaultCamera();
  scene.createDefaultLight();
  //const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 5, -10), scene);
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    0,
    0,
    10,
    new BABYLON.Vector3(0, 0, 0),
    scene,
  );
  camera.attachControl(canvas, true);
  //allow user to Lắng nghe mouse event ,.....
  //camera.inputs.addMouseWheel(); // cho phep lan con chuot
  //camera.setTarget(BABYLON.Vector3.Zero()); //Quay camera để nó nhìn vào vector đó

  //camera.setPosition(new BABYLON.Vector3(0, 0, -20));
  // camera.lowerBetaLimit= Math.PI /4 ;
  // camera.upperBetaLimit= Math.PI /2 ;
  // camera.lowerRadiusLimit= 10;
  // camera.upperRadiusLimit= 20;

  // const box = BABYLON.MeshBuilder.CreateBox('myBox', {
  //  size:1,
  // //   // width:1,//x
  // //   // height:1,//y
  // //   // depth:1,//Z
  // //  // faceColors:[new BABYLON.Color3(1, 0, 0), new BABYLON.Color3(0, 1, 0), new BABYLON.Color3(0, 0, 1), new BABYLON.Color3(1, 1, 0), new BABYLON.Color3(1, 0, 1), new BABYLON.Color3(0, 1, 1)],
  //   faceUV : [
  //     new BABYLON.Vector4(0,0, 1/6,1), // tach 1 ảnh thành nhiều phàn và mỗi mặt gắn 1 ảnh khác nhau
  //     new BABYLON.Vector4(1/6,0, 2/6,1),
  //     new BABYLON.Vector4(2/6,0, 3/6,1),
  //     new BABYLON.Vector4(3/6,0, 4/6,1),
  //     new BABYLON.Vector4(4/6,0, 5/6,1),
  //     new BABYLON.Vector4(5/6,0, 1,1),
  //   ],
  //    wrap:true // cho các ảnh đều cùng 1 hướng thuận mắt
  //  }, scene);

  // const boxCatMat = new BABYLON.StandardMaterial();
  // box.material= boxCatMat;
  // boxCatMat.emissiveTexture= new BABYLON.Texture('/cats.png')
  //box.position.x=2;
  //box.position= new BABYLON.Vector3(2,5,1); doi vi tri ban dau cua box

  //box.rotation.x= Math.PI / 4;
  //box.rotation = new BABYLON.Vector3(0,0,Math.PI/6) // này sẽ chèn cái trên

  // box.scaling.y=2
  // box.scaling = new BABYLON.Vector3(2,2,2)
  // const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  // const positionGizmo = new BABYLON.PositionGizmo(utilLayer); // Tạo một gizmo điều khiển vị trí object.(tạo ra 3 mũi tên trục XYZ để kéo object.)
  // positionGizmo.attachedMesh = box; //Gắn gizmo vào mesh box.
  // const sphere = BABYLON.MeshBuilder.CreateSphere('mySphere', {
  //   segments:5,
  //   diameter:0.3,//duong kinh neu diameterX=0.5 thi uu tien ben ngang la 0.5 va nguoc lai
  //   //diameterZ:0.5,
  // }, scene);

  // const ground = BABYLON.MeshBuilder.CreateGround('ground', {
  //   width: 10,
  //   height: 10,
  //   subdivisions: 5,
  //   subdivisionsX: 10
  // }, scene);

  // const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
  // groundMat.emissiveTexture = new BABYLON.Texture('/cats.png',scene)
  // ground.material = groundMat;
  // groundMat.emissiveTexture.uScale = 5; //đang thay đổi tỉ lệ lặp của texture theo trục U (trục ngang)
  // groundMat.emissiveTexture.vScale = 5; //đang thay đổi tỉ lệ lặp của texture theo trục V (trục dọc)
  //  groundMat.emissiveTexture.uOffset = 1.4; // dời/cắt hình ảnh đi 1/2 và gắn lại phần đầu  theo trục X
  //  groundMat.emissiveTexture.vOffset = 1.4;
  //ground.material.diffuseColor = new BABYLON.Color3(0, 1, 0); //(màu chính)
  //ground.material.wireframe = true;//vẽ cạnh , hien thi khung luoi

  const groundFromHM = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
    "groundHM",
    "/tuong.jpg",
    {
      width: 10,
      height: 10,
      subdivisions: 10,
      maxHeight: 3,
    },
    scene,
    (mesh) => {
      const mat = new BABYLON.StandardMaterial("groundHMColorMat", scene);
      mat.diffuseTexture = new BABYLON.Texture(heightMapUrl, scene);
      mat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
      mesh.material = mat;
    },
  );
  //groundFromHM.material = new BABYLON.StandardMaterial('groundMaterial', scene);
  // groundFromHM.material.wireframe = true;//vẽ cạnh , hien thi khung luoi
  //groundFromHM.material = new BABYLON.StandardMaterial('groundMaterial', scene);
  // groundFromHM.material.wireframe = true;//vẽ cạnh , hien thi khung luoi

  // const fontData = await (await fetch('/Montserrat_Regular.json')).json();
  // const text = BABYLON.MeshBuilder.CreateText(
  //   'text',
  //   'Hello World',
  //   fontData,
  //  {
  //   size:3,
  //   depth:0.3,
  //   resolution:64
  //  }
  // );

  // const sphere = new BABYLON.MeshBuilder.CreateSphere('sphere', {
  //   diameter:0.3,
  //   diameterY:0.4,
  //   segments:32,
  //   //segmentsY:32,
  // }, scene);

  //const sphereMaterial = new BABYLON.StandardMaterial('sphereMaterial', scene);
  //sphereMaterial.alpha =0.2;
  // sphereMaterial.diffuseTexture=new BABYLON.Texture('/heightmap.png')
  // sphereMaterial.emissiveTexture=new BABYLON.Texture('/heightmap.png')
  //sphereMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);//màu chính của vật thể khi ánh sáng chiếu vào.
  //sphereMaterial.specularColor = new BABYLON.Color3(0, 1, 0);//ánh sáng phản chiếu trên bề mặt vật thể
  //sphereMaterial.wireframe = true;
  //sphereMaterial.ambientColor = new BABYLON.Color3(0, 1, 1);//màu sắc của vật thể khi không có ánh sáng chiếu vào
  //scene.ambientColor = new BABYLON.Color3(0, 1, 1);//màu sắc của toàn bộ cảnh khi không có ánh sáng chiếu vào
  //sphereMaterial.emissiveColor= new BABYLON.Color3(1, 0, 0)
  //sphere.material = sphereMaterial;

  //  scene.registerBeforeRender(function() {
  //   //console.log('render');
  //   box.rotation.y += 0.01;
  //   box.rotation.x += 0.01;
  //   box.rotation.z += 0.01;
  //  });
  //====
  // BABYLON.Animation.CreateAndStartAnimation(
  //   'xScale',
  //   box,
  //   'scaling.x',
  //   30,
  //   120,
  //   0,
  //   2,
  //   BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
  //   new BABYLON.CircleEase
  // )
  // const animation = new BABYLON.Animation(
  //   'yRotAnimation',
  //   'rotation.y',
  //   30,
  //   BABYLON.Animation.ANIMATIONTYPE_FLOAT,
  //   BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  // );

  // const animationKeys = [];

  // animationKeys.push({
  //   frame: 0,
  //   value: 0
  // });

  // animationKeys.push({
  //   frame: 120,
  //   value: 2 * Math.PI
  // });

  // animation.setKeys(animationKeys);

  // box.animations = [];
  // box.animations.push(animation);
  // scene.beginAnimation(box, 0, 120, true);

  // const light = new BABYLON.PointLight(
  //   'pointLight',
  //   new BABYLON.Vector3(0, 1, 0),
  //   scene
  // );

  // const light = new BABYLON.SpotLight(
  //   'spotLight',
  //   new BABYLON.Vector3(0, 1, 0),
  //   new BABYLON.Vector3(0, -1, 0),
  //   Math.PI / 3,
  //   2,
  //   scene
  // );
  // light.range = 10;

  // const light = new BABYLON.DirectionalLight(
  //   'directionalLight',
  //   new BABYLON.Vector3(-2, -3, 0),
  //   scene
  // );
  // light.intensity = 0.5

  // const light = new BABYLON.HemisphericLight(
  //   'hemisphericLight',
  //   new BABYLON.Vector3(-5, 5, 0),
  //   scene
  // );
  // light.groundColor = new BABYLON.Color3(0, 1, 0);

  // light.diffuse = new BABYLON.Color3(0, 0, 1);
  // light.specular = new BABYLON.Color3(0, 1, 0);

  // const lightGizmo = new BABYLON.LightGizmo(utilLayer);//visual helper giúp hiển thị vị trí và hướng của light trong scene.
  // lightGizmo.light = light;

  // const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);

  // shadowGenerator.addShadowCaster(sphere);
  // ground.receiveShadows = true; //Mesh ground nhận bóng.

  // //shadowGenerator.setDarkness(0.5); //Điều chỉnh độ tối của bóng.
  // shadowGenerator.useBlurExponentialShadowMap = true; //Dùng shadow map mượt hơn.
  // shadowGenerator.useKernelBlur = true; //Áp dụng blur filter cho shadow.
  // shadowGenerator.blurKernel = 64;

  // scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR; //Sương mù tăng đều theo khoảng cách.
  // scene.fogStart = 10;
  // scene.fogEnd = 60;

  // scene.fogMode = BABYLON.Scene.FOGMODE_EXP2; //Fog tăng theo hàm mũ.
  // scene.fogDensity = 0.08;
  // scene.fogColor = new BABYLON.Color3(0.3, 0.2, 0.6);
  // lam mờ vặt thể khi ở xa
  //  scene.onPointerDown = function castRay() {
  //   const hit = scene.pick(scene.pointerX, scene.pointerY);

  //   if(hit.pickedMesh && hit.pickedMesh.name === 'mySphere') {
  //     hit.pickedMesh.material = new BABYLON.StandardMaterial();
  //     hit.pickedMesh.material.diffuseColor = BABYLON.Color3.Red();
  //   }
  // }

  // scene.createDefaultEnvironment({
  //   environmentTexture: forest,
  //   skyboxTexture: forest,
  //   skyboxSize: 1000,
  //   groundSize: 50,
  //   enableGroundMirror: true
  // });

  // SceneLoader.ImportMesh(
  //   '',
  //   '/',
  //   'Cow.gltf',
  //   scene,
  //   function(meshes, particleSystems, skeletons, animationGroups) {
  //     const model = meshes[0];
  //     model.scaling = new BABYLON.Vector3(0.25, 0.25, 0.25);

  //     animationGroups[5].play(true);
  //   }
  // );

  // SceneLoader.ImportMeshAsync("", "/", "Cow.gltf", scene).then((result) => {
  //   const importedAnimGroups = result.animationGroups;
  //   importedAnimGroups[3].play(true);
  // });

  // SceneLoader.ImportMeshAsync("", damagedHelmet, null, scene).then((helmet) => {
  //   helmet.meshes[0].position.y = 2;
  //   camera.setTarget(helmet.meshes[0]);

  //   scene.onBeforeRenderObservable.add(() => {//Chạy code mỗi frame
  //     helmet.meshes[0].rotate(new Vector3(0, 1, 0), 0.001);
  //   });
  // });

  // const bgMusic = new BABYLON.Sound('mySong', '/DivKid.mp3', scene, null, {
  //   loop: true,
  //   autoplay: true
  //});

  return scene;
};
const scene = await createScene();
engine.runRenderLoop(function () {
  //60fps
  scene.render();
});

window.addEventListener("resize", function () {
  // set cung object 3 size de khong bi resize theo window
  // box.position.y = 0.5;
  // box.position.x = 0.5;
  // box.position.z = 0.5;
  // box.rotation.x = Math.PI / 4;
  // box.rotation.y = Math.PI / 4;
  // box.rotation.z = Math.PI / 4;
  // box.scale.x = 2;
  // box.scale.y = 2;
  // box.scale.z = 2;
  // box.rotation.x = Math.PI / 4;
  // box.rotation.y = Math.PI / 4;
  // box.rotation.z = Math.PI / 4;
  // box.position.y = 0.5;
  // box.position.x = 0.5;
  // box.position.z = 0.5;
  // box.material.wireframe = true;
  engine.resize();
});
Inspector.Show(scene, {});
