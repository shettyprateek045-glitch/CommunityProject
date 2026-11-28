/**
 * ============================================================================
 * 3D Earth Orbital Telemetry & Hyper-Zoom Navigation Engine
 * ============================================================================
 * Directly ported from user's EarthScene3D.tsx:
 * - Deep space backdrop with 3-tier twinkling starfield, galaxy cluster & burgundy/violet nebulae
 * - Solar & deep-space rim lighting (SUN_DIRECTION: 6.5, 2.2, 4.2)
 * - Photorealistic Earth surface with day/night terminator shader for night lights
 * - Natural drifting satellite cloud layer (1.012)
 * - Rayleigh sunlit limb scattering shell (1.032) with twilight rose warmth
 * - Outer soft atmospheric halo (1.092, BackSide, AdditiveBlending)
 * - Surface coordinates marker with glowing core & pulsing beacon ring
 * - Hyper-zoom orbital dive plunging into the Earth and transitioning into 2D mode
 */

const SUN_DIRECTION = new THREE.Vector3(6.5, 2.2, 4.2).normalize();

// Procedural Earth Texture Generator: instant photorealistic frame-0 fallback
function generateProceduralEarthCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Deep Ocean Base with realistic marine bathymetry gradients
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0.0, '#0c2744');
  oceanGrad.addColorStop(0.35, '#0e3860');
  oceanGrad.addColorStop(0.5, '#134773');
  oceanGrad.addColorStop(0.65, '#0e3860');
  oceanGrad.addColorStop(1.0, '#0c2744');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  const toXY = (lat, lon) => [
    ((lon + 180) / 360) * 2048,
    ((90 - lat) / 180) * 1024
  ];

  const drawLandmass = (points, fillColor, shelfColor) => {
    if (points.length < 3) return;
    ctx.beginPath();
    let [x0, y0] = toXY(points[0][0], points[0][1]);
    ctx.moveTo(x0, y0);
    for (let i = 1; i < points.length; i++) {
      const [xi, yi] = toXY(points[i][0], points[i][1]);
      ctx.lineTo(xi, yi);
    }
    ctx.closePath();
    ctx.fillStyle = shelfColor || '#0284c7';
    ctx.lineWidth = 14;
    ctx.strokeStyle = shelfColor || 'rgba(2, 132, 199, 0.45)';
    ctx.stroke();

    ctx.fillStyle = fillColor;
    ctx.fill();
  };

  // Indian Subcontinent (Deccan plateau, Western/Eastern Ghats)
  const indiaPoints = [
    [35, 74], [34, 78], [30, 80], [27, 88], [24, 93], [22, 91], [21, 87],
    [16, 82], [13, 80], [8.1, 77.5], [10, 76], [13, 74.5], [15.5, 73.8],
    [19, 72.8], [21.5, 69.5], [23.5, 68.5], [25, 70], [30, 71], [33, 73]
  ];
  drawLandmass(indiaPoints, '#2d6a4f', '#06b6d4');

  // Deccan plateau / Karnataka agrarian green
  ctx.beginPath();
  const [blrX, blrY] = toXY(12.97, 77.59);
  ctx.arc(blrX, blrY, 52, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(101, 163, 13, 0.72)';
  ctx.fill();

  // Eurasia
  const eurasia = [
    [70, 30], [72, 60], [70, 100], [68, 140], [60, 160], [45, 145], [35, 128],
    [22, 115], [15, 105], [20, 95], [30, 75], [40, 50], [45, 35], [55, 30],
    [60, 10], [65, 20]
  ];
  drawLandmass(eurasia, '#3f6212', '#0284c7');

  // Africa
  const africa = [
    [36, 0], [32, 32], [22, 37], [12, 51], [5, 48], [-4, 40], [-11, 40],
    [-25, 33], [-34, 26], [-34, 18], [-22, 14], [-5, 12], [4, 9], [6, 1],
    [14, -16], [28, -13], [36, -5]
  ];
  drawLandmass(africa, '#ca8a04', '#0284c7');

  // Americas
  const northAmerica = [
    [70, -160], [70, -90], [55, -60], [45, -65], [30, -80], [25, -80],
    [20, -97], [15, -90], [18, -104], [30, -115], [45, -125], [60, -140]
  ];
  drawLandmass(northAmerica, '#4d7c0f', '#0284c7');

  const southAmerica = [
    [10, -75], [5, -52], [-5, -35], [-20, -40], [-35, -55], [-54, -68],
    [-45, -75], [-20, -70], [-5, -80], [5, -77]
  ];
  drawLandmass(southAmerica, '#15803d', '#0284c7');

  // Australia
  const australia = [
    [-12, 130], [-12, 137], [-18, 146], [-28, 153], [-37, 150], [-38, 140],
    [-34, 115], [-22, 114], [-16, 124]
  ];
  drawLandmass(australia, '#b45309', '#0284c7');

  // Antarctica (Natural subtle polar ice tint, no solid white block)
  ctx.fillStyle = 'rgba(180, 210, 235, 0.35)';
  ctx.fillRect(0, 950, 2048, 74);

  // Soft Lat/Lon Telemetry Grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const [, y] = toXY(lat, 0);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const [x] = toXY(0, lon);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }

  // (Cloud swirls removed as requested: clean clear Earth surface)
  return canvas;
}

// Procedural Night Lights Texture: urban clusters glowing in darkness
function generateProceduralNightCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#010408';
  ctx.fillRect(0, 0, 1024, 512);

  const toXY = (lat, lon) => [
    ((lon + 180) / 360) * 1024,
    ((90 - lat) / 180) * 512
  ];

  const cityClusters = [
    [12.97, 77.59, 22],  // Bengaluru
    [15.31, 75.71, 14],  // Dharwad / Hubballi
    [19.07, 72.87, 26],  // Mumbai
    [28.61, 77.20, 28],  // Delhi
    [13.08, 80.27, 20],  // Chennai
    [17.38, 78.48, 20],  // Hyderabad
    [22.57, 88.36, 22],  // Kolkata
    [51.50, -0.12, 22],  // London
    [48.85, 2.35, 20],   // Paris
    [40.71, -74.00, 26], // New York
    [34.05, -118.24, 24],// LA
    [35.67, 139.65, 30], // Tokyo
  ];

  cityClusters.forEach(([lat, lon, radius]) => {
    const [cx, cy] = toXY(lat, lon);
    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
    grad.addColorStop(0, 'rgba(255, 225, 130, 0.98)');
    grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.75)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas;
}

// Procedural Cosmic Nebula Texture: creates soft particle dust
function generateCosmicNebulaCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.25, 'rgba(220, 180, 255, 0.45)');
  grad.addColorStop(0.6, 'rgba(130, 70, 180, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  return canvas;
}

export class Earth3DGlobe {
  constructor(containerEl, options = {}) {
    this.container = typeof containerEl === 'string' ? document.getElementById(containerEl) : containerEl;
    this.options = Object.assign({
      initialLat: 12.9716, // Bengaluru, Karnataka default
      initialLon: 77.5946,
      autoRotateSpeed: 0.0028,
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
    this.mantleMesh = null;
    this.coreMesh = null;
    this.cloudMesh = null;
    this.innerAtmosphere = null;
    this.outerAtmosphere = null;

    this.beaconGroup = null;
    this.beaconRing = null;
    this.beaconCore = null;

    this.starPointsFar = null;
    this.starPointsMid = null;
    this.starPointsGalaxy = null;
    this.nebulaPoints = null;
    this.starMaterial = null;

    this.animId = null;
    this.isDestroyed = false;
    this.isZooming = false;
    this.zoomProgress = 0;
    this.zoomStartTime = 0;
    this.zoomDuration = 2200; // 2.2s cinematic plunge

    this.targetLat = this.options.initialLat;
    this.targetLon = this.options.initialLon;
    this.currentLat = this.options.initialLat;
    this.currentLon = this.options.initialLon;

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0 };

    this.targetQuaternion = new THREE.Quaternion();
    this.startQuaternion = new THREE.Quaternion();

    this.pointer = { x: 0, y: 0 };

    this.init();
  }

  latLonToVector3(lat, lon, radius = 1) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  // Exact target orientation calculation via Unit Vector Quaternions
  calculateTargetQuaternion(lat, lon) {
    const pos = this.latLonToVector3(lat, lon, 1);
    const dir = pos.clone().normalize();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(dir, new THREE.Vector3(0, 0, 1));
    return quat;
  }

  checkResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const rect = this.container.getBoundingClientRect();
    const w = rect.width || this.container.clientWidth;
    const h = rect.height || this.container.clientHeight;
    if (w > 0 && h > 0) {
      const targetAspect = w / h;
      if (Math.abs(this.camera.aspect - targetAspect) > 0.002) {
        this.camera.aspect = targetAspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h, false);
      }
    }
  }

  init() {
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('Earth3DGlobe: Three.js or container not ready.');
      return;
    }

    const rect = this.container.getBoundingClientRect();
    const width = (rect.width > 0 ? rect.width : this.container.clientWidth) || 800;
    const height = (rect.height > 0 ? rect.height : this.container.clientHeight) || 520;

    // 1. Scene setup: Clean Pure White Background (whatever black is change to white)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.fog = null;

    // 2. Camera setup - initial FOV 38 matching EarthScene3D.tsx
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 160);
    this.camera.position.set(0, 0.06, 3.25);

    // 3. Renderer setup: ACESFilmicToneMapping, exposure 1.08
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    // Mount canvas inside container
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    const canvas = this.renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    this.container.appendChild(canvas);

    // 4. Exact Solar & Deep-Space Rim Lighting from EarthScene3D.tsx
    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x1e0510, 0.28);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.65);
    sunLight.position.copy(SUN_DIRECTION.clone().multiplyScalar(8));
    this.scene.add(sunLight);

    const pointLight1 = new THREE.PointLight(0x9f1239, 3.2, 18);
    pointLight1.position.set(-4.5, -2.0, -3.2);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x5b21b6, 2.4, 18);
    pointLight2.position.set(3.2, -2.5, -3.8);
    this.scene.add(pointLight2);

    // 5. Build Deep Space Multi-Layer Starfield & Nebula Cloud from EarthScene3D.tsx
    this.buildDeepSpaceBackdrop();

    // 6. Earth Group: Initial rotation [0.19, -2.42, 0.08] from EarthScene3D.tsx
    this.earthGroup = new THREE.Group();
    this.earthGroup.rotation.set(0.19, -2.42, 0.08);

    // A. Procedural Textures
    const procDayCanvas = generateProceduralEarthCanvas();
    const procDayTex = new THREE.CanvasTexture(procDayCanvas);
    procDayTex.wrapS = THREE.RepeatWrapping;
    procDayTex.wrapT = THREE.ClampToEdgeWrapping;

    const procNightCanvas = generateProceduralNightCanvas();
    const procNightTex = new THREE.CanvasTexture(procNightCanvas);
    procNightTex.wrapS = THREE.RepeatWrapping;
    procNightTex.wrapT = THREE.ClampToEdgeWrapping;

    // B. Photorealistic Earth Surface with Day/Night Terminator Shader
    const earthGeo = new THREE.SphereGeometry(1.0, 96, 96);
    const earthMat = new THREE.MeshPhysicalMaterial({
      map: procDayTex,
      roughness: 0.95,
      metalness: 0.0,
      clearcoat: 0.0,
      clearcoatRoughness: 1.0,
      emissiveMap: procNightTex,
      emissive: new THREE.Color('#ffbe73'),
      emissiveIntensity: 0.95,
      transparent: false,
    });

    // Custom GLSL Shader Chunk injecting the Day/Night Terminator Mask
    earthMat.onBeforeCompile = (shader) => {
      shader.uniforms.uSunDir = { value: SUN_DIRECTION };
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
           varying vec3 vEarthWorldNormal;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           vEarthWorldNormal = normalize(mat3(modelMatrix) * normal);`
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
           uniform vec3 uSunDir;
           varying vec3 vEarthWorldNormal;`
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
           float earthSunDot = dot(normalize(vEarthWorldNormal), normalize(uSunDir));
           float earthNightMask = smoothstep(0.14, -0.22, earthSunDot);
           totalEmissiveRadiance *= earthNightMask;`
        );
    };

    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(this.earthMesh);

    // Asynchronously upgrade to high-res NASA maps if available
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      this.options.dayTextureUrl,
      (loadedDay) => {
        loadedDay.wrapS = THREE.RepeatWrapping;
        loadedDay.wrapT = THREE.ClampToEdgeWrapping;
        if (this.earthMesh && this.earthMesh.material) {
          this.earthMesh.material.map = loadedDay;
          this.earthMesh.material.needsUpdate = true;
        }
      },
      undefined,
      () => {}
    );

    // C. (Cloud layer removed as requested: clean clear Earth surface)
    this.cloudMesh = null;

    // D. Inner Rayleigh Sunlit Limb Scattering Shell (Radius: 1.032) from EarthScene3D.tsx
    const innerAtmosGeo = new THREE.SphereGeometry(1.032, 64, 64);
    const innerAtmosMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uSunDir: { value: SUN_DIRECTION },
      },
      vertexShader: `
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        varying vec3 vWorldNormal;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormalView = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        varying vec3 vWorldNormal;
        void main() {
          float fresnel = pow(1.0 - max(dot(vNormalView, vViewDir), 0.0), 5.5);
          float sunDot = dot(normalize(vWorldNormal), normalize(uSunDir));
          float daySide = smoothstep(-0.2, 0.45, sunDot);
          vec3 skyBlue = vec3(0.24, 0.60, 1.0);
          float alpha = fresnel * (0.05 + daySide * 0.38);
          gl_FragColor = vec4(skyBlue, clamp(alpha, 0.0, 0.45));
        }
      `,
    });
    this.innerAtmosphere = new THREE.Mesh(innerAtmosGeo, innerAtmosMat);
    this.earthGroup.add(this.innerAtmosphere);

    // E. Outer Soft Atmospheric Halo (Radius: 1.092, BackSide, AdditiveBlending)
    const outerAtmosGeo = new THREE.SphereGeometry(1.092, 64, 64);
    const outerAtmosMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uSunDir: { value: SUN_DIRECTION },
      },
      vertexShader: `
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        varying vec3 vWorldNormal;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormalView = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        varying vec3 vWorldNormal;
        void main() {
          float intensity = pow(0.66 - dot(vNormalView, -vViewDir), 4.0);
          float sunDot = dot(normalize(vWorldNormal), normalize(uSunDir));
          float dayFactor = smoothstep(-0.4, 0.6, sunDot);
          vec3 outerBlue = vec3(0.32, 0.66, 1.0);
          vec3 outerViolet = vec3(0.45, 0.22, 0.58);
          vec3 col = mix(outerViolet, outerBlue, 0.45 + dayFactor * 0.55);
          gl_FragColor = vec4(col, clamp(intensity * (0.28 + dayFactor * 0.58), 0.0, 0.72));
        }
      `,
    });
    this.outerAtmosphere = new THREE.Mesh(outerAtmosGeo, outerAtmosMat);
    this.earthGroup.add(this.outerAtmosphere);

    // F. Internal Molten Mantle (Radius 0.94 - visible when camera dives into the Earth)
    const mantleGeo = new THREE.SphereGeometry(0.94, 32, 32);
    const mantleMat = new THREE.MeshBasicMaterial({
      color: 0xea580c,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.mantleMesh = new THREE.Mesh(mantleGeo, mantleMat);
    this.earthGroup.add(this.mantleMesh);

    // G. Surface Marker & Pulsing Beacon Ring from EarthScene3D.tsx
    this.beaconGroup = new THREE.Group();
    
    // Core glowing sphere
    const beaconCoreGeo = new THREE.SphereGeometry(0.014, 16, 16);
    const beaconCoreMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#fb7185',
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    this.beaconCore = new THREE.Mesh(beaconCoreGeo, beaconCoreMat);
    this.beaconGroup.add(this.beaconCore);

    // Pulsing radar ring
    const beaconRingGeo = new THREE.RingGeometry(0.024, 0.038, 32);
    const beaconRingMat = new THREE.MeshBasicMaterial({
      color: '#fda4af',
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide,
    });
    this.beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
    this.beaconGroup.add(this.beaconRing);

    this.earthGroup.add(this.beaconGroup);
    this.updateBeaconPosition(this.options.initialLat, this.options.initialLon);

    this.scene.add(this.earthGroup);

    this.bindEvents();
    this.animate();
  }

  // Deep Space Multi-Layer Starfield & Nebula Cloud from EarthScene3D.tsx
  buildDeepSpaceBackdrop() {
    const createStarLayer = (count, minR, maxR, minSize, maxSize) => {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const phases = new Float32Array(count);

      const palette = [
        new THREE.Color('#cfe5ff'), // O/B blue-white
        new THREE.Color('#f8fafc'), // A/F pure white
        new THREE.Color('#fff1d6'), // G warm solar white
        new THREE.Color('#ffd6a5'), // K golden amber
        new THREE.Color('#f5d0fe'), // Faint rose-violet star
      ];

      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * Math.PI * 2;
        const rawCosPhi = 2 * v - 1;
        const galacticBias = i % 3 === 0 ? rawCosPhi * 0.35 : rawCosPhi;
        const phi = Math.acos(THREE.MathUtils.clamp(galacticBias, -1, 1));
        const r = minR + Math.random() * (maxR - minR);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.cos(phi);
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

        const c = palette[i % palette.length];
        const brightness = 0.52 + Math.random() * 0.48;
        colors[i * 3] = c.r * brightness;
        colors[i * 3 + 1] = c.g * brightness;
        colors[i * 3 + 2] = c.b * brightness;

        sizes[i] = minSize + Math.pow(Math.random(), 2.4) * (maxSize - minSize);
        phases[i] = Math.random() * Math.PI * 2;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
      return geo;
    };

    this.starMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vColor = aColor;
          vTwinkle = 0.72 + 0.28 * sin(uTime * 1.15 + aPhase);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (26.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vec2 cxy = 2.0 * gl_PointCoord - 1.0;
          float r2 = dot(cxy, cxy);
          if (r2 > 1.0) discard;
          float alpha = exp(-r2 * 5.8) * vTwinkle;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    });

    const farStarsGeo = createStarLayer(3200, 38, 72, 1.3, 3.2);
    this.starPointsFar = new THREE.Points(farStarsGeo, this.starMaterial);
    this.scene.add(this.starPointsFar);

    const midStarsGeo = createStarLayer(1100, 22, 38, 1.8, 4.4);
    this.starPointsMid = new THREE.Points(midStarsGeo, this.starMaterial);
    this.scene.add(this.starPointsMid);

    const galaxyGeo = createStarLayer(360, 42, 54, 1.1, 2.4);
    this.starPointsGalaxy = new THREE.Points(galaxyGeo, this.starMaterial);
    this.starPointsGalaxy.position.set(-12, 7.5, -26);
    this.starPointsGalaxy.rotation.set(0.9, 0.3, 0.4);
    this.starPointsGalaxy.scale.set(0.45, 0.18, 0.45);
    this.scene.add(this.starPointsGalaxy);

    // Cosmic dust / nebula cloud (42 points in deep burgundy & cosmic violet)
    const nebCanvas = generateCosmicNebulaCanvas();
    const nebTex = new THREE.CanvasTexture(nebCanvas);
    const nebCount = 42;
    const nebPositions = new Float32Array(nebCount * 3);
    const nebColors = new Float32Array(nebCount * 3);

    const nebulaPalette = [
      new THREE.Color('#6b1031'), // Deep burgundy
      new THREE.Color('#4c1d95'), // Deep cosmic violet
      new THREE.Color('#831843'), // Wine magenta
      new THREE.Color('#1e1b4b'), // Midnight indigo dust
    ];

    for (let i = 0; i < nebCount; i++) {
      const t = (i / nebCount) * Math.PI * 2;
      const bandTilt = Math.sin(t * 2.0) * 8.5;
      const radius = 34 + (i % 7) * 2.8;
      nebPositions[i * 3] = Math.cos(t) * radius;
      nebPositions[i * 3 + 1] = bandTilt + ((i % 5) - 2) * 3.2;
      nebPositions[i * 3 + 2] = Math.sin(t) * radius - 10;

      const c = nebulaPalette[i % nebulaPalette.length];
      nebColors[i * 3] = c.r;
      nebColors[i * 3 + 1] = c.g;
      nebColors[i * 3 + 2] = c.b;
    }

    const nebGeo = new THREE.BufferGeometry();
    nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPositions, 3));
    nebGeo.setAttribute('color', new THREE.BufferAttribute(nebColors, 3));

    const nebMat = new THREE.PointsMaterial({
      map: nebTex,
      size: 24,
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.nebulaPoints = new THREE.Points(nebGeo, nebMat);
    this.scene.add(this.nebulaPoints);
  }

  updateBeaconPosition(lat, lon) {
    if (!this.beaconGroup) return;
    const pos = this.latLonToVector3(lat, lon, 1.009);
    this.beaconGroup.position.copy(pos);

    // Look at origin reversed so ring lies flat on Earth surface
    const dummy = new THREE.Object3D();
    dummy.position.copy(pos);
    dummy.lookAt(pos.clone().multiplyScalar(2));
    this.beaconGroup.quaternion.copy(dummy.quaternion);
  }

  // Cinematic orbital dive plunging directly into the Earth towards coordinates in hierarchical stages:
  // Global Orbit -> Country (India) -> State (Karnataka) -> District (Bengaluru) -> Current Farm Location
  zoomToLocation(lat, lon, onProgressOrComplete, onComplete) {
    this.targetLat = lat;
    this.targetLon = lon;
    this.updateBeaconPosition(lat, lon);

    this.startQuaternion.copy(this.earthGroup.quaternion);
    this.targetQuaternion = this.calculateTargetQuaternion(lat, lon);

    this.isZooming = true;
    this.zoomProgress = 0;
    this.zoomStartTime = performance.now();
    this.zoomDuration = 2500; // Snappy 2.5s multi-stage dive
    if (typeof onComplete === 'function') {
      this.onZoomProgressCallback = onProgressOrComplete;
      this.onZoomCompleteCallback = onComplete;
    } else {
      this.onZoomProgressCallback = null;
      this.onZoomCompleteCallback = onProgressOrComplete || this.options.onZoomComplete;
    }

    // Safety fallback timeout to guarantee completion even under throttled background rAF
    if (this.zoomTimer) clearTimeout(this.zoomTimer);
    this.zoomTimer = setTimeout(() => {
      if (this.isZooming) {
        this.isZooming = false;
        if (this.onZoomCompleteCallback) {
          const cb = this.onZoomCompleteCallback;
          this.onZoomCompleteCallback = null;
          cb({ lat: this.targetLat, lon: this.targetLon });
        }
      }
    }, this.zoomDuration + 150);
  }

  resetOrbitalView() {
    this.isZooming = false;
    this.zoomProgress = 0;
    if (this.zoomTimer) clearTimeout(this.zoomTimer);
    this.onZoomCompleteCallback = null;
    this.onZoomProgressCallback = null;
    if (this.camera) {
      this.camera.position.set(0, 0.06, 3.25);
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
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      // Parallax tracking
      this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;

      if (!this.isDragging || this.isZooming) return;

      const deltaX = clientX - this.previousMousePosition.x;
      const deltaY = clientY - this.previousMousePosition.y;

      this.rotationVelocity.x = deltaY * 0.005;
      this.rotationVelocity.y = deltaX * 0.005;

      if (this.earthGroup) {
        const deltaQuatY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVelocity.y);
        const deltaQuatX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.rotationVelocity.x);
        this.earthGroup.quaternion.multiplyQuaternions(deltaQuatY, this.earthGroup.quaternion);
        this.earthGroup.quaternion.multiplyQuaternions(deltaQuatX, this.earthGroup.quaternion);
      }

      this.previousMousePosition = { x: clientX, y: clientY };
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

    this.onResize = () => this.checkResize();
    window.addEventListener('resize', this.onResize);
  }

  animate() {
    if (this.isDestroyed) return;

    this.animId = requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // Update twinkle time uniform for starfield
    if (this.starMaterial) {
      this.starMaterial.uniforms.uTime.value = time;
    }

    // Pulse beacon marker ring
    if (this.beaconRing && this.beaconRing.material) {
      const ringPulse = 1.0 + (Math.sin(time * 6.5) * 0.5 + 0.5) * 0.55;
      this.beaconRing.scale.set(ringPulse, ringPulse, 1);
      this.beaconRing.material.opacity = 0.58 + Math.cos(time * 6.5) * 0.35;
    }
    if (this.beaconCore && this.beaconCore.material) {
      this.beaconCore.material.emissiveIntensity = 2.2 + Math.sin(time * 8.0) * 0.8;
    }

    // Cloud rotation
    if (this.cloudMesh) {
      this.cloudMesh.rotation.y += 0.0006;
    }

    // Starfield subtle orbital drift
    if (this.starPointsFar) {
      this.starPointsFar.rotation.y -= 0.0002;
    }
    if (this.starPointsMid) {
      this.starPointsMid.rotation.y -= 0.0004;
    }

    // Plunge Animation: Slerps to target coordinates, plunges through atmosphere into the Earth
    if (this.isZooming) {
      const elapsed = performance.now() - this.zoomStartTime;
      const t = Math.min(1, elapsed / this.zoomDuration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Slerp Earth rotation so target coordinates center on camera
      if (this.earthGroup && this.targetQuaternion) {
        this.earthGroup.quaternion.slerp(this.targetQuaternion, Math.min(1, 0.16));
      }

      // Camera plunges from orbit (3.25) -> through clouds & atmosphere -> into crust (0.92)
      let currentZ;
      if (t < 0.55) {
        const p1 = t / 0.55;
        const e1 = p1 * p1 * (3 - 2 * p1);
        currentZ = 3.25 - (3.25 - 1.25) * e1;
      } else {
        const p2 = (t - 0.55) / (1.0 - 0.55);
        const e2 = p2 * p2;
        // Plunges into earth interior / mantle (down to 0.92)
        currentZ = 1.25 - (1.25 - 0.92) * e2;
      }
      this.camera.position.z = currentZ;

      // Report hierarchical zoom stages: Country -> State -> District -> Current Location with real telemetry
      if (this.onZoomProgressCallback) {
        if (t < 0.28) {
          const alt = Math.round((1 - t / 0.28) * 10000 + 1500);
          this.onZoomProgressCallback({ stage: 'country', name: 'India', flag: '🇮🇳', level: 1, altitude: `${alt} km` });
        } else if (t < 0.58) {
          const alt = Math.round((1 - (t - 0.28) / 0.30) * 1400 + 120);
          this.onZoomProgressCallback({ stage: 'state', name: 'Karnataka', flag: '🏛️', level: 2, altitude: `${alt} km` });
        } else if (t < 0.86) {
          const alt = Math.round((1 - (t - 0.58) / 0.28) * 115 + 2);
          this.onZoomProgressCallback({ stage: 'district', name: 'Bengaluru Urban', flag: '📍', level: 3, altitude: `${alt} km` });
        } else {
          this.onZoomProgressCallback({ stage: 'local', name: 'Ground Surface', flag: '🌿', level: 4, altitude: '0 m (Ground)' });
        }
      }

      // Atmospheric penetration vibration shake
      if (t > 0.40 && t < 0.95) {
        const intensity = Math.sin(((t - 0.40) / 0.55) * Math.PI);
        const shake = intensity * 0.016;
        this.camera.position.x = (Math.random() - 0.5) * shake;
        this.camera.position.y = 0.06 + (Math.random() - 0.5) * shake;
        if (this.mantleMesh) {
          this.mantleMesh.material.opacity = 0.85 * intensity;
        }
      } else {
        this.camera.position.x = 0;
        this.camera.position.y = 0.06;
      }

      if (t >= 1) {
        this.isZooming = false;
        if (this.zoomTimer) clearTimeout(this.zoomTimer);
        if (this.onZoomCompleteCallback) {
          const cb = this.onZoomCompleteCallback;
          this.onZoomCompleteCallback = null;
          cb({
            lat: this.targetLat,
            lon: this.targetLon
          });
        }
      }
    } else {
      // Idle orbital auto-rotation
      if (!this.isDragging && this.earthGroup) {
        const autoQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.options.autoRotateSpeed);
        this.earthGroup.quaternion.multiplyQuaternions(autoQuat, this.earthGroup.quaternion);

        // Smooth subtle pointer parallax
        this.camera.position.x += (this.pointer.x * 0.18 - this.camera.position.x) * 0.05;
        this.camera.position.y += (0.06 + this.pointer.y * 0.12 - this.camera.position.y) * 0.05;
      }
    }

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
