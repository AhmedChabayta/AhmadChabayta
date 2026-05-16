"use client";

import { useState } from "react";
import { WaveSynth } from "@/components/demos/wave-synth";
import { ExperimentShell, Range, Toggle } from "../_experiment-shell";

export function WaveSynthClient() {
  const [layers, setLayers] = useState(5);
  const [speed, setSpeed] = useState(1.2);
  const [glow, setGlow] = useState(true);

  return (
    <ExperimentShell
      label="WORKSPACE / CANVAS"
      title="WAVE SYNTH"
      controls={
        <>
          <Range
            label="LAYERS"
            value={layers}
            min={1}
            max={8}
            step={1}
            onChange={setLayers}
          />
          <Range
            label="SPEED"
            value={speed}
            min={0.2}
            max={3}
            step={0.1}
            onChange={setSpeed}
            fmt={(v) => v.toFixed(1) + "×"}
          />
          <Toggle label="GLOW" checked={glow} onChange={setGlow} />
        </>
      }
    >
      <WaveSynth
        className="h-full w-full !rounded-none"
        layers={layers}
        speed={speed}
        glow={glow}
      />
    </ExperimentShell>
  );
}
