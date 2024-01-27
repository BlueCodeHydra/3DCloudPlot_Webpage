import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, gridHelper;
let sphereColor = '#ffffff'; // Default color for spheres
const sphereDiameter = .1; // Universal diameter variable
let sphereMaterials = []; // Array to keep track of all sphere materials
let mesh, meshMaterial;

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
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;

    // Add event listeners
    document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
    document.getElementById('colorPicker').addEventListener('input', handleColorChange, false);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Initialize mesh material
    meshMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Default red color

    // Event listeners for mesh controls
    document.getElementById('toggleMesh').addEventListener('click', toggleMesh);
    document.getElementById('meshColorPicker').addEventListener('input', changeMeshColor);
    animate();
}
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Clear the current scene and materials array
    clearScene();

    // Read the file and load coordinates
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        loadCoordinates(text);
    };
    reader.readAsText(file);
}

function clearScene() {
    sphereMaterials = []; // Clear the materials array
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    // Re-add the grid to the scene
    scene.add(gridHelper);
}

function handleColorChange(event) {
    sphereColor = event.target.value;
    // Update all sphere materials with the new color
    sphereMaterials.forEach(material => {
        material.color.set(sphereColor);
    });
}

function loadCoordinates(text) {
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
}

function drawLines(points) {
    // Use the global mesh material
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    mesh = new THREE.Line(geometry, meshMaterial);
    scene.add(mesh);
}

function toggleMesh() {
    if (mesh) {
        mesh.visible = !mesh.visible; // Toggle visibility
    }
}

function changeMeshColor(event) {
    const color = event.target.value;
    if (meshMaterial) {
        meshMaterial.color.set(color);
    }
}

function createSphereWithOutline(x, y, z) {
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

document.getElementById('fileDropdown').addEventListener('change', function(event) {
    const selectedFile = event.target.value;
    if (selectedFile) {
        loadFile(selectedFile);
    }
});

function loadFile(filePath) {
    // Code to load and process the file
    // This might involve an AJAX request or other method to retrieve the file content
    // For example:
    fetch(filePath)
        .then(response => response.text())
        .then(text => loadCoordinates(text))
        .catch(error => console.error('Error loading file:', error));
}


init();
