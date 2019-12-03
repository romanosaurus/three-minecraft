"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// three.js
const THREE = require("three");
const transform_1 = require("./components/transform");
const DirectionalLight_1 = require("./components/lights/DirectionalLight");
// create the scene
let scene = new THREE.Scene();
// create the camera
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
// set size
renderer.setSize(window.innerWidth, window.innerHeight);
// add canvas to dom
document.body.appendChild(renderer.domElement);
// add lights
let firstLightTransform = new transform_1.default();
firstLightTransform.position = { x: 100, y: 100, z: 100 };
let firstLight = new DirectionalLight_1.default(firstLightTransform, 0xffffff);
scene.add(firstLight);
let light2 = new THREE.DirectionalLight(0xffffff, 1.0);
light2.position.set(-100, 100, -100);
scene.add(light2);
let material = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa
});
// create a box and add it to the scene
let box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
scene.add(box);
box.position.x = 0.5;
box.rotation.y = 0.5;
camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;
camera.lookAt(scene.position);
function animate() {
    requestAnimationFrame(animate);
    render();
}
function render() {
    let timer = 0.002 * Date.now();
    box.position.y = 0.5 + 0.5 * Math.sin(timer);
    box.rotation.x += 0.1;
    renderer.render(scene, camera);
}
animate();
