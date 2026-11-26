/**
 * ============================================================================
 * 3D Earth Orbital Telemetry & Hyper-Zoom Navigation Engine
 * ============================================================================
 * Photorealistic rotating 3D Earth with dynamic cloud layers, atmospheric aura,
 * procedural starfield, live GPS targeting beacon, and cinematic orbital
 * dive animation transitioning into high-resolution 2D farm mapping.
 */

export class Earth3DGlobe {
  constructor(containerEl, options = {}) {
    this.container = typeof containerEl === 'string' ? document.getElementById(containerEl) : containerEl;
    this.options = Object.assign({
      initialLat: 12.9716, // Bengaluru, Karnataka default
      initialLon: 77.5946,
      autoRotateSpeed: 0.0035,
      dayTextureUrl: '/static/img/earth_day.jpg',
      cloudsTextureUrl: '/static/img/earth_clouds.jpg',
      lightsTextureUrl: '/static/img/earth_lights.png',
      onZoomComplete: null,
      onTargetSelected: null,
    }, options);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.earthGroup = null;
    this.earthMesh = null;
    this.cloudMesh = null;
    this.atmosphereMesh = null;
    this.beaconGroup = null;
    this.beaconRing = null;
    this.beaconOuterRing = null;
    this.beaconCore = null;
    this.beaconBeam = null;
    this.stars = null;

    this.animId = null;
    this.isDestroyed = false;
    this.isZooming = false;
    this.zoomProgress = 0;
    this.zoomStartTime = 0;
    this.zoomDuration = 2800; // ms

    // Target coordinates for dive
    this.targetLat = this.options.initialLat;
    this.targetLon = this.options.initialLon;
    this.currentLat = this.options.initialLat;
    this.currentLon = this.options.initialLon;

    // Camera and rotation states
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0 };
    this.targetRotX = 0;
    this.targetRotY = 0;

    this.init();
  }

  latLonToVector3(lat, lon, radius = 1) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  calculateTargetRotation(lat, lon) {
    const pos = this.latLonToVector3(lat, lon, 1);
    const rotY = Math.atan2(-pos.x, pos.z);
    const rotX = Math.asin(Math.min(1, Math.max(-1, pos.y)));
    return { rotX, rotY };
  }

  checkResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w > 0 && h > 0) {
      const targetAspect = w / h;
      if (Math.abs(this.camera.aspect - targetAspect) > 0.001) {
        this.camera.aspect = targetAspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    }
  }

  init() {
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('Earth3DGlobe: Three.js or container not ready.');
      return;
    }

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 520;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x03060a);

    // 2. Camera setup - perfectly spherical aspect ratio
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 3.1);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Clean container and mount canvas
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting (Warm Sunlight + Deep Blue Ambient Rim)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaee, 2.4);
    sunLight.position.set(5.5, 2.5, 4.5);
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(-5, -2, -3);
    this.scene.add(rimLight);

    // 5. Starfield Backdrop
    this.buildStarfield();

    // 6. Earth Group & Sphere
    this.earthGroup = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();

    // Day texture with fallback color
    const dayMap = textureLoader.load(this.options.dayTextureUrl);
    const cloudsMap = textureLoader.load(this.options.cloudsTextureUrl);
    const lightsMap = textureLoader.load(this.options.lightsTextureUrl);

    // Earth Sphere Geometry (Radius 1.0, 64x64 segments)
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1d4ed8,
      map: dayMap,
      emissiveMap: lightsMap,
      emissive: new THREE.Color(0xffbf69),
      emissiveIntensity: 0.85,
      specular: new THREE.Color(0x224455),
      shininess: 22,
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(this.earthMesh);

    // Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(1.014, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.54,
      depthWrite: false,
      roughness: 0.9,
    });
    this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.earthGroup.add(this.cloudMesh);

    // Rayleigh Atmospheric Halo Glow
    const atmosGeo = new THREE.SphereGeometry(1.038, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.25, 0.82, 0.58, 1.0) * intensity * 0.98;
        }
      `
    });
    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.earthGroup.add(this.atmosphereMesh);

    // 7. Targeting Location Beacon
    this.buildBeacon(this.options.initialLat, this.options.initialLon);

    // Initial rotation orienting towards Karnataka/India
    const initRot = this.calculateTargetRotation(this.options.initialLat, this.options.initialLon);
    this.earthGroup.rotation.y = initRot.rotY;
    this.earthGroup.rotation.x = -initRot.rotX * 0.85;
    this.targetRotY = initRot.rotY;
    this.targetRotX = -initRot.rotX * 0.85;
    this.scene.add(this.earthGroup);

    // 8. Event Listeners & Auto-Resizer
    this.bindEvents();

    if (window.ResizeObserver && this.container) {
      this.resizeObserver = new ResizeObserver(() => this.checkResize());
      this.resizeObserver.observe(this.container);
    }

    // 9. Start Render Loop
    this.animate();
  }

  buildStarfield() {
    const starCount = 1600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#93c5fd'),
      new THREE.Color('#fef08a'),
      new THREE.Color('#a7f3d0'),
      new THREE.Color('#f472b6'),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 26 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const c = palette[i % palette.length];
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  buildBeacon(lat, lon) {
    if (this.beaconGroup) {
      this.earthGroup.remove(this.beaconGroup);
    }

    this.beaconGroup = new THREE.Group();
    const pos = this.latLonToVector3(lat, lon, 1.015);
    this.beaconGroup.position.copy(pos);

    // Orient beacon to point straight up from sphere surface
    this.beaconGroup.lookAt(pos.clone().multiplyScalar(2));

    // Core pulsing beacon sphere (Gold Head)
    const coreGeo = new THREE.SphereGeometry(0.024, 16, 16);
    this.beaconCore = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const coreMesh = new THREE.Mesh(coreGeo, this.beaconCore);
    coreMesh.position.z = 0.04;
    this.beaconGroup.add(coreMesh);

    // Pin stem
    const stemGeo = new THREE.CylinderGeometry(0.003, 0.001, 0.04, 8);
    stemGeo.translate(0, 0.02, 0);
    const stemMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.rotation.x = Math.PI / 2;
    this.beaconGroup.add(stemMesh);

    // Inner concentric animated radar beacon ring (Emerald)
    const ringGeo = new THREE.RingGeometry(0.022, 0.042, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    this.beaconRing = new THREE.Mesh(ringGeo, ringMat);
    this.beaconGroup.add(this.beaconRing);

    // Outer concentric animated radar beacon ring (Amber)
    const outerRingGeo = new THREE.RingGeometry(0.045, 0.068, 32);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    this.beaconOuterRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    this.beaconGroup.add(this.beaconOuterRing);

    // Vertical orbital telemetry laser beam (Cyan)
    const beamGeo = new THREE.CylinderGeometry(0.002, 0.006, 0.18, 16);
    beamGeo.translate(0, 0.09, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    this.beaconBeam = new THREE.Mesh(beamGeo, beamMat);
    this.beaconBeam.rotation.x = Math.PI / 2;
    this.beaconGroup.add(this.beaconBeam);

    this.earthGroup.add(this.beaconGroup);
  }

  updateBeaconPosition(lat, lon) {
    this.currentLat = lat;
    this.currentLon = lon;
    this.buildBeacon(lat, lon);
  }

  /**
   * Cinematic multi-phase orbital dive:
   * 1. Rotates Earth so target coordinate faces the camera directly.
   * 2. Zooms camera from orbit (z=3.1) down through atmosphere.
   * 3. Plunges INSIDE the earth (z=0.94) with atmospheric warp & particle shake.
   * 4. Re-emerges to close surface altitude (z=1.12) to reveal coordinates point.
   */
  zoomToLocation(lat, lon, onComplete) {
    this.targetLat = lat;
    this.targetLon = lon;
    this.updateBeaconPosition(lat, lon);

    const { rotX, rotY } = this.calculateTargetRotation(lat, lon);
    this.targetRotX = -rotX * 0.85;
    this.targetRotY = rotY;

    this.isZooming = true;
    this.zoomProgress = 0;
    this.zoomStartTime = performance.now();
    this.zoomDuration = 2800; // 2.8s complete cinematic experience
    this.onZoomCompleteCallback = onComplete || this.options.onZoomComplete;
  }

  resetOrbitalView() {
    this.isZooming = false;
    this.zoomProgress = 0;
    if (this.camera) {
      this.camera.position.set(0, 0, 3.1);
    }
  }

  bindEvents() {
    const el = this.renderer.domElement;

    const onPointerDown = (e) => {
      if (this.isZooming) return;
      this.isDragging = true;
      this.previousMousePosition = {
        x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
        y: e.clientY || (e.touches && e.touches[0].clientY) || 0,
      };
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || this.isZooming) return;
      const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = currentX - this.previousMousePosition.x;
      const deltaY = currentY - this.previousMousePosition.y;

      this.rotationVelocity.x = deltaY * 0.005;
      this.rotationVelocity.y = deltaX * 0.005;

      if (this.earthGroup) {
        this.earthGroup.rotation.y += this.rotationVelocity.y;
        this.earthGroup.rotation.x = Math.max(-0.95, Math.min(0.95, this.earthGroup.rotation.x + this.rotationVelocity.x));
      }

      this.previousMousePosition = { x: currentX, y: currentY };
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    el.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    el.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    this.onResize = () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w && h) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', this.onResize);
  }

  animate() {
    if (this.isDestroyed) return;

    this.animId = requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // Pulse dual concentric beacon radar rings & laser beam
    if (this.beaconRing && this.beaconRing.material) {
      const s = 1.0 + Math.sin(time * 5.5) * 0.45;
      this.beaconRing.scale.set(s, s, 1);
      this.beaconRing.material.opacity = 0.55 + Math.cos(time * 5.5) * 0.4;
    }
    if (this.beaconOuterRing && this.beaconOuterRing.material) {
      const s2 = 1.0 + Math.sin(time * 3.8 + 1.2) * 0.42;
      this.beaconOuterRing.scale.set(s2, s2, 1);
      this.beaconOuterRing.material.opacity = 0.4 + Math.cos(time * 3.8 + 1.2) * 0.35;
    }
    if (this.beaconBeam) {
      this.beaconBeam.material.opacity = 0.5 + Math.sin(time * 6.5) * 0.35;
    }

    // Gentle cloud drift
    if (this.cloudMesh) {
      this.cloudMesh.rotation.y += 0.0006;
    }

    // Handle Zoom Dive Animation: Plunges INSIDE the Earth then settles at coordinates
    if (this.isZooming) {
      const elapsed = performance.now() - this.zoomStartTime;
      const t = Math.min(1, elapsed / this.zoomDuration);

      // Smoothly rotate Earth so target coordinates face camera dead-center
      if (this.earthGroup && this.targetRotY !== undefined) {
        let deltaY = (this.targetRotY - this.earthGroup.rotation.y) % (Math.PI * 2);
        if (deltaY > Math.PI) deltaY -= Math.PI * 2;
        if (deltaY < -Math.PI) deltaY += Math.PI * 2;

        this.earthGroup.rotation.y += deltaY * 0.16;
        this.earthGroup.rotation.x += (this.targetRotX - this.earthGroup.rotation.x) * 0.16;
      }

      // Multi-phase camera trajectory:
      // Phase 1 (0 -> 0.48): Orbital descent towards earth surface (3.1 -> 1.35)
      // Phase 2 (0.48 -> 0.76): Hypersonic plunge INSIDE the earth (1.35 -> 0.93 - Earth radius is 1.0)
      // Phase 3 (0.76 -> 1.0): Emerge smoothly from inside the earth to surface vantage point (0.93 -> 1.14)
      let currentZ;
      if (t < 0.48) {
        const p1 = t / 0.48;
        const ease1 = p1 * p1 * (3 - 2 * p1); // smoothstep
        currentZ = 3.1 - (3.1 - 1.35) * ease1;
      } else if (t < 0.76) {
        const p2 = (t - 0.48) / (0.76 - 0.48);
        const ease2 = Math.sin(p2 * Math.PI * 0.5);
        // Pierces through sphere surface (1.0) down to 0.93 inside the Earth!
        currentZ = 1.35 - (1.35 - 0.93) * ease2;
      } else {
        const p3 = (t - 0.76) / (1.0 - 0.76);
        const ease3 = 1 - Math.pow(1 - p3, 2);
        // Surfacing up to 1.14 directly facing location point
        currentZ = 0.93 + (1.14 - 0.93) * ease3;
      }
      this.camera.position.z = currentZ;

      // Atmospheric & crust penetration vibration
      if (t > 0.45 && t < 0.82) {
        const intensity = Math.sin((t - 0.45) / 0.37 * Math.PI);
        const shake = intensity * 0.012;
        this.camera.position.x = (Math.random() - 0.5) * shake;
        this.camera.position.y = (Math.random() - 0.5) * shake;
      } else {
        this.camera.position.x = 0;
        this.camera.position.y = 0;
      }

      // Cloud penetration dissolve when passing through cloud layer
      if (this.cloudMesh) {
        if (t > 0.48 && t < 0.78) {
          this.cloudMesh.material.opacity = Math.max(0.08, 0.55 * (1 - (t - 0.48) * 3.0));
        } else if (t >= 0.78) {
          this.cloudMesh.material.opacity = 0.45;
        }
      }

      if (t >= 1) {
        this.isZooming = false;
        if (this.onZoomCompleteCallback) {
          this.onZoomCompleteCallback({
            lat: this.targetLat,
            lon: this.targetLon
          });
        }
      }
    } else {
      // Natural idle auto-rotation when not dragging
      if (!this.isDragging && this.earthGroup) {
        this.earthGroup.rotation.y += this.options.autoRotateSpeed;
      }
    }

    // Dynamic aspect check prevents any stretching or oval distortion
    this.checkResize();

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
