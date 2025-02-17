import * as THREE from 'https://unpkg.com/three@0.125.1/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.125.1/examples/jsm/controls/OrbitControls.js';

// more like random noise

const scene = new THREE.Scene();

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.4); 
scene.add(ambientLight);

class TerrainGenerator {
    constructor(scene, size = 32, segments = 64) {
        this.scene = scene;
        this.scene.background = new THREE.Color(0x777777);
        this.size = size;
        this.segments = segments;
        this.createTerrain();
    }

    createTerrain() {
        const geometry = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
        const material = new THREE.MeshStandardMaterial({ color: 0x228B22, wireframe: false });
        
        // Displace vertices
        const position = geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
            const y = (Math.random() - 0.5) * 10; // Random height variation
            position.setY(i, y);
        }
        
        position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2; // Orientation
        // this.mesh.rotation.y = -Math.PI / 2;
        // this.mesh.rotation.z = -Math.PI / 2;
        this.scene.add(this.mesh);
    }
}

const terrain = new TerrainGenerator(scene);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;
camera.position.y = 5;
// camera.position.x = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();