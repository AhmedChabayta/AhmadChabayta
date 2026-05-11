"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Swatch {
  hex: string;
  rgb: [number, number, number];
  weight: number;
}

function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function kmeansSample(
  pixels: Uint8ClampedArray,
  k = 6,
  iterations = 6,
): Swatch[] {
  const n = pixels.length / 4;
  const centers: number[][] = Array.from({ length: k }, () => {
    const i = Math.floor(Math.random() * n) * 4;
    return [pixels[i], pixels[i + 1], pixels[i + 2]];
  });
  const counts = new Array(k).fill(0);
  const sums = Array.from({ length: k }, () => [0, 0, 0]);

  for (let it = 0; it < iterations; it++) {
    counts.fill(0);
    sums.forEach((s) => s.fill(0));
    for (let i = 0; i < n; i++) {
      const r = pixels[i * 4];
      const g = pixels[i * 4 + 1];
      const b = pixels[i * 4 + 2];
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const dr = r - centers[c][0];
        const dg = g - centers[c][1];
        const db = b - centers[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      sums[best][0] += r;
      sums[best][1] += g;
      sums[best][2] += b;
      counts[best]++;
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) continue;
      centers[c][0] = sums[c][0] / counts[c];
      centers[c][1] = sums[c][1] / counts[c];
      centers[c][2] = sums[c][2] / counts[c];
    }
  }

  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return centers
    .map((c, i) => {
      const r = Math.round(c[0]);
      const g = Math.round(c[1]);
      const b = Math.round(c[2]);
      return {
        hex: rgbToHex(r, g, b),
        rgb: [r, g, b] as [number, number, number],
        weight: counts[i] / total,
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

const SAMPLE_GRADIENTS = [
  ["#ff4500", "#1a1a1a", "#ff8460", "#262626", "#fefefe", "#0a0a0a"],
  ["#040b1e", "#1a3a8f", "#3aa1ff", "#a4c8ff", "#f0f4ff", "#08152b"],
  ["#3d0a1a", "#7a1f3d", "#c43459", "#f08aaa", "#fff0f3", "#1a050d"],
];

function gradientToSwatches(palette: string[]): Swatch[] {
  return palette.map((hex, i) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return {
      hex,
      rgb: [r, g, b] as [number, number, number],
      weight: 1 - i * 0.12,
    };
  });
}

export function ColorExtractor() {
  const [swatches, setSwatches] = useState<Swatch[]>(
    gradientToSwatches(SAMPLE_GRADIENTS[0]),
  );
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const extractFromImage = useCallback((src: string) => {
    setBusy(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current ?? document.createElement("canvas");
      const max = 140;
      const scale = Math.min(max / img.width, max / img.height, 1);
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setBusy(false);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const result = kmeansSample(data, 6, 6);
      setSwatches(result);
      setBusy(false);
    };
    img.onerror = () => setBusy(false);
    img.src = src;
  }, []);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    extractFromImage(url);
  };

  return (
    <div className="flex flex-col gap-6 border border-border bg-card p-5 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="f-mono text-[0.6rem] tracking-[0.2em] text-orange">
            / K-MEANS PALETTE
          </p>
          <h3 className="f-anton mt-1 text-3xl">COLOR EXTRACTOR</h3>
        </div>
        <label className="f-mono cursor-pointer border border-orange/60 bg-background px-4 py-2 text-[0.6rem] tracking-[0.2em] text-orange transition-colors hover:bg-orange hover:text-background focus-within:bg-orange focus-within:text-background">
          UPLOAD IMAGE
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div
          className={cn(
            "flex aspect-[4/3] items-center justify-center overflow-hidden border border-border bg-background",
            busy && "opacity-60",
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Source"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
              <p className="f-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground">
                NO IMAGE — TRY A SAMPLE
              </p>
              <div className="flex gap-2">
                {SAMPLE_GRADIENTS.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSwatches(gradientToSwatches(g))}
                    className="flex h-8 w-12 overflow-hidden rounded-sm border border-border"
                    style={{
                      background: `linear-gradient(90deg, ${g.join(", ")})`,
                    }}
                    aria-label={`Sample palette ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="f-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground">
            / PALETTE · {swatches.length}
          </p>
          <ul className="flex flex-col gap-2">
            {swatches.map((s) => (
              <li
                key={s.hex}
                className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border border-border bg-background p-2"
              >
                <span
                  className="block h-10 w-10 rounded-sm"
                  style={{ backgroundColor: s.hex }}
                />
                <div className="flex flex-col">
                  <span className="f-mono text-[0.7rem]">{s.hex.toUpperCase()}</span>
                  <span className="f-mono text-[0.55rem] text-muted-foreground">
                    rgb({s.rgb.join(", ")})
                  </span>
                </div>
                <span className="f-mono text-[0.6rem] text-muted-foreground">
                  {Math.round(s.weight * 100)}%
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              const css = swatches
                .map((s, i) => `  --c-${i + 1}: ${s.hex};`)
                .join("\n");
              navigator.clipboard?.writeText(`:root {\n${css}\n}`);
            }}
            className="f-mono mt-2 border border-orange/60 px-3 py-2 text-[0.6rem] tracking-[0.2em] text-orange transition-colors hover:bg-orange hover:text-background focus-visible:bg-orange focus-visible:text-background"
          >
            COPY AS CSS VARS
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
