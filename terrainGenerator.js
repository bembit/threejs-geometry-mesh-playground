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
        const material = new THREE.MeshStandardMaterial({ color: 0x228B22, wireframe: true });

        // "Bump mapping" 
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

const terrain = new TerrainGenerator(scene);

// Rest of the scene I forgot.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;
camera.position.y = 5;
// camera.position.x = 15;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();