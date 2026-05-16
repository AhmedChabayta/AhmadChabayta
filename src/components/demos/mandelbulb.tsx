"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const PHASE_NAMES = ["EMBER STORM", "DEEP VOID", "AURORA PRIME", "BLOOD RITE"];
const PHASE_BASES = [8.0, 10.0, 6.0, 12.0];
const PHASE_OSCS = [1.5, 0.8, 1.5, 0.5];
const PHASE_SPEEDS = [0.15, 0.2, 0.1, 0.3];

const VERT = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAG = `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uMouse;
  uniform float uZoom;

  #define MAX_ITER 8
  #define MAX_STEPS 60
  #define MAX_DIST 100.0
  #define SURF_DIST 0.001

  float mandelbulb(vec3 pos, out float orbitTrap, float power) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;
    orbitTrap = 1e10;
    for (int i = 0; i < MAX_ITER; i++) {
      r = length(z);
      if (r > 2.0) break;
      float theta = acos(z.z / r);
      float phi = atan(z.y, z.x);
      dr = pow(r, power - 1.0) * power * dr + 1.0;
      float zr = pow(r, power);
      theta *= power;
      phi *= power;
      z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta)) + pos;
      orbitTrap = min(orbitTrap, length(z));
    }
    return 0.5 * log(r) * r / dr;
  }

  float scene(vec3 p, out float trap, float power) {
    return mandelbulb(p, trap, power);
  }

  vec3 calcNormal(vec3 p, float power) {
    float trap;
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
      scene(p + e.xyy, trap, power) - scene(p - e.xyy, trap, power),
      scene(p + e.yxy, trap, power) - scene(p - e.yxy, trap, power),
      scene(p + e.yyx, trap, power) - scene(p - e.yyx, trap, power)
    ));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;

    int seg = int(mod(uTime, 100.0) / 25.0);
    seg = seg - 4 * (seg / 4);
    float baseP[4]; baseP[0]=8.0; baseP[1]=10.0; baseP[2]=6.0; baseP[3]=12.0;
    float oscP[4];  oscP[0]=1.5;  oscP[1]=0.8;  oscP[2]=1.5;  oscP[3]=0.5;
    float spdP[4];  spdP[0]=0.15; spdP[1]=0.2;  spdP[2]=0.1;  spdP[3]=0.3;

    float bP = baseP[0];
    float oP = oscP[0];
    float sP = spdP[0];
    if (seg == 1) { bP=baseP[1]; oP=oscP[1]; sP=spdP[1]; }
    else if (seg == 2) { bP=baseP[2]; oP=oscP[2]; sP=spdP[2]; }
    else if (seg == 3) { bP=baseP[3]; oP=oscP[3]; sP=spdP[3]; }
    float power = bP + oP * sin(uTime * sP);

    float yaw   = uMouse.x * 1.2 + uTime * 0.10;
    float pitch = -uMouse.y * 0.8;

    vec3 ro = vec3(
      3.0 * cos(yaw) * cos(pitch),
      3.0 * sin(pitch),
      3.0 * sin(yaw) * cos(pitch)
    );
    ro /= uZoom;
    vec3 ta = vec3(0.0);
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.5 * ww);

    float d = 0.0;
    float trap = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 p = ro + rd * d;
      float ds = scene(p, trap, power);
      if (ds < SURF_DIST || d > MAX_DIST) break;
      d += ds;
    }

    vec3 col = vec3(0.0);
    if (d < MAX_DIST) {
      vec3 p = ro + rd * d;
      vec3 n = calcNormal(p, power);
      float light = max(dot(n, normalize(vec3(0.8, 0.6, 1.0))), 0.0);

      vec3 phaseA = vec3(1.0, 0.27, 0.0);
      vec3 phaseB = vec3(0.0, 0.4, 1.0);
      vec3 phaseC = vec3(0.0, 0.85, 0.45);
      vec3 phaseD = vec3(0.85, 0.18, 0.42);
      vec3 phaseCol = phaseA;
      if (seg == 1) phaseCol = phaseB;
      else if (seg == 2) phaseCol = phaseC;
      else if (seg == 3) phaseCol = phaseD;

      vec3 baseCol = mix(phaseCol, vec3(1.0, 0.95, 0.7), light * 0.5);
      col = baseCol * (0.3 + 0.7 * light);
      col *= mix(0.6, 1.4, smoothstep(0.0, 1.5, trap));
    }

    float vignette = smoothstep(1.4, 0.3, length(uv));
    col *= vignette;
    col = pow(col, vec3(0.92));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Mandelbulb({
  className,
  controls = true,
}: {
  className?: string;
  controls?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    zoom: 1.0,
    paused: false,
    targetX: 0,
    targetY: 0,
  });
  const [hud, setHud] = useState({ phase: "EMBER STORM", power: "8.00", fps: 60, zoom: "1.00" });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) stateRef.current.paused = true;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const W = Math.max(wrap.clientWidth, 1);
    const H = Math.max(wrap.clientHeight, 1);
    renderer.setSize(W, H, false);
    const dom = renderer.domElement;
    dom.style.cssText =
      "display:block;position:absolute;top:0;left:0;width:100%;height:100%;";
    dom.setAttribute("aria-hidden", "true");
    wrap.appendChild(dom);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(W, H) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uZoom: { value: 1.0 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    let currentX = 0;
    let currentY = 0;
    let zoomCurrent = 1.0;
    let frozenTime = 0;
    let lastTs: number | null = null;
    let frames = 0;
    let lastFpsTime = performance.now();

    const updateFractal = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      stateRef.current.targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      stateRef.current.targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "touch") {
        stateRef.current.targetX = 0;
        stateRef.current.targetY = 0;
      }
    };
    wrap.addEventListener("pointermove", updateFractal);
    wrap.addEventListener("pointerdown", updateFractal);
    wrap.addEventListener("pointerleave", onLeave);

    let raf = 0;
    const animate = (ts: number) => {
      if (lastTs !== null && !stateRef.current.paused) {
        frozenTime += (ts - lastTs) * 0.001;
      }
      lastTs = ts;
      mat.uniforms.uTime.value = frozenTime;

      currentX += (stateRef.current.targetX - currentX) * 0.06;
      currentY += (stateRef.current.targetY - currentY) * 0.06;
      mat.uniforms.uMouse.value.set(currentX, currentY);

      zoomCurrent += (stateRef.current.zoom - zoomCurrent) * 0.1;
      mat.uniforms.uZoom.value = zoomCurrent;

      if (!stateRef.current.paused) {
        const phaseIdx =
          Math.floor((frozenTime % 100) / 25) % 4;
        const power =
          PHASE_BASES[phaseIdx] +
          PHASE_OSCS[phaseIdx] * Math.sin(frozenTime * PHASE_SPEEDS[phaseIdx]);
        frames++;
        const now = performance.now();
        if (now - lastFpsTime >= 600) {
          setHud({
            phase: PHASE_NAMES[phaseIdx],
            power: power.toFixed(2),
            fps: Math.round(frames / ((now - lastFpsTime) / 1000)),
            zoom: zoomCurrent.toFixed(2),
          });
          frames = 0;
          lastFpsTime = now;
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(1, entry.contentRect.width);
        const h = Math.max(1, entry.contentRect.height);
        renderer.setSize(w, h, false);
        mat.uniforms.uRes.value.set(w, h);
      }
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", updateFractal);
      wrap.removeEventListener("pointerdown", updateFractal);
      wrap.removeEventListener("pointerleave", onLeave);
      renderer.dispose();
      mat.dispose();
      dom.remove();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={wrapRef}
        className="absolute inset-0 overflow-hidden bg-black select-none"
      />
      {controls && (
        <div className="pointer-events-auto absolute bottom-3 right-3 flex gap-2 md:bottom-5 md:right-5">
          <button
            type="button"
            onClick={() => (stateRef.current.zoom = Math.min(3.5, stateRef.current.zoom * 1.25))}
            className="f-mono border border-orange/60 bg-black/40 px-2 py-1 text-[0.55rem] text-orange backdrop-blur transition-colors hover:bg-orange hover:text-background focus-visible:bg-orange focus-visible:text-background"
          >
            ZOOM+
          </button>
          <button
            type="button"
            onClick={() => (stateRef.current.zoom = Math.max(0.4, stateRef.current.zoom / 1.25))}
            className="f-mono border border-orange/60 bg-black/40 px-2 py-1 text-[0.55rem] text-orange backdrop-blur transition-colors hover:bg-orange hover:text-background focus-visible:bg-orange focus-visible:text-background"
          >
            ZOOM−
          </button>
          <button
            type="button"
            onClick={() => {
              stateRef.current.zoom = 1.0;
              stateRef.current.targetX = 0;
              stateRef.current.targetY = 0;
            }}
            className="f-mono border border-orange/60 bg-black/40 px-2 py-1 text-[0.55rem] text-orange backdrop-blur transition-colors hover:bg-orange hover:text-background focus-visible:bg-orange focus-visible:text-background"
          >
            RESET
          </button>
        </div>
      )}
      {controls && (
        <div className="f-mono pointer-events-none absolute top-3 left-3 flex flex-col gap-1 border border-orange/30 bg-black/30 p-2 text-[0.5rem] tracking-[0.2em] text-orange/90 backdrop-blur md:top-5 md:left-5">
          <span>PHASE&nbsp;&nbsp;{hud.phase}</span>
          <span>POWER&nbsp;&nbsp;{hud.power}</span>
          <span>ZOOM&nbsp;&nbsp;&nbsp;{hud.zoom}</span>
          <span>FPS&nbsp;&nbsp;&nbsp;&nbsp;{hud.fps}</span>
        </div>
      )}
    </div>
  );
}
