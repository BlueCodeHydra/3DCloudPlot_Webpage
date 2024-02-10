// Event listeners for control elements
document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('colorPicker').addEventListener('input', handleColorChange, false);
document.getElementById('toggleMesh').addEventListener('click', toggleMesh);
document.getElementById('meshColorPicker').addEventListener('input', changeMeshColor);
document.getElementById('toggleGrid').addEventListener('click', toggleGrid);

// JavaScript for dropdown functionality
document.getElementById('dropdownToggle').addEventListener('click', function() {
    var controls = document.getElementById('controls');
    controls.classList.toggle('active');
});

document.getElementById('fileDropdown').addEventListener('change', function(event) {
    const selectedFile = event.target.value;
    if (selectedFile) {
        loadFile(selectedFile);
    }
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    clearScene(); // Clear the current scene and materials array

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        loadCoordinates(text);
    };
    reader.readAsText(file);
}

function handleColorChange(event) {
    sphereColor = event.target.value;
    sphereMaterials.forEach(material => {
        material.color.set(sphereColor);
    });
}

function toggleMesh() {
    if (mesh) {
        mesh.visible = !mesh.visible;
    }
}

function toggleGrid() {
    gridHelper.visible = !gridHelper.visible;
}

function changeMeshColor(event) {
    const color = event.target.value;
    meshMaterial.color.set(color);
}

function loadFile(filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            clearScene();
            loadCoordinates(text);
        })
        .catch(error => console.error('Error loading file:', error));
}
