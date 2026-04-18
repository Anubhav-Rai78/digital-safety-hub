/**
 * DIGITAL SAFETY HUB — visuals.js
 * Three.js particle background.
 * Listens to themechange events from main.js and updates particle color.
 *
 * KEEP THIS FILE IF ALREADY WORKING.
 * Only replace if you want the theme-reactive particle color.
 */

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js';

class AetherEngine {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.canvas    = document.getElementById('three-canvas');
    if (!this.canvas) return;

    this.scene  = new THREE.Scene();
    this.mouseX = 0;

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
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  getParticleColor() {
    // Read theme color from CSS variable set by main.js
    const style = getComputedStyle(document.documentElement);
    const r = parseFloat(style.getPropertyValue('--particle-color-r').trim()) || 0.114;
    const g = parseFloat(style.getPropertyValue('--particle-color-g').trim()) || 0.729;
    const b = parseFloat(style.getPropertyValue('--particle-color-b').trim()) || 0.329;
    return new THREE.Color(r, g, b);
  }

  createParticles() {
    const count     = window.innerWidth < 640 ? 1500 : 3000;
    const geometry  = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 16;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.particlesMaterial = new THREE.PointsMaterial({
      size:        0.022,
      color:       this.getParticleColor(),
      transparent: true,
      opacity:     0.55,
      blending:    THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, this.particlesMaterial);
    this.scene.add(this.particles);
  }

  addEventListeners() {
    // Window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Mouse parallax
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth) - 0.5;
    });

    // Theme change — update particle color instantly
    window.addEventListener('themechange', () => {
      if (this.particlesMaterial) {
        // Small delay to let CSS variables update
        setTimeout(() => {
          this.particlesMaterial.color = this.getParticleColor();
          this.particlesMaterial.needsUpdate = true;
        }, 50);
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Slow rotation
    this.particles.rotation.y += 0.0008;
    this.particles.rotation.x += 0.0004;

    // Mouse parallax
    this.particles.position.x += (this.mouseX * 0.4 - this.particles.position.x) * 0.04;

    this.renderer.render(this.scene, this.camera);
  }
}

// Start after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AetherEngine());
} else {
  new AetherEngine();
}