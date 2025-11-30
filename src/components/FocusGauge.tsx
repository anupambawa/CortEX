// src/components/FocusGauge.tsx
"use client";
import React from "react";

export default function FocusGauge({
  value,
  label = "Focus",
}: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * 42; // r=42
  return (
    <div className="flex flex-col items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="#0f172a"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="#38bdf8"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference - (clamped / 100) * circumference
          }
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="fill-slate-600 text-[18px] font-semibold"
        >
          {clamped}
        </text>
        <text
          x="50"
          y="64"
          textAnchor="middle"
          className="fill-slate-600 text-[10px]"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
