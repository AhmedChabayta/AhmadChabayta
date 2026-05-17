"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Cinematic constellation tree. Transparency-safe "bloom": every glow is
 * real additive geometry (crisp core + soft halo layers) under ACES
 * filmic tone-mapping, with god-ray haze, a ground light pool and
 * drifting motes for volumetric depth. Branches GROW structurally
 * (seed -> tree) by path-distance; canopy points are born when the
 * branch reaches them. Rooted, transparent, quality scales on mobile.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Seg {
  a: THREE.Vector3;
  b: THREE.Vector3;
  t0: number;
  t1: number;
}

function buildTree() {
  const rnd = mulberry32(20260516);
  const raw: { a: THREE.Vector3; b: THREE.Vector3; d0: number; d1: number }[] =
    [];
  const tipsRaw: { p: THREE.Vector3; d: number }[] = [];
  let maxD = 1;

  const grow = (
    start: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    depth: number,
    acc: number,
  ) => {
    if (depth > 5 || len < 0.12) return;
    const steps = 5;
    let p = start.clone();
    const d = dir.clone().normalize();
    const segLen = len / steps;
    let cur = acc;
    for (let i = 0; i < steps; i++) {
      d.x += (rnd() - 0.5) * 0.2;
      d.y += 0.05 - depth * 0.013;
      d.z += (rnd() - 0.5) * 0.2;
      d.normalize();
      const np = p.clone().addScaledVector(d, segLen);
      raw.push({ a: p.clone(), b: np.clone(), d0: cur, d1: cur + segLen });
      cur += segLen;
      p = np;
    }
    if (cur > maxD) maxD = cur;
    if (depth >= 2) tipsRaw.push({ p: p.clone(), d: cur });
    const kids = depth < 2 ? 3 : rnd() < 0.45 ? 2 : 3;
    for (let i = 0; i < kids; i++) {
      const axis = new THREE.Vector3(
        rnd() - 0.5,
        rnd() * 0.3,
        rnd() - 0.5,
      ).normalize();
      const ang = 0.42 + rnd() * 0.55;
      const nd = d
        .clone()
        .applyAxisAngle(axis, i === 0 ? ang * 0.4 : ang)
        .normalize();
      grow(p.clone(), nd, len * (0.7 + rnd() * 0.16), depth + 1, cur);
    }
  };

  grow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 2.4, 0, 0);

  const segs: Seg[] = raw.map((r) => ({
    a: r.a,
    b: r.b,
    t0: r.d0 / maxD,
    t1: r.d1 / maxD,
  }));
  const tips = tipsRaw.map((t) => ({ p: t.p, tg: t.d / maxD }));
  return { segs, tips };
}

const PALETTE = [
  [0.18, 0.5, 0.4],
  [0.29, 0.68, 0.52],
  [0.46, 0.83, 0.66],
  [0.12, 0.44, 0.38],
  [0.8, 0.95, 0.86],
  [0.96, 0.92, 0.83],
  [1.0, 0.56, 0.32], // rare warm spark
];

const CANOPY_VERT = `
  attribute vec3 aColor; attribute float aSeed;
  attribute float aSize; attribute float aBorn;
  uniform float uTime; uniform float uGrow; uniform float uH; uniform float uMul;
  varying vec3 vC; varying float vA;
  void main() {
    float born = smoothstep(aBorn, aBorn + 0.06, uGrow);
    vec3 p = position;
    vec4 wp = modelMatrix * vec4(p, 1.0);
    float sway = sin(uTime*1.3 + wp.x*0.6 + wp.z*0.45)*0.17
               + sin(uTime*2.6 + aSeed)*0.06;
    p.x += sway * smoothstep(0.0, 5.0, wp.y);
    p.z += sway * 0.6 * smoothstep(0.0, 5.0, wp.y);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float tw = 0.6 + 0.4 * sin(uTime*2.1 + aSeed*3.0);
    float pop = born * (1.0 + (1.0 - born) * 0.9);
    float depth = clamp((-mv.z - 8.0) / 14.0, 0.0, 1.0); // far = softer/dimmer
    gl_PointSize = aSize * uMul * pop * (0.5 + 0.5*tw)
                 * (1.0 + depth * 0.5) * (uH / -mv.z) * 0.012;
    gl_Position = projectionMatrix * mv;
    vC = aColor;
    vA = born * (0.45 + 0.55*tw) * (1.0 - depth*0.55);
  }`;

const canopyFrag = (soft: number) => `
  precision mediump float;
  varying vec3 vC; varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, ${soft.toFixed(2)}, d);
    if (a <= 0.001) discard;
    gl_FragColor = vec4(vC, a * vA);
  }`;

export function Tree3D({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const low =
      window.matchMedia("(max-width: 860px), (pointer: coarse)").matches;

    const W = Math.max(wrap.clientWidth, 1);
    const H = Math.max(wrap.clientHeight, 1);
    const DPR = Math.min(window.devicePixelRatio, low ? 1.25 : 1.75);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07120f, 0.03);
    const camera = new THREE.PerspectiveCamera(33, W / H, 0.1, 100);
    camera.position.set(0.3, 4.5, 13.6);
    camera.lookAt(0, 4.2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !low,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    const dom = renderer.domElement;
    dom.style.cssText =
      "display:block;position:absolute;inset:0;width:100%;height:100%;";
    dom.setAttribute("aria-hidden", "true");
    wrap.appendChild(dom);

    const root = new THREE.Group();
    scene.add(root);
    const disposers: (() => void)[] = [];

    const { segs, tips } = buildTree();

    // ---- branches: glowing additive lines that EXTEND on growth ----
    const linePos = new Float32Array(segs.length * 6);
    const lineCol = new Float32Array(segs.length * 6);
    segs.forEach((s, i) => {
      linePos.set([s.a.x, s.a.y, s.a.z, s.a.x, s.a.y, s.a.z], i * 6);
      const ta = Math.min(1, s.a.y / 6);
      const tb = Math.min(1, s.b.y / 6);
      lineCol.set(
        [
          0.95 - ta * 0.6,
          0.85 - ta * 0.1,
          0.66 + ta * 0.06,
          0.95 - tb * 0.6,
          0.85 - tb * 0.1,
          0.66 + tb * 0.06,
        ],
        i * 6,
      );
    });
    const lineGeo = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(linePos, 3);
    linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute("position", linePosAttr);
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    root.add(new THREE.LineSegments(lineGeo, lineMat));
    disposers.push(() => {
      lineGeo.dispose();
      lineMat.dispose();
    });

    // ---- canopy: dense additive points, crisp core + soft glow halo --
    const rp = mulberry32(99);
    const PER = low ? 5 : 9;
    const N = tips.length * PER;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const psize = new Float32Array(N);
    const aborn = new Float32Array(N);
    let k = 0;
    tips.forEach((t) => {
      for (let j = 0; j < PER; j++) {
        const spread = 0.5 + rp() * 0.55;
        pos[k * 3] = t.p.x + (rp() + rp() + rp() - 1.5) * spread;
        pos[k * 3 + 1] = t.p.y + (rp() + rp() + rp() - 1.5) * spread * 0.85;
        pos[k * 3 + 2] = t.p.z + (rp() + rp() + rp() - 1.5) * spread;
        const warm = rp() < 0.05;
        const c = warm
          ? PALETTE[6]
          : PALETTE[(rp() * (PALETTE.length - 1)) | 0];
        col[k * 3] = c[0];
        col[k * 3 + 1] = c[1];
        col[k * 3 + 2] = c[2];
        seed[k] = rp() * 6.2831853;
        psize[k] = (warm ? 24 : 12) + rp() * 15;
        aborn[k] = Math.min(0.985, t.tg + 0.01 + rp() * 0.03);
        k++;
      }
    });
    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    ptsGeo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    ptsGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    ptsGeo.setAttribute("aSize", new THREE.BufferAttribute(psize, 1));
    ptsGeo.setAttribute("aBorn", new THREE.BufferAttribute(aborn, 1));
    disposers.push(() => ptsGeo.dispose());

    const uH = H * DPR;
    const shared = {
      uTime: { value: 0 },
      uGrow: { value: reduced ? 1 : 0 },
      uH: { value: uH },
    };
    const mkCanopy = (mul: number, soft: number, extraOpacity: number) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: { ...shared, uMul: { value: mul } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: CANOPY_VERT,
        fragmentShader: canopyFrag(soft),
      });
      mat.uniforms.uTime = shared.uTime;
      mat.uniforms.uGrow = shared.uGrow;
      mat.uniforms.uH = shared.uH;
      const pts = new THREE.Points(ptsGeo, mat);
      pts.renderOrder = extraOpacity; // halo first, core on top
      root.add(pts);
      disposers.push(() => mat.dispose());
      return mat;
    };
    if (!low) mkCanopy(3.4, 0.0, 0); // wide soft bloom halo
    mkCanopy(1.8, 0.04, 1); // mid glow
    mkCanopy(1.0, 0.12, 2); // crisp core

    // ---- ground light pool (additive, grows in) ----
    const groundUni = { uGrow: shared.uGrow, uTime: shared.uTime };
    const groundMat = new THREE.ShaderMaterial({
      uniforms: groundUni,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `precision mediump float; varying vec2 vUv;
        uniform float uGrow; uniform float uTime;
        void main(){
          float d=length(vUv-0.5)*2.0;
          float a=smoothstep(1.0,0.0,d);
          a*=a*(0.5+0.18*sin(uTime*0.6));
          vec3 c=mix(vec3(0.18,0.55,0.46), vec3(1.0,0.55,0.3), 0.25);
          gl_FragColor=vec4(c, a*0.5*uGrow);
        }`,
    });
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(13, 13),
      groundMat,
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    root.add(ground);
    disposers.push(() => {
      ground.geometry.dispose();
      groundMat.dispose();
    });

    // ---- god-ray haze: big soft additive sheets behind canopy ----
    const hazeMat = new THREE.ShaderMaterial({
      uniforms: { uTime: shared.uTime, uGrow: shared.uGrow },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `precision mediump float; varying vec2 vUv;
        uniform float uTime; uniform float uGrow;
        void main(){
          float r=length(vUv-0.5);
          float a=smoothstep(0.5,0.0,r);
          a*=0.10+0.05*sin(uTime*0.4+vUv.y*6.0);
          gl_FragColor=vec4(vec3(0.95,0.6,0.36), a*uGrow);
        }`,
    });
    [
      [-2.4, 6, -4, 9],
      [2.8, 7.5, -5, 11],
    ].forEach(([x, y, z, s]) => {
      const h = new THREE.Mesh(new THREE.PlaneGeometry(s, s), hazeMat);
      h.position.set(x, y, z);
      root.add(h);
      disposers.push(() => h.geometry.dispose());
    });
    disposers.push(() => hazeMat.dispose());

    // ---- drifting motes (volumetric dust) ----
    if (!low) {
      const M = 130;
      const mp = new Float32Array(M * 3);
      const ms = new Float32Array(M);
      const rm = mulberry32(4242);
      for (let i = 0; i < M; i++) {
        mp[i * 3] = (rm() - 0.5) * 14;
        mp[i * 3 + 1] = rm() * 11;
        mp[i * 3 + 2] = (rm() - 0.5) * 12 - 1;
        ms[i] = rm() * 6.28;
      }
      const mg = new THREE.BufferGeometry();
      mg.setAttribute("position", new THREE.BufferAttribute(mp, 3));
      mg.setAttribute("aSeed", new THREE.BufferAttribute(ms, 1));
      const mm = new THREE.ShaderMaterial({
        uniforms: { uTime: shared.uTime, uGrow: shared.uGrow, uH: shared.uH },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `attribute float aSeed; uniform float uTime;
          uniform float uH; uniform float uGrow; varying float vA;
          void main(){
            vec3 p=position;
            p.x+=sin(uTime*0.25+aSeed)*0.7;
            p.y+=sin(uTime*0.18+aSeed*1.7)*0.5;
            vec4 mv=modelViewMatrix*vec4(p,1.0);
            gl_PointSize=(2.5+1.5*sin(uTime+aSeed))*(uH/-mv.z)*0.012;
            gl_Position=projectionMatrix*mv;
            vA=(0.25+0.25*sin(uTime*0.8+aSeed))*uGrow;
          }`,
        fragmentShader: `precision mediump float; varying float vA;
          void main(){ float d=length(gl_PointCoord-0.5);
            float a=smoothstep(0.5,0.0,d);
            gl_FragColor=vec4(0.85,0.95,0.9,a*vA); }`,
      });
      scene.add(new THREE.Points(mg, mm));
      disposers.push(() => {
        mg.dispose();
        mm.dispose();
      });
    }

    // ---- scroll growth (structural, rooted) ----
    let targetG = 0;
    let curG = reduced ? 1 : 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetG = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const clock = new THREE.Clock();
    let raf = 0;
    const ease = (x: number) => 1 - Math.pow(1 - x, 2.4);

    const writeBranches = (G: number) => {
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        let r = (G - s.t0) / (s.t1 - s.t0 || 1e-5);
        r = r < 0 ? 0 : r > 1 ? 1 : r;
        const o = i * 6;
        linePos[o] = s.a.x;
        linePos[o + 1] = s.a.y;
        linePos[o + 2] = s.a.z;
        linePos[o + 3] = s.a.x + (s.b.x - s.a.x) * r;
        linePos[o + 4] = s.a.y + (s.b.y - s.a.y) * r;
        linePos[o + 5] = s.a.z + (s.b.z - s.a.z) * r;
      }
      linePosAttr.needsUpdate = true;
    };

    const frame = () => {
      const t = clock.getElapsedTime();
      curG += (targetG - curG) * 0.08;
      const G = ease(curG);
      writeBranches(G);
      root.rotation.y = Math.sin(t * 0.11) * 0.06 + 0.16;
      root.rotation.z = Math.sin(t * 0.3) * 0.012;
      shared.uTime.value = t;
      shared.uGrow.value = G;
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    if (reduced) {
      writeBranches(1);
      shared.uGrow.value = 1;
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      const w = Math.max(wrap.clientWidth, 1);
      const h = Math.max(wrap.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      shared.uH.value = h * DPR;
      if (reduced) renderer.render(scene, camera);
    });
    ro.observe(wrap);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      disposers.forEach((d) => d());
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} />;
}
