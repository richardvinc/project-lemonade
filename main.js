import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

// --- 1. SETUP THREE.JS SCENE ---
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f5f9);

const camera = new THREE.PerspectiveCamera(
  45,
  (window.innerWidth - 120) / window.innerHeight,
  0.1,
  100,
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth - 120, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// --- 2. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 5, 4);
dirLight.castShadow = true;
scene.add(dirLight);

// --- 3. CREATE CHARACTER ROOT & LOAD OBJ ---
const characterGroup = new THREE.Group();
scene.add(characterGroup);

const lemonMaterial = new THREE.MeshStandardMaterial({
  color: 0xffe135,
  roughness: 0.3,
  metalness: 0.1,
});

// Instantiate OBJLoader
const loader = new OBJLoader();

const objPath = "public/lemon.obj";

let lemonModel = null;
loader.load(
  objPath,
  (obj) => {
    // Apply our yellow lemon material to loaded meshes
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = lemonMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    obj.rotateX(30);
    lemonModel = obj;

    characterGroup.add(obj);
    console.log("Lemon OBJ loaded successfully!");
  },
  (xhr) => {},
  (error) => {
    console.warn("An error occurred loading the OBJ. Using fallbacks.", error);

    // Fallback basic cylinder/sphere placeholder so app functions if file is missing
    const fallbackGeo = new THREE.SphereGeometry(1, 32, 32);
    fallbackGeo.scale(1, 1, 1);
    const fallbackMesh = new THREE.Mesh(fallbackGeo, lemonMaterial);
    characterGroup.add(fallbackMesh);
  },
);
const axesHelper = new THREE.AxesHelper(5);
if (lemonModel) lemonModel.add(axesHelper);

// --- 4. EYES MANAGEMENT ---
const eyeGroup = new THREE.Group();
// Shift forward relative to your asset geometry profile depth boundary
eyeGroup.position.set(0, 0.1, 1.1);
characterGroup.add(eyeGroup);

const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
let leftEyeMesh, rightEyeMesh;
let currentType = "round";
let currentGap = 0.35;

function createEyes(type) {
  currentType = type;
  if (leftEyeMesh) eyeGroup.remove(leftEyeMesh);
  if (rightEyeMesh) eyeGroup.remove(rightEyeMesh);

  let eyeGeo;

  if (type === "round") {
    eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    eyeGeo.scale(1, 1, 0.3);
  } else if (type === "tall") {
    eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
    eyeGeo.scale(1, 2, 0.4);
  } else if (type === "happy") {
    eyeGeo = new THREE.TorusGeometry(0.1, 0.025, 8, 16, Math.PI);
  }

  leftEyeMesh = new THREE.Mesh(eyeGeo, eyeMaterial);
  rightEyeMesh = new THREE.Mesh(eyeGeo, eyeMaterial);

  // You might need to change these offsets slightly depending on your OBJ size
  leftEyeMesh.position.x = -0.35;
  rightEyeMesh.position.x = 0.35;

  leftEyeMesh.rotation.y = 0.2;
  rightEyeMesh.rotation.y = -0.2;

  // Apply current gap transformations
  applyEyeGap();

  eyeGroup.add(leftEyeMesh);
  eyeGroup.add(rightEyeMesh);
}

function applyEyeGap() {
  if (!leftEyeMesh || !rightEyeMesh) return;

  leftEyeMesh.position.x = -currentGap;
  rightEyeMesh.position.x = currentGap;

  // Make the eyes subtle conform to the round face profile as they widen
  leftEyeMesh.rotation.y = currentGap * 0.57;
  rightEyeMesh.rotation.y = -currentGap * 0.57;
}

createEyes("round");

// --- 5. INTERACTION & EVENT LISTENERS ---
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let controlMode = "model";

function updateEyeUI(type, element) {
  createEyes(type);
  document.querySelectorAll(".item-btn").forEach((btn) => {
    btn.className =
      "item-btn w-14 h-14 my-1 border-2 border-slate-200 bg-white rounded-full flex items-center justify-center transition-all hover:scale-105 hover:border-slate-400";
  });
  element.className =
    "item-btn w-14 h-14 my-1 border-2 border-blue-500 bg-blue-50 rounded-full flex items-center justify-center transition-all hover:scale-105";
}

document
  .getElementById("btn-round")
  .addEventListener("click", (e) => updateEyeUI("round", e.currentTarget));
document
  .getElementById("btn-tall")
  .addEventListener("click", (e) => updateEyeUI("tall", e.currentTarget));
document
  .getElementById("btn-happy")
  .addEventListener("click", (e) => updateEyeUI("happy", e.currentTarget));

const modeToggle = document.getElementById("mode-toggle");
modeToggle.addEventListener("click", () => {
  if (controlMode === "model") {
    controlMode = "camera";
    modeToggle.textContent = "Rotate Camera";
    modeToggle.className =
      "w-full py-2 px-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs font-bold shadow-sm transition-all duration-200";
  } else {
    controlMode = "model";
    modeToggle.textContent = "Rotate Model";
    modeToggle.className =
      "w-full py-2 px-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm transition-all duration-200";
  }
});

document.getElementById("eye-scale").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  eyeGroup.scale.set(val, val, val);
});

document.getElementById("eye-y").addEventListener("input", (e) => {
  eyeGroup.position.y = parseFloat(e.target.value);
});

document.getElementById("eye-gap").addEventListener("input", (e) => {
  currentGap = parseFloat(e.target.value);
  applyEyeGap();
});

container.addEventListener("mousedown", (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener("mouseup", () => (isDragging = false));

container.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - previousMousePosition.x;
  const speed = 0.007;

  if (controlMode === "model") {
    characterGroup.rotation.y += deltaX * speed;
  } else if (controlMode === "camera") {
    const radius = 5;
    let theta = Math.atan2(camera.position.x, camera.position.z);
    theta -= deltaX * speed;

    camera.position.x = radius * Math.sin(theta);
    camera.position.z = radius * Math.cos(theta);
    camera.lookAt(0, 0, 0);
  }

  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener("resize", () => {
  const width = window.innerWidth - 120;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// --- 6. ANIMATION LOOP ---
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
