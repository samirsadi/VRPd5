// 3D Maze Game - 10 Minute Escape Challenge

// =================== SCENE SETUP ===================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// Add fog for atmosphere
scene.fog = new THREE.Fog(0x000000, 30, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// =================== RAYCASTING FOR CLICK DETECTION ===================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// =================== LIGHTING ===================
// Ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Directional light with shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(50, 30, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Flickering light array for ambient horror effect
const flickeringLights = [];

// =================== TEXTURE GENERATION ===================
// Create a procedural brick texture
function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Brick pattern
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#404040';
    const brickWidth = 64;
    const brickHeight = 32;
    
    for (let y = 0; y < canvas.height; y += brickHeight) {
        const offset = (y / brickHeight) % 2 === 0 ? brickWidth / 2 : 0;
        for (let x = 0 + offset; x < canvas.width; x += brickWidth) {
            ctx.fillRect(x, y, brickWidth - 2, brickHeight - 2);
            
            // Add grout lines
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, brickWidth - 2, brickHeight - 2);
        }
    }
    
    // Add some noise/dirt
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 20 - 10;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

const wallTexture = createBrickTexture();

// =================== GAME VARIABLES ===================
const CELL_SIZE = 2;
const WALL_HEIGHT = 3;
const COLS = 16;  // Smaller maze for 10 minute escape
const ROWS = 16;
const TIME_LIMIT = 10 * 60; // 10 minutes

let timeLeft = TIME_LIMIT;
let gameOver = false;
let gameStarted = false;
let buttonFound = false;
let exitOpen = false;
let canInteract = true;

// Store all clickable objects
const clickableObjects = [];

// =================== KEYBOARD AND MOUSE CONTROLS ===================
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (gameStarted && !gameOver) jump();
    }
    if ((e.key === 'e' || e.key === 'E') && gameStarted && !gameOver) {
        collectInteraction();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mouse click detection
window.addEventListener('click', (event) => {
    if (!gameStarted || gameOver) return;
    
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Check intersections with clickable objects
    const intersects = raycaster.intersectObjects(clickableObjects);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        // Find the button that was clicked
        for (let btn of specialButtons) {
            if (btn.mesh === clickedObject && !btn.collected) {
                btn.collected = true;
                scene.remove(btn.mesh);
                clickableObjects.splice(clickableObjects.indexOf(btn.mesh), 1);
                handleSpecial(btn.type);
                return;
            }
        }
    }
});

// Mouse look
let cameraYaw = 0;
let cameraPitch = 0;

document.addEventListener('mousemove', (e) => {
    if (!document.pointerLockElement) return;
    
    const sensitivity = 0.005;
    cameraYaw -= e.movementX * sensitivity;
    cameraPitch -= e.movementY * sensitivity;
    
    if (cameraPitch > Math.PI / 2) cameraPitch = Math.PI / 2;
    if (cameraPitch < -Math.PI / 2) cameraPitch = -Math.PI / 2;
});

// Enable pointer lock on click
document.addEventListener('click', () => {
    if (gameStarted && !gameOver) {
        document.documentElement.requestPointerLock = 
            document.documentElement.requestPointerLock || 
            document.documentElement.mozRequestPointerLock;
        document.documentElement.requestPointerLock();
    }
});

// =================== MAZE GENERATION ===================
function createMaze() {
    let grid = [];
    
    for (let row = 0; row < ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < COLS; col++) {
            grid[row][col] = 1;
        }
    }
    
    function carvePath(x, y) {
        grid[y][x] = 0;
        const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];
        
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        for (let dir of directions) {
            const nextX = x + dir[0];
            const nextY = y + dir[1];
            
            if (nextX > 0 && nextX < COLS - 1 && nextY > 0 && nextY < ROWS - 1 && grid[nextY][nextX] === 1) {
                grid[y + dir[1] / 2][x + dir[0] / 2] = 0;
                carvePath(nextX, nextY);
            }
        }
    }
    
    carvePath(1, 1);
    grid[1][1] = 0;
    grid[ROWS - 2][COLS - 2] = 0;
    
    return grid;
}

const mazeGrid = createMaze();

// =================== BUILD 3D MAZE ===================
function buildMaze3D() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (mazeGrid[row][col] === 1) {
                const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
                const wallMaterial = new THREE.MeshPhongMaterial({ 
                    map: wallTexture,
                    color: 0xcccccc
                });
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                
                wall.position.set(
                    col * CELL_SIZE + CELL_SIZE / 2,
                    WALL_HEIGHT / 2,
                    row * CELL_SIZE + CELL_SIZE / 2
                );
                
                wall.castShadow = true;
                wall.receiveShadow = true;
                scene.add(wall);
            }
        }
    }
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(COLS * CELL_SIZE, ROWS * CELL_SIZE);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3a3a });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((COLS * CELL_SIZE) / 2, 0, (ROWS * CELL_SIZE) / 2);
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(COLS * CELL_SIZE, ROWS * CELL_SIZE);
    const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set((COLS * CELL_SIZE) / 2, WALL_HEIGHT, (ROWS * CELL_SIZE) / 2);
    scene.add(ceiling);
}

buildMaze3D();

// =================== COLLISION DETECTION ===================
function isInWall(x, z) {
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(z / CELL_SIZE);
    
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;
    return mazeGrid[row][col] === 1;
}

// =================== PLAYER MOVEMENT ===================
let playerX = 1.5 * CELL_SIZE;
let playerZ = 1.5 * CELL_SIZE;
const playerSpeed = 0.1;
const playerHeight = WALL_HEIGHT / 2;

function updatePlayerPosition() {
    let newX = playerX;
    let newZ = playerZ;
    
    const forwardX = Math.sin(cameraYaw);
    const forwardZ = Math.cos(cameraYaw);
    const leftX = Math.sin(cameraYaw - Math.PI / 2);
    const leftZ = Math.cos(cameraYaw - Math.PI / 2);
    
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
    
    const radius = 0.3;
    if (!isInWall(newX - radius, newZ) && !isInWall(newX + radius, newZ) &&
        !isInWall(newX, newZ - radius) && !isInWall(newX, newZ + radius)) {
        playerX = newX;
        playerZ = newZ;
    }
    
    camera.position.set(playerX, playerHeight, playerZ);
    const lookX = playerX + Math.sin(cameraYaw);
    const lookZ = playerZ + Math.cos(cameraYaw);
    camera.lookAt(lookX, playerHeight + Math.tan(cameraPitch), lookZ);
}

// =================== GAME BUTTONS ===================
// 4 buttons: 3 with bad effects, 1 to unlock exit (randomly assigned)
const specialButtons = [];
const specialTypes = [
    { type: 'kill', color: 0xFFD700, label: 'DEADLY' },           // Golden: kills instantly
    { type: 'jumpscare', color: 0xFFD700, label: 'JUMPSCARE' },   // Golden: scares you
    { type: 'nothing', color: 0xFFD700, label: 'DUMMY' },         // Golden: does nothing
    { type: 'escape', color: 0xFFD700, label: 'ESCAPE' }          // Golden: unlocks exit
];

// Shuffle the array to randomize which button is the escape
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffleArray(specialTypes);

function getRandomEmptyPosition() {
    while (true) {
        const col = Math.floor(Math.random() * (COLS - 4)) + 2;
        const row = Math.floor(Math.random() * (ROWS - 4)) + 2;
        if (mazeGrid[row][col] === 0) {
            if ((col === 1 && row === 1) || (col === COLS - 2 && row === ROWS - 2)) continue;
            const x = col * CELL_SIZE + CELL_SIZE / 2;
            const z = row * CELL_SIZE + CELL_SIZE / 2;
            
            // Check distance from existing buttons
            let tooClose = false;
            for (let btn of specialButtons) {
                if (Math.hypot(x - btn.pos.x, z - btn.pos.z) < 3) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;
            
            return { x, z };
        }
    }
}

function createSpecialButtons() {
    specialTypes.forEach(spec => {
        const pos = getRandomEmptyPosition();
        const geom = new THREE.SphereGeometry(0.5, 16, 16);
        const mat = new THREE.MeshPhongMaterial({ color: spec.color });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(pos.x, playerHeight + 0.5, pos.z);
        mesh.castShadow = true;
        scene.add(mesh);
        clickableObjects.push(mesh); // Add to clickable objects
        specialButtons.push({ mesh, pos, type: spec.type, collected: false });
    });
}

createSpecialButtons();

// =================== EXIT DOOR ===================
const doorGeometry = new THREE.BoxGeometry(1, 2.5, 0.2);
const doorMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(
    (COLS - 2) * CELL_SIZE + CELL_SIZE / 2, 
    1.25, 
    (ROWS - 2) * CELL_SIZE + CELL_SIZE / 2 - 1.5
);
door.castShadow = true;
scene.add(door);

const doorPos = { x: door.position.x, z: door.position.z };

// =================== GAME MECHANICS ===================
function handleSpecial(type) {
    switch (type) {
        case 'kill':
            playSound('scareSound');
            endGame(false, '💀 You pressed the DEADLY button! Game Over.');
            break;
        case 'jumpscare':
            playSound('scareSound');
            const overlay = document.getElementById('jumpscareOverlay');
            overlay.style.display = 'flex';
            setTimeout(() => { overlay.style.display = 'none'; }, 800);
            setTimeout(() => {
                endGame(false, '😱 The jumpscare shocked you! Game Over.');
            }, 1200);
            break;
        case 'nothing':
            // Button does nothing
            break;
        case 'escape':
            buttonFound = true;
            exitOpen = true;
            playSound('successSound');
            doorMaterial.color.setHex(0x00ff00);
            updateUI();
            // Show message to user
            showMessage('🎉 You found the escape button! The exit is now open!');
            break;
    }
}

function collectInteraction() {
    if (!canInteract) return;
    canInteract = false;
    setTimeout(() => { canInteract = true; }, 300);
    
    // Check special buttons
    for (let btn of specialButtons) {
        if (btn.collected) continue;
        const dist = Math.hypot(playerX - btn.pos.x, playerZ - btn.pos.z);
        if (dist < 1.5) {
            btn.collected = true;
            scene.remove(btn.mesh);
            handleSpecial(btn.type);
            return;
        }
    }
}

function checkWin() {
    if (!exitOpen) return false;
    const distance = Math.sqrt(Math.pow(playerX - doorPos.x, 2) + Math.pow(playerZ - doorPos.z, 2));
    return distance < 2;
}

// =================== JUMP MECHANIC ===================
let velocity = 0;
const gravity = -0.015;
let isJumping = false;

function jump() {
    if (!isJumping) {
        velocity = 0.2;
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

// =================== ANIMATIONS ===================
function updateButton() {
    specialButtons.forEach(btn => {
        if (btn.mesh && scene.children.includes(btn.mesh)) {
            btn.mesh.rotation.x += 0.01;
            btn.mesh.rotation.y += 0.02;
            btn.mesh.position.y = playerHeight + 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
        }
    });
}

function updateFlickeringLights() {
    // Randomly change ambient light intensity for flickering effect
    if (Math.random() < 0.02) {
        ambientLight.intensity = 0.3 + Math.random() * 0.4;
    }
}

// =================== AUDIO ===================
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function startBackgroundMusic() {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.play().catch(e => console.log('Background music failed:', e));
    }
}

// =================== UI UPDATES ===================
function updateUI() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    
    document.getElementById('timer').innerText = 
        minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    
    document.getElementById('buttonStatus').innerText = 
        buttonFound ? '✅ Found!' : '❌ Not Found';
    
    document.getElementById('exitStatus').innerText = 
        exitOpen ? '🔓 OPEN!' : '🔒 Locked';
}

function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.innerText = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '20px';
    messageDiv.style.borderRadius = '10px';
    messageDiv.style.fontSize = '24px';
    messageDiv.style.zIndex = '1000';
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 3000);
}

// =================== GAME STATE ===================
function startGame() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';
    gameStarted = true;
    timeLeft = TIME_LIMIT;
    startBackgroundMusic();
}

function restartGame() {
    location.reload();
}

function endGame(won, customMessage) {
    gameOver = true;
    document.getElementById('bgMusic').pause();
    document.getElementById('crosshair').style.display = 'none';
    
    const screen = document.getElementById('gameOverScreen');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    
    screen.style.display = 'block';
    
    if (won) {
        title.innerText = '🎉 YOU ESCAPED!';
        message.innerText = customMessage || 'You found the button and made it to the exit!';
    } else {
        title.innerText = '💀 GAME OVER';
        message.innerText = customMessage || 'You failed to escape. Try again!';
    }
}

// =================== MAIN GAME LOOP ===================
function gameLoop() {
    requestAnimationFrame(gameLoop);
    
    if (gameStarted && !gameOver) {
        // Update game state
        updatePlayerPosition();
        updateButton();
        updateFlickeringLights();
        updateJump();
        
        // Check win condition
        if (checkWin()) {
            endGame(true, '🎉 You escaped the maze in time!');
        }
        
        // Update timer
        timeLeft -= 1 / 60;
        if (timeLeft <= 0) {
            endGame(false, '⏰ Time\'s up! You ran out of time.');
        }
        
        updateUI();
    }
    
    renderer.render(scene, camera);
}

// =================== WINDOW EVENTS ===================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the game loop
gameLoop();
