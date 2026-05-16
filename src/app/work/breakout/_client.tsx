"use client";

import { useState } from "react";
import { BreakoutMicro } from "@/components/demos/breakout-micro";
import {
  ActionButton,
  ExperimentShell,
  Range,
} from "../_experiment-shell";

export function BreakoutClient() {
  const [cols, setCols] = useState(9);
  const [rows, setRows] = useState(6);
  const [lives, setLives] = useState(3);
  const [ballSpeed, setBallSpeed] = useState(1);
  const [paddleWidth, setPaddleWidth] = useState(80);
  const [restartKey, setRestartKey] = useState(0);

  return (
    <ExperimentShell
      label="WORKSPACE / CANVAS"
      title="BREAKOUT"
      controls={
        <>
          <Range
            label="COLUMNS"
            value={cols}
            min={4}
            max={14}
            step={1}
            onChange={setCols}
          />
          <Range
            label="ROWS"
            value={rows}
            min={2}
            max={9}
            step={1}
            onChange={setRows}
          />
          <Range
            label="LIVES"
            value={lives}
            min={1}
            max={6}
            step={1}
            onChange={setLives}
          />
          <Range
            label="BALL SPEED"
            value={ballSpeed}
            min={0.6}
            max={2.2}
            step={0.1}
            onChange={setBallSpeed}
            fmt={(v) => v.toFixed(1) + "×"}
          />
          <Range
            label="PADDLE"
            value={paddleWidth}
            min={36}
            max={140}
            step={4}
            onChange={setPaddleWidth}
          />
          <ActionButton
            label="RESTART"
            onClick={() => setRestartKey((k) => k + 1)}
          />
        </>
      }
    >
      <BreakoutMicro
        className="h-full w-full !rounded-none"
        cols={cols}
        rows={rows}
        lives={lives}
        ballSpeed={ballSpeed}
        paddleWidth={paddleWidth}
        restartKey={restartKey}
      />
    </ExperimentShell>
  );
}
