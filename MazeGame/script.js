// Three.js 3D Maze Game
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
scene.fog = new THREE.Fog(0x87ceeb, 100, 200);

// Camera (First-person view)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Game constants
const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.2;
const CELL_SIZE = 2;
const MAZE_COLS = 20;
const MAZE_ROWS = 20;
const TIME_LIMIT = 20 * 60;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// Maze generation
class Maze {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = Array(rows).fill(null).map(() => Array(cols).fill(1));
        this.generateMaze();
    }

    generateMaze() {
        const visited = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
        this.carve(1, 1, visited);
        this.grid[1][1] = 0;
        this.grid[this.rows - 2][this.cols - 2] = 0;
    }

    carve(x, y, visited) {
        visited[y][x] = true;
        this.grid[y][x] = 0;

        const directions = [
            [0, -2],
            [2, 0],
            [0, 2],
            [-2, 0]
        ];

        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx > 0 && nx < this.cols - 1 && ny > 0 && ny < this.rows - 1 && !visited[ny][nx]) {
                this.grid[y + dy / 2][x + dx / 2] = 0;
                this.carve(nx, ny, visited);
            }
        }
    }

    isWall(x, z) {
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(z / CELL_SIZE);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return true;
        return this.grid[row][col] === 1;
    }

    create3D(scene) {
        const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 1) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x * CELL_SIZE + CELL_SIZE / 2, WALL_HEIGHT / 2, y * CELL_SIZE + CELL_SIZE / 2);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    scene.add(wall);
                }
            }
        }

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(this.cols * CELL_SIZE, this.rows * CELL_SIZE);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set((this.cols * CELL_SIZE) / 2, 0, (this.rows * CELL_SIZE) / 2);
        floor.receiveShadow = true;
        scene.add(floor);

        // Ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(this.cols * CELL_SIZE, this.rows * CELL_SIZE);
        const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.8 });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set((this.cols * CELL_SIZE) / 2, WALL_HEIGHT, (this.rows * CELL_SIZE) / 2);
        ceiling.receiveShadow = true;
        scene.add(ceiling);
    }
}

// Player class
class Player {
    constructor(x, z) {
        camera.position.set(x * CELL_SIZE, WALL_HEIGHT / 2, z * CELL_SIZE);
        this.velocity = new THREE.Vector3();
        this.speed = 0.15;
        this.jumpPower = 0.3;
        this.isJumping = false;
        this.gravity = -0.015;
    }

    move(keys, maze) {
        const direction = new THREE.Vector3();
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

        if (keys['w'] || keys['W'] || keys['ArrowUp']) {
            direction.add(forward.multiplyScalar(this.speed));
        }
        if (keys['s'] || keys['S'] || keys['ArrowDown']) {
            direction.add(forward.multiplyScalar(-this.speed));
        }
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
            direction.add(right.multiplyScalar(-this.speed));
        }
        if (keys['d'] || keys['D'] || keys['ArrowRight']) {
            direction.add(right.multiplyScalar(this.speed));
        }

        const newX = camera.position.x + direction.x;
        const newZ = camera.position.z + direction.z;

        // Collision detection
        const collisionRadius = 0.5;
        if (!maze.isWall(newX - collisionRadius, newZ) &&
            !maze.isWall(newX + collisionRadius, newZ) &&
            !maze.isWall(newX, newZ - collisionRadius) &&
            !maze.isWall(newX, newZ + collisionRadius)) {
            camera.position.x = newX;
            camera.position.z = newZ;
        }

        // Jump
        if (keys[' '] && !this.isJumping) {
            this.velocity.y = this.jumpPower;
            this.isJumping = true;
        }

        // Apply gravity
        this.velocity.y += this.gravity;
        camera.position.y += this.velocity.y;

        // Ground collision
        if (camera.position.y <= WALL_HEIGHT / 2) {
            camera.position.y = WALL_HEIGHT / 2;
            this.velocity.y = 0;
            this.isJumping = false;
        }
    }
}

// Button class
class Button {
    constructor(x, z) {
        this.collected = false;
        this.mesh = null;

        const buttonGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const buttonMaterial = new THREE.MeshStandardMaterial({
            color: 0xf1c40f,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xf1c40f,
            emissiveIntensity: 0.3
        });
        this.mesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        this.mesh.position.set(x * CELL_SIZE + CELL_SIZE / 2, WALL_HEIGHT / 2, z * CELL_SIZE + CELL_SIZE / 2);
        this.mesh.castShadow = true;
        scene.add(this.mesh);

        this.position = new THREE.Vector3(x * CELL_SIZE + CELL_SIZE / 2, WALL_HEIGHT / 2, z * CELL_SIZE + CELL_SIZE / 2);
    }

    update() {
        if (!this.collected && this.mesh) {
            this.mesh.rotation.x += 0.01;
            this.mesh.rotation.y += 0.02;
            this.mesh.position.y = WALL_HEIGHT / 2 + Math.sin(Date.now() * 0.005) * 0.2;
        }
    }

    checkCollection(playerPos) {
        if (this.collected) return false;
        const dist = playerPos.distanceTo(this.position);
        if (dist < 1) {
            this.collected = true;
            if (this.mesh) scene.remove(this.mesh);
            return true;
        }
        return false;
    }
}

// Exit door class
class Exit {
    constructor(x, z) {
        this.locked = true;
        this.meshes = [];

        // Door frame
        const frameGeometry = new THREE.BoxGeometry(1, 2.5, 0.2);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x * CELL_SIZE + CELL_SIZE / 2, 1.25, z * CELL_SIZE + CELL_SIZE / 2);
        frame.castShadow = true;
        scene.add(frame);
        this.meshes.push(frame);

        // Door
        this.doorGeometry = new THREE.BoxGeometry(0.9, 2.3, 0.1);
        this.doorMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
        this.door = new THREE.Mesh(this.doorGeometry, this.doorMaterial);
        this.door.position.set(x * CELL_SIZE + CELL_SIZE / 2, 1.15, z * CELL_SIZE + CELL_SIZE / 2 + 0.1);
        this.door.castShadow = true;
        scene.add(this.door);
        this.meshes.push(this.door);

        this.position = new THREE.Vector3(x * CELL_SIZE + CELL_SIZE / 2, WALL_HEIGHT / 2, z * CELL_SIZE + CELL_SIZE / 2);
    }

    update() {
        if (!this.locked && this.door) {
            // Open door animation
            this.door.position.z += (this.position.z - this.door.position.z) * 0.05;
            this.doorMaterial.color.setHex(0x27ae60);
        }
    }

    unlock() {
        this.locked = false;
    }

    checkEscape(playerPos) {
        if (this.locked) return false;
        const dist = playerPos.distanceTo(this.position);
        return dist < 2;
    }
}

// Game class
class Game {
    constructor() {
        this.maze = new Maze(MAZE_COLS, MAZE_ROWS);
        this.maze.create3D(scene);

        this.player = new Player(1.5, 1.5);
        this.button = new Button(18, 18);
        this.exit = new Exit(18, 18);

        this.timeLeft = TIME_LIMIT;
        this.gameOver = false;
        this.won = false;

        this.keys = {};
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.setupEventListeners();
        this.animate();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Pointer lock for mouse look
        document.addEventListener('click', () => {
            document.documentElement.requestPointerLock = document.documentElement.requestPointerLock || document.documentElement.mozRequestPointerLock;
            document.documentElement.requestPointerLock();
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.documentElement) {
                const euler = new THREE.Euler(0, 0, 0, 'YXZ');
                euler.setFromQuaternion(camera.quaternion);
                euler.rotateY(-e.movementX * 0.005);
                euler.rotateX(-e.movementY * 0.005);
                euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
                camera.quaternion.setFromEuler(euler);
            }
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    update() {
        if (this.gameOver) return;

        this.player.move(this.keys, this.maze);

        const playerPos = new THREE.Vector3(camera.position.x, WALL_HEIGHT / 2, camera.position.z);

        // Check button collection
        if (this.button.checkCollection(playerPos)) {
            this.exit.unlock();
            this.updateUI();
        }

        this.button.update();
        this.exit.update();

        // Check escape
        if (this.exit.checkEscape(playerPos)) {
            this.endGame(true);
        }

        // Update timer
        this.timeLeft -= 1 / 60;
        if (this.timeLeft <= 0) {
            this.endGame(false);
        }

        this.updateUI();
    }

    updateUI() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60);
        const timerEl = document.getElementById('timer');
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (this.timeLeft < 60) {
            timerEl.classList.add('warning');
        }

        const buttonStatus = document.getElementById('buttonStatus');
        buttonStatus.textContent = this.button.collected ? '✅ Found' : '❌ Not Found';

        const exitStatus = document.getElementById('exitStatus');
        exitStatus.textContent = this.exit.locked ? '🔒 Locked' : '🔓 Open';
    }

    endGame(won) {
        this.gameOver = true;
        this.won = won;

        const overlay = document.getElementById('overlay');
        const screen = document.getElementById('gameOverScreen');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');

        overlay.style.display = 'block';
        screen.style.display = 'block';

        if (won) {
            screen.classList.add('win');
            screen.classList.remove('lose');
            title.textContent = '🎉 You Escaped!';
            message.textContent = 'You found the button and escaped the maze in time!';
        } else {
            screen.classList.add('lose');
            screen.classList.remove('win');
            title.textContent = '😞 Time\'s Up!';
            message.textContent = 'You ran out of time! Try again to find the button faster.';
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.update();
        renderer.render(scene, camera);
    }
}

window.addEventListener('load', () => {
    new Game();
});
