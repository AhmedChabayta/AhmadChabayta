"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Constellation tree. Branches are glowing lines; the canopy is a few
 * thousand soft additive points filling the tree volume — camera-facing
 * sprites, so nothing ever intersects anything. Shader wind + twinkle,
 * grows from sapling to full canopy with scroll, rooted (scale only, no
 * upward drift), transparent canvas.
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
}

function buildTree() {
  const rnd = mulberry32(20260516);
  const segs: Seg[] = [];
  const tips: THREE.Vector3[] = [];

  const grow = (
    start: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    rad: number,
    depth: number,
  ) => {
    if (depth > 5 || len < 0.12) return;
    const steps = 4;
    let p = start.clone();
    const d = dir.clone().normalize();
    const segLen = len / steps;
    for (let i = 0; i < steps; i++) {
      d.x += (rnd() - 0.5) * 0.2;
      d.y += 0.05 - depth * 0.013;
      d.z += (rnd() - 0.5) * 0.2;
      d.normalize();
      const np = p.clone().addScaledVector(d, segLen);
      segs.push({ a: p.clone(), b: np.clone() });
      p = np;
    }
    const end = p;
    if (depth >= 2) tips.push(end.clone());
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
      grow(
        end,
        nd,
        len * (0.7 + rnd() * 0.16),
        rad * (0.64 + rnd() * 0.12),
        depth + 1,
      );
    }
  };

  grow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 2.4, 0.34, 0);
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
    camera.position.set(0.3, 4.6, 13.5);
    camera.lookAt(0, 4.3, 0);

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

    // ---------- branches: glowing lines ----------
    const linePos = new Float32Array(segs.length * 6);
    const lineCol = new Float32Array(segs.length * 6);
    segs.forEach((s, i) => {
      linePos.set([s.a.x, s.a.y, s.a.z, s.b.x, s.b.y, s.b.z], i * 6);
      // trunk warm-bone -> tips teal
      const ta = Math.min(1, s.a.y / 6);
      const tb = Math.min(1, s.b.y / 6);
      const ca = [
        0.85 - ta * 0.55,
        0.78 - ta * 0.12,
        0.62 + ta * 0.05,
      ];
      const cb = [
        0.85 - tb * 0.55,
        0.78 - tb * 0.12,
        0.62 + tb * 0.05,
      ];
      lineCol.set([...ca, ...cb], i * 6);
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(linePos, 3),
    );
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    root.add(new THREE.LineSegments(lineGeo, lineMat));

    // ---------- canopy: additive point constellation ----------
    const rp = mulberry32(99);
    const PER = 4;
    const N = tips.length * PER;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const psize = new Float32Array(N);
    const birth = new Float32Array(N);
    let yMax = 1;
    tips.forEach((t) => {
      if (t.y > yMax) yMax = t.y;
    });
    let k = 0;
    tips.forEach((t) => {
      for (let j = 0; j < PER; j++) {
        const spread = 0.55 + rp() * 0.5;
        pos[k * 3] = t.x + (rp() + rp() + rp() - 1.5) * spread;
        pos[k * 3 + 1] = t.y + (rp() + rp() + rp() - 1.5) * spread * 0.85;
        pos[k * 3 + 2] = t.z + (rp() + rp() + rp() - 1.5) * spread;
        const warm = rp() < 0.05;
        const c = warm
          ? PALETTE[6]
          : PALETTE[(rp() * (PALETTE.length - 1)) | 0];
        col[k * 3] = c[0];
        col[k * 3 + 1] = c[1];
        col[k * 3 + 2] = c[2];
        seed[k] = rp() * 6.2831853;
        psize[k] = (warm ? 26 : 13) + rp() * 16;
        // lower canopy is born first as the tree grows
        birth[k] = Math.min(0.92, (pos[k * 3 + 1] / yMax) * 0.9 + rp() * 0.12);
        k++;
      }
    });

    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    ptsGeo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    ptsGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    ptsGeo.setAttribute("aSize", new THREE.BufferAttribute(psize, 1));
    ptsGeo.setAttribute("aBirth", new THREE.BufferAttribute(birth, 1));

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
        attribute float aSize; attribute float aBirth;
        uniform float uTime; uniform float uGrow; uniform float uH;
        varying vec3 vC; varying float vA;
        void main() {
          vec3 p = position;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          float sway = sin(uTime*1.4 + wp.x*0.6 + wp.z*0.45)*0.16
                     + sin(uTime*2.7 + aSeed)*0.06;
          p.x += sway * smoothstep(0.0, 5.0, wp.y);
          p.z += sway * 0.6 * smoothstep(0.0, 5.0, wp.y);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float born = smoothstep(aBirth - 0.12, aBirth + 0.05, uGrow);
          float tw = 0.65 + 0.35 * sin(uTime*2.2 + aSeed*3.0);
          gl_PointSize = aSize * born * (0.45 + 0.55*tw) * (uH / -mv.z) * 0.012;
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

    // ---------- scroll growth (rooted) ----------
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
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);

    const frame = () => {
      const t = clock.getElapsedTime();
      cur += (target - cur) * 0.08;
      const e = ease(cur);
      root.scale.setScalar(0.2 + e * 0.8);
      root.rotation.y = Math.sin(t * 0.12) * 0.06 + 0.16;
      root.rotation.z = Math.sin(t * 0.32) * 0.012;
      uniforms.uTime.value = t;
      uniforms.uGrow.value = e;
      lineMat.opacity = 0.18 + e * 0.4;
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    if (reduced) {
      root.scale.setScalar(1);
      uniforms.uGrow.value = 1;
      lineMat.opacity = 0.55;
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
