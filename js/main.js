import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Declare shared variables globally
var scene, camera, renderer, controls, gridHelper;
var mesh, meshMaterial;
var sphereColor = '#ffffff'; // Default color for spheres
const sphereDiameter = .1; // Universal diameter variable
var sphereMaterials = []; // Array to keep track of all sphere materials

// Declare shared functions globally
var clearScene, loadCoordinates, createSphereWithOutline;

// Main initialization function
function init() {
    // Create scene, camera, renderer
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create wireframe (grid)
    gridHelper = new THREE.GridHelper(10, 10);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;

    // Initialize mesh material
    meshMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Default red color

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// Define the clearScene function
clearScene = function() {
    sphereMaterials = []; // Clear the materials array
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    // Re-add the grid to the scene
    scene.add(gridHelper);
}

// Define the loadCoordinates function
loadCoordinates = function(text) {
    const lines = text.split('\n');
    const points = [];
    for (let line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length === 3) {
            const [x, y, z] = parts.map(Number);
            createSphereWithOutline(x, y, z);
            points.push(new THREE.Vector3(x, y, z));
        }
    }
    drawLines(points);
    if (mesh) {
        mesh.visible = false; // Turn off the mesh initially
    }
}

// Define the createSphereWithOutline function
createSphereWithOutline = function(x, y, z) {
    const geometry = new THREE.SphereGeometry(sphereDiameter / 2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: sphereColor });
    sphereMaterials.push(material); // Add the material to the array
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    scene.add(sphere);

    // Outline
    const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
    outlineMesh.position.set(x, y, z);
    outlineMesh.scale.multiplyScalar(1.1); // Slightly larger to create an outline effect
    scene.add(outlineMesh);
}

function drawLines(points) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    mesh = new THREE.Line(geometry, meshMaterial);
    scene.add(mesh);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();
