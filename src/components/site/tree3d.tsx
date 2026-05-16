"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Constellation tree that actually GROWS — seed -> sprout -> plant ->
 * tree. Branches extend outward from the root by path-distance as you
 * scroll (no scaling — the geometry itself lengthens); each canopy point
 * is "born" only once the branch that carries it has reached it. Lines +
 * additive points, so nothing ever intersects. Rooted, transparent.
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
  t0: number; // normalized path-distance from root at a
  t1: number; // ...at b
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
    const steps = 4;
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
  [0.18, 0.48, 0.38],
  [0.27, 0.64, 0.49],
  [0.43, 0.78, 0.62],
  [0.12, 0.43, 0.37],
  [0.75, 0.91, 0.82],
  [0.94, 0.9, 0.82],
  [1.0, 0.54, 0.3], // rare warm spark
];

export function Tree3D({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const W = Math.max(wrap.clientWidth, 1);
    const H = Math.max(wrap.clientHeight, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 100);
    camera.position.set(0.3, 4.4, 13.5);
    camera.lookAt(0, 4.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    const dom = renderer.domElement;
    dom.style.cssText =
      "display:block;position:absolute;inset:0;width:100%;height:100%;";
    dom.setAttribute("aria-hidden", "true");
    wrap.appendChild(dom);

    const root = new THREE.Group();
    scene.add(root);

    const { segs, tips } = buildTree();

    // ---------- branches: glowing lines that EXTEND on growth ----------
    const linePos = new Float32Array(segs.length * 6);
    const lineCol = new Float32Array(segs.length * 6);
    segs.forEach((s, i) => {
      linePos.set([s.a.x, s.a.y, s.a.z, s.a.x, s.a.y, s.a.z], i * 6);
      const ta = Math.min(1, s.a.y / 6);
      const tb = Math.min(1, s.b.y / 6);
      lineCol.set(
        [
          0.85 - ta * 0.55,
          0.78 - ta * 0.12,
          0.62 + ta * 0.05,
          0.85 - tb * 0.55,
          0.78 - tb * 0.12,
          0.62 + tb * 0.05,
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
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    root.add(new THREE.LineSegments(lineGeo, lineMat));

    // ---------- canopy: additive points, born when branch arrives ------
    const rp = mulberry32(99);
    const PER = 4;
    const N = tips.length * PER;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const psize = new Float32Array(N);
    const aborn = new Float32Array(N);
    let k = 0;
    tips.forEach((t) => {
      for (let j = 0; j < PER; j++) {
        const spread = 0.55 + rp() * 0.5;
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
        psize[k] = (warm ? 26 : 13) + rp() * 16;
        // born a touch after the branch tip reaches this point
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

    const uniforms = {
      uTime: { value: 0 },
      uGrow: { value: reduced ? 1 : 0 },
      uH: { value: H * Math.min(window.devicePixelRatio, 1.5) },
    };
    const ptsMat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aColor; attribute float aSeed;
        attribute float aSize; attribute float aBorn;
        uniform float uTime; uniform float uGrow; uniform float uH;
        varying vec3 vC; varying float vA;
        void main() {
          float born = smoothstep(aBorn, aBorn + 0.06, uGrow);
          vec3 p = position;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          float sway = sin(uTime*1.4 + wp.x*0.6 + wp.z*0.45)*0.16
                     + sin(uTime*2.7 + aSeed)*0.06;
          p.x += sway * smoothstep(0.0, 5.0, wp.y);
          p.z += sway * 0.6 * smoothstep(0.0, 5.0, wp.y);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float tw = 0.65 + 0.35 * sin(uTime*2.2 + aSeed*3.0);
          // pop in: a hair bigger as it sprouts, then settle
          float pop = born * (1.0 + (1.0 - born) * 0.8);
          gl_PointSize = aSize * pop * (0.5 + 0.5*tw) * (uH / -mv.z) * 0.012;
          gl_Position = projectionMatrix * mv;
          vC = aColor;
          vA = born * (0.5 + 0.5*tw);
        }`,
      fragmentShader: `
        precision mediump float;
        varying vec3 vC; varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.06, d);
          if (a <= 0.001) discard;
          gl_FragColor = vec4(vC, a * vA);
        }`,
    });
    root.add(new THREE.Points(ptsGeo, ptsMat));

    // ---------- scroll growth (structural, rooted) ----------
    let target = 0;
    let cur = reduced ? 1 : 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const clock = new THREE.Clock();
    let raf = 0;
    const ease = (x: number) => 1 - Math.pow(1 - x, 2.4);

    // grow the branch lines by extending each segment's far endpoint
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
      cur += (target - cur) * 0.08;
      const G = ease(cur);
      writeBranches(G);
      root.rotation.y = Math.sin(t * 0.12) * 0.06 + 0.16;
      root.rotation.z = Math.sin(t * 0.32) * 0.012;
      uniforms.uTime.value = t;
      uniforms.uGrow.value = G;
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    if (reduced) {
      writeBranches(1);
      uniforms.uGrow.value = 1;
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
      uniforms.uH.value = h * Math.min(window.devicePixelRatio, 1.5);
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
      lineGeo.dispose();
      lineMat.dispose();
      ptsGeo.dispose();
      ptsMat.dispose();
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} />;
}
