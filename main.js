import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OBJLoader } from "three/examples/jsm/Addons.js";

// state variables
let isAnimating = true;
const orbitRadius = 5;
const cameraHeight = 0;
const orbitSpeed = 0.3;

// HTML element
const canvas = document.getElementById("three-canvas");
const toggleBtn = document.getElementById("toggle-cam-btn");

const clock = new THREE.Clock();
const scene = new THREE.Scene();

// setup camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000,
);
camera.position.z = 3;

// setup lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
scene.add(directionalLight);

// setup renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

// setup composer to render outline pass for selected object
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera,
);
outlinePass.edgeThickness = 1.0; // Thickness of the line
outlinePass.edgeStrength = 10.0; // Crispness/opacity
outlinePass.visibleEdgeColor.set("#000000"); // Ink color
outlinePass.hiddenEdgeColor.set("#000000"); // Outline even if blocked by objects

composer.addPass(outlinePass);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0); // Always orbit around the center object
controls.enableDamping = true; // Adds a smooth weight/inertia when dragging
// Calculate the fixed pitch angle based on your preset height and radius
// to restricts the camera to ONLY rotate around the X and Z axes when dragged
const fixedPolarAngle = Math.atan2(orbitRadius, cameraHeight);
controls.minPolarAngle = fixedPolarAngle;
controls.maxPolarAngle = fixedPolarAngle;
controls.enabled = true;

// load lemon object + add toon material so it looks cartoonish
const toonMaterial = new THREE.MeshToonMaterial({ color: 0xffe462 });
// let lemonModel;
const loader = new OBJLoader();
loader.load("public/lemon.obj", (obj) => {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.material = toonMaterial;
    }
  });

  obj.rotateX(30);
  // obj.rotateZ(30);
  scene.add(obj);
  outlinePass.selectedObjects = [obj];
  // lemonModel = obj;
});

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
/**
 * Functions region
 */
function resizeRenderer() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const needsResize =
    canvas.width !== width * renderer.getPixelRatio() ||
    canvas.height !== height * renderer.getPixelRatio();

  if (needsResize) {
    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  resizeRenderer();

  if (isAnimating) {
    // AUTOMATIC MODE: Drive camera position using math
    const elapsedTime = clock.getElapsedTime();
    camera.position.x = Math.cos(elapsedTime * orbitSpeed) * orbitRadius;
    camera.position.z = Math.sin(elapsedTime * orbitSpeed) * orbitRadius;
    camera.position.y = cameraHeight;
    camera.lookAt(0, 0, 0);
  } else {
    // MANUAL MODE: Let OrbitControls take over and handle the dragging
    controls.update();
  }
  composer.render(scene, camera);
}
animate();

// register event listeners
toggleBtn.addEventListener("click", () => {
  isAnimating = !isAnimating;

  if (isAnimating) {
    toggleBtn.innerText = "Stop Animation";
    // Swap Tailwind colors
    toggleBtn.classList.remove("bg-red-500", "hover:bg-red-600");
    toggleBtn.classList.add("bg-emerald-500", "hover:bg-emerald-600");
    controls.enabled = false;
  } else {
    toggleBtn.innerText = "Start Animation";
    // Swap Tailwind colors
    toggleBtn.classList.remove("bg-emerald-500", "hover:bg-emerald-600");
    toggleBtn.classList.add("bg-red-500", "hover:bg-red-600");
    controls.enabled = true;
  }
});
