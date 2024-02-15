// Importing THREE.js and OrbitControls
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global Variables
let scene, camera, renderer, controls, gridHelper;
let sphereColor = '#ffffff'; // Default color for spheres
let sphereDiameter = .1; // Universal diameter variable for spheres
let sphereMaterials = []; // Array to keep track of all sphere materials
let lastLoadedCoordinates = []; // Stores the last loaded coordinates
let mesh, meshMaterial;

//=================================================================================================
// Initialization Function
//=================================================================================================
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Grid (wireframe) setup
    gridHelper = new THREE.GridHelper(10, 10);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // OrbitControls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;

    // Mesh material initialization
    meshMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Default red color

    // Event Listeners
    bindEventListeners();

    // Animation loop
    animate();
}

//=================================================================================================
// Binding Event Listeners
//=================================================================================================
function bindEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
    document.getElementById('fileDropdown').addEventListener('change', handleDropdownSelect, false);
    document.querySelector('.number-input').addEventListener('input', handleSphereSizeChange, false);
    document.getElementById('colorPicker').addEventListener('input', handleColorChange, false);
    document.getElementById('meshColorPicker').addEventListener('input', changeMeshColor);
    document.getElementById('toggleMesh').addEventListener('click', toggleMesh);
    document.getElementById('toggleGrid').addEventListener('click', toggleGrid);
}

//=================================================================================================
// Event Handling Functions
//=================================================================================================

// Handle File Selection
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    clearScene();
    const reader = new FileReader();
    reader.onload = function(e) {
        loadCoordinates(e.target.result);
    };
    reader.readAsText(file);
}

// Dropdown Selection Handler
function handleDropdownSelect(event) {
    const filePath = event.target.value;
    if (filePath) {
        loadFile(filePath);
    }
}

// Load File from Dropdown
function loadFile(filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            clearScene(); // Clear the scene before loading new coordinates
            loadCoordinates(text);
        })
        .catch(error => console.error('Error loading file:', error));
}

//=================================================================================================
// Scene Management
//=================================================================================================

//================================
// Main Scene Functions
//================================

// Clearing the Scene
function clearScene() {
    sphereMaterials = [];
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    scene.add(gridHelper);
}

// Coordinate Loading and Mesh Creation
function loadCoordinates(text) {
    // Parse text only if it's a string, otherwise assume it's already parsed coordinates
    const lines = typeof text === "string" ? text.split('\n') : text;
    const points = [];
    lastLoadedCoordinates = []; // Clear previous coordinates

    lines.forEach(line => {
        let parts;
        if (typeof line === "string") {
            parts = line.trim().split(/\s+/).map(Number);
        } else {
            parts = [line.x, line.y, line.z]; // Directly use coordinates if not parsing from text
        }

        if (parts.length === 3) {
            const [x, y, z] = parts;
            createSphereWithOutline(x, y, z);
            points.push(new THREE.Vector3(x, y, z));
            lastLoadedCoordinates.push({x, y, z}); // Store the parsed coordinates
        }
    });

    drawLines(points);
    if (mesh) mesh.visible = false;
}


// Creating Spheres with Outlines
function createSphereWithOutline(x, y, z) {
    const geometry = new THREE.SphereGeometry(sphereDiameter / 2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: sphereColor });
    sphereMaterials.push(material);
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    scene.add(sphere);

    const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
    outlineMesh.position.set(x, y, z);
    outlineMesh.scale.multiplyScalar(1.1);
    scene.add(outlineMesh);
}


//================================
// Color Changes
//================================

// Handle Color Changes
function handleColorChange(event) {
    sphereColor = event.target.value;
    sphereMaterials.forEach(material => material.color.set(sphereColor));
}

// Changing Mesh Color
function changeMeshColor(event) {
    const color = event.target.value;
    if (meshMaterial) meshMaterial.color.set(color);
}

//================================
// Toggle Options 
//================================

// Mesh Visibility
function toggleMesh() {
    if (mesh) mesh.visible = !mesh.visible;
}

// Grid Visibility
function toggleGrid() {
    if (gridHelper) gridHelper.visible = !gridHelper.visible;
}


//================================
// Subfunctions 
//================================

// Handle Sphere Size Change
function handleSphereSizeChange(event) {
    sphereDiameter = ((parseFloat(event.target.value)*.005) + .1);
    updateSpheres(); // Implement this function to adjust sphere sizes
}

// Implementing updateSpheres function
function updateSpheres() {
    // Clear the scene but preserve essential elements like gridHelper
    clearScene();

    // Reload spheres with updated diameter using stored coordinates
    if (lastLoadedCoordinates.length > 0) {
        loadCoordinates(lastLoadedCoordinates);
    } else {
        console.warn("No coordinates loaded previously.");
    }
}

// Drawing Lines between Points
function drawLines(points) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    mesh = new THREE.Line(geometry, meshMaterial);
    scene.add(mesh);
}

// Handling Window Resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initiating the Visualization
init();
