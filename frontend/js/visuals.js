import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js';

class AetherEngine {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.canvas = document.getElementById('three-canvas');
        this.scene = new THREE.Scene();
        
        this.init();
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }

    init() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true, // Transparent background to show CSS colors
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    createParticles() {
        this.particlesGeometry = new THREE.BufferGeometry();
        const count = 3000; // How many stars/particles

        const positions = new Float32Array(count * 3);
        for(let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 15; // Spread them out
        }

        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x00d4ff, // Match our --shield-blue
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
        this.scene.add(this.particles);
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Mouse interaction logic
        this.mouseX = 0;
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) - 0.5;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Slow rotation for the "Aether" effect
        this.particles.rotation.y += 0.001;
        this.particles.rotation.x += 0.0005;

        // Subtle mouse reaction
        this.particles.position.x += (this.mouseX * 0.5 - this.particles.position.x) * 0.05;

        this.renderer.render(this.scene, this.camera);
    }
}

// Start the engine
new AetherEngine();