"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Copy, Check, RotateCcw, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExperimentShell } from "@/app/work/_experiment-shell";

const MAX_ITER_HARD = 14;

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
  uniform float uPower;
  uniform float uIter;
  uniform vec3  uColA;
  uniform vec3  uColB;
  uniform float uCamDist;
  uniform float uFog;
  uniform float uLightYaw;
  uniform float uAutoRot;

  #define MAX_ITER ${MAX_ITER_HARD}
  #define MAX_STEPS 70
  #define MAX_DIST 100.0
  #define SURF_DIST 0.001

  float mandelbulb(vec3 pos, out float orbitTrap) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;
    orbitTrap = 1e10;
    int iters = int(uIter);
    for (int i = 0; i < MAX_ITER; i++) {
      if (i >= iters) break;
      r = length(z);
      if (r > 2.0) break;
      float theta = acos(z.z / r);
      float phi = atan(z.y, z.x);
      dr = pow(r, uPower - 1.0) * uPower * dr + 1.0;
      float zr = pow(r, uPower);
      theta *= uPower;
      phi *= uPower;
      z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta)) + pos;
      orbitTrap = min(orbitTrap, length(z));
    }
    return 0.5 * log(r) * r / dr;
  }

  vec3 calcNormal(vec3 p) {
    float trap;
    vec2 e = vec2(0.0008, 0.0);
    return normalize(vec3(
      mandelbulb(p + e.xyy, trap) - mandelbulb(p - e.xyy, trap),
      mandelbulb(p + e.yxy, trap) - mandelbulb(p - e.yxy, trap),
      mandelbulb(p + e.yyx, trap) - mandelbulb(p - e.yyx, trap)
    ));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;

    float autoYaw = uTime * 0.10 * uAutoRot;
    float yaw   = uMouse.x * 1.2 + autoYaw;
    float pitch = -uMouse.y * 0.8;

    vec3 ro = vec3(
      uCamDist * cos(yaw) * cos(pitch),
      uCamDist * sin(pitch),
      uCamDist * sin(yaw) * cos(pitch)
    );
    vec3 ta = vec3(0.0);
    vec3 ww = normalize(ta - ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = normalize(cross(uu, ww));
    vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.5 * ww);

    float d = 0.0;
    float trap = 0.0;
    bool hit = false;
    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 p = ro + rd * d;
      float ds = mandelbulb(p, trap);
      if (ds < SURF_DIST) { hit = true; break; }
      if (d > MAX_DIST) break;
      d += ds;
    }

    vec3 col = vec3(0.0);
    if (hit) {
      vec3 p = ro + rd * d;
      vec3 n = calcNormal(p);
      vec3 ld = normalize(vec3(cos(uLightYaw), 0.6, sin(uLightYaw)));
      float light = max(dot(n, ld), 0.0);
      float ao = smoothstep(0.0, 1.5, trap);
      vec3 baseCol = mix(uColA, uColB, ao);
      vec3 hi = mix(baseCol, vec3(1.0, 0.95, 0.78), light * 0.55);
      col = hi * (0.28 + 0.72 * light);
      // fog blends to dark with distance
      col = mix(col, vec3(0.02, 0.02, 0.03), clamp(d * uFog * 0.08, 0.0, 1.0));
    }

    float vignette = smoothstep(1.5, 0.25, length(uv));
    col *= vignette;
    col = pow(col, vec3(0.92));

    gl_FragColor = vec4(col, 1.0);
  }
`;

interface Params {
  power: number;
  iter: number;
  colA: string; // hex
  colB: string;
  camDist: number;
  fog: number;
  lightYaw: number;
  autoRot: boolean;
}

const DEFAULTS: Params = {
  power: 8,
  iter: 8,
  colA: "#ff4500",
  colB: "#ffd17a",
  camDist: 3,
  fog: 0.5,
  lightYaw: 0.6,
  autoRot: true,
};

const PRESETS: Array<{ name: string; params: Params }> = [
  {
    name: "EMBER",
    params: { power: 8, iter: 8, colA: "#ff4500", colB: "#ffd17a", camDist: 3, fog: 0.5, lightYaw: 0.6, autoRot: true },
  },
  {
    name: "VOID",
    params: { power: 10, iter: 9, colA: "#0066ff", colB: "#7dd3fc", camDist: 3.2, fog: 0.65, lightYaw: 1.8, autoRot: true },
  },
  {
    name: "AURORA",
    params: { power: 6, iter: 10, colA: "#00d997", colB: "#a3ff9c", camDist: 2.6, fog: 0.4, lightYaw: 2.4, autoRot: true },
  },
  {
    name: "BLOOD",
    params: { power: 12, iter: 7, colA: "#d92e6c", colB: "#ffb3c8", camDist: 3.4, fog: 0.55, lightYaw: 0.2, autoRot: true },
  },
  {
    name: "ICE",
    params: { power: 5, iter: 11, colA: "#7dd3fc", colB: "#ffffff", camDist: 2.4, fog: 0.3, lightYaw: 1.2, autoRot: false },
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function encode(p: Params): string {
  const q = new URLSearchParams();
  q.set("p", p.power.toFixed(2));
  q.set("i", String(p.iter));
  q.set("a", p.colA.replace("#", ""));
  q.set("b", p.colB.replace("#", ""));
  q.set("c", p.camDist.toFixed(2));
  q.set("f", p.fog.toFixed(2));
  q.set("l", p.lightYaw.toFixed(2));
  q.set("r", p.autoRot ? "1" : "0");
  return q.toString();
}

function decode(search: string): Partial<Params> {
  const q = new URLSearchParams(search);
  const out: Partial<Params> = {};
  const num = (k: string, min: number, max: number) => {
    const v = q.get(k);
    if (v == null) return undefined;
    const n = parseFloat(v);
    if (!Number.isFinite(n)) return undefined;
    return Math.min(max, Math.max(min, n));
  };
  const hex = (k: string) => {
    const v = q.get(k);
    if (!v) return undefined;
    if (!/^[0-9a-fA-F]{6}$/.test(v)) return undefined;
    return "#" + v.toLowerCase();
  };
  const power = num("p", 3, MAX_ITER_HARD);
  if (power !== undefined) out.power = power;
  const iter = num("i", 2, MAX_ITER_HARD);
  if (iter !== undefined) out.iter = Math.round(iter);
  const a = hex("a");
  if (a) out.colA = a;
  const b = hex("b");
  if (b) out.colB = b;
  const camDist = num("c", 1.5, 5);
  if (camDist !== undefined) out.camDist = camDist;
  const fog = num("f", 0, 1);
  if (fog !== undefined) out.fog = fog;
  const lightYaw = num("l", 0, Math.PI * 2);
  if (lightYaw !== undefined) out.lightYaw = lightYaw;
  const r = q.get("r");
  if (r === "1" || r === "0") out.autoRot = r === "1";
  return out;
}

export function MandelbulbPlayground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ targetX: 0, targetY: 0, paused: false });
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const [params, setParams] = useState<Params>(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const [fps, setFps] = useState(60);
  const [paused, setPaused] = useState(false);

  // Hydrate from URL on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromUrl = decode(window.location.search);
    if (Object.keys(fromUrl).length > 0) {
      setParams((p) => ({ ...p, ...fromUrl }));
    }
  }, []);

  // Reflect into URL whenever params change (debounced via animation frame).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      const q = encode(params);
      const next = window.location.pathname + "?" + q + window.location.hash;
      window.history.replaceState(null, "", next);
    }, 120);
    return () => window.clearTimeout(id);
  }, [params]);

  // Push params into shader uniforms.
  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uPower.value = params.power;
    m.uniforms.uIter.value = params.iter;
    const [ar, ag, ab] = hexToRgb(params.colA);
    const [br, bg, bb] = hexToRgb(params.colB);
    m.uniforms.uColA.value.set(ar, ag, ab);
    m.uniforms.uColB.value.set(br, bg, bb);
    m.uniforms.uCamDist.value = params.camDist;
    m.uniforms.uFog.value = params.fog;
    m.uniforms.uLightYaw.value = params.lightYaw;
    m.uniforms.uAutoRot.value = params.autoRot ? 1 : 0;
  }, [params]);

  useEffect(() => {
    const wrap = canvasRef.current;
    if (!wrap) return;

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

    const [ar, ag, ab] = hexToRgb(DEFAULTS.colA);
    const [br, bg, bb] = hexToRgb(DEFAULTS.colB);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(W, H) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPower: { value: DEFAULTS.power },
        uIter: { value: DEFAULTS.iter },
        uColA: { value: new THREE.Vector3(ar, ag, ab) },
        uColB: { value: new THREE.Vector3(br, bg, bb) },
        uCamDist: { value: DEFAULTS.camDist },
        uFog: { value: DEFAULTS.fog },
        uLightYaw: { value: DEFAULTS.lightYaw },
        uAutoRot: { value: 1 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
    });
    matRef.current = mat;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    let currentX = 0;
    let currentY = 0;
    let frozenTime = 0;
    let lastTs: number | null = null;
    let frames = 0;
    let lastFpsTime = performance.now();

    const onMove = (e: PointerEvent) => {
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
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerdown", onMove);
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

      frames++;
      const now = performance.now();
      if (now - lastFpsTime >= 700) {
        setFps(Math.round(frames / ((now - lastFpsTime) / 1000)));
        frames = 0;
        lastFpsTime = now;
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
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      renderer.dispose();
      mat.dispose();
      dom.remove();
      matRef.current = null;
    };
  }, []);

  const update = useCallback(<K extends keyof Params>(k: K, v: Params[K]) => {
    setParams((p) => ({ ...p, [k]: v }));
  }, []);

  const applyPreset = (p: Params) => setParams(p);
  const reset = () => setParams(DEFAULTS);
  const togglePause = () => {
    setPaused((p) => {
      stateRef.current.paused = !p;
      return !p;
    });
  };
  const copyShare = async () => {
    const url = window.location.origin + window.location.pathname + "?" + encode(params);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <ExperimentShell
      label="WORKSPACE / SHADERS"
      title="MANDELBULB PLAYGROUND"
      controls={
        <div className="-mr-1 max-h-[78dvh] space-y-5 overflow-y-auto pr-1">
          <div className="flex items-center justify-between gap-2">
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-orange">/ PRESETS</span>
            <button
              type="button"
              onClick={reset}
              className="f-mono inline-flex items-center gap-1.5 text-[0.55rem] tracking-[0.2em] text-white/50 transition-colors hover:text-orange focus-visible:text-orange"
            >
              <RotateCcw className="size-3" /> RESET
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.params)}
                className="f-mono border border-white/15 px-2 py-2 text-[0.55rem] tracking-[0.2em] text-white/50 transition-colors hover:border-orange hover:text-orange focus-visible:border-orange focus-visible:text-orange"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 pt-5">
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-orange">/ GEOMETRY</span>
            <div className="mt-3 flex flex-col gap-4">
              <Slider label="POWER" value={params.power} min={3} max={MAX_ITER_HARD} step={0.05} onChange={(v) => update("power", v)} format={(v) => v.toFixed(2)} />
              <Slider label="ITERATIONS" value={params.iter} min={2} max={MAX_ITER_HARD} step={1} onChange={(v) => update("iter", Math.round(v))} format={(v) => String(Math.round(v))} />
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-orange">/ COLOR</span>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ColorField label="CORE" value={params.colA} onChange={(v) => update("colA", v)} />
              <ColorField label="HALO" value={params.colB} onChange={(v) => update("colB", v)} />
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-orange">/ CAMERA</span>
            <div className="mt-3 flex flex-col gap-4">
              <Slider label="DISTANCE" value={params.camDist} min={1.5} max={5} step={0.05} onChange={(v) => update("camDist", v)} format={(v) => v.toFixed(2)} />
              <Slider label="FOG" value={params.fog} min={0} max={1} step={0.02} onChange={(v) => update("fog", v)} format={(v) => v.toFixed(2)} />
              <Slider label="LIGHT YAW" value={params.lightYaw} min={0} max={Math.PI * 2} step={0.05} onChange={(v) => update("lightYaw", v)} format={(v) => v.toFixed(2)} />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <span className="f-mono text-[0.55rem] tracking-[0.25em] text-white/50">AUTO ROTATE</span>
            <button
              type="button"
              role="switch"
              aria-checked={params.autoRot}
              onClick={() => update("autoRot", !params.autoRot)}
              className={cn(
                "relative h-5 w-10 border transition-colors",
                params.autoRot ? "border-orange bg-orange/20" : "border-white/20 bg-white/5",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-3.5 bg-orange transition-transform",
                  params.autoRot ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={copyShare}
            className="f-mono group mt-1 inline-flex w-full items-center justify-between gap-2 border border-orange bg-orange/5 px-3 py-3 text-[0.6rem] tracking-[0.25em] text-orange transition-colors hover:bg-orange hover:text-background focus-visible:bg-orange focus-visible:text-background"
          >
            <span>{copied ? "URL COPIED" : "COPY SHARE URL"}</span>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      }
    >
      <div ref={wrapRef} className="absolute inset-0 select-none bg-black">
        <div ref={canvasRef} className="absolute inset-0" />
        <div
          className="absolute bottom-3 left-3 flex flex-col items-start gap-2 md:bottom-4 md:left-4"
          style={{
            paddingBottom: "max(0rem, env(safe-area-inset-bottom))",
          }}
        >
          <button
            type="button"
            onClick={togglePause}
            aria-label="Pause/resume animation"
            aria-pressed={paused}
            className="f-mono pointer-events-auto inline-flex items-center gap-1.5 border border-orange/60 bg-black/40 px-2.5 py-1.5 text-[0.55rem] text-orange backdrop-blur transition-colors hover:bg-orange hover:text-background focus-visible:bg-orange focus-visible:text-background"
          >
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
            {paused ? "RESUME" : "PAUSE"}
          </button>
          <div className="f-mono pointer-events-none flex flex-col gap-1 border border-orange/30 bg-black/40 p-2 text-[0.5rem] tracking-[0.2em] text-orange/90 backdrop-blur">
            <span>POWER&nbsp;&nbsp;{params.power.toFixed(2)}</span>
            <span>ITER&nbsp;&nbsp;&nbsp;{params.iter}</span>
            <span>CAM&nbsp;&nbsp;&nbsp;&nbsp;{params.camDist.toFixed(2)}</span>
            <span>FPS&nbsp;&nbsp;&nbsp;&nbsp;{fps}</span>
          </div>
        </div>
      </div>
    </ExperimentShell>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="f-mono flex items-center justify-between text-[0.55rem] tracking-[0.2em] text-muted-foreground">
        {label}
        <span className="text-foreground">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full appearance-none bg-transparent accent-orange [&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-border [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-orange [&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing"
      />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="f-mono text-[0.55rem] tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2 border border-border bg-background px-2 py-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-6 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"
          aria-label={`${label} color`}
        />
        <span className="f-mono text-[0.6rem] uppercase text-muted-foreground">
          {value}
        </span>
      </div>
    </label>
  );
}
