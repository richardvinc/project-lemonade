import * as THREE from "three";

const canvas = document.getElementById("three-canvas");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000,
);

camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

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

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
