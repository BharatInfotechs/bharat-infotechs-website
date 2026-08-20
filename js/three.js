(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 780;

  var canvas = document.getElementById('webgl-canvas');

  if (!window.THREE) {
    canvas.style.display = 'none';
  } else {

    var vertexShader = [
      "uniform float uTime;",
      "uniform float uDistort;",
      "uniform float uDissolve;",
      "varying vec3 vNormal;",
      "varying vec3 vPos;",
      "varying float vNoise;",
      "",
      "// --- simplex-style 3D noise (Ashima-derived, compact) ---",
      "vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }",
      "vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }",
      "vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }",
      "vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }",
      "float snoise(vec3 v){",
      "  const vec2 C = vec2(1.0/6.0, 1.0/3.0);",
      "  const vec4 D = vec4(0.0,0.5,1.0,2.0);",
      "  vec3 i = floor(v + dot(v, C.yyy));",
      "  vec3 x0 = v - i + dot(i, C.xxx);",
      "  vec3 g = step(x0.yzx, x0.xyz);",
      "  vec3 l = 1.0 - g;",
      "  vec3 i1 = min(g.xyz, l.zxy);",
      "  vec3 i2 = max(g.xyz, l.zxy);",
      "  vec3 x1 = x0 - i1 + C.xxx;",
      "  vec3 x2 = x0 - i2 + C.yyy;",
      "  vec3 x3 = x0 - D.yyy;",
      "  i = mod289(i);",
      "  vec4 p = permute(permute(permute(",
      "            i.z + vec4(0.0, i1.z, i2.z, 1.0))",
      "          + i.y + vec4(0.0, i1.y, i2.y, 1.0))",
      "          + i.x + vec4(0.0, i1.x, i2.x, 1.0));",
      "  float n_ = 0.142857142857;",
      "  vec3 ns = n_ * D.wyz - D.xzx;",
      "  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);",
      "  vec4 x_ = floor(j * ns.z);",
      "  vec4 y_ = floor(j - 7.0 * x_);",
      "  vec4 x = x_ *ns.x + ns.yyyy;",
      "  vec4 y = y_ *ns.x + ns.yyyy;",
      "  vec4 h = 1.0 - abs(x) - abs(y);",
      "  vec4 b0 = vec4(x.xy, y.xy);",
      "  vec4 b1 = vec4(x.zw, y.zw);",
      "  vec4 s0 = floor(b0)*2.0 + 1.0;",
      "  vec4 s1 = floor(b1)*2.0 + 1.0;",
      "  vec4 sh = -step(h, vec4(0.0));",
      "  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;",
      "  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;",
      "  vec3 p0 = vec3(a0.xy, h.x);",
      "  vec3 p1 = vec3(a0.zw, h.y);",
      "  vec3 p2 = vec3(a1.xy, h.z);",
      "  vec3 p3 = vec3(a1.zw, h.w);",
      "  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));",
      "  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;",
      "  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);",
      "  m = m * m;",
      "  return 92.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));",
      "}",
      "float fbm(vec3 p){",
      "  float v = 0.0; float amp = 0.55; float freq = 1.0;",
      "  for (int i = 0; i < 4; i++){",
      "    v += amp * snoise(p * freq);",
      "    freq *= 2.02; amp *= 0.52;",
      "  }",
      "  return v;",
      "}",
      "void main(){",
      "  vNormal = normalize(normalMatrix * normal);",
      "  vec3 p = position;",
      "  float n = fbm(p * 1.6 + uTime * 0.12);",
      "  vNoise = n;",
      "  float displaced = n * (0.14 + uDistort * 0.5);",
      "  vec3 dissolved = p + normal * uDissolve * (1.4 + n * 1.8);",
      "  vec3 finalPos = mix(p + normal * displaced, dissolved, uDissolve);",
      "  vPos = finalPos;",
      "  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);",
      "  gl_Position = projectionMatrix * mvPosition;",
      "}"
    ].join("\n");

    var fragmentShader = [
      "uniform vec3 uColorA;",
      "uniform vec3 uColorB;",
      "uniform float uTime;",
      "uniform float uDissolve;",
      "varying vec3 vNormal;",
      "varying vec3 vPos;",
      "varying float vNoise;",
      "void main(){",
      "  vec3 viewDir = normalize(cameraPosition - vPos);",
      "  float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.2);",
      "  float mixF = clamp(vNoise * 0.5 + 0.5, 0.0, 1.0);",
      "  vec3 base = mix(uColorA, uColorB, mixF);",
      "  vec3 glow = base + fresnel * vec3(0.75, 0.7, 1.0) * 1.1;",
      "  float alpha = (0.55 + fresnel * 0.5) * (1.0 - uDissolve);",
      "  if (alpha < 0.02) discard;",
      "  gl_FragColor = vec4(glow, alpha);",
      "}"
    ].join("\n");

    var particleVertex = [
      "uniform float uTime;",
      "uniform float uDissolve;",
      "attribute float aSize;",
      "attribute float aSeed;",
      "varying float vSeed;",
      "void main(){",
      "  vSeed = aSeed;",
      "  vec3 p = position;",
      "  float orbit = uTime * (0.05 + aSeed * 0.04);",
      "  float c = cos(orbit); float s = sin(orbit);",
      "  p.xz = mat2(c, -s, s, c) * p.xz;",
      "  p += normalize(position) * uDissolve * (1.2 + aSeed * 2.4);",
      "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
      "  gl_PointSize = aSize * (200.0 / -mv.z) * (0.6 + uDissolve * 1.2);",
      "  gl_Position = projectionMatrix * mv;",
      "}"
    ].join("\n");

    var particleFragment = [
      "uniform vec3 uColorA;",
      "uniform vec3 uColorB;",
      "varying float vSeed;",
      "void main(){",
      "  vec2 uv = gl_PointCoord - 0.5;",
      "  float d = length(uv);",
      "  float alpha = smoothstep(0.5, 0.0, d);",
      "  vec3 col = mix(uColorA, uColorB, vSeed);",
      "  gl_FragColor = vec4(col, alpha * 0.85);",
      "}"
    ].join("\n");

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
    var pixelCap = isMobile ? 1.25 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelCap));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    var colorA = new THREE.Color(0x9b8bff);
    var colorB = new THREE.Color(0x3d6bff);

    var coreDetail = isMobile ? 2 : 4;
    var coreGeo = new THREE.IcosahedronGeometry(1.55, coreDetail);
    var coreUniforms = {
      uTime: { value: 0 },
      uDistort: { value: 0.3 },
      uDissolve: { value: 0 },
      uColorA: { value: colorA },
      uColorB: { value: colorB }
    };
    var coreMat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: coreUniforms,
      transparent: true,
      wireframe: false,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    var core = new THREE.Mesh(coreGeo, coreMat);
    var coreGroup = new THREE.Group();
    coreGroup.add(core);
    coreGroup.position.set(1.1, 0, 0);
    scene.add(coreGroup);

    // wireframe inner shell for extra structure
    var wireGeo = new THREE.IcosahedronGeometry(1.15, 1);
    var wireMat = new THREE.MeshBasicMaterial({ color: 0x9b8bff, wireframe: true, transparent: true, opacity: 0.14 });
    var wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // particles
    var particleCount = isMobile ? 350 : 900;
    var pGeo = new THREE.BufferGeometry();
    var posArr = new Float32Array(particleCount * 3);
    var sizeArr = new Float32Array(particleCount);
    var seedArr = new Float32Array(particleCount);
    for (var i = 0; i < particleCount; i++){
      var r = 1.7 + Math.random() * 1.6;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos((Math.random() * 2) - 1);
      posArr[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      posArr[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      posArr[i*3+2] = r * Math.cos(phi);
      sizeArr[i] = Math.random() * 3 + 0.6;
      seedArr[i] = Math.random();
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(sizeArr, 1));
    pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seedArr, 1));
    var particleUniforms = {
      uTime: { value: 0 },
      uDissolve: { value: 0 },
      uColorA: { value: colorA },
      uColorB: { value: colorB }
    };
    var pMat = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: particleUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var particles = new THREE.Points(pGeo, pMat);
    coreGroup.add(particles);

    /* ---- pointer + scroll driven uniforms ---- */
    var pointer = { x: 0, y: 0 };
    var targetRot = { x: 0, y: 0 };
    window.addEventListener('mousemove', function(e){
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    });

    var docHeight = 1;
    function computeDocHeight(){ docHeight = Math.max(document.body.scrollHeight - window.innerHeight, 1); }
    computeDocHeight();
    window.addEventListener('resize', computeDocHeight);

    var scrollProgress = 0;
    var heroEl = document.getElementById('hero');
    var ctaEl = document.getElementById('contact');

    function updateScrollProgress(){
      var y = window.scrollY || window.pageYOffset;
      scrollProgress = Math.min(y / docHeight, 1);

      var heroH = heroEl.offsetHeight;
      var heroProgress = Math.min(Math.max(y / heroH, 0), 1);
      // dissolve strongest right after hero, fades canvas visibility via opacity too
      var dissolve = Math.min(Math.max((heroProgress - 0.15) / 0.85, 0), 1);

      // re-condense near CTA for the "evolving final visual"
      var ctaTop = ctaEl.offsetTop;
      var ctaProgress = Math.min(Math.max((y - (ctaTop - window.innerHeight)) / window.innerHeight, 0), 1);
      var finalDissolve = dissolve * (1 - ctaProgress * 0.6);

      coreUniforms.uDissolve.value = finalDissolve;
      particleUniforms.uDissolve.value = finalDissolve;
      coreUniforms.uDistort.value = 0.3 + ctaProgress * 0.5;

      canvas.style.opacity = String(Math.max(1 - dissolve * 0.85 + ctaProgress * 0.55, 0.15));
    }
    var scrollUpdateQueued = false;
    window.addEventListener('scroll', function(){
      if (scrollUpdateQueued) return;
      scrollUpdateQueued = true;
      requestAnimationFrame(function(){
        scrollUpdateQueued = false;
        updateScrollProgress();
      });
    }, { passive: true });

    var clock = new THREE.Clock();
    var lastFrame = 0;
    var frameInterval = isMobile ? (1000 / 45) : (1000 / 60);
    function animate(now){
      requestAnimationFrame(animate);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;
      var t = clock.getElapsedTime();
      coreUniforms.uTime.value = t;
      particleUniforms.uTime.value = t;

      targetRot.x += (pointer.y * 0.35 - targetRot.x) * 0.04;
      targetRot.y += (pointer.x * 0.5 - targetRot.y) * 0.04;
      coreGroup.rotation.x = targetRot.x + Math.sin(t * 0.15) * 0.08;
      coreGroup.rotation.y = targetRot.y + t * 0.06;
      wireMesh.rotation.y -= 0.0015;

      camera.position.x += (pointer.x * 0.3 - camera.position.x) * 0.03;
      camera.position.y += (-pointer.y * 0.2 - camera.position.y) * 0.03;
      camera.lookAt(coreGroup.position);

      renderer.render(scene, camera);
    }
    animate();

    function resize(){
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      computeDocHeight();
      updateScrollProgress();
    }
    window.addEventListener('resize', resize);
    setTimeout(function(){ computeDocHeight(); updateScrollProgress(); }, 400);

    if (reduceMotion) {
      // freeze heavy animation, keep a calm static-ish frame
      coreUniforms.uDistort.value = 0.12;
    }
  }

})();
