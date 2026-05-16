"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Procedural 3D tree — recursive branch skeleton (instanced cylinders),
 * a few thousand instanced leaves, dusk rim-lighting so it reads as a
 * colored photoreal silhouette against the teal atmosphere. GPU wind,
 * grows from a sapling to full canopy as you scroll, rooted to the
 * ground (never translates up). Transparent canvas.
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
  r0: number;
  r1: number;
}
interface LeafPt {
  p: THREE.Vector3;
  n: THREE.Vector3;
}

function buildTree() {
  const rnd = mulberry32(20260516);
  const segs: Seg[] = [];
  const leaves: LeafPt[] = [];

  const grow = (
    start: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    rad: number,
    depth: number,
  ) => {
    if (depth > 5 || rad < 0.018 || len < 0.12) return;
    const steps = 4;
    let p = start.clone();
    const d = dir.clone().normalize();
    const segLen = len / steps;
    for (let i = 0; i < steps; i++) {
      // gravitropism + organic noise
      d.x += (rnd() - 0.5) * 0.18;
      d.y += 0.05 - depth * 0.012;
      d.z += (rnd() - 0.5) * 0.18;
      d.normalize();
      const np = p.clone().addScaledVector(d, segLen);
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      segs.push({
        a: p.clone(),
        b: np.clone(),
        r0: rad * (1 - t0 * 0.5),
        r1: rad * (1 - t1 * 0.5),
      });
      p = np;
    }
    const end = p;

    if (depth >= 2) {
      const n = 7 + Math.floor(rnd() * 9);
      for (let i = 0; i < n; i++) {
        const off = new THREE.Vector3(
          (rnd() - 0.5) * len * 0.9,
          (rnd() - 0.5) * len * 0.9,
          (rnd() - 0.5) * len * 0.9,
        );
        leaves.push({
          p: end.clone().add(off),
          n: off.clone().normalize(),
        });
      }
    }

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
        rad * (0.62 + rnd() * 0.12),
        depth + 1,
      );
    }
  };

  grow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 2.4, 0.34, 0);
  return { segs, leaves };
}

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
    camera.position.set(0.4, 4.6, 13);
    camera.lookAt(0, 4.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    const dom = renderer.domElement;
    dom.style.cssText =
      "display:block;position:absolute;inset:0;width:100%;height:100%;";
    dom.setAttribute("aria-hidden", "true");
    wrap.appendChild(dom);

    // dusk lighting → dark body, colored rims
    scene.add(new THREE.HemisphereLight(0x2f6f63, 0x05100f, 0.55));
    const key = new THREE.DirectionalLight(0xffd9b0, 0.85);
    key.position.set(-4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff7a3c, 0.9);
    rim.position.set(3, 4, -6);
    scene.add(rim);
    const rim2 = new THREE.DirectionalLight(0x4fd0c0, 0.5);
    rim2.position.set(-5, 2, -4);
    scene.add(rim2);

    const root = new THREE.Group();
    scene.add(root);

    const { segs, leaves } = buildTree();

    // ---- branches: instanced cylinders ----
    const cyl = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
    const barkMat = new THREE.MeshStandardMaterial({
      color: 0x14322c,
      roughness: 0.95,
      metalness: 0,
    });
    const branches = new THREE.InstancedMesh(cyl, barkMat, segs.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const dirV = new THREE.Vector3();
    const mid = new THREE.Vector3();
    segs.forEach((s, i) => {
      dirV.subVectors(s.b, s.a);
      const len = dirV.length() || 0.0001;
      mid.addVectors(s.a, s.b).multiplyScalar(0.5);
      q.setFromUnitVectors(up, dirV.clone().normalize());
      const r = (s.r0 + s.r1) * 0.5;
      m.compose(mid, q, new THREE.Vector3(r, len, r));
      branches.setMatrixAt(i, m);
    });
    branches.instanceMatrix.needsUpdate = true;
    root.add(branches);

    // ---- leaves: instanced planes, colored, GPU wind ----
    const leafGeo = new THREE.PlaneGeometry(0.5, 0.74);
    const leafMat = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    let leafUniforms: { uTime: { value: number } } | null = null;
    leafMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = { value: 0 };
      leafUniforms = sh.uniforms as unknown as {
        uTime: { value: number };
      };
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uTime;",
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vec4 wp = modelMatrix * instanceMatrix * vec4(transformed,1.0);
           float sway = sin(uTime*1.7 + wp.x*0.7 + wp.z*0.5) * 0.09
                      + sin(uTime*3.1 + wp.y*1.3) * 0.04;
           transformed.x += sway * smoothstep(0.0, 6.0, wp.y);
           transformed.z += sway * 0.6 * smoothstep(0.0, 6.0, wp.y);`,
        );
    };
    const palette = [
      new THREE.Color(0x2f7a5f),
      new THREE.Color(0x3f9a72),
      new THREE.Color(0x57b487),
      new THREE.Color(0x1f5f50),
      new THREE.Color(0x86c9a4),
      new THREE.Color(0xe9e0cf),
    ];
    const leafMesh = new THREE.InstancedMesh(
      leafGeo,
      leafMat,
      leaves.length,
    );
    const rndC = mulberry32(7);
    const e = new THREE.Euler();
    const sc = new THREE.Vector3();
    leaves.forEach((lf, i) => {
      e.set(
        rndC() * Math.PI,
        rndC() * Math.PI * 2,
        rndC() * Math.PI,
      );
      q.setFromEuler(e);
      const s = 0.9 + rndC() * 1.1;
      sc.set(s, s, s);
      m.compose(lf.p, q, sc);
      leafMesh.setMatrixAt(i, m);
      const c = palette[(rndC() * palette.length) | 0];
      leafMesh.setColorAt(i, c);
    });
    leafMesh.instanceMatrix.needsUpdate = true;
    if (leafMesh.instanceColor) leafMesh.instanceColor.needsUpdate = true;
    root.add(leafMesh);

    // ---- scroll growth (rooted: scale only, base stays at y=0) ----
    let target = 0;
    let cur = 0;
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
      const g = 0.16 + ease(cur) * 0.84;
      root.scale.setScalar(g);
      root.rotation.y = Math.sin(t * 0.12) * 0.06 + 0.15;
      root.rotation.z = Math.sin(t * 0.35) * 0.012;
      if (leafUniforms && !reduced) leafUniforms.uTime.value = t;
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    if (reduced) {
      cur = 1;
      root.scale.setScalar(1);
      renderer.render(scene, camera);
    }

    const ro = new ResizeObserver(() => {
      const w = Math.max(wrap.clientWidth, 1);
      const h = Math.max(wrap.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduced) renderer.render(scene, camera);
    });
    ro.observe(wrap);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      cyl.dispose();
      leafGeo.dispose();
      barkMat.dispose();
      leafMat.dispose();
      branches.dispose();
      leafMesh.dispose();
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} />;
}
