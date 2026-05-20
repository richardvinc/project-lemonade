import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

// Change these strings to target your real project folder filenames
const eyeImages = [
  { id: "eye-1", url: "eyes/1.png", label: "Eye1" },
  { id: "eye-2", url: "eyes/2.png", label: "Eye2" },
  { id: "eye-3", url: "eyes/3.png", label: "Eye3" },
  { id: "eye-4", url: "eyes/4.png", label: "Eye4" },
  { id: "eye-5", url: "eyes/5.png", label: "Eye5" },
  { id: "eye-6", url: "eyes/6.png", label: "Eye6" },
  { id: "eye-7", url: "eyes/7.png", label: "Eye7" },
  { id: "eye-8", url: "eyes/8.png", label: "Eye8" },
  { id: "eye-9", url: "eyes/9.png", label: "Eye9" },
  { id: "eye-10", url: "eyes/10.png", label: "Eye10" },
  { id: "eye-11", url: "eyes/11.png", label: "Eye11" },
  { id: "eye-12", url: "eyes/12.png", label: "Eye12" },
  { id: "eye-13", url: "eyes/13.png", label: "Eye13" },
  { id: "eye-14", url: "eyes/14.png", label: "Eye14" },
  { id: "eye-15", url: "eyes/15.png", label: "Eye15" },
  { id: "eye-16", url: "eyes/16.png", label: "Eye16" },
  { id: "eye-17", url: "eyes/17.png", label: "Eye17" },
  { id: "eye-18", url: "eyes/18.png", label: "Eye18" },
  { id: "eye-19", url: "eyes/19.png", label: "Eye19" },
];

const mouthImages = [
  { id: "mouth-1", url: "mouths/1.png", label: "Mouth1" },
  { id: "mouth-2", url: "mouths/2.png", label: "Mouth2" },
  { id: "mouth-3", url: "mouths/3.png", label: "Mouth3" },
  { id: "mouth-4", url: "mouths/4.png", label: "Mouth4" },
  { id: "mouth-5", url: "mouths/5.png", label: "Mouth5" },
  { id: "mouth-6", url: "mouths/6.png", label: "Mouth6" },
  { id: "mouth-7", url: "mouths/7.png", label: "Mouth7" },
  { id: "mouth-8", url: "mouths/8.png", label: "Mouth8" },
  { id: "mouth-9", url: "mouths/9.png", label: "Mouth9" },
  { id: "mouth-10", url: "mouths/10.png", label: "Mouth10" },
  { id: "mouth-11", url: "mouths/11.png", label: "Mouth11" },
  { id: "mouth-12", url: "mouths/12.png", label: "Mouth12" },
  { id: "mouth-13", url: "mouths/13.png", label: "Mouth13" },
  { id: "mouth-14", url: "mouths/14.png", label: "Mouth14" },
  { id: "mouth-15", url: "mouths/15.png", label: "Mouth15" },
  { id: "mouth-16", url: "mouths/16.png", label: "Mouth16" },
  { id: "mouth-17", url: "mouths/17.png", label: "Mouth17" },
];

// --- SETUP THREE.JS SCENE ---
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f5f9);
const width = container.clientWidth;
const height = container.clientHeight;

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight, false);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.domElement.className = "block w-full h-full";
renderer.domElement.style.touchAction = "none";

// setup composer to render outline pass for selected object
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const outlinePass = new OutlinePass(
  new THREE.Vector2(container.innerWidth, container.innerHeight),
  scene,
  camera,
);
outlinePass.edgeThickness = 1.0; // Thickness of the line
outlinePass.edgeStrength = 10.0; // Crispness/opacity
outlinePass.visibleEdgeColor.set("#000000"); // Ink color
outlinePass.hiddenEdgeColor.set("#000000"); // Outline even if blocked by objects
composer.addPass(outlinePass);

container.appendChild(renderer.domElement);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.3);
dirLight.position.set(5, 5, 4);
dirLight.castShadow = true;
scene.add(dirLight);

// --- CREATE CHARACTER ROOT & LOAD OBJ ---
const characterGroup = new THREE.Group();
scene.add(characterGroup);

// load lemon object and set material
const lemonMaterial = new THREE.MeshToonMaterial({ color: 0xffe462 });
const loader = new OBJLoader();
const objPath = "models/lemon.obj";
loader.load(
  objPath,
  (obj) => {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = lemonMaterial;
        child.castShadow = true;
      }
    });
    obj.rotateX(30);
    outlinePass.selectedObjects = [obj];
    characterGroup.add(obj);
  },
  undefined,
  (error) => {
    const fallbackGeo = new THREE.SphereGeometry(1, 32, 32);
    fallbackGeo.scale(1, 1.3, 1);
    const fallbackMesh = new THREE.Mesh(fallbackGeo, lemonMaterial);
    characterGroup.add(fallbackMesh);
  },
);

// --- 2D SPRITE MANAGEMENT ---
// for eye
const eyeTextureLoader = new THREE.TextureLoader();
const eyePlaneGeo = new THREE.PlaneGeometry(1.2, 0.8);
const eyePlaneMat = new THREE.MeshBasicMaterial({
  transparent: true,
  side: THREE.FrontSide,
  depthWrite: false, // Prevents alpha masking issues against the model edge
});

const eyeMesh = new THREE.Mesh(eyePlaneGeo, eyePlaneMat);
// Positioned right against the front boundary of the lemon fallback mesh
eyeMesh.position.set(0, 0.1, 1.1);
characterGroup.add(eyeMesh);

// for mouth
const mouthTextureLoader = new THREE.TextureLoader();
const mouthPlaneGeo = new THREE.PlaneGeometry(0.5, 0.5);
const mouthPlaneMat = new THREE.MeshBasicMaterial({
  transparent: true,
  side: THREE.FrontSide,
  depthWrite: false, // Prevents alpha masking issues against the model edge
});

const mouthMesh = new THREE.Mesh(mouthPlaneGeo, mouthPlaneMat);
// Positioned right against the front boundary of the lemon fallback mesh
mouthMesh.position.set(0, -0.25, 1.1);
characterGroup.add(mouthMesh);

function changeEyeTexture(url) {
  eyeTextureLoader.load(url, (texture) => {
    // Ensure correct color space handling for standard PNG variants
    texture.colorSpace = THREE.SRGBColorSpace;
    eyePlaneMat.map = texture;
    eyePlaneMat.needsUpdate = true;
  });
}

function changeMouthTexture(url) {
  mouthTextureLoader.load(url, (texture) => {
    // Ensure correct color space handling for standard PNG variants
    texture.colorSpace = THREE.SRGBColorSpace;
    mouthPlaneMat.map = texture;
    mouthPlaneMat.needsUpdate = true;
  });
}

// --- 6. DYNAMIC UI GENERATION FROM FOLDERS ---
const eyeGrid = document.getElementById("eye-grid");
eyeImages.forEach((eye, index) => {
  const btn = document.createElement("button");
  btn.id = eye.id;
  // Thumbnails fall back gracefully to text labels if assets are loading locally
  btn.className = `eye-btn w-full aspect-portrait border-2 flex flex-col items-center justify-center p-1 rounded-xl transition-all hover:scale-105 ${
    index === 0
      ? "border-blue-500 bg-blue-50"
      : "border-slate-200 bg-white hover:border-slate-400"
  }`;

  btn.innerHTML = `
        <div class="w-full flex-grow bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden mb-1">
            <img src="${eye.url}" alt="${eye.label}" class="max-w-full max-h-full object-contain error-fallback" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <span class="hidden text-[10px] font-bold text-slate-400">PNG</span>
        </div>
        <span class="text-[9px] font-medium text-slate-600 truncate w-full text-center">${eye.label}</span>
    `;

  btn.addEventListener("click", (e) => {
    document.querySelectorAll(".eye-btn").forEach((b) => {
      b.className =
        "eye-btn w-full aspect-portrait border-2 border-slate-200 bg-white flex flex-col items-center justify-center p-1 rounded-xl transition-all hover:scale-105 hover:border-slate-400";
    });
    btn.className =
      "eye-btn w-full aspect-portrait border-2 border-blue-500 bg-blue-50 flex flex-col items-center justify-center p-1 rounded-xl transition-all hover:scale-105";
    changeEyeTexture(eye.url);
  });

  eyeGrid.appendChild(btn);
});

const mouthGrid = document.getElementById("mouth-grid");
mouthImages.forEach((mouth, index) => {
  const btn = document.createElement("button");
  btn.id = mouth.id;
  // Thumbnails fall back gracefully to text labels if assets are loading locally
  btn.className = `mouth-btn w-full aspect-portrait border-2 flex flex-col items-center justify-center p-1 rounded-xl transition-all hover:scale-105 ${
    index === 0
      ? "border-blue-500 bg-blue-50"
      : "border-slate-200 bg-white hover:border-slate-400"
  }`;

  btn.innerHTML = `
        <div class="w-full flex-grow bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden mb-1">
            <img src="${mouth.url}" alt="${mouth.label}" class="max-w-full max-h-full object-contain error-fallback" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <span class="hidden text-[10px] font-bold text-slate-400">PNG</span>
        </div>
        <span class="text-[9px] font-medium text-slate-600 truncate w-full text-center">${mouth.label}</span>
    `;

  btn.addEventListener("click", (e) => {
    document.querySelectorAll(".mouth-btn").forEach((b) => {
      b.className =
        "mouth-btn w-full aspect-portrait border-2 border-slate-200 bg-white flex flex-col items-center justify-center p-1 rounded-xl transition-all hover:scale-105 hover:border-slate-400";
    });
    btn.className =
      "mouth-btn w-full aspect-portrait border-2 border-blue-500 bg-blue-50 flex flex-col items-center justify-center p-1 rounded-xl transition-all hover:scale-105";
    changeMouthTexture(mouth.url);
  });

  mouthGrid.appendChild(btn);
});

// Initialize with default first entry configuration
if (eyeImages.length > 0) {
  changeEyeTexture(eyeImages[0].url);
}
if (mouthImages.length > 0) {
  changeMouthTexture(mouthImages[0].url);
}

// --- 7. INTERACTION & EVENT LISTENERS ---
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Size Adjustment Listener
// EYE
document.getElementById("eye-scale").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  eyeMesh.scale.set(val, val, 1);
});
document.getElementById("eye-y").addEventListener("input", (e) => {
  eyeMesh.position.y = parseFloat(e.target.value);
});

// MOUTH
document.getElementById("mouth-scale").addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  mouthMesh.scale.set(val, val, 1);
});
document.getElementById("mouth-y").addEventListener("input", (e) => {
  mouthMesh.position.y = parseFloat(e.target.value);
});

// Mouse Drag Setup
container.addEventListener("pointerdown", (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener("pointerup", () => (isDragging = false));

container.addEventListener("pointermove", (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - previousMousePosition.x;
  const speed = 0.007;

  const radius = 5;
  let theta = Math.atan2(camera.position.x, camera.position.z);
  theta -= deltaX * speed;

  camera.position.x = radius * Math.sin(theta);
  camera.position.z = radius * Math.cos(theta);
  camera.lookAt(0, 0, 0);

  previousMousePosition = { x: e.clientX, y: e.clientY };
});

function resizeRenderer() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (width === 0 || height === 0) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);
  composer.setSize(width, height);
  outlinePass.setSize(width, height);
}

// --- 8. ANIMATION LOOP ---
function animate() {
  requestAnimationFrame(animate);
  composer.render(scene, camera);
}
resizeRenderer();
const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(container);
animate();
