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
let lineObjects = []; // Stores line objects for toggling visibility

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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
    document.getElementById('toggleLines').addEventListener('change', updateLineVisibility);
    document.getElementById('meshColorPicker').addEventListener('input', changeMeshColor);
    document.getElementById('toggleMesh').addEventListener('click', toggleMesh);
    document.getElementById('toggleGrid').addEventListener('click', toggleGrid);
    document.getElementById('deleteSpheres').addEventListener('click', deleteSelectedSpheres);
    document.getElementById('exportCoordinates').addEventListener('click', exportCoordinates);
    document.getElementById('clearSceneButton').addEventListener('click', clearScene);
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

// Mouse Click
function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Call function to select sphere
    selectSphere();
}

window.addEventListener('click', onMouseClick, false);

//=================================================================================================
// Scene Management
//=================================================================================================

//================================
// Main Scene Functions
//================================

// Clearing the Scene
function clearScene() {
    // Remove all objects except the gridHelper
    for (let i = scene.children.length - 1; i >= 0; i--) {
        const object = scene.children[i];
        if (object !== gridHelper) {
            scene.remove(object);

            if (object.geometry) object.geometry.dispose(); // Dispose geometry
            if (object.material) object.material.dispose(); // Dispose material
            if (object.texture) object.texture.dispose(); // Dispose texture
        }
    }

    // Reset data arrays
    sphereMaterials = [];
    lastLoadedCoordinates = [];
    lineObjects = [];
    mesh = undefined;

    // Re-render the scene to reflect the changes
    renderer.render(scene, camera);
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

    connectNearestNeighbors(points);
}


// Creating Spheres with Outlines
function createSphereWithOutline(x, y, z) {
    const geometry = new THREE.SphereGeometry(sphereDiameter / 2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: sphereColor });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.isSphere = true; // Custom property to identify spheres
    sphere.position.set(x, y, z);
    scene.add(sphere);

    // Outline
    const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
    outlineMesh.position.set(x, y, z);
    outlineMesh.scale.multiplyScalar(1.1);
    scene.add(outlineMesh);

    // Linking sphere and outline for easy access
    sphere.outlineMesh = outlineMesh;

    // Add material to sphereMaterials array
    sphereMaterials.push(material);
}



//================================
// Color Changes
//================================

// Handle Color Changes
function handleColorChange(event) {
    sphereColor = event.target.value;

    // Update materials of all spheres in the scene
    scene.traverse((object) => {
        if (object.isSphere) {
            object.material.color.set(sphereColor);
        }
    });

    renderer.render(scene, camera); // Re-render the scene to show the new color
}


// Changing Mesh and Lines Color
function changeMeshColor(event) {
    const color = event.target.value;
    // Update mesh material color
    if (meshMaterial) {
        meshMaterial.color.set(color);
    }
    // Update line material color
    lineObjects.forEach(line => {
        line.material.color.set(color);
    });

    // This is necessary to see the color change if the lines are already added to the scene
    renderer.render(scene, camera);
}


//================================
// Toggle Options 
//================================

// Mesh Visibility
function toggleMesh() {
    // If the mesh exists, toggle its visibility
    if (mesh) {
        mesh.visible = !mesh.visible;
    } else {
        // If the mesh doesn't exist, create it and set it to visible
        updateMesh();
        if (mesh) mesh.visible = true;
    }
    renderer.render(scene, camera); // Re-render the scene
}

function updateMesh() {
    // Remove the existing mesh if it exists
    if (mesh) {
        scene.remove(mesh);
        mesh.geometry.dispose(); // Optional: Dispose of the geometry to free up memory
        mesh.material.dispose(); // Optional: Dispose of the material to free up memory
    }

    // Draw a new mesh based on the updated coordinates
    const points = lastLoadedCoordinates.map(coord => new THREE.Vector3(coord.x, coord.y, coord.z));
    drawLines(points); // Reuse your existing function to draw lines
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
    sphereDiameter = ((parseFloat(event.target.value) * .005) + .1);
    updateSpheres(); // Adjust sphere sizes
}

function updateSpheres() {
    // Create a new geometry with the updated diameter for spheres
    const newSphereGeometry = new THREE.SphereGeometry(sphereDiameter / 2, 32, 32);

    // Update each sphere and its outline in the scene with the new geometry and scale
    scene.traverse((object) => {
        if (object.isSphere) {
            object.geometry.dispose(); // Dispose of the old sphere geometry
            object.geometry = newSphereGeometry; // Assign the new sphere geometry

            // Update the scale of the outline mesh if it exists
            if (object.outlineMesh) {
                object.outlineMesh.geometry.dispose(); // Dispose of the old outline geometry
                object.outlineMesh.geometry = newSphereGeometry.clone(); // Assign a clone of the new geometry to the outline
                object.outlineMesh.scale.set(1.1, 1.1, 1.1); // Adjust the scale to be slightly larger than the sphere
            }
        }
    });
}

// =========================================
// Connect nearest Points
//==========================================
function connectNearestNeighbors(points) {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });

    points.forEach((point, index) => {
        let distances = points.map((otherPoint, otherIndex) => {
            if (index !== otherIndex) {
                return {
                    distance: point.distanceTo(otherPoint),
                    index: otherIndex
                };
            } else {
                return {
                    distance: Number.MAX_SAFE_INTEGER,
                    index: otherIndex
                };
            }
        });

        distances.sort((a, b) => a.distance - b.distance);
        let nearest = distances.slice(0, 8);

        nearest.forEach((neighbor) => {
            let geometry = new THREE.BufferGeometry().setFromPoints([point, points[neighbor.index]]);
            let line = new THREE.Line(geometry, lineMaterial);
            lineObjects.push(line); // Store line for later use
        });
    });

    // Now add or remove lines based on checkbox state
    updateLineVisibility();
}

function updateLineVisibility() {
    const showLines = document.getElementById('toggleLines').checked;
    lineObjects.forEach(line => {
        if (showLines) {
            if (!scene.getObjectById(line.id)) {
                scene.add(line);
            }
        } else {
            if (scene.getObjectById(line.id)) {
                scene.remove(line);
            }
        }
    });
}
//=====================================================
// Delete Spheres
//=====================================================
let selectedSpheres = []; // Array to keep track of selected spheres

function selectSphere() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.isSphere) { // Ensure we're only interacting with spheres
            const selectedSphere = intersects[i].object;

            if (selectedSphere.selected) {
                // Sphere is already selected, deselect it
                selectedSphere.material.color.set(sphereColor); // Change color back to default
                selectedSphere.selected = false;

                // Remove from selectedSpheres array
                const index = selectedSpheres.indexOf(selectedSphere);
                if (index > -1) {
                    selectedSpheres.splice(index, 1);
                }
            } else {
                // Sphere is not selected, select it
                selectedSphere.material.color.set(0xff0000); // Highlight color
                selectedSphere.selected = true;

                // Add to selectedSpheres array
                selectedSpheres.push(selectedSphere);
            }

            break; // Stop the loop after processing the first intersected sphere
        }
    }
}

function deleteSelectedSpheres() {
    selectedSpheres.forEach(sphere => {
        // Remove sphere and its outline, if any
        if (sphere.outlineMesh) scene.remove(sphere.outlineMesh);
        scene.remove(sphere);
        // Clean up references
        cleanUpAfterSphereRemoval(sphere);
    });

    selectedSpheres = []; // Clear the selected spheres array
    updateConnections(); // Update the connections based on remaining spheres
    
    // Update the mesh only if it is currently visible
    if (mesh && mesh.visible) {
        updateMesh(); // Call to update the mesh with remaining spheres
    }
}


function cleanUpAfterSphereRemoval(sphere) {
    // Assuming sphere.position uniquely identifies a sphere
    lastLoadedCoordinates = lastLoadedCoordinates.filter(coord => 
        !(coord.x === sphere.position.x && coord.y === sphere.position.y && coord.z === sphere.position.z));
}


function updateConnections() {
    // Clear existing line objects to avoid duplicates
    lineObjects.forEach(line => scene.remove(line));
    lineObjects = []; // Reset the line objects array

    const updatedPoints = lastLoadedCoordinates.map(coord => new THREE.Vector3(coord.x, coord.y, coord.z));
    connectNearestNeighbors(updatedPoints);
    renderer.render(scene, camera); // Ensure the scene is updated
}

function exportCoordinates() {
    // Convert the current coordinates to a formatted string
    const updatedCoordsText = lastLoadedCoordinates.map(coord => `${coord.x} ${coord.y} ${coord.z}`).join('\n');
    
    // Create a Blob from the string
    const blob = new Blob([updatedCoordsText], { type: 'text/plain' });
    
    // Generate a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create an anchor (<a>) element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'updated_coordinates.txt'; // Set the file name for the download
    
    // Trigger the download
    document.body.appendChild(a); // Append the anchor to the body to make it "clickable"
    a.click(); // Programmatically click the anchor to trigger the download
    
    // Cleanup
    document.body.removeChild(a); // Remove the anchor from the body
    URL.revokeObjectURL(url); // Free up the Blob URL
}


//========================================================================================
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
