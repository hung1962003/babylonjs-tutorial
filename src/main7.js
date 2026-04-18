import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    ParticleSystem,
    GPUParticleSystem,
    Color4,
    Texture,
    MeshBuilder
  } from "@babylonjs/core";
  import "@babylonjs/loaders";
  import "@babylonjs/core/Particles/particleSystemComponent.js";
  import "@babylonjs/core/Particles/webgl2ParticleSystem.js";
  import "./style.css";
  const flare = `${import.meta.env.BASE_URL}assets/flare_transparent.png`;
  const star = `${import.meta.env.BASE_URL}assets/star.png`;
  const splash = `${import.meta.env.BASE_URL}assets/splash.png`;
  
  const canvas = document.getElementById("renderCanvas");
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
  
  const camera = new ArcRotateCamera(
    "ArcRotateCamera",
    -Math.PI / 2,
    Math.PI / 2.2,
    80,
    new Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);
  
  // Render
  engine.runRenderLoop(() => {
    scene.render();
  });
  // Resize
  window.addEventListener("resize", () => {
    engine.resize();
  });
  
  // Create a large plane mesh in front of the camera
  const planeMesh = MeshBuilder.CreatePlane("plane", { size: 1000 }, scene);
  planeMesh.position = camera.position.add(
    camera.getForwardRay().direction.scale(10)
  ); // Position 10 units in front of the camera
  planeMesh.lookAt(camera.position); // Orient the plane to face the camera
  planeMesh.isVisible = false; // Make the plane invisible
  
  const particleSystem = new ParticleSystem(
    "particles",
    2000,
    scene
  );
  
  particleSystem.particleTexture = new Texture(flare, scene);
  particleSystem.emitter = Vector3.Zero(); // the starting location
  particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
  particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
  particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 1.5;
  particleSystem.emitRate = 4000;
  particleSystem.createSphereEmitter(2);
  particleSystem.minEmitPower = 1;
  particleSystem.maxEmitPower = 3;
  particleSystem.updateSpeed = 0.005;
  
  const fountain = new ParticleSystem(
    "fountain",
    2000,
    scene
  );
  
  fountain.emitter = new Vector3(0, 0, 0);
  fountain.particleTexture = new Texture(flare, scene);
  fountain.hasAlpha = true;
  fountain.minSize = 0.5;
  fountain.maxSize = 1;
  fountain.minLifeTime = 0.5;
  fountain.maxLifeTime = 1;
  //fountain.blendMode = ParticleSystem.BLENDMODE_STANDARD;
  fountain.createConeEmitter(1, Math.PI / 3);
  fountain.emitRate = 500; // Increase the emission rate
  fountain.minEmitPower = 4;
  fountain.maxEmitPower = 7;
  fountain.gravity = new Vector3(0, -9.81, 0);
  fountain.color1 = new Color4(0, 0, 1, 1); // Bright blue at the start
  fountain.color2 = new Color4(0.5, 0.5, 1, 0.5); // Fade to lighter blue in the middle
  fountain.colorDead = new Color4(1, 1, 1, 0); // Fade to white and
  
  const starfield = new ParticleSystem(
    "starfield",
    10000,
    scene
  );
  starfield.particleTexture = new Texture(star);
  starfield.particleTexture = new Texture(star, scene);
  starfield.hasAlpha = true;
  starfield.emitter = new Vector3(0, 0, 0);
  starfield.createSphereEmitter(150); // Increase this value as needed
  starfield.colorDead = new Color4(0, 0, 0, 0);
  starfield.minSize = 0.1;
  starfield.maxSize = 0.3;
  starfield.minLifeTime = 0.4;
  starfield.maxLifeTime = 3;
  starfield.emitRate = 10000;
  starfield.blendMode = ParticleSystem.BLENDMODE_MULTIPLYADD;
  starfield.minEmitPower = 0;
  starfield.maxEmitPower = 0;
  
  const rotatingParticles = new ParticleSystem(
    "rotatingParticles",
    2000,
    scene
  );
  rotatingParticles.particleTexture = new Texture(splash, scene);
  rotatingParticles.emitter = new Vector3(0, 0, 0);
  rotatingParticles.createSphereEmitter(2); // Create a spherical emitter
  rotatingParticles.colorDead = new Color4(1, 1, 1, 0);
  rotatingParticles.minSize = 0.8;
  rotatingParticles.maxSize = 2;
  rotatingParticles.minLifeTime = 0.1;
  rotatingParticles.maxLifeTime = 2;
  rotatingParticles.emitRate = 1000;
  rotatingParticles.blendMode =
    ParticleSystem.BLENDMODE_STANDARD;
  rotatingParticles.minEmitPower = 1;
  rotatingParticles.maxEmitPower = 6;
  rotatingParticles.gravity = new Vector3(0, 0, 0);
  rotatingParticles.minInitialRotation = 0;
  rotatingParticles.maxInitialRotation = Math.PI;
  rotatingParticles.minAngularSpeed = 5;
  rotatingParticles.maxAngularSpeed = 20;
  
  const gpuSystem = new GPUParticleSystem(
    "gpuParticles",
    { capacity: 400000 },
    scene
  );
  gpuSystem.activeParticleCount = 400000;
  gpuSystem.createBoxEmitter(
    new Vector3(-3, 2, 1),
    new Vector3(3, 2, -1),
    new Vector3(-1, -1, -2.5),
    new Vector3(1, 1, 2.5)
  );
  
  gpuSystem.particleTexture = new Texture(flare, scene);
  gpuSystem.emitRate = 30000;
  gpuSystem.minEmitPower = 1;
  gpuSystem.maxEmitPower = 6;
  gpuSystem.minLifeTime = 0.5;
  gpuSystem.maxLifeTime = 1;
  gpuSystem.minSize = 0.1;
  gpuSystem.maxSize = 0.3;
  gpuSystem.color1 = new Color4(1, 0, 0, 1);
  gpuSystem.color2 = new Color4(0, 0, 1, 1);
  gpuSystem.color3 = new Color4(0, 1, 0, 1);
  gpuSystem.colorDead = new Color4(1, 1, 0, 0); // Yellow
  gpuSystem.blendMode =
    GPUParticleSystem.BLENDMODE_MULTIPLYADD;
  gpuSystem.gravity = new Vector3(0, -9.81, 0);
    


const galaxy = new ParticleSystem("galaxy", 20000, scene);

galaxy.particleTexture = new Texture(star, scene);
galaxy.emitter = new Vector3(0, 0, 0);

// màu galaxy
galaxy.color1 = new Color4(1, 1, 1, 1);
galaxy.color2 = new Color4(0.5, 0.5, 1, 1);
galaxy.colorDead = new Color4(0, 0, 0, 0);

// size
galaxy.minSize = 0.05;
galaxy.maxSize = 0.2;

// lifetime
galaxy.minLifeTime = 5;
galaxy.maxLifeTime = 10;

// KHÔNG bắn ra ngoài
galaxy.minEmitPower = 0;
galaxy.maxEmitPower = 0;

// spawn dạng sphere lớn
galaxy.createSphereEmitter(50);

// nhiều particle
galaxy.emitRate = 20000;

// blend đẹp cho galaxy
galaxy.blendMode = ParticleSystem.BLENDMODE_MULTIPLYADD;

// rotation (cực quan trọng)
galaxy.minAngularSpeed = 0.2;
galaxy.maxAngularSpeed = 1.0;

// không gravity
galaxy.gravity = new Vector3(0, 0, 0);

// start
galaxy.start();
galaxy.startPositionFunction = (worldMatrix, positionToUpdate) => {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 50;

  // tạo xoắn ốc
  const spiral = angle * 2;

  positionToUpdate.x = Math.cos(angle + spiral) * radius;
  positionToUpdate.z = Math.sin(angle + spiral) * radius;
  positionToUpdate.y = (Math.random() - 0.5) * 5;
};
scene.onBeforeRenderObservable.add(() => {
  galaxy.emitter.x = 0;
  galaxy.emitter.y = 0;
  galaxy.emitter.z = 0;

  // quay toàn bộ galaxy
  galaxy._emitterWorldMatrix = Matrix.RotationY(performance.now() * 0.00005);
});
const arms = 4;

galaxy.startPositionFunction = (worldMatrix, positionToUpdate) => {
  const armIndex = Math.floor(Math.random() * arms);
  const angle = (armIndex / arms) * Math.PI * 2;

  const distance = Math.random() * 50;

  const twist = distance * 0.3;

  positionToUpdate.x = Math.cos(angle + twist) * distance;
  positionToUpdate.z = Math.sin(angle + twist) * distance;
  positionToUpdate.y = (Math.random() - 0.5) * 3;
};
galaxy.color1 = new Color4(1, 0.8, 1, 1);
galaxy.color2 = new Color4(0.3, 0.5, 1, 1);
const core = new ParticleSystem("core", 2000, scene);
core.createSphereEmitter(5);
core.emitRate = 5000;
core.minSize = 0.5;
core.maxSize = 2;
core.blendMode = ParticleSystem.BLENDMODE_ADD;
core.start();
camera.radius -= 0.01;

    const particleSystems = [
      particleSystem,
      rotatingParticles,
      gpuSystem,
      fountain,
      starfield,
      galaxy
    ];
    
    scene.onPointerDown = () => {
      let pickResult = scene.pick(
        scene.pointerX,
        scene.pointerY,
        (mesh) => mesh === planeMesh
      );
    
      if (pickResult.hit) {
        const randomIndex = Math.floor(
          Math.random() * particleSystems.length
        );
        const selectedParticleSystem =
          particleSystems[randomIndex];
        selectedParticleSystem.emitter = pickResult.pickedPoint;
        selectedParticleSystem.start();
        setTimeout(() => {
          selectedParticleSystem.stop();
        }, 1000);
      }
    };
    