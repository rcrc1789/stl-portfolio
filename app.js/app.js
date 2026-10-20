import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm';

const works = { demo: { file: './models/demo.stl' } };
const slug = new URLSearchParams(location.search).get('model') || 'demo';
const work = works[slug];
const viewer = document.querySelector('#viewer');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#d6d6d6');
const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
viewer.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(4, 7, 6);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 1.1);
fillLight.position.set(-5, 2, -4);
scene.add(fillLight);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
const material = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0, roughness: 0.72 });
let mesh = null;
let modelRadius = 1;
function fitCamera(resetDirection = false) {
  if (!mesh) return;
  const aspect = Math.max(viewer.clientWidth / Math.max(viewer.clientHeight, 1), 0.01);
  const vertical = THREE.MathUtils.degToRad(camera.fov);
  const fitAngle = 2 * Math.atan(Math.tan(vertical / 2) * Math.min(aspect, 1));
  const distance = (modelRadius / Math.sin(fitAngle / 2)) * 1.18;
  const direction = resetDirection || camera.position.length() < 0.001 ? new THREE.Vector3(1, 0.72, 1.2).normalize() : camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(direction.multiplyScalar(distance));
  camera.near = Math.max(distance / 1000, 0.001);
  camera.far = distance * 20;
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
  controls.minDistance = modelRadius * 0.35;
  controls.maxDistance = distance * 6;
  controls.update();
}
function resize() {
  const width = Math.max(viewer.clientWidth, 1);
  const height = Math.max(viewer.clientHeight, 1);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  fitCamera();
}
new ResizeObserver(resize).observe(viewer);
resize();
function showGeometry(geometry) {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  bounds.getCenter(center);
  bounds.getSize(size);
  const largestSide = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(largestSide) || largestSide <= 0) throw new Error('STL has no valid dimensions');
  geometry.translate(-center.x, -center.y, -center.z);
  geometry.scale(2.4 / largestSide, 2.4 / largestSide, 2.4 / largestSide);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
  }
  mesh = new THREE.Mesh(geometry, material);
  modelRadius = Math.max(geometry.boundingSphere.radius, 0.01);
  scene.add(mesh);
  fitCamera(true);
}
if (work) new STLLoader().load(work.file, showGeometry, undefined, (error) => console.error('STL load failed', error));
const shareUrl = new URL('?model=' + encodeURIComponent(slug), location.href).href;
QRCode.toCanvas(shareUrl, { width: 196, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#111111', light: '#ffffff' } }, (error, canvas) => {
  if (error) return console.error('QR Code generation failed', error);
  document.querySelector('#qrcode').appendChild(canvas);
});
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
