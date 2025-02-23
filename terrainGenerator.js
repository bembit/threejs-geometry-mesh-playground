import * as THREE from 'https://unpkg.com/three@0.139.2/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.125.1/examples/jsm/controls/OrbitControls.js';

// Quick scene.
const scene = new THREE.Scene();

// Rest of the scene I forgot.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.z = 5500;
camera.position.y = 3000;
camera.position.x = 0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 20, 0);
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(12000, 5000, 2000);
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 25000;
light.shadow.camera.left = -15000;
light.shadow.camera.right = 15000;
light.shadow.camera.top = 15000;
light.shadow.camera.bottom = -15000;
light.shadowMapWidth = 15000
light.shadowMapHeight = 15000

const helper = new THREE.CameraHelper(light.shadow.camera);
scene.add(helper);


// let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
// light.position.set(20, 100, 10);
// light.target.position.set(0, 0, 0);
// light.castShadow = true;
// light.shadow.bias = -0.001;
// light.shadow.mapSize.width = 2048;
// light.shadow.mapSize.height = 2048;
// light.shadow.camera.near = 0.1;
// light.shadow.camera.far = 500.0;
// light.shadow.camera.near = 0.5;
// light.shadow.camera.far = 500.0;
// light.shadow.camera.left = 100;
// light.shadow.camera.right = -100;
// light.shadow.camera.top = 100;
// light.shadow.camera.bottom = -100;
// light.shadow.camera.far = 10000;
// light.shadowMapWidth = 2048
// light.shadowMapHeight = 2048

scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.4); 
scene.add(ambientLight);

class TerrainGenerator {
    // segment = 300 or less than 50 testing
    constructor(scene, size = 21500, segments = 75) {
        this.scene = scene;
        // this.scene.background = new THREE.Color(0x07dae2);
        this.scene.background = new THREE.Color(0x6ea9ab);
        this.size = size;
        this.segments = segments;
        this.createTerrain();
        this.createVegetation();
        this.createRainDrops();
        this.createClouds();
    }

    createTerrain() {
        const geometry = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
        const material = new THREE.MeshStandardMaterial({ color: 0xb3f9fc, wireframe: false });

        
        // flat for now
        const position = geometry.attributes.position;

        this.heightData = new Float32Array(position.count);

        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const z = position.getZ(i);

            // Distance from center (0,0)
            const distance = Math.sqrt(x * x + y * y + z * z);
            const maxDistance = this.size / 3; // Control bump spread

            let height = 0;

            if (distance < maxDistance) {
                height = Math.cos((distance / maxDistance) * Math.PI) * 1000.0;
            } else {
                const heightFromEdge = 0.5;
                height = (Math.random() - heightFromEdge) * 300.0;
            }
        
            // Store the computed height in your custom array
            this.heightData[i] = height;
            // Also update the geometry’s Z coordinate
            position.setZ(i, height);
        }

        this.mesh = new THREE.Mesh(geometry, material);

        const renderedGround = this.mesh;

        renderedGround.rotation.x = -Math.PI / 2.0; // Orientation
        // this.mesh.rotation.y = -Math.PI / 2;
        // this.mesh.rotation.z = -Math.PI / 2;

        renderedGround.receiveShadow = true;
        renderedGround.castShadow = true;

        this.scene.add(renderedGround);
        console.log(this.heightData);
    }

    getHeightAt(x, z) {
        // Convert world coordinates (x, z) to UV coordinates in the range [0,1].
        const halfSize = this.size / 2;
        const u = (x + halfSize) / this.size;
        const v = (z + halfSize) / this.size;
    
        // Determine the grid indices. Make sure to clamp the values if needed.
        const gridX = Math.floor(u * this.segments);
        const gridZ = Math.floor(v * this.segments);
    
        // Calculate the index into the heightData array.
        const index = gridZ * (this.segments + 1) + gridX;
        // return the bumps height and use it for the trees Y pos.
        return this.heightData[index];
    }

    createVegetation() {

        const treeTrunkMaterial = new THREE.MeshStandardMaterial({ color: 0x180d11 });
        const treeLeavesMaterial = new THREE.MeshStandardMaterial({ color: 0x0e4518 });

        const treeTrunkGeometry = new THREE.BoxGeometry(1, 1, 2);
        const treeLeaveGeometry = new THREE.ConeGeometry(1, 1, 32);

        for (let x = 0; x < 50; x++) {
            for (let y = 0; y <  50; y++) {
                const x = 10000.0 * (Math.random() * 2.0 - 1.0);
                const z = 10000.0 * (Math.random() * 2.0 - 1.0);

                // Use the stored height data.
                const terrainHeight = this.getHeightAt(x, z);

                const treeTrunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
                const treeLeaves = new THREE.Mesh(treeLeaveGeometry, treeLeavesMaterial);

                // Randomize trunk scale.
                treeTrunk.scale.set(20, (Math.random() + 1.0) * 100.0, 20);
                // Adjust the trunk position so its base sits on the terrain.
                treeTrunk.position.set(
                    x,
                    terrainHeight + treeTrunk.scale.y / 2.0,
                    z
                );

                treeLeaves.scale.copy(treeTrunk.scale);
                treeLeaves.scale.set(100, treeTrunk.scale.y * 5.0, 100);
                // Position the leaves atop the trunk.
                treeLeaves.position.set(
                    x,
                    terrainHeight + treeTrunk.scale.y + treeLeaves.scale.y / 2,
                    z
                );

                treeTrunk.receiveShadow = true;
                treeTrunk.castShadow = true;

                treeLeaves.receiveShadow = true;
                treeLeaves.castShadow = true;

                this.scene.add(treeTrunk);
                this.scene.add(treeLeaves);
            }
        }
    }

    // Congratualtions on making missiles.
    createRainDrops() {
        const geometry = new THREE.CapsuleGeometry( 0.5, 0.5, 2, 4 ); 
        const material = new THREE.MeshBasicMaterial( {color: 0xffffff, transparent: true, opacity: 0.3 } ); 
        for (let x = 0; x < 50; x++) {
        // rtx bricker 150 x 150 is fun
        // for (let x = 0; x < 150; x++) {
            for (let y = 0; y <  50; y++) {
            // for (let y = 0; y <  150; y++) {
                const x = 10000.0 * (Math.random() * 2.0 - 1.0);
                const z = 10000.0 * (Math.random() * 2.0 - 1.0);

                const raindrop = new THREE.Mesh( geometry, material );

                raindrop.scale.set(20, (Math.random() + 1.0) * 100.0, 20);
                raindrop.position.set(
                    x,
                    // terrainHeight + treeTrunk.scale.y / 2.0,
                    4000 * (Math.random() * 2.0),
                    z
                );

                raindrop.receiveShadow = true;
                raindrop.castShadow = true;

                scene.add(raindrop);
            }
        }
    }

    createClouds() {
        const geometry = new THREE.CapsuleGeometry( 15, 4, 4, 8 ); 
        const material = new THREE.MeshBasicMaterial( {color: 0x74ccf5, transparent: true, opacity: 0.5 } ); 
        for (let x = 0; x < 6; x++) {
            for (let y = 0; y <  6; y++) {
                const x = 10000.0 * (Math.random() * 2.0 - 1.0);
                const z = 10000.0 * (Math.random() * 2.0 - 1.0);

                const cloud = new THREE.Mesh( geometry, material );

                // Randomize scale.
                cloud.scale.set(20, (Math.random() + 1.0) * 100.0, 20);
                cloud.position.set(
                    x,
                    // terrainHeight + treeTrunk.scale.y / 2.0,
                    (2000 * (Math.random() * 2.0) + 11000),
                    z
                );
                cloud.rotation.set(1.5, 0, 0);

                cloud.receiveShadow = true;
                cloud.castShadow = true;

                scene.add(cloud);
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();

const terrain = new TerrainGenerator(scene);
