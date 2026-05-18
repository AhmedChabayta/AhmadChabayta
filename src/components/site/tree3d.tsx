"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Procedural fractal tree, generated entirely in code — no asset.
 *
 * Hero (scroll 0): the camera sits INSIDE the canopy, a single branch
 * filling the screen at full detail — bark, leaves, and a couple of
 * critters (a ladybug + a butterfly) for scale/realism. Scrolling
 * DOWN dollies straight back (no orbit, no auto-rotation) to reveal
 * the whole tree, rooted in ground so it never floats and is never
 * cut off. Daylight lit; wind sway only. Reduced-motion: scroll still
 * drives the dolly, no wind/flap.
 */

const SEED = 0xa17e;
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
  t: number;
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
  const DEPTH = low ? 8 : 9;
  const SUB = low ? 2 : 3;
  const leafMul = low ? 0.5 : 0.85;
  const segs: Seg[] = [];
  const leaves: Leaf[] = [];
  const k = 0.77;

  const sprinkle = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    dir: THREE.Vector3,
    tp: number,
    n: number,
  ) => {
    for (let i = 0; i < n; i++) {
      const u = rnd();
      const p = a.clone().lerp(b, u);
      p.x += (rnd() - 0.5) * 0.06;
      p.y += (rnd() - 0.5) * 0.06;
      p.z += (rnd() - 0.5) * 0.06;
      leaves.push({
        p,
        dir: dir.clone(),
        size: 0.17 + rnd() * 0.18,
        t: tp,
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
  ) => {
    let cp = p.clone();
    let cd = dir.clone().normalize();
    const subLen = len / SUB;
    const tp = depth / DEPTH;
    for (let s = 0; s < SUB; s++) {
      const bend = new THREE.Vector3(
        (rnd() - 0.5) * 0.5,
        (rnd() - 0.5) * 0.2,
        (rnd() - 0.5) * 0.5,
      );
      const nd = cd.clone().addScaledVector(bend, 0.18).normalize();
      const r0 = rad * (1 - (s / SUB) * 0.22);
      const r1 = rad * (1 - ((s + 1) / SUB) * 0.22);
      const np = cp.clone().addScaledVector(nd, subLen);
      segs.push({ p: cp.clone(), d: nd.clone(), len: subLen, r0, r1, t: tp });
      if (depth >= 3) {
        const dens = (depth - 2) * leafMul;
        sprinkle(cp, np, nd, tp, Math.round(subLen * dens * 26));
      }
      cp = np;
      cd = nd;
    }

    if (depth >= DEPTH || len < 0.045) {
      const cnt = Math.round((14 + rnd() * 12) * leafMul);
      for (let i = 0; i < cnt; i++) {
        const a = (i / cnt) * Math.PI * 2 + rnd();
        const off = new THREE.Vector3(
          Math.cos(a) * (0.05 + rnd() * 0.2),
          (rnd() - 0.3) * 0.22,
          Math.sin(a) * (0.05 + rnd() * 0.2),
        );
        leaves.push({
          p: cp.clone().add(off),
          dir: cd.clone().add(off).normalize(),
          size: 0.21 + rnd() * 0.22,
          t: 1,
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
      );
    }
  };

  grow(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 1.85, 0.13, 0);

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
  const fix = (vv: THREE.Vector3) =>
    vv.set((vv.x - ctr.x) * sc, (vv.y - box.min.y) * sc, (vv.z - ctr.z) * sc);
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

  // pick a hero focal branch — mid-canopy, toward the +Z front so the
  // close-up has the rest of the tree behind it and faces the camera.
  const anchor = new THREE.Vector3(1.1, 4.5, 2.0);
  let bestSeg = segs[0];
  let best = Infinity;
  const mid = new THREE.Vector3();
  for (const s of segs) {
    if (s.t < 0.42 || s.t > 0.82) continue;
    mid.copy(s.p).addScaledVector(s.d, s.len * 0.5);
    const dd = mid.distanceToSquared(anchor);
    if (dd < best) {
      best = dd;
      bestSeg = s;
    }
  }
  const focal = bestSeg.p
    .clone()
    .addScaledVector(bestSeg.d, bestSeg.len * 0.5);
  return { segs, leaves, focal, focalDir: bestSeg.d.clone().normalize() };
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
    const HAZE = new THREE.Color(0xcddcec);
    scene.fog = new THREE.Fog(HAZE.getHex(), 14, 60);
    const camera = new THREE.PerspectiveCamera(46, W / H, 0.05, 200);
    const renderer = new THREE.WebGLRenderer({
      antialias: !low,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1.4 : 1.9));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    const dom = renderer.domElement;
    dom.style.cssText =
      "display:block;position:absolute;inset:0;width:100%;height:100%;";
    dom.setAttribute("aria-hidden", "true");
    wrap.appendChild(dom);

    const { segs, leaves, focal, focalDir } = buildTree(low);

    const SUN = new THREE.Vector3(-0.42, 0.84, 0.46).normalize();
    const uniforms = {
      uTime: { value: 0 },
      uWind: { value: reduced ? 0 : 1 },
      uSun: { value: SUN },
      uSunCol: { value: new THREE.Color(0xfff1d6) },
      uSky: { value: new THREE.Color(0x9fc4e8) },
      uGround: { value: new THREE.Color(0x4a3d28) },
      uBarkLo: { value: new THREE.Color(0x3a2a1b) },
      uBarkHi: { value: new THREE.Color(0x7a5d3e) },
      uLeafLo: { value: new THREE.Color(0x2f5d27) },
      uLeafHi: { value: new THREE.Color(0x8fc04a) },
      uHaze: { value: HAZE },
    };

    // lights only touch the standard-material props (ground, critters);
    // the tree uses its own shaders and ignores them.
    scene.add(new THREE.HemisphereLight(0xbdd9f2, 0x4a3d28, 1.0));
    const sunLight = new THREE.DirectionalLight(0xfff1d6, 1.9);
    sunLight.position.copy(SUN).multiplyScalar(12);
    scene.add(sunLight);

    const BASIS = /* glsl */ `
      mat3 basis(vec3 d){
        d = normalize(d);
        vec3 up = abs(d.y) < 0.999 ? vec3(0.,1.,0.) : vec3(1.,0.,0.);
        vec3 t = normalize(cross(up,d));
        vec3 b = cross(d,t);
        return mat3(t,d,b);
      }`;

    // ---------- ground (so the tree is rooted, never floating) ----------
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x55733a,
      roughness: 1,
      metalness: 0,
    });
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(140, 48),
      groundMat,
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    // soft contact darkening at the base
    const contactMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {},
      vertexShader: `varying vec2 vU; void main(){ vU=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `precision mediump float; varying vec2 vU;
        void main(){ float d=distance(vU,vec2(0.5));
          gl_FragColor=vec4(0.,0.,0., smoothstep(0.5,0.0,d)*0.42); }`,
    });
    const contact = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), contactMat);
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.012;
    scene.add(contact);

    // ---------- branches ----------
    const N = segs.length;
    const cyl = new THREE.CylinderGeometry(1, 1, 1, low ? 5 : 7, 1, true);
    cyl.translate(0, 0.5, 0);
    const bGeo = new THREE.InstancedBufferGeometry();
    bGeo.index = cyl.index;
    bGeo.attributes.position = cyl.attributes.position;
    bGeo.instanceCount = N;
    const bS = new Float32Array(N * 3),
      bD = new Float32Array(N * 3),
      bL = new Float32Array(N),
      bR = new Float32Array(N * 2),
      bT = new Float32Array(N);
    segs.forEach((s, i) => {
      bS.set([s.p.x, s.p.y, s.p.z], i * 3);
      bD.set([s.d.x, s.d.y, s.d.z], i * 3);
      bL[i] = s.len;
      bR.set([s.r0, s.r1], i * 2);
      bT[i] = s.t;
    });
    bGeo.setAttribute("iStart", new THREE.InstancedBufferAttribute(bS, 3));
    bGeo.setAttribute("iDir", new THREE.InstancedBufferAttribute(bD, 3));
    bGeo.setAttribute("iLen", new THREE.InstancedBufferAttribute(bL, 1));
    bGeo.setAttribute("iR", new THREE.InstancedBufferAttribute(bR, 2));
    bGeo.setAttribute("iTp", new THREE.InstancedBufferAttribute(bT, 1));

    const branchMat = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        attribute vec3 iStart; attribute vec3 iDir; attribute float iLen;
        attribute vec2 iR; attribute float iTp;
        uniform float uTime,uWind;
        varying float vTp; varying vec3 vN; varying float vZ; varying float vUp;
        ${BASIS}
        void main(){
          float r = mix(iR.x,iR.y,position.y);
          vec3 lp = vec3(position.x*r, position.y*iLen, position.z*r);
          mat3 Mb = basis(iDir);
          vec3 wp = iStart + Mb*lp;
          float sway = uWind*(0.05+iTp*iTp*0.9);
          float ph = wp.x*0.6+wp.z*0.5;
          wp += vec3(sin(uTime*1.05+ph)*0.5+sin(uTime*2.3+ph*1.7)*0.2,0.,
                     cos(uTime*0.9+ph)*0.4)*sway;
          vec4 mv = viewMatrix*vec4(wp,1.);
          gl_Position = projectionMatrix*mv;
          vN = normalize(Mb*normalize(vec3(position.x,0.,position.z)));
          vTp=iTp; vZ=-mv.z; vUp=position.y;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uSun,uSunCol,uSky,uGround,uBarkLo,uBarkHi,uHaze;
        varying float vTp; varying vec3 vN; varying float vZ; varying float vUp;
        void main(){
          vec3 n = normalize(vN);
          vec3 bark = mix(uBarkLo,uBarkHi, mix(0.15,0.85,vTp));
          float hemi = n.y*0.5+0.5;
          vec3 amb = mix(uGround,uSky,hemi)*0.55;
          float ndl = dot(n,normalize(uSun));
          float diff = clamp(ndl*0.5+0.5,0.,1.);
          vec3 col = bark*(amb + uSunCol*diff*0.95);
          col *= mix(0.72,1.0,clamp(vUp,0.,1.));
          float fog = clamp((vZ-9.)/34.,0.,0.55);
          col = mix(col,uHaze,fog);
          gl_FragColor = vec4(col,1.);
        }`,
    });
    const branchMesh = new THREE.Mesh(bGeo, branchMat);
    branchMesh.frustumCulled = false;
    scene.add(branchMesh);

    // ---------- leaves ----------
    const ML = leaves.length;
    const quad = new THREE.PlaneGeometry(1, 1);
    const lGeo = new THREE.InstancedBufferGeometry();
    lGeo.index = quad.index;
    lGeo.attributes.position = quad.attributes.position;
    lGeo.attributes.uv = quad.attributes.uv;
    lGeo.instanceCount = ML;
    const lP = new Float32Array(ML * 3),
      lD = new Float32Array(ML * 3),
      lS = new Float32Array(ML),
      lT = new Float32Array(ML),
      lSeed = new Float32Array(ML);
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
    lGeo.setAttribute("iTp", new THREE.InstancedBufferAttribute(lT, 1));
    lGeo.setAttribute("iSeed", new THREE.InstancedBufferAttribute(lSeed, 1));

    const leafMat = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        attribute vec3 iPos; attribute vec3 iDir; attribute float iSize;
        attribute float iTp; attribute float iSeed;
        uniform float uTime,uWind;
        varying vec2 vUv; varying float vTp; varying float vZ;
        varying float vShade; varying float vBack; varying float vSeed;
        ${BASIS}
        void main(){
          mat3 Mb = basis(normalize(iDir+vec3(0.0,0.001,0.0)));
          float a = iSeed*6.2831;
          vec3 outw = cos(a)*Mb[0]+sin(a)*Mb[2];
          vec3 up = normalize(Mb[1]*0.55+outw);
          vec3 nrm = normalize(cross(outw,Mb[1])+Mb[1]*0.25);
          vec3 rgt = normalize(cross(up,nrm));
          float fl = uWind*sin(uTime*3.0+iSeed*30.0)*0.22;
          up = normalize(up+nrm*fl);
          vec2 q = position.xy;
          vec3 wp = iPos + (q.x*rgt + (q.y+0.5)*up)*iSize;
          float sway = uWind*(0.05+iTp*iTp*1.0);
          float ph = wp.x*0.6+wp.z*0.5;
          wp += vec3(sin(uTime*1.05+ph)*0.5+sin(uTime*2.5+iSeed*9.0)*0.16,0.,
                     cos(uTime*0.9+ph)*0.38)*sway;
          vec4 mv = viewMatrix*vec4(wp,1.);
          gl_Position = projectionMatrix*mv;
          vec3 S = normalize(vec3(-0.42,0.84,0.46));
          vShade = clamp(dot(nrm,S),0.,1.);
          vBack  = clamp(dot(-nrm,S),0.,1.);
          vUv = position.xy+0.5; vTp=iTp; vZ=-mv.z; vSeed=iSeed;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uLeafLo,uLeafHi,uSky,uSunCol,uHaze;
        varying vec2 vUv; varying float vTp; varying float vZ;
        varying float vShade; varying float vBack; varying float vSeed;
        void main(){
          vec2 q = vUv*2.0-1.0;
          float shape = pow(1.0-abs(q.y),0.55) - abs(q.x)*1.45;
          if(shape < 0.06) discard;
          float rib = smoothstep(0.05,0.0,abs(q.x))*0.14;
          vec3 lo = uLeafLo*(0.82+0.4*vSeed);
          vec3 col = mix(lo,uLeafHi, clamp(vUv.y*0.8+0.16,0.,1.));
          col *= mix(0.6,1.05, vTp);
          col *= 0.5 + uSky*0.35 + vShade*0.85;
          col += uSunCol*pow(vBack,2.0)*0.5;
          col -= rib;
          float fog = clamp((vZ-10.)/38.,0.,0.5);
          col = mix(col,uHaze,fog);
          gl_FragColor = vec4(col,1.);
        }`,
    });
    const leafMesh = new THREE.Mesh(lGeo, leafMat);
    leafMesh.frustumCulled = false;
    scene.add(leafMesh);

    // ---------- critters on the focal branch (scale + realism) ----------
    const axis = focalDir.clone();
    const wUp = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(axis, wUp);
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    side.normalize();
    const nUp = new THREE.Vector3().crossVectors(side, axis).normalize();

    const critterGeos: THREE.BufferGeometry[] = [];
    const critterMats: THREE.Material[] = [];

    // ladybug — sits on top of the branch
    const ladybug = new THREE.Group();
    const lbBodyG = new THREE.SphereGeometry(0.07, 18, 14);
    const lbBodyM = new THREE.MeshStandardMaterial({
      color: 0xc62828,
      roughness: 0.35,
    });
    const lbBody = new THREE.Mesh(lbBodyG, lbBodyM);
    lbBody.scale.set(1, 0.62, 1.25);
    ladybug.add(lbBody);
    const blackM = new THREE.MeshStandardMaterial({
      color: 0x0c0c0c,
      roughness: 0.5,
    });
    const lbHeadG = new THREE.SphereGeometry(0.034, 12, 10);
    const lbHead = new THREE.Mesh(lbHeadG, blackM);
    lbHead.position.set(0, 0.005, 0.085);
    ladybug.add(lbHead);
    const spotG = new THREE.SphereGeometry(0.014, 8, 8);
    for (const sp of [
      [0.032, 0.03, 0.0],
      [-0.032, 0.03, 0.0],
      [0.03, 0.025, -0.05],
      [-0.03, 0.025, -0.05],
      [0, 0.045, 0.03],
    ] as const) {
      const m = new THREE.Mesh(spotG, blackM);
      m.position.set(sp[0], sp[1], sp[2]);
      ladybug.add(m);
    }
    critterGeos.push(lbBodyG, lbHeadG, spotG);
    critterMats.push(lbBodyM, blackM);

    const lbBasis = new THREE.Matrix4().makeBasis(side, nUp, axis);
    const lbQuat = new THREE.Quaternion().setFromRotationMatrix(lbBasis);
    ladybug.quaternion.copy(lbQuat);
    ladybug.position.copy(focal).addScaledVector(nUp, 0.06);
    scene.add(ladybug);

    // butterfly — perched just off the branch, wings flap
    const butterfly = new THREE.Group();
    const bfBodyG = new THREE.CapsuleGeometry(0.012, 0.12, 4, 8);
    const bfBodyM = new THREE.MeshStandardMaterial({
      color: 0x241a12,
      roughness: 0.6,
    });
    const bfBody = new THREE.Mesh(bfBodyG, bfBodyM);
    bfBody.rotation.x = Math.PI / 2;
    butterfly.add(bfBody);
    const wingM = new THREE.MeshStandardMaterial({
      color: 0xe07b2c,
      roughness: 0.4,
      side: THREE.DoubleSide,
      emissive: 0x3a1e06,
      emissiveIntensity: 0.35,
    });
    const wingG = new THREE.PlaneGeometry(0.17, 0.13);
    const wingL = new THREE.Group();
    const wingLMesh = new THREE.Mesh(wingG, wingM);
    wingLMesh.position.x = -0.085;
    wingL.add(wingLMesh);
    const wingR = new THREE.Group();
    const wingRMesh = new THREE.Mesh(wingG, wingM);
    wingRMesh.position.x = 0.085;
    wingR.add(wingRMesh);
    butterfly.add(wingL, wingR);
    critterGeos.push(bfBodyG, wingG);
    critterMats.push(bfBodyM, wingM);

    const bfBasis = new THREE.Matrix4().makeBasis(side, nUp, axis);
    butterfly.quaternion.setFromRotationMatrix(bfBasis);
    const bfHome = focal
      .clone()
      .addScaledVector(nUp, 0.22)
      .addScaledVector(side, 0.16);
    butterfly.position.copy(bfHome);
    scene.add(butterfly);

    // ---------- scroll-driven dolly (NO orbit / NO auto-rotation) ----------
    let target = 0;
    let cur = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const center = new THREE.Vector3(0, HEIGHT * 0.52, 0);
    // fixed view direction (camera→subject). No azimuth change ever.
    const viewDir = new THREE.Vector3(0.34, 0.16, 1).normalize();
    const ease = (x: number) => x * x * (3 - 2 * x);
    const clock = new THREE.Clock();
    const look = new THREE.Vector3();
    const pos = new THREE.Vector3();
    let raf = 0;
    let alive = true;
    let reducedCleanup: (() => void) | null = null;

    const apply = (time: number) => {
      const p = ease(cur);
      // p=0: macro on the focal branch. p=1: whole tree, fit so it is
      // never cut off (limiting axis + margin), with ground in frame.
      const vHalf = (camera.fov * Math.PI) / 360;
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const fitFar = (HEIGHT * 0.62) / Math.tan(Math.min(vHalf, hHalf)) + 2.0;
      const dist = 0.9 + (fitFar - 0.9) * p;
      look.copy(focal).lerp(center, ease(p));
      pos.copy(look).addScaledVector(viewDir, dist);
      camera.position.copy(pos);
      camera.lookAt(look);
      uniforms.uTime.value = time;

      if (!reduced) {
        const flap = Math.sin(time * 7.0) * 0.9 + 0.5;
        wingL.rotation.y = flap;
        wingR.rotation.y = -flap;
        butterfly.position.copy(bfHome);
        butterfly.position.y += Math.sin(time * 1.6) * 0.012;
      }
    };

    const frame = () => {
      cur += (target - cur) * 0.1;
      apply(clock.getElapsedTime());
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      const render = () => {
        if (!alive) return;
        cur += (target - cur) * 0.3;
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
      ground.geometry.dispose();
      groundMat.dispose();
      contact.geometry.dispose();
      contactMat.dispose();
      critterGeos.forEach((g) => g.dispose());
      critterMats.forEach((m) => m.dispose());
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} />;
}
