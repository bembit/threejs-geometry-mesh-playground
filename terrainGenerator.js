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
    constructor(scene, size = 20000, segments = 300) {
        this.scene = scene;
        // this.scene.background = new THREE.Color(0x07dae2);
        this.scene.background = new THREE.Color(0x6ea9ab);
        this.size = size;
        this.segments = segments;
        this.createTerrain();
        this.createVegetation();
    }

    createTerrain() {
        const geometry = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
        const material = new THREE.MeshStandardMaterial({ color: 0xb3f9fc, wireframe: false });

        // flat for now
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
                const height = Math.cos((distance / maxDistance) * Math.PI) * 2500; // Bump intensity
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
        this.mesh.rotation.x = -Math.PI / 2.0; // Orientation
        // this.mesh.rotation.y = -Math.PI / 2;
        // this.mesh.rotation.z = -Math.PI / 2;

        this.scene.add(this.mesh);
    }

    createVegetation() {
        // return the bumps height and use it for the trees Y pos.

        const treeTrunkMaterial = new THREE.MeshStandardMaterial({ color: 0x180d11 });
        const treeLeavesMaterial = new THREE.MeshStandardMaterial({ color: 0x0e4518 });

        const treeTrunkGeometry = new THREE.BoxGeometry(1, 1, 2);
        const treeLeaveGeometry = new THREE.ConeGeometry(1, 1, 32);

        for (let x = 0; x < 50; x++) {
            for (let y = 0; y <  50; y++) {
                const treeTrunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
                const treeLeaves = new THREE.Mesh(treeLeaveGeometry, treeLeavesMaterial);

                treeTrunk.scale.set(20, (Math.random() + 1.0) * 100.0, 20);
                treeTrunk.position.set(
                    10000.0 * (Math.random() * 2.0 - 1.0),
                    treeTrunk.scale.y / 2.0,
                    10000.0 * (Math.random() * 2.0 - 1.0)
                );

                treeLeaves.scale.copy(treeTrunk.scale);
                treeLeaves.scale.set(100, treeTrunk.scale.y * 5.0, 100);
                treeLeaves.position.set(
                    treeTrunk.position.x,
                    treeLeaves.scale.y / 2 + (Math.random() + 1) * 25,
                    treeTrunk.position.z
                );

                treeTrunk.castShadow = true;
                this.scene.add(treeTrunk);
                this.scene.add(treeLeaves);
            }
        }
    }

}

const terrain = new TerrainGenerator(scene);

// Rest of the scene I forgot.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.z = 2500;
camera.position.y = 1000;
camera.position.x = 0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 20, 0);
controls.update();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();