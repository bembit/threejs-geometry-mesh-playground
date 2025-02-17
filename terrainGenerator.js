import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.125.1/examples/jsm/controls/OrbitControls.js';


// Quick scene.
const scene = new THREE.Scene();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.4); 
scene.add(ambientLight);

class TerrainGenerator {
    // segment = 24 or 4
    constructor(scene, size = 24, segments = 24) {
        this.scene = scene;
        this.scene.background = new THREE.Color(0x777777);
        this.size = size;
        this.segments = segments;
        this.createTerrain();
    }

    createTerrain() {
        const geometry = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
        // const material = new THREE.MeshStandardMaterial({ color: 0x228B22, wireframe: true });

        // Loader
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('./texture.jpg');
        const material = new THREE.MeshStandardMaterial({ map: texture });

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        texture.anisotropy = 16;
        texture.rotation = Math.PI / 2;

        // Create the bump.
        const position = geometry.attributes.position;

        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const z = position.getZ(i);

            // Distance from center (0,0)
            const distance = Math.sqrt(x * x + y * y + z * z);
            const maxDistance = this.size / 3; // Control bump spread

            if (distance < maxDistance) {
                // Turn off for plain terrain.
                const height = Math.cos((distance / maxDistance) * Math.PI) * 2; // Bump intensity
                // position.setX(i, height);
                // position.setY(i, height);
                position.setZ(i, height);
            } else {
                // Naming things is hard, 0.5 0.5 ok.
                // const heightFromEdge = 0.5;
                const heightFromEdge = 4;
                position.setZ(i, (Math.random() - heightFromEdge) * 0.5); // Rest of the terrain with minimal bumps
            }
        }

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2; // Orientation
        // this.mesh.rotation.y = -Math.PI / 2;
        // this.mesh.rotation.z = -Math.PI / 2;

        this.scene.add(this.mesh);
    }

}

class cubeGenerator {
    constructor(scene, size, posX, posY, posZ) {
        this.scene = scene;
        this.size = size;
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;
        this.createCubes();
    }

    createCubes() {
        const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        const textureLoader = new THREE.TextureLoader();
        // const texture = textureLoader.load('./texture.jpg');
        // const material = new THREE.MeshStandardMaterial({ map: texture });

        const material = new THREE.MeshStandardMaterial({ color: 0x228B22, wireframe: true });

        const cube = new THREE.Mesh(geometry, material);

        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(4, 4);
        // texture.anisotropy = 16;
        // texture.rotation = Math.PI / 2;

        cube.position.set(this.posX, this.posY, this.posZ);

        this.scene.add(cube);
    }
}

const positionTakenByCube =  new Set();

const rndNrY = () => Math.floor(Math.random() * (12));
const rndNrXZ = () => Math.floor(Math.random() * 24) - 12;

// let tmparray = [];
// let tmparray2 = [];
// for (let i = 0; i < 100; i++) {
//     // console.log(rndNrY());
//     tmparray.push(rndNrY());
//     tmparray2.push(rndNrXZ());
// }
// console.log("max:", Math.max(...tmparray));
// console.log("min:", Math.min(...tmparray));

// console.log("max:", Math.max(...tmparray2));
// console.log("min:", Math.min(...tmparray2));

function getUniquePosition(size) {
    let posX, posY, posZ, key;
    // This is great.
    do {
        posX = Math.round(rndNrXZ() / size) * size;
        posY = Math.round(rndNrY() / size) * size;
        posZ = Math.round(rndNrXZ() / size) * size;

        key = posX + ',' + posY + ',' + posZ;
    // It keeps repeating if the key is already taken.
    // So if we render 1500 cubes into a small scene we will brick the browser.
    } while (positionTakenByCube.has(key));

    positionTakenByCube.add(key);
    return { posX, posY, posZ };
}

for (let i = 0; i < 15; i++) {
    const { posX, posY, posZ } = getUniquePosition(4);
    const cube = new cubeGenerator(scene, 4, posX, posY, posZ);
}

const terrain = new TerrainGenerator(scene);

// Rest of the scene I forgot.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;
camera.position.y = 15;
// camera.position.x = 15;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();