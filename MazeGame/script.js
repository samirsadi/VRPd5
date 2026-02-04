// Simple 3D Maze Game - 10th Grade Level

// Basic setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(light);

// Game variables
const CELL_SIZE = 2;
const WALL_HEIGHT = 3;
const COLS = 20;
const ROWS = 20;
const TIME_LIMIT = 20 * 60; // 20 minutes

let timeLeft = TIME_LIMIT;
let gameOver = false;
let buttonFound = false;
let exitOpen = false;

// Key controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
        e.preventDefault();
        jump();
    }
    if (e.key === 'e' || e.key === 'E') {
        collectButton();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mouse look
document.addEventListener('mousemove', (e) => {
    const sensitivity = 0.005;
    cameraYaw -= e.movementX * sensitivity;
    cameraPitch -= e.movementY * sensitivity;
    
    // Limit pitch to prevent flipping
    if (cameraPitch > Math.PI / 2) cameraPitch = Math.PI / 2;
    if (cameraPitch < -Math.PI / 2) cameraPitch = -Math.PI / 2;
});

// Enable pointer lock on click
document.addEventListener('click', () => {
    document.documentElement.requestPointerLock = 
        document.documentElement.requestPointerLock || 
        document.documentElement.mozRequestPointerLock;
    document.documentElement.requestPointerLock();
});

// Simple Maze Generation
function createMaze() {
    let grid = [];
    
    // Create grid full of walls
    for (let row = 0; row < ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < COLS; col++) {
            grid[row][col] = 1; // 1 = wall, 0 = empty
        }
    }
    
    // Carve out paths
    function carvePath(x, y) {
        grid[y][x] = 0; // Make current cell empty
        
        // Four directions: up, right, down, left
        const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];
        
        // Shuffle directions
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        // Try each direction
        for (let dir of directions) {
            const nextX = x + dir[0];
            const nextY = y + dir[1];
            
            // Check if next cell is in bounds and is a wall
            if (nextX > 0 && nextX < COLS - 1 && nextY > 0 && nextY < ROWS - 1 && grid[nextY][nextX] === 1) {
                // Remove wall between cells
                grid[y + dir[1] / 2][x + dir[0] / 2] = 0;
                // Carve path in next cell
                carvePath(nextX, nextY);
            }
        }
    }
    
    // Start carving from position (1,1)
    carvePath(1, 1);
    grid[1][1] = 0;
    grid[ROWS - 2][COLS - 2] = 0;
    
    return grid;
}

// Create the maze
const mazeGrid = createMaze();

// Build 3D maze
function buildMaze3D() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (mazeGrid[row][col] === 1) { // If it's a wall
                // Create a box geometry for the wall
                const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
                const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                
                // Position the wall
                wall.position.set(
                    col * CELL_SIZE + CELL_SIZE / 2,
                    WALL_HEIGHT / 2,
                    row * CELL_SIZE + CELL_SIZE / 2
                );
                
                scene.add(wall);
            }
        }
    }
    
    // Add floor
    const floorGeometry = new THREE.PlaneGeometry(COLS * CELL_SIZE, ROWS * CELL_SIZE);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x8B7355 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((COLS * CELL_SIZE) / 2, 0, (ROWS * CELL_SIZE) / 2);
    scene.add(floor);
}

buildMaze3D();

// Player position and movement
let playerX = 1.5 * CELL_SIZE;
let playerZ = 1.5 * CELL_SIZE;
const playerSpeed = 0.08;
const playerHeight = WALL_HEIGHT / 2;

// Function to check if position is in a wall
function isInWall(x, z) {
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(z / CELL_SIZE);
    
    // Check if outside bounds
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;
    
    // Check if in a wall cell
    return mazeGrid[row][col] === 1;
}

// Camera rotation
let cameraYaw = 0;
let cameraPitch = 0;

// Update player position
function updatePlayerPosition() {
    let newX = playerX;
    let newZ = playerZ;
    
    // Get direction vectors based on camera rotation
    const forwardX = Math.sin(cameraYaw);
    const forwardZ = Math.cos(cameraYaw);
    const leftX = Math.sin(cameraYaw - Math.PI / 2);
    const leftZ = Math.cos(cameraYaw - Math.PI / 2);
    
    // Handle movement
    if (keys['w']) {
        newX += forwardX * playerSpeed;
        newZ += forwardZ * playerSpeed;
    }
    if (keys['s']) {
        newX -= forwardX * playerSpeed;
        newZ -= forwardZ * playerSpeed;
    }
    if (keys['a']) {
        newX += leftX * playerSpeed;
        newZ += leftZ * playerSpeed;
    }
    if (keys['d']) {
        newX -= leftX * playerSpeed;
        newZ -= leftZ * playerSpeed;
    }
    
    // Check collision with walls
    const radius = 0.3;
    if (!isInWall(newX - radius, newZ) && !isInWall(newX + radius, newZ) &&
        !isInWall(newX, newZ - radius) && !isInWall(newX, newZ + radius)) {
        playerX = newX;
        playerZ = newZ;
    }
    
    // Update camera position
    camera.position.set(playerX, playerHeight, playerZ);
    
    // Look in direction based on camera rotation
    const lookX = playerX + Math.sin(cameraYaw);
    const lookZ = playerZ + Math.cos(cameraYaw);
    camera.lookAt(lookX, playerHeight + Math.tan(cameraPitch), lookZ);
}

// Simple button (golden sphere)
const buttonGeometry = new THREE.SphereGeometry(0.4, 16, 16);
const buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
button.position.set(18 * CELL_SIZE + CELL_SIZE / 2, playerHeight, 18 * CELL_SIZE + CELL_SIZE / 2);
scene.add(button);

const buttonPos = { x: button.position.x, z: button.position.z };

// Rotate button
function updateButton() {
    button.rotation.x += 0.01;
    button.rotation.y += 0.02;
}

// Check if player collected button
function collectButton() {
    const distance = Math.sqrt(Math.pow(playerX - buttonPos.x, 2) + Math.pow(playerZ - buttonPos.z, 2));
    
    if (distance < 1.5 && !buttonFound) {
        buttonFound = true;
        exitOpen = true;
        scene.remove(button);
        updateUI();
    }
}

// Exit door (simple red box)
const doorGeometry = new THREE.BoxGeometry(1, 2.5, 0.2);
const doorMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(18 * CELL_SIZE + CELL_SIZE / 2, 1.25, 18 * CELL_SIZE + CELL_SIZE / 2);
scene.add(door);

const doorPos = { x: door.position.x, z: door.position.z };

// Update door color when unlocked
function updateDoor() {
    if (exitOpen) {
        doorMaterial.color.setHex(0x00ff00);
    }
}

// Check if player reached exit
function checkWin() {
    if (!exitOpen) return false;
    
    const distance = Math.sqrt(Math.pow(playerX - doorPos.x, 2) + Math.pow(playerZ - doorPos.z, 2));
    return distance < 1.5;
}

// Jump
let velocity = 0;
const gravity = -0.01;
let isJumping = false;

function jump() {
    if (!isJumping) {
        velocity = 0.15;
        isJumping = true;
    }
}

function updateJump() {
    velocity += gravity;
    camera.position.y += velocity;
    
    if (camera.position.y <= playerHeight) {
        camera.position.y = playerHeight;
        velocity = 0;
        isJumping = false;
    }
}

// Update UI
function updateUI() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    
    document.getElementById('timer').innerText = 
        minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    
    document.getElementById('buttonStatus').innerText = 
        buttonFound ? '✅ Found' : '❌ No';
    
    document.getElementById('exitStatus').innerText = 
        exitOpen ? '🔓 Open' : '🔒 Locked';
}

// End game
function endGame(won) {
    gameOver = true;
    const screen = document.getElementById('gameOverScreen');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    
    screen.style.display = 'block';
    
    if (won) {
        title.innerText = '🎉 You Won!';
        message.innerText = 'You found the button and escaped!';
    } else {
        title.innerText = '😞 Game Over';
        message.innerText = 'Time is up! Try again.';
    }
}

// Main game loop
function gameLoop() {
    requestAnimationFrame(gameLoop);
    
    if (!gameOver) {
        // Update game
        updatePlayerPosition();
        updateButton();
        updateDoor();
        updateJump();
        
        // Check win condition
        if (checkWin()) {
            endGame(true);
        }
        
        // Update timer
        timeLeft -= 1 / 60;
        if (timeLeft <= 0) {
            endGame(false);
        }
        
        updateUI();
    }
    
    // Render
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start game
gameLoop();
