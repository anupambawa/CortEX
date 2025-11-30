"use client";
import React from "react";
import { ModeHistoryEntry } from "./ModeSuggestionCard";

export function SessionTimeline({
  history,
  darkMode,
  onDownloadJSON,
}: {
  history: ModeHistoryEntry[];
  darkMode: boolean;
  onDownloadJSON: () => void;
}) {
  const bg = darkMode
    ? "bg-zinc-900/80 border-zinc-800"
    : "bg-white/90 border-amber-100";
  const text = darkMode ? "text-zinc-100" : "text-zinc-800";
  const sub = darkMode ? "text-zinc-400" : "text-zinc-500";

  return (
    <div
      className={`mt-2 rounded-xl border px-3 py-2 sm:px-4 sm:py-3 ${bg}`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-semibold ${text}`}>
          Session Timeline
        </span>
        <button
          onClick={onDownloadJSON}
          className="text-[0.7rem] underline underline-offset-2 cursor-pointer text-amber-400"
        >
          Export JSON
        </button>
      </div>
      {history.length === 0 ? (
        <p className={`text-[0.7rem] ${sub}`}>
          No modes run yet. When you start a suggested mode, it will
          appear here with before/after metrics.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto py-1">
          {history.map((h) => {
            const start = new Date(h.startedAt);
            return (
              <div
                key={h.id}
                className="min-w-[150px] rounded-lg border border-zinc-700/40 px-2 py-1.5 text-[0.7rem]"
              >
                <div className="flex justify-between mb-1">
                  <span className={`font-semibold capitalize ${text}`}>
                    {h.mode}
                  </span>
                  <span className={sub}>
                    {start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className={`flex justify-between ${sub}`}>
                  <span>Focus</span>
                  <span>
                    {h.beforeSummary.focus}
                    {h.afterSummary &&
                      ` → ${h.afterSummary.focus}`}
                  </span>
                </div>
                <div className={`flex justify-between ${sub}`}>
                  <span>Stress</span>
                  <span>
                    {h.beforeSummary.stress}
                    {h.afterSummary &&
                      ` → ${h.afterSummary.stress}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
