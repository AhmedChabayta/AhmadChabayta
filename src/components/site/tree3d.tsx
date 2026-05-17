"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Procedural fractal tree — generated entirely in code, no asset.
 *
 * A seeded recursive branch system (thousands of tapered limbs) is
 * uploaded once as an instanced mesh. A custom shader then:
 *   - GROWS it from the scroll position: each segment carries a
 *     normalized path-order [t0,t1]; uGrow (driven by page scroll)
 *     sweeps outward, so scrolling literally unfolds the tree.
 *   - SWAYS it in the wind: tips displace far more than the trunk.
 *   - GLOWS at the tips for an ethereal falloff.
 *
 * Reduced-motion: still grows with scroll, but no wind/idle drift.
 */

const SEED = 0xa17e;
const DEPTH = 9;
const HEIGHT = 7; // final normalized height (units)

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Seg = {
  p: THREE.Vector3;
  d: THREE.Vector3;
  len: number;
  r0: number;
  r1: number;
  t0: number;
  t1: number;
};

function buildTree() {
  const rnd = mulberry32(SEED);
  const segs: Seg[] = [];
  // longest root->tip path length, to normalize growth order to [0,1]
  const k = 0.76;
  let span = 0;
  for (let i = 0; i <= DEPTH; i++) span += Math.pow(k, i);
  span *= 1.9;

  const grow = (
    p: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    rad: number,
    depth: number,
    path: number,
  ) => {
    // subdivide each limb into 3 slightly-bent cylinders (organic curve)
    const SUB = 3;
    let cp = p.clone();
    let cd = dir.clone().normalize();
    const subLen = len / SUB;
    for (let s = 0; s < SUB; s++) {
      const bend = new THREE.Vector3(
        (rnd() - 0.5) * 0.5,
        (rnd() - 0.5) * 0.2,
        (rnd() - 0.5) * 0.5,
      );
      const nd = cd.clone().addScaledVector(bend, 0.18).normalize();
      const r0 = rad * (1 - (s / SUB) * 0.25);
      const r1 = rad * (1 - ((s + 1) / SUB) * 0.25);
      const t0 = path / span;
      const t1 = (path + subLen) / span;
      segs.push({
        p: cp.clone(),
        d: nd.clone(),
        len: subLen,
        r0,
        r1,
        t0: Math.min(t0, 1),
        t1: Math.min(t1, 1),
      });
      cp = cp.clone().addScaledVector(nd, subLen);
      cd = nd;
      path += subLen;
    }

    if (depth >= DEPTH || len < 0.04) return;
    const kids = rnd() < 0.55 ? 3 : 2;
    for (let c = 0; c < kids; c++) {
      const ang = (24 + rnd() * 20) * (Math.PI / 180);
      // random axis roughly perpendicular to cd for a 3D spread
      const az = (c / kids) * Math.PI * 2 + rnd() * 1.3;
      const axis = new THREE.Vector3(Math.cos(az), 0, Math.sin(az))
        .cross(cd)
        .normalize();
      const childDir = cd
        .clone()
        .applyAxisAngle(axis, ang)
        .addScaledVector(new THREE.Vector3(0, 1, 0), 0.12) // upward bias
        .normalize();
      grow(
        cp.clone(),
        childDir,
        len * k * (0.92 + rnd() * 0.16),
        rad * 0.7,
        depth + 1,
        path,
      );
    }
  };

  grow(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0),
    1.7,
    0.11,
    0,
    0,
  );

  // normalize: base at y=0, centered x/z, height = HEIGHT
  const box = new THREE.Box3();
  const tip = new THREE.Vector3();
  for (const s of segs) {
    box.expandByPoint(s.p);
    tip.copy(s.p).addScaledVector(s.d, s.len);
    box.expandByPoint(tip);
  }
  const size = new THREE.Vector3();
  const ctr = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(ctr);
  const sc = HEIGHT / (size.y || 1);
  for (const s of segs) {
    s.p.set(
      (s.p.x - ctr.x) * sc,
      (s.p.y - box.min.y) * sc,
      (s.p.z - ctr.z) * sc,
    );
    s.len *= sc;
    s.r0 *= sc;
    s.r1 *= sc;
  }
  return segs;
}

export function Tree3D({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const low = window.matchMedia(
      "(max-width: 860px), (pointer: coarse)",
    ).matches;

    let W = Math.max(wrap.clientWidth, 1);
    let H = Math.max(wrap.clientHeight, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({
      antialias: !low,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1.25 : 1.9));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    const dom = renderer.domElement;
    dom.style.cssText =
      "display:block;position:absolute;inset:0;width:100%;height:100%;";
    dom.setAttribute("aria-hidden", "true");
    wrap.appendChild(dom);

    // ---- build instanced geometry ----
    const segs = buildTree();
    const N = segs.length;
    const cyl = new THREE.CylinderGeometry(1, 1, 1, low ? 5 : 6, 1, true);
    cyl.translate(0, 0.5, 0); // base at y=0

    const geo = new THREE.InstancedBufferGeometry();
    geo.index = cyl.index;
    geo.attributes.position = cyl.attributes.position;
    geo.instanceCount = N;

    const iStart = new Float32Array(N * 3);
    const iDir = new Float32Array(N * 3);
    const iLen = new Float32Array(N);
    const iR = new Float32Array(N * 2);
    const iT = new Float32Array(N * 2);
    segs.forEach((s, i) => {
      iStart[i * 3] = s.p.x;
      iStart[i * 3 + 1] = s.p.y;
      iStart[i * 3 + 2] = s.p.z;
      iDir[i * 3] = s.d.x;
      iDir[i * 3 + 1] = s.d.y;
      iDir[i * 3 + 2] = s.d.z;
      iLen[i] = s.len;
      iR[i * 2] = s.r0;
      iR[i * 2 + 1] = s.r1;
      iT[i * 2] = s.t0;
      iT[i * 2 + 1] = s.t1;
    });
    geo.setAttribute("iStart", new THREE.InstancedBufferAttribute(iStart, 3));
    geo.setAttribute("iDir", new THREE.InstancedBufferAttribute(iDir, 3));
    geo.setAttribute("iLen", new THREE.InstancedBufferAttribute(iLen, 1));
    geo.setAttribute("iR", new THREE.InstancedBufferAttribute(iR, 2));
    geo.setAttribute("iT", new THREE.InstancedBufferAttribute(iT, 2));

    const uniforms = {
      uGrow: { value: reduced ? 0.0001 : 0.0001 },
      uTime: { value: 0 },
      uWind: { value: reduced ? 0 : 1 },
      uColBase: { value: new THREE.Color(0x243027) },
      uColTip: { value: new THREE.Color(0x7fe0c8) },
      uColGlow: { value: new THREE.Color(0xff8a3d) },
      uLightDir: { value: new THREE.Vector3(-0.5, 1, 0.6).normalize() },
      uFog: { value: new THREE.Color(0x06110f) },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
      vertexShader: /* glsl */ `
        attribute vec3 iStart; attribute vec3 iDir; attribute float iLen;
        attribute vec2 iR; attribute vec2 iT;
        uniform float uGrow, uTime, uWind;
        varying float vT; varying float vG; varying vec3 vN; varying float vZ;
        mat3 basis(vec3 d){
          d = normalize(d);
          vec3 up = abs(d.y) < 0.999 ? vec3(0.,1.,0.) : vec3(1.,0.,0.);
          vec3 t = normalize(cross(up,d));
          vec3 b = cross(d,t);
          return mat3(t,d,b);
        }
        void main(){
          float g = clamp((uGrow - iT.x)/max(iT.y-iT.x,1e-4), 0., 1.);
          float r = mix(iR.x, iR.y, position.y);
          vec3 lp = vec3(position.x*r, position.y*iLen*g, position.z*r);
          mat3 M = basis(iDir);
          vec3 wp = iStart + M*lp;
          float tp = mix(iT.x, iT.y, position.y);
          float sway = uWind * (0.06 + tp*tp*1.05) * g;
          float ph = wp.x*0.6 + wp.z*0.5;
          wp += vec3(
            sin(uTime*1.1+ph)*0.5 + sin(uTime*2.3+ph*1.7)*0.22,
            0.0,
            cos(uTime*0.9+ph)*0.42
          ) * sway;
          vec4 mv = viewMatrix * vec4(wp,1.0);
          gl_Position = projectionMatrix * mv;
          vN = normalize(M * normalize(vec3(position.x,0.0,position.z)));
          vT = tp; vG = g; vZ = -mv.z;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uColBase, uColTip, uColGlow, uLightDir, uFog;
        varying float vT; varying float vG; varying vec3 vN; varying float vZ;
        void main(){
          if (vG < 0.012) discard;
          vec3 col = mix(uColBase, uColTip, smoothstep(0.0,1.0,vT));
          float ndl = clamp(dot(normalize(vN), normalize(uLightDir)),0.0,1.0);
          col *= 0.36 + 0.82*ndl;
          col += uColGlow * pow(vT,3.0) * (0.35 + 0.65*vG);
          float fog = clamp((vZ-12.0)/30.0, 0.0, 0.4);
          col = mix(col, uFog, fog);
          float a = smoothstep(0.0,0.06,vG) * (0.9 - fog*0.5);
          gl_FragColor = vec4(col, a);
        }
      `,
    });

    const tree = new THREE.Mesh(geo, mat);
    tree.frustumCulled = false;
    scene.add(tree);

    // ---- scroll-driven growth + cinematic camera ----
    let targetG = 0;
    let curG = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetG = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const camFrom = new THREE.Vector3(0.5, 5.5, 18);
    const camTo = new THREE.Vector3(-1.6, 4.0, 12.5);
    const lookFrom = new THREE.Vector3(0, 4, 0);
    const lookTo = new THREE.Vector3(0, 3.4, 0);
    const ease = (x: number) => x * x * (3 - 2 * x);

    const clock = new THREE.Clock();
    let raf = 0;
    let alive = true;
    let reducedCleanup: (() => void) | null = null;
    const tmpL = new THREE.Vector3();

    const frame = () => {
      const t = clock.getElapsedTime();
      curG += (targetG - curG) * 0.12;
      const p = ease(curG);
      // grow from a visible sprout (0.06) to full
      uniforms.uGrow.value = 0.06 + p * 0.94;
      uniforms.uTime.value = t;

      camera.position.lerpVectors(camFrom, camTo, p);
      camera.position.x += Math.sin(t * 0.1 + p * 1.4) * 0.5;
      tmpL.lerpVectors(lookFrom, lookTo, p);
      camera.lookAt(tmpL);

      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      curG = 1;
      const render = () => {
        if (!alive) return;
        const p = ease((curG += (targetG - curG) * 0.2));
        uniforms.uGrow.value = 0.06 + p * 0.94;
        camera.position.copy(camTo);
        camera.lookAt(lookTo);
        renderer.render(scene, camera);
      };
      render();
      window.addEventListener("scroll", render, { passive: true });
      reducedCleanup = () => window.removeEventListener("scroll", render);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      W = Math.max(wrap.clientWidth, 1);
      H = Math.max(wrap.clientHeight, 1);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      if (reduced) renderer.render(scene, camera);
    });
    ro.observe(wrap);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      reducedCleanup?.();
      cyl.dispose();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} />;
}
