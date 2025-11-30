"use client";
import React from "react";
import { ModeSuggestion, Mode } from "@/lib/modeEngine";
import { Sparkles, Wind, Brain, RotateCcw } from "lucide-react";

export interface ModeHistoryEntry {
  id: string;
  mode: Mode;
  startedAt: number;
  beforeSummary: {
    focus: number;
    stress: number;
    fatigue: number;
    engagement: number;
  };
  afterSummary?: {
    focus: number;
    stress: number;
    fatigue: number;
    engagement: number;
  };
}

export function ModeSuggestionCard({
  suggestion,
  summary,
  darkMode,
  onStart,
  onSnooze,
  onIgnore,
}: {
  suggestion: ModeSuggestion | null;
  summary: {
    focus: number;
    stress: number;
    fatigue: number;
    engagement: number;
  } | null;
  darkMode: boolean;
  onStart: (mode: Mode) => void;
  onSnooze: () => void;
  onIgnore: () => void;
}) {
  const bg = darkMode
    ? "bg-zinc-800/90 border-zinc-700/60"
    : "bg-white/95 border-amber-100";

  const text = darkMode ? "text-zinc-100" : "text-zinc-800";
  const sub = darkMode ? "text-zinc-400" : "text-zinc-500";

  if (!summary) {
    return (
      <div
        className={`rounded-xl border px-3 py-3 text-xs ${bg} ${sub}`}
      >
        Waiting for stable signal to suggest a mode…
      </div>
    );
  }

  const mode = suggestion?.mode ?? null;

  const title =
    mode === "clarity"
      ? "Clarity — Guided Breathing"
      : mode === "flow"
      ? "Flow — Visualization"
      : mode === "refresh"
      ? "Refresh — Muscle Relaxation"
      : "No Strong Suggestion";

  const description =
    suggestion?.reason ??
    "All metrics are within typical range. You can still start any mode manually.";

  const Icon =
    mode === "clarity"
      ? Wind
      : mode === "flow"
      ? Brain
      : mode === "refresh"
      ? RotateCcw
      : Sparkles;

  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className={`text-xs font-semibold ${text}`}>
            Suggested Mode
          </span>
          <span className={`text-sm ${sub}`}>{title}</span>
        </div>
      </div>

      <p className={`text-xs mb-2 ${sub}`}>{description}</p>

      <div className="grid grid-cols-2 gap-1 mb-2 text-[0.7rem]">
        <div className="flex justify-between">
          <span className={sub}>Focus</span>
          <span className={text}>{summary.focus}</span>
        </div>
        <div className="flex justify-between">
          <span className={sub}>Stress</span>
          <span className={text}>{summary.stress}</span>
        </div>
        <div className="flex justify-between">
          <span className={sub}>Fatigue</span>
          <span className={text}>{summary.fatigue}</span>
        </div>
        <div className="flex justify-between">
          <span className={sub}>Engagement</span>
          <span className={text}>{summary.engagement}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={() => mode && onStart(mode)}
          disabled={!mode}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-semibold cursor-pointer
            ${
              mode
                ? darkMode
                  ? "bg-amber-300 text-zinc-900 hover:bg-amber-200"
                  : "bg-amber-600 text-white hover:bg-amber-500"
                : "bg-zinc-600/40 text-zinc-400 cursor-not-allowed"
            }
          `}
        >
          {mode ? "Start Mode" : "No Suggestion"}
        </button>
        <button
          onClick={onSnooze}
          className={`px-2 py-1.5 rounded-md text-xs ${sub} border border-zinc-600/50 cursor-pointer`}
        >
          Snooze
        </button>
        <button
          onClick={onIgnore}
          className="px-2 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
