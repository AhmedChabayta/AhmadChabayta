"use client";

import { useState } from "react";
import { ParticleField } from "@/components/demos/particle-field";
import { ExperimentShell, Range, Toggle } from "../_experiment-shell";

export function ParticleGravityClient() {
  const [count, setCount] = useState(220);
  const [gravity, setGravity] = useState(1);
  const [trail, setTrail] = useState(0.16);
  const [paused, setPaused] = useState(false);

  return (
    <ExperimentShell
      label="WORKSPACE / CANVAS"
      title="PARTICLE GRAVITY"
      controls={
        <>
          <Range
            label="BODIES"
            value={count}
            min={40}
            max={600}
            step={10}
            onChange={setCount}
          />
          <Range
            label="GRAVITY"
            value={gravity}
            min={0.2}
            max={4}
            step={0.1}
            onChange={setGravity}
            fmt={(v) => v.toFixed(1) + "×"}
          />
          <Range
            label="TRAIL"
            value={trail}
            min={0.04}
            max={0.5}
            step={0.02}
            onChange={setTrail}
            fmt={(v) => (v < 0.12 ? "LONG" : v > 0.32 ? "SHORT" : "MEDIUM")}
          />
          <Toggle label="PAUSE" checked={paused} onChange={setPaused} />
        </>
      }
    >
      <ParticleField
        className="h-full w-full !rounded-none"
        count={count}
        gravity={gravity}
        trail={trail}
        paused={paused}
      />
    </ExperimentShell>
  );
}
