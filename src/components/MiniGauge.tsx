"use client";
import React from "react";

type MiniGaugeProps = {
  label: string;
  value: number;
  darkMode: boolean;
};

export default function MiniGauge({ label, value, darkMode }: MiniGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const colorClass =
    clamped <= 33
      ? darkMode
        ? "text-emerald-300 bg-emerald-900/30"
        : "text-emerald-700 bg-emerald-100"
      : clamped <= 66
      ? darkMode
        ? "text-amber-300 bg-amber-900/30"
        : "text-amber-700 bg-amber-100"
      : darkMode
      ? "text-rose-300 bg-rose-900/30"
      : "text-rose-700 bg-rose-100";

  const barColor =
    clamped <= 33
      ? "#22c55e"
      : clamped <= 66
      ? "#eab308"
      : "#ef4444";

  return (
    <div
      className={`rounded-xl px-3 py-2 text-xs flex flex-col gap-1 ${colorClass}`}
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold">{label}</span>
        <span className="font-mono text-sm">{clamped}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700/30 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${clamped}%`,
            backgroundColor: barColor,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
