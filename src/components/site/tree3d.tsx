"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Procedural tree, generated in code — no asset.
 *
 * Hero (scroll 0): a small sprout, camera close & low so it reads as
 * a little plant. As the page scrolls, uGrow sweeps a normalized
 * path-order outward so the branch system unfolds AND a dense leaf
 * canopy pops in branch-by-branch into a full, lush tree while the
 * camera pulls back to frame it. Everything sways in the wind
 * (tip-weighted; leaves also flutter). Reduced-motion: grows on
 * scroll, no wind/drift.
 */

const SEED = 0xa17e;
const DEPTH = 8;
const HEIGHT = 7;

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
type Leaf = {
  p: THREE.Vector3;
  dir: THREE.Vector3;
  size: number;
  t: number;
  seed: number;
};

function buildTree(low: boolean) {
  const rnd = mulberry32(SEED);
  const segs: Seg[] = [];
  const leaves: Leaf[] = [];
  const k = 0.76;
  let span = 0;
  for (let i = 0; i <= DEPTH; i++) span += Math.pow(k, i);
  span *= 1.9;
  const leafMul = low ? 0.34 : 0.62;

  const sprinkle = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    dir: THREE.Vector3,
    ta: number,
    tb: number,
    n: number,
  ) => {
    for (let i = 0; i < n; i++) {
      const u = rnd();
      const p = a.clone().lerp(b, u);
      p.x += (rnd() - 0.5) * 0.05;
      p.y += (rnd() - 0.5) * 0.05;
      p.z += (rnd() - 0.5) * 0.05;
      leaves.push({
        p,
        dir: dir.clone(),
        size: 0.16 + rnd() * 0.16,
        t: Math.min(ta + (tb - ta) * u + 0.01, 1),
        seed: rnd(),
      });
    }
  };

  const grow = (
    p: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    rad: number,
    depth: number,
    path: number,
  ) => {
    const SUB = 2;
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
      const t0 = Math.min(path / span, 1);
      const t1 = Math.min((path + subLen) / span, 1);
      const np = cp.clone().addScaledVector(nd, subLen);
      segs.push({ p: cp.clone(), d: nd.clone(), len: subLen, r0, r1, t0, t1 });
      // leaves along outer/upper limbs (denser the deeper we go)
      if (depth >= 3) {
        const dens = (depth - 2) * 1.0 * leafMul;
        sprinkle(cp, np, nd, t0, t1, Math.round(subLen * dens * 30));
      }
      // tiny seedling leaves near the very base → hero "small plant"
      if (depth === 0 && s === SUB - 1) {
        for (let i = 0; i < 3; i++)
          leaves.push({
            p: np.clone().add(
              new THREE.Vector3(
                (rnd() - 0.5) * 0.12,
                rnd() * 0.06,
                (rnd() - 0.5) * 0.12,
              ),
            ),
            dir: nd.clone(),
            size: 0.12 + rnd() * 0.06,
            t: 0.035 + i * 0.004,
            seed: rnd(),
          });
      }
      cp = np;
      cd = nd;
      path += subLen;
    }

    if (depth >= DEPTH || len < 0.04) {
      // terminal: a full rosette of leaves at the tip
      const cnt = Math.round((12 + rnd() * 10) * leafMul);
      for (let i = 0; i < cnt; i++) {
        const a = (i / cnt) * Math.PI * 2 + rnd();
        const off = new THREE.Vector3(
          Math.cos(a) * (0.05 + rnd() * 0.18),
          (rnd() - 0.3) * 0.2,
          Math.sin(a) * (0.05 + rnd() * 0.18),
        );
        leaves.push({
          p: cp.clone().add(off),
          dir: cd.clone().add(off).normalize(),
          size: 0.2 + rnd() * 0.2,
          t: Math.min(path / span + 0.005, 1),
          seed: rnd(),
        });
      }
      return;
    }
    const kids = rnd() < 0.55 ? 3 : 2;
    for (let c = 0; c < kids; c++) {
      const ang = (24 + rnd() * 20) * (Math.PI / 180);
      const az = (c / kids) * Math.PI * 2 + rnd() * 1.3;
      const axis = new THREE.Vector3(Math.cos(az), 0, Math.sin(az))
        .cross(cd)
        .normalize();
      const childDir = cd
        .clone()
        .applyAxisAngle(axis, ang)
        .addScaledVector(new THREE.Vector3(0, 1, 0), 0.12)
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

  grow(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 1.7, 0.11, 0, 0);

  const box = new THREE.Box3();
  const tmp = new THREE.Vector3();
  for (const s of segs) {
    box.expandByPoint(s.p);
    box.expandByPoint(tmp.copy(s.p).addScaledVector(s.d, s.len));
  }
  const size = new THREE.Vector3();
  const ctr = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(ctr);
  const sc = HEIGHT / (size.y || 1);
  const fix = (v: THREE.Vector3) =>
    v.set(
      (v.x - ctr.x) * sc,
      (v.y - box.min.y) * sc,
      (v.z - ctr.z) * sc,
    );
  for (const s of segs) {
    fix(s.p);
    s.len *= sc;
    s.r0 *= sc;
    s.r1 *= sc;
  }
  for (const l of leaves) {
    fix(l.p);
    l.size *= sc;
  }
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
    const low = window.matchMedia(
      "(max-width: 860px), (pointer: coarse)",
    ).matches;

    let W = Math.max(wrap.clientWidth, 1);
    let H = Math.max(wrap.clientHeight, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
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

    const { segs, leaves } = buildTree(low);

    const uniforms = {
      uGrow: { value: 0.0001 },
      uTime: { value: 0 },
      uWind: { value: reduced ? 0 : 1 },
      uMature: { value: 0 },
      uColBase: { value: new THREE.Color(0x6a7d4a) },
      uColTip: { value: new THREE.Color(0x8fe9d2) },
      uColGlow: { value: new THREE.Color(0xffb14d) },
      uLeafLo: { value: new THREE.Color(0x57c163) },
      uLeafHi: { value: new THREE.Color(0xe6ffe8) },
      uLightDir: { value: new THREE.Vector3(-0.5, 1, 0.6).normalize() },
      uFog: { value: new THREE.Color(0x183a30) },
    };

    const BASIS = /* glsl */ `
      mat3 basis(vec3 d){
        d = normalize(d);
        vec3 up = abs(d.y) < 0.999 ? vec3(0.,1.,0.) : vec3(1.,0.,0.);
        vec3 t = normalize(cross(up,d));
        vec3 b = cross(d,t);
        return mat3(t,d,b);
      }`;

    // ---------- branches ----------
    const N = segs.length;
    const cyl = new THREE.CylinderGeometry(1, 1, 1, low ? 5 : 6, 1, true);
    cyl.translate(0, 0.5, 0);
    const bGeo = new THREE.InstancedBufferGeometry();
    bGeo.index = cyl.index;
    bGeo.attributes.position = cyl.attributes.position;
    bGeo.instanceCount = N;
    const bS = new Float32Array(N * 3),
      bD = new Float32Array(N * 3),
      bL = new Float32Array(N),
      bR = new Float32Array(N * 2),
      bT = new Float32Array(N * 2);
    segs.forEach((s, i) => {
      bS.set([s.p.x, s.p.y, s.p.z], i * 3);
      bD.set([s.d.x, s.d.y, s.d.z], i * 3);
      bL[i] = s.len;
      bR.set([s.r0, s.r1], i * 2);
      bT.set([s.t0, s.t1], i * 2);
    });
    bGeo.setAttribute("iStart", new THREE.InstancedBufferAttribute(bS, 3));
    bGeo.setAttribute("iDir", new THREE.InstancedBufferAttribute(bD, 3));
    bGeo.setAttribute("iLen", new THREE.InstancedBufferAttribute(bL, 1));
    bGeo.setAttribute("iR", new THREE.InstancedBufferAttribute(bR, 2));
    bGeo.setAttribute("iT", new THREE.InstancedBufferAttribute(bT, 2));

    const branchMat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        attribute vec3 iStart; attribute vec3 iDir; attribute float iLen;
        attribute vec2 iR; attribute vec2 iT;
        uniform float uGrow,uTime,uWind,uMature;
        varying float vT; varying float vG; varying vec3 vN; varying float vZ;
        ${BASIS}
        void main(){
          float g = clamp((uGrow-iT.x)/max(iT.y-iT.x,1e-4),0.,1.);
          float r = mix(iR.x,iR.y,position.y) * mix(0.42,1.0,uMature);
          vec3 lp = vec3(position.x*r, position.y*iLen*g, position.z*r);
          mat3 M = basis(iDir);
          vec3 wp = iStart + M*lp;
          float tp = mix(iT.x,iT.y,position.y);
          float sway = uWind*(0.06+tp*tp*1.05)*g;
          float ph = wp.x*0.6+wp.z*0.5;
          wp += vec3(sin(uTime*1.1+ph)*0.5+sin(uTime*2.3+ph*1.7)*0.22,0.,
                     cos(uTime*0.9+ph)*0.42)*sway;
          vec4 mv = viewMatrix*vec4(wp,1.);
          gl_Position = projectionMatrix*mv;
          vN = normalize(M*normalize(vec3(position.x,0.,position.z)));
          vT=tp; vG=g; vZ=-mv.z;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uColBase,uColTip,uColGlow,uLightDir,uFog;
        varying float vT; varying float vG; varying vec3 vN; varying float vZ;
        void main(){
          if(vG<0.012) discard;
          vec3 col = mix(uColBase,uColTip,smoothstep(0.,1.,vT));
          float ndl = clamp(dot(normalize(vN),normalize(uLightDir)),0.,1.);
          col *= 0.85+0.5*ndl;
          col += uColGlow*pow(vT,3.0)*(0.3+0.5*vG);
          float fog = clamp((vZ-16.)/40.,0.,0.18);
          col = mix(col,uFog,fog);
          gl_FragColor = vec4(col, smoothstep(0.,0.06,vG));
        }`,
    });
    const branchMesh = new THREE.Mesh(bGeo, branchMat);
    branchMesh.frustumCulled = false;
    scene.add(branchMesh);

    // ---------- leaves ----------
    const M = leaves.length;
    const quad = new THREE.PlaneGeometry(1, 1);
    const lGeo = new THREE.InstancedBufferGeometry();
    lGeo.index = quad.index;
    lGeo.attributes.position = quad.attributes.position;
    lGeo.attributes.uv = quad.attributes.uv;
    lGeo.instanceCount = M;
    const lP = new Float32Array(M * 3),
      lD = new Float32Array(M * 3),
      lS = new Float32Array(M),
      lT = new Float32Array(M),
      lSeed = new Float32Array(M);
    leaves.forEach((l, i) => {
      lP.set([l.p.x, l.p.y, l.p.z], i * 3);
      lD.set([l.dir.x, l.dir.y, l.dir.z], i * 3);
      lS[i] = l.size;
      lT[i] = l.t;
      lSeed[i] = l.seed;
    });
    lGeo.setAttribute("iPos", new THREE.InstancedBufferAttribute(lP, 3));
    lGeo.setAttribute("iDir", new THREE.InstancedBufferAttribute(lD, 3));
    lGeo.setAttribute("iSize", new THREE.InstancedBufferAttribute(lS, 1));
    lGeo.setAttribute("iT", new THREE.InstancedBufferAttribute(lT, 1));
    lGeo.setAttribute("iSeed", new THREE.InstancedBufferAttribute(lSeed, 1));

    const leafMat = new THREE.ShaderMaterial({
      uniforms,
      transparent: false,
      side: THREE.DoubleSide,
      depthWrite: true,
      vertexShader: /* glsl */ `
        attribute vec3 iPos; attribute vec3 iDir; attribute float iSize;
        attribute float iT; attribute float iSeed;
        uniform float uGrow,uTime,uWind;
        varying vec2 vUv; varying float vT; varying float vG; varying float vZ;
        varying float vShade; varying float vSeed;
        ${BASIS}
        void main(){
          float g = clamp((uGrow-iT)/0.05,0.,1.);
          g = g*g*(3.-2.*g);
          mat3 M = basis(normalize(iDir+vec3(0.0,0.001,0.0)));
          float a = iSeed*6.2831;
          vec3 outw = cos(a)*M[0]+sin(a)*M[2];
          vec3 up = normalize(M[1]*0.55+outw);
          vec3 nrm = normalize(cross(outw,M[1])+M[1]*0.25);
          vec3 rgt = normalize(cross(up,nrm));
          // per-leaf flutter
          float fl = uWind*sin(uTime*3.0+iSeed*30.0)*0.25;
          up = normalize(up+nrm*fl);
          vec2 q = position.xy;
          vec3 wp = iPos + (q.x*rgt + (q.y+0.5)*up)*iSize*g;
          // canopy wind (tip-weighted by appear-order)
          float sway = uWind*(0.05+iT*iT*1.15)*g;
          float ph = wp.x*0.6+wp.z*0.5;
          wp += vec3(sin(uTime*1.1+ph)*0.5+sin(uTime*2.5+iSeed*9.0)*0.18,0.,
                     cos(uTime*0.9+ph)*0.4)*sway;
          vec4 mv = viewMatrix*vec4(wp,1.);
          gl_Position = projectionMatrix*mv;
          vUv = position.xy+0.5; vT=iT; vG=g; vZ=-mv.z; vSeed=iSeed;
          vShade = 0.78+0.32*clamp(dot(nrm,normalize(vec3(-0.5,1.,0.6))),0.,1.);
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uLeafLo,uLeafHi,uColGlow,uFog;
        uniform float uTime;
        varying vec2 vUv; varying float vT; varying float vG; varying float vZ;
        varying float vShade; varying float vSeed;
        void main(){
          if(vG<0.04) discard;
          vec2 q = vUv*2.0-1.0;
          // pointed leaf silhouette — hard cutout (opaque, fast)
          float shape = pow(1.0-abs(q.y),0.55) - abs(q.x)*1.45;
          if(shape < 0.06) discard;
          float rib = smoothstep(0.055,0.0,abs(q.x))*0.16;
          // per-leaf hue variance keeps a big canopy from looking flat
          vec3 lo = uLeafLo*(0.9+0.35*vSeed);
          vec3 col = mix(lo,uLeafHi, clamp(vUv.y*0.85+0.18,0.,1.));
          col *= vShade;
          col -= rib;
          // warm-glow tips + faint living shimmer
          col += uColGlow*pow(vT,2.2)*0.45;
          col += uColGlow*0.05*sin(uTime*1.8+vSeed*40.0)*vT;
          float fog = clamp((vZ-18.)/44.,0.,0.16);
          col = mix(col,uFog,fog);
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const leafMesh = new THREE.Mesh(lGeo, leafMat);
    leafMesh.frustumCulled = false;
    scene.add(leafMesh);

    // ---------- scroll growth + camera ----------
    let targetG = 0;
    let curG = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetG = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // start CLOSE & LOW on the sprout → pull back to frame the tree
    const camFrom = new THREE.Vector3(0.22, 0.6, 2.4);
    const camTo = new THREE.Vector3(0, 4.2, 17.0);
    const lookFrom = new THREE.Vector3(0, 0.42, 0);
    const lookTo = new THREE.Vector3(0, 3.5, 0);
    const ease = (x: number) => x * x * (3 - 2 * x);

    const clock = new THREE.Clock();
    let raf = 0;
    let alive = true;
    let reducedCleanup: (() => void) | null = null;
    const tmpL = new THREE.Vector3();

    const apply = (t: number) => {
      const p = ease(curG);
      // dwell as a seed/sprout longer, then unfold (natural ontogeny)
      const growth = Math.pow(p, 1.5);
      uniforms.uGrow.value = 0.045 + growth * 0.955;
      uniforms.uMature.value = p; // trunk/limbs thicken as it matures
      uniforms.uTime.value = t;
      // pure dolly: pull back as it grows — NO orbit/rotation
      camera.position.lerpVectors(camFrom, camTo, p);
      tmpL.lerpVectors(lookFrom, lookTo, p);
      camera.lookAt(tmpL);
    };

    const frame = () => {
      curG += (targetG - curG) * 0.12;
      apply(clock.getElapsedTime());
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      const render = () => {
        if (!alive) return;
        curG += (targetG - curG) * 0.25;
        apply(0);
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
      quad.dispose();
      bGeo.dispose();
      lGeo.dispose();
      branchMat.dispose();
      leafMat.dispose();
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} />;
}
