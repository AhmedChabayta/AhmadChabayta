"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Procedural fractal tree in a full daylight scene — all code, no asset.
 *
 * Hero (scroll 0): the camera sits inside the canopy on a thick focal
 * branch that fills the screen — deep procedural bark relief (ridges,
 * fissures, grain, moss) plus a ladybug + butterfly for scale. Scroll
 * DOWN dollies straight back (no orbit / no auto-rotation) to reveal
 * the whole tree, rooted in a grass field under a real sky, never cut
 * off, never floating. Reduced-motion: scroll drives the dolly only.
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
  const RMIN = 0.018;

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
      // thick limbs, gentle taper, hard floor so nothing is a hairline
      const r0 = Math.max(rad * (1 - (s / SUB) * 0.12), RMIN);
      const r1 = Math.max(rad * (1 - ((s + 1) / SUB) * 0.12), RMIN);
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
        rad * 0.74,
        depth + 1,
      );
    }
  };

  // thick trunk
  grow(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 1.85, 0.52, 0);

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

  // hero focal branch — mid-canopy, toward +Z front, prefer a thick one
  const anchor = new THREE.Vector3(1.0, 4.4, 2.1);
  let bestSeg = segs[0];
  let best = Infinity;
  const mid = new THREE.Vector3();
  for (const s of segs) {
    if (s.t < 0.34 || s.t > 0.72) continue;
    mid.copy(s.p).addScaledVector(s.d, s.len * 0.5);
    const dd = mid.distanceToSquared(anchor) - s.r0 * 24;
    if (dd < best) {
      best = dd;
      bestSeg = s;
    }
  }
  const focal = bestSeg.p.clone().addScaledVector(bestSeg.d, bestSeg.len * 0.5);
  return {
    segs,
    leaves,
    focal,
    focalDir: bestSeg.d.clone().normalize(),
    focalR: bestSeg.r0,
  };
}

// shared GLSL — 3D value-noise fbm
const NOISE = /* glsl */ `
  float hash13(vec3 p){
    p = fract(p*0.1031); p += dot(p, p.yzx+33.33);
    return fract((p.x+p.y)*p.z);
  }
  float vnoise(vec3 x){
    vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash13(i+vec3(0,0,0)),hash13(i+vec3(1,0,0)),f.x),
                   mix(hash13(i+vec3(0,1,0)),hash13(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash13(i+vec3(0,0,1)),hash13(i+vec3(1,0,1)),f.x),
                   mix(hash13(i+vec3(0,1,1)),hash13(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p){
    float a=0.5, s=0.0;
    for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=0.5; }
    return s;
  }`;

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
    const HAZE = new THREE.Color(0xcfe0ee);
    scene.fog = new THREE.Fog(HAZE.getHex(), 18, 70);
    const camera = new THREE.PerspectiveCamera(46, W / H, 0.03, 400);
    const renderer = new THREE.WebGLRenderer({
      antialias: !low,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1.4 : 1.9));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    const dom = renderer.domElement;
    dom.style.cssText =
      "display:block;position:absolute;inset:0;width:100%;height:100%;";
    dom.setAttribute("aria-hidden", "true");
    wrap.appendChild(dom);

    const { segs, leaves, focal, focalDir, focalR } = buildTree(low);

    const SUN = new THREE.Vector3(-0.42, 0.84, 0.46).normalize();
    const uniforms = {
      uTime: { value: 0 },
      uWind: { value: reduced ? 0 : 1 },
      uSun: { value: SUN },
      uSunCol: { value: new THREE.Color(0xfff0d0) },
      uSky: { value: new THREE.Color(0x9fc4e8) },
      uGround: { value: new THREE.Color(0x42502a) },
      uLeafLo: { value: new THREE.Color(0x2f5d27) },
      uLeafHi: { value: new THREE.Color(0x8fc04a) },
      uHaze: { value: HAZE },
    };

    scene.add(new THREE.HemisphereLight(0xbdd9f2, 0x46502a, 1.0));
    const sunLight = new THREE.DirectionalLight(0xfff0d0, 1.9);
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

    const disposeGeo: THREE.BufferGeometry[] = [];
    const disposeMat: THREE.Material[] = [];

    // ---------- sky dome ----------
    const skyGeo = new THREE.SphereGeometry(300, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { uSun: uniforms.uSun },
      vertexShader: `varying vec3 vD; void main(){ vD=normalize(position);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `precision highp float; varying vec3 vD; uniform vec3 uSun;
        void main(){
          float h = clamp(vD.y*0.5+0.5,0.,1.);
          vec3 zen = vec3(0.30,0.55,0.85);
          vec3 mid = vec3(0.66,0.80,0.92);
          vec3 hor = vec3(0.93,0.91,0.82);
          vec3 col = h>0.5 ? mix(mid,zen,(h-0.5)*2.0) : mix(hor,mid,h*2.0);
          float s = clamp(dot(normalize(vD),normalize(uSun)),0.,1.);
          col += vec3(1.0,0.92,0.72)*(pow(s,2200.0)*1.2 + pow(s,9.0)*0.22);
          gl_FragColor = vec4(col,1.);
        }`,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.frustumCulled = false;
    scene.add(sky);
    disposeGeo.push(skyGeo);
    disposeMat.push(skyMat);

    // ---------- terrain ----------
    const groundGeo = new THREE.CircleGeometry(260, 96);
    const groundMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        ${NOISE}
        varying vec3 vW; varying float vZ;
        void main(){
          vec3 p = position;
          float r = length(p.xy);
          // gentle rolling mounds, flat near the trunk
          float roll = (fbm(vec3(p.xy*0.03,0.0))-0.5)*4.0;
          p.z += roll * smoothstep(6.0,40.0,r);
          vec4 wp = modelMatrix*vec4(p,1.0);
          vW = wp.xyz;
          vec4 mv = viewMatrix*wp;
          vZ = -mv.z;
          gl_Position = projectionMatrix*mv;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        ${NOISE}
        uniform vec3 uSun,uSunCol,uSky,uHaze;
        varying vec3 vW; varying float vZ;
        void main(){
          float n = fbm(vW*0.4);
          float patch = fbm(vW*0.08);
          vec3 grass = mix(vec3(0.20,0.31,0.12), vec3(0.34,0.46,0.18), n);
          vec3 dirt  = vec3(0.30,0.24,0.15);
          vec3 col = mix(grass, dirt, smoothstep(0.62,0.78,patch)*0.5);
          col *= 0.55 + 0.5*clamp(uSun.y,0.,1.);
          col = col*(0.7+0.3*uSky) + uSunCol*0.06;
          float fog = clamp((vZ-22.)/55.,0.,1.);
          col = mix(col, uHaze, fog);
          gl_FragColor = vec4(col,1.);
        }`,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.frustumCulled = false;
    scene.add(ground);
    disposeGeo.push(groundGeo);
    disposeMat.push(groundMat);

    // soft contact darkening at the base
    const contactMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: `varying vec2 vU; void main(){ vU=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `precision mediump float; varying vec2 vU;
        void main(){ float d=distance(vU,vec2(0.5));
          gl_FragColor=vec4(0.,0.,0.,smoothstep(0.5,0.0,d)*0.4); }`,
    });
    const contactGeo = new THREE.CircleGeometry(2.6, 32);
    const contact = new THREE.Mesh(contactGeo, contactMat);
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.013;
    scene.add(contact);
    disposeGeo.push(contactGeo);
    disposeMat.push(contactMat);

    // ---------- grass field (instanced) ----------
    const GB = low ? 9000 : 30000;
    const gRnd = mulberry32(0x51a2);
    const bladeBase = new THREE.PlaneGeometry(1, 1, 1, 4);
    bladeBase.translate(0, 0.5, 0);
    const gGeo = new THREE.InstancedBufferGeometry();
    gGeo.index = bladeBase.index;
    gGeo.attributes.position = bladeBase.attributes.position;
    gGeo.instanceCount = GB;
    const gP = new Float32Array(GB * 3);
    const gA = new Float32Array(GB);
    const gH = new Float32Array(GB);
    const gT = new Float32Array(GB);
    for (let i = 0; i < GB; i++) {
      const ra = Math.sqrt(gRnd()) * 26;
      const an = gRnd() * Math.PI * 2;
      gP[i * 3] = Math.cos(an) * ra;
      gP[i * 3 + 1] = 0;
      gP[i * 3 + 2] = Math.sin(an) * ra;
      gA[i] = gRnd() * Math.PI * 2;
      gH[i] = 0.18 + gRnd() * 0.26;
      gT[i] = gRnd();
    }
    gGeo.setAttribute("iPos", new THREE.InstancedBufferAttribute(gP, 3));
    gGeo.setAttribute("iAng", new THREE.InstancedBufferAttribute(gA, 1));
    gGeo.setAttribute("iH", new THREE.InstancedBufferAttribute(gH, 1));
    gGeo.setAttribute("iT", new THREE.InstancedBufferAttribute(gT, 1));
    const grassMat = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        attribute vec3 iPos; attribute float iAng; attribute float iH;
        attribute float iT;
        uniform float uTime,uWind;
        varying float vY; varying float vT; varying float vZ; varying float vFade;
        void main(){
          float y = position.y;
          float dist = distance(iPos.xz, cameraPosition.xz);
          float fade = smoothstep(34.0, 5.0, dist);
          float w = (1.0 - y*0.86) * 0.05;
          float ca=cos(iAng), sa=sin(iAng);
          vec3 lp = vec3(position.x*w, 0.0, 0.0);
          lp = vec3(ca*lp.x - sa*lp.z, 0.0, sa*lp.x + ca*lp.z);
          float ph = iPos.x*0.7 + iPos.z*0.6;
          float wind = uWind*(sin(uTime*1.6+ph)*0.12 + sin(uTime*3.1+ph)*0.05);
          float bend = (0.14 + wind) * y*y;
          vec3 wp = iPos + lp;
          wp.y += y * iH * fade;
          wp.x += bend * iH;
          gl_Position = projectionMatrix*viewMatrix*vec4(wp,1.0);
          vY=y; vT=iT; vFade=fade;
          vZ = -(viewMatrix*vec4(wp,1.0)).z;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform vec3 uSunCol,uSky,uHaze;
        varying float vY; varying float vT; varying float vZ; varying float vFade;
        void main(){
          if(vFade < 0.02) discard;
          vec3 root = vec3(0.16,0.26,0.10);
          vec3 tip  = mix(vec3(0.42,0.58,0.22), vec3(0.55,0.62,0.26), vT);
          vec3 col = mix(root, tip, vY*0.9+0.1);
          col *= 0.7 + 0.3*uSky + 0.25*vY;
          col += uSunCol*0.05*vY;
          float fog = clamp((vZ-22.)/55.,0.,1.);
          col = mix(col, uHaze, fog);
          gl_FragColor = vec4(col,1.0);
        }`,
    });
    const grass = new THREE.Mesh(gGeo, grassMat);
    grass.frustumCulled = false;
    scene.add(grass);
    disposeGeo.push(bladeBase, gGeo);
    disposeMat.push(grassMat);

    // ---------- branches (thick, deep procedural bark) ----------
    const N = segs.length;
    const cyl = new THREE.CylinderGeometry(1, 1, 1, low ? 8 : 12, 1, true);
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
        varying float vTp; varying vec3 vN; varying vec3 vW;
        varying vec3 vAxis; varying float vZ;
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
          vAxis = normalize(Mb*vec3(0.,1.,0.));
          vW = wp; vTp=iTp; vZ=-mv.z;
        }`,
      fragmentShader: /* glsl */ `
        precision highp float;
        ${NOISE}
        uniform vec3 uSun,uSunCol,uSky,uGround,uHaze;
        varying float vTp; varying vec3 vN; varying vec3 vW;
        varying vec3 vAxis; varying float vZ;

        // bark height field — long fissures running along the limb +
        // chunky plates + fine grain.
        float bark(vec3 P, vec3 ax){
          float along = dot(P, ax);
          vec3 Q = P*2.4 - ax*along*2.4*0.82;   // stretch along the limb
          float plate = fbm(Q*0.7);
          float fiss  = 1.0 - abs(sin(along*5.5 + 5.0*fbm(Q*0.5)));
          fiss = pow(clamp(fiss,0.,1.), 1.6);
          float grain = fbm(Q*5.5)*0.5;
          return plate*0.5 + fiss*0.42 + grain*0.18;
        }

        void main(){
          vec3 N0 = normalize(vN);
          vec3 ax = normalize(vAxis);
          float det = clamp(1.0 - (vZ-2.0)/26.0, 0.0, 1.0); // fade far
          float e = 0.05;
          vec3 ta = normalize(cross(N0, ax));
          vec3 tb = normalize(cross(N0, ta));
          float h  = bark(vW, ax);
          float ha = bark(vW + ta*e, ax);
          float hb = bark(vW + tb*e, ax);
          vec3 N = normalize(N0 - det*1.7*((ha-h)/e*ta + (hb-h)/e*tb));

          // albedo: ridges light tan, fissures dark
          vec3 deep = vec3(0.12,0.085,0.055);
          vec3 ridge = vec3(0.46,0.34,0.21);
          vec3 bcol = mix(deep, ridge, smoothstep(0.18,0.72,h));
          bcol *= 0.8 + 0.4*fbm(vW*0.6);                 // large mottling
          // moss on upward / sheltered faces
          float moss = smoothstep(0.2,0.8,N0.y) * smoothstep(0.55,0.2,h)
                       * smoothstep(0.35,0.7,fbm(vW*0.9+3.0));
          bcol = mix(bcol, vec3(0.22,0.30,0.14), moss*0.7*det);
          bcol *= mix(0.85,1.05,vTp);

          float hemi = N.y*0.5+0.5;
          vec3 amb = mix(uGround,uSky,hemi)*0.5;
          float diff = clamp(dot(N,normalize(uSun))*0.5+0.5,0.,1.);
          float ao = mix(0.55,1.0,smoothstep(0.0,0.55,h));   // crevice AO
          vec3 col = bcol*(amb + uSunCol*diff*1.0)*ao;

          float fog = clamp((vZ-12.)/46.,0.,0.6);
          col = mix(col,uHaze,fog);
          gl_FragColor = vec4(col,1.);
        }`,
    });
    const branchMesh = new THREE.Mesh(bGeo, branchMat);
    branchMesh.frustumCulled = false;
    scene.add(branchMesh);
    disposeGeo.push(cyl, bGeo);
    disposeMat.push(branchMat);

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
    disposeGeo.push(quad, lGeo);
    disposeMat.push(leafMat);

    // ---------- critters on the focal branch ----------
    const axis = focalDir.clone();
    const wUp = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(axis, wUp);
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    side.normalize();
    const nUp = new THREE.Vector3().crossVectors(side, axis).normalize();
    const bMat = new THREE.Matrix4().makeBasis(side, nUp, axis);
    const bQuat = new THREE.Quaternion().setFromRotationMatrix(bMat);

    const ladybug = new THREE.Group();
    const lbBodyG = new THREE.SphereGeometry(0.075, 18, 14);
    const lbBodyM = new THREE.MeshStandardMaterial({
      color: 0xc62828,
      roughness: 0.32,
    });
    const lbBody = new THREE.Mesh(lbBodyG, lbBodyM);
    lbBody.scale.set(1, 0.62, 1.25);
    ladybug.add(lbBody);
    const blackM = new THREE.MeshStandardMaterial({
      color: 0x0c0c0c,
      roughness: 0.5,
    });
    const lbHeadG = new THREE.SphereGeometry(0.036, 12, 10);
    const lbHead = new THREE.Mesh(lbHeadG, blackM);
    lbHead.position.set(0, 0.006, 0.092);
    ladybug.add(lbHead);
    const spotG = new THREE.SphereGeometry(0.015, 8, 8);
    for (const sp of [
      [0.034, 0.032, 0.0],
      [-0.034, 0.032, 0.0],
      [0.032, 0.027, -0.055],
      [-0.032, 0.027, -0.055],
      [0, 0.048, 0.032],
    ] as const) {
      const m = new THREE.Mesh(spotG, blackM);
      m.position.set(sp[0], sp[1], sp[2]);
      ladybug.add(m);
    }
    ladybug.quaternion.copy(bQuat);
    ladybug.position.copy(focal).addScaledVector(nUp, focalR + 0.045);
    scene.add(ladybug);
    disposeGeo.push(lbBodyG, lbHeadG, spotG);
    disposeMat.push(lbBodyM, blackM);

    const butterfly = new THREE.Group();
    const bfBodyG = new THREE.CapsuleGeometry(0.013, 0.12, 4, 8);
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
    const wingLM = new THREE.Mesh(wingG, wingM);
    wingLM.position.x = -0.085;
    wingL.add(wingLM);
    const wingR = new THREE.Group();
    const wingRM = new THREE.Mesh(wingG, wingM);
    wingRM.position.x = 0.085;
    wingR.add(wingRM);
    butterfly.add(wingL, wingR);
    butterfly.quaternion.copy(bQuat);
    const bfHome = focal
      .clone()
      .addScaledVector(nUp, focalR + 0.2)
      .addScaledVector(side, 0.18);
    butterfly.position.copy(bfHome);
    scene.add(butterfly);
    disposeGeo.push(bfBodyG, wingG);
    disposeMat.push(bfBodyM, wingM);

    // ---------- scroll-driven dolly (NO orbit / NO auto-rotation) -------
    let target = 0;
    let cur = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const center = new THREE.Vector3(0, HEIGHT * 0.52, 0);
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
      const vHalf = (camera.fov * Math.PI) / 360;
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const fitFar = (HEIGHT * 0.62) / Math.tan(Math.min(vHalf, hHalf)) + 2.0;
      const dist = 0.85 + (fitFar - 0.85) * p;
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
      disposeGeo.forEach((g) => g.dispose());
      disposeMat.forEach((m) => m.dispose());
      renderer.dispose();
      dom.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className} />;
}
