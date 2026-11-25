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
    this.beaconCore = null;
    this.beaconBeam = null;
    this.stars = null;

    this.animId = null;
    this.isDestroyed = false;
    this.isZooming = false;
    this.zoomProgress = 0;
    this.zoomStartTime = 0;
    this.zoomDuration = 2200; // ms

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

  init() {
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('Earth3DGlobe: Three.js or container not ready.');
      return;
    }

    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 380;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x03060a);

    // 2. Camera setup
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
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

    // Earth Sphere Geometry
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1d4ed8,
      map: dayMap,
      emissiveMap: lightsMap,
      emissive: new THREE.Color(0xffbf69),
      emissiveIntensity: 0.9,
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

    // 8. Event Listeners
    this.bindEvents();

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
    const pos = this.latLonToVector3(lat, lon, 1.012);
    this.beaconGroup.position.copy(pos);

    // Orient beacon to point straight up from sphere surface
    this.beaconGroup.lookAt(pos.clone().multiplyScalar(2));

    // Core pulsing beacon sphere
    const coreGeo = new THREE.SphereGeometry(0.018, 16, 16);
    this.beaconCore = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
    const coreMesh = new THREE.Mesh(coreGeo, this.beaconCore);
    this.beaconGroup.add(coreMesh);

    // Concentric animated radar beacon ring
    const ringGeo = new THREE.RingGeometry(0.025, 0.046, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.beaconRing = new THREE.Mesh(ringGeo, ringMat);
    this.beaconGroup.add(this.beaconRing);

    // Vertical orbital telemetry laser beam
    const beamGeo = new THREE.CylinderGeometry(0.002, 0.005, 0.12, 16);
    beamGeo.translate(0, 0.06, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
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
   * Cinematic orbital dive:
   * 1. Rotates Earth so target coordinate faces the camera directly.
   * 2. Zooms camera from orbit (z=3.1) down towards sphere surface (z=1.05).
   * 3. Triggers onComplete callback for seamless transition into 2D Leaflet map.
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

    // Pulse beacon radar ring & laser beam
    if (this.beaconRing && this.beaconRing.material) {
      const s = 1.0 + Math.sin(time * 5.0) * 0.45;
      this.beaconRing.scale.set(s, s, 1);
      this.beaconRing.material.opacity = 0.5 + Math.cos(time * 5.0) * 0.4;
    }
    if (this.beaconBeam) {
      this.beaconBeam.material.opacity = 0.4 + Math.sin(time * 6.0) * 0.3;
    }

    // Gentle cloud drift
    if (this.cloudMesh) {
      this.cloudMesh.rotation.y += 0.0006;
    }

    // Handle Zoom Dive Animation
    if (this.isZooming) {
      const elapsed = performance.now() - this.zoomStartTime;
      const t = Math.min(1, elapsed / this.zoomDuration);

      // Smooth cubic in-out easing
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Smoothly rotate Earth so target coordinates face camera
      if (this.earthGroup && this.targetRotY !== undefined) {
        let deltaY = (this.targetRotY - this.earthGroup.rotation.y) % (Math.PI * 2);
        if (deltaY > Math.PI) deltaY -= Math.PI * 2;
        if (deltaY < -Math.PI) deltaY += Math.PI * 2;

        this.earthGroup.rotation.y += deltaY * 0.14;
        this.earthGroup.rotation.x += (this.targetRotX - this.earthGroup.rotation.x) * 0.14;
      }

      // Plunge camera towards the globe surface
      const startZ = 3.1;
      const endZ = 1.05;
      this.camera.position.z = startZ - (startZ - endZ) * ease;

      // Atmospheric penetration atmospheric vibration
      if (t > 0.6 && t < 0.94) {
        const shake = (1 - t) * 0.008;
        this.camera.position.x = (Math.random() - 0.5) * shake;
        this.camera.position.y = (Math.random() - 0.5) * shake;
      } else {
        this.camera.position.x = 0;
        this.camera.position.y = 0;
      }

      // Soft cloud fade as camera penetrates cloud layer
      if (this.cloudMesh && t > 0.65) {
        this.cloudMesh.material.opacity = Math.max(0.12, 0.54 * (1 - (t - 0.65) * 2.8));
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
