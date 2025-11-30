// src/lib/modeEngine.ts
export type Mode = "clarity" | "flow" | "refresh";

export interface SideBands {
  alpha: number;
  beta: number;
  theta: number;
  delta: number;
  gamma?: number;
}

export interface FeaturesSnapshot {
  ts: number;
  left: SideBands;
  right: SideBands;
  blinkRate: number; // blinks/min
  eyeDrift: number;
  emgRMS: number;
  sqi: number; // 0..1
}

export interface Baselines {
  BA: number;          // beta / alpha
  theta: number;
  betaRel: number;
  thetaRel: number;
  alphaRel: number;
  blinkRate: number;
  emgRMS: number;
}

// Summaries you show in the middle column
export interface SummaryMetrics {
  focusScore: number;   // 0..100
  stress: number;       // 0..100
  fatigue: number;      // 0..100
  engagement: number;   // 0..100
}

export interface ModeSuggestion {
  mode: Mode;
  reason: string;
  confidence: number; // 0..1
}

export interface ModeEngineResult {
  summary: SummaryMetrics;
  suggestion: ModeSuggestion | null;
}

export const defaultBaselines: Baselines = {
  BA: 1,
  theta: 1,
  betaRel: 0.25,
  thetaRel: 0.15,
  alphaRel: 0.25,
  blinkRate: 12,
  emgRMS: 0.05,
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function computeRelativeBands(bands: SideBands) {
  const total =
    bands.alpha +
    bands.beta +
    bands.theta +
    bands.delta +
    (bands.gamma ?? 0) +
    1e-9;

  return {
    alphaRel: bands.alpha / total,
    betaRel: bands.beta / total,
    thetaRel: bands.theta / total,
    deltaRel: bands.delta / total,
    total,
  };
}

export function computeFocusScore(
  snap: FeaturesSnapshot,
  baselines: Baselines
): number {
  const avgAlpha = (snap.left.alpha + snap.right.alpha) / 2;
  const avgBeta = (snap.left.beta + snap.right.beta) / 2;
  const avgTheta = (snap.left.theta + snap.right.theta) / 2;

  const BA = avgBeta / (avgAlpha + 1e-6);
  const BA_norm = clamp01((BA / baselines.BA) / 2); // 0..1

  const thetaNorm = clamp01(avgTheta / (baselines.theta + 1e-6));
  const blinkNorm = clamp01(
    (snap.blinkRate / (baselines.blinkRate + 1e-6)) / 2
  );
  const emgNorm = clamp01((snap.emgRMS / (baselines.emgRMS + 1e-6)) / 2);

  const score =
    0.45 * BA_norm +
    0.25 * (1 - thetaNorm) +
    0.2 * (1 - blinkNorm) +
    0.1 * (1 - emgNorm);

  return Math.round(100 * clamp01(score));
}

export function computeStress(
  snap: FeaturesSnapshot,
  baselines: Baselines
): number {
  const leftRel = computeRelativeBands(snap.left);
  const rightRel = computeRelativeBands(snap.right);
  const betaRel = (leftRel.betaRel + rightRel.betaRel) / 2;

  const betaRelNorm = clamp01(betaRel / (baselines.betaRel + 1e-6));
  const emgNorm = clamp01((snap.emgRMS / (baselines.emgRMS + 1e-6)) / 2);
  const blinkNorm = clamp01(
    (snap.blinkRate / (baselines.blinkRate + 1e-6)) / 2
  );

  const stressIdx =
    0.5 * betaRelNorm + 0.3 * emgNorm + 0.2 * blinkNorm;

  return Math.round(100 * clamp01(stressIdx));
}

export function computeFatigue(
  snap: FeaturesSnapshot,
  baselines: Baselines
): number {
  const leftRel = computeRelativeBands(snap.left);
  const rightRel = computeRelativeBands(snap.right);

  const thetaRel = (leftRel.thetaRel + rightRel.thetaRel) / 2;
  const deltaRel = (leftRel.deltaRel + rightRel.deltaRel) / 2;
  const alphaRel = (leftRel.alphaRel + rightRel.alphaRel) / 2;

  const thetaRelNorm = clamp01(thetaRel / (baselines.thetaRel + 1e-6));
  const deltaRelNorm = clamp01(deltaRel / (0.15 + 1e-6)); // starter
  const alphaRelNorm = clamp01(alphaRel / (baselines.alphaRel + 1e-6));

  const fatigue =
    0.6 * (deltaRelNorm + thetaRelNorm) / 2 +
    0.4 * (1 - alphaRelNorm);

  return Math.round(100 * clamp01(fatigue));
}

export function computeEngagement(
  snap: FeaturesSnapshot
): number {
  const avgAlpha = (snap.left.alpha + snap.right.alpha) / 2;
  const avgBeta = (snap.left.beta + snap.right.beta) / 2;
  const avgTheta = (snap.left.theta + snap.right.theta) / 2;

  const denom = avgTheta + avgAlpha + 1e-6;
  const raw = avgBeta / denom; // higher = more engaged / focused
  // Normalize with heuristic range
  const norm = clamp01((raw - 0.5) / (2 - 0.5)); // map ~0.5..2 → 0..1

  return Math.round(norm * 100);
}

function averageSnapshots(
  snaps: FeaturesSnapshot[]
): FeaturesSnapshot | null {
  if (!snaps.length) return null;

  const sum = snaps.reduce(
    (acc, s) => {
      acc.left.alpha += s.left.alpha;
      acc.left.beta += s.left.beta;
      acc.left.theta += s.left.theta;
      acc.left.delta += s.left.delta;
      acc.left.gamma += s.left.gamma ?? 0;

      acc.right.alpha += s.right.alpha;
      acc.right.beta += s.right.beta;
      acc.right.theta += s.right.theta;
      acc.right.delta += s.right.delta;
      acc.right.gamma += s.right.gamma ?? 0;

      acc.blinkRate += s.blinkRate;
      acc.eyeDrift += s.eyeDrift;
      acc.emgRMS += s.emgRMS;
      acc.sqi += s.sqi;
      acc.ts = s.ts;
      return acc;
    },
    {
      ts: snaps[snaps.length - 1].ts,
      left: { alpha: 0, beta: 0, theta: 0, delta: 0, gamma: 0 },
      right: { alpha: 0, beta: 0, theta: 0, delta: 0, gamma: 0 },
      blinkRate: 0,
      eyeDrift: 0,
      emgRMS: 0,
      sqi: 0,
    } as FeaturesSnapshot
  );

  const n = snaps.length;
  return {
    ts: sum.ts,
    left: {
      alpha: sum.left.alpha / n,
      beta: sum.left.beta / n,
      theta: sum.left.theta / n,
      delta: sum.left.delta / n,
      gamma: (sum.left.gamma ?? 0) / n,
    },
    right: {
      alpha: sum.right.alpha / n,
      beta: sum.right.beta / n,
      theta: sum.right.theta / n,
      delta: sum.right.delta / n,
      gamma: (sum.right.gamma ?? 0) / n,
    },
    blinkRate: sum.blinkRate / n,
    eyeDrift: sum.eyeDrift / n,
    emgRMS: sum.emgRMS / n,
    sqi: sum.sqi / n,
  };
}

export class ModeEngine {
  private buffer: FeaturesSnapshot[] = [];
  private baselines: Baselines;

  constructor(baselines: Baselines = defaultBaselines) {
    this.baselines = baselines;
  }

  updateBaselines(partial: Partial<Baselines>) {
    this.baselines = { ...this.baselines, ...partial };
  }

  pushSnapshot(
    snap: FeaturesSnapshot,
    windowSize = 6
  ): ModeEngineResult {
    this.buffer.push(snap);
    if (this.buffer.length > windowSize) {
      this.buffer.splice(0, this.buffer.length - windowSize);
    }

    const avg = averageSnapshots(this.buffer) ?? snap;

    const focusScore = computeFocusScore(avg, this.baselines);
    const stress = computeStress(avg, this.baselines);
    const fatigue = computeFatigue(avg, this.baselines);
    const engagement = computeEngagement(avg);

    const summary: SummaryMetrics = {
      focusScore,
      stress,
      fatigue,
      engagement,
    };

    const suggestion = this.computeSuggestion(avg, summary);

    return { summary, suggestion };
  }

  private computeSuggestion(
    avg: FeaturesSnapshot,
    summary: SummaryMetrics
  ): ModeSuggestion | null {
    const leftRel = computeRelativeBands(avg.left);
    const rightRel = computeRelativeBands(avg.right);

    const thetaRel = (leftRel.thetaRel + rightRel.thetaRel) / 2;
    const alphaRel = (leftRel.alphaRel + rightRel.alphaRel) / 2;
    const betaRel = (leftRel.betaRel + rightRel.betaRel) / 2;

    const focus = summary.focusScore;

    const thetaRelAbs = thetaRel;
    const baselineTheta = this.baselines.theta;

    const emgNorm = avg.emgRMS / (this.baselines.emgRMS + 1e-6);
    const blinkNorm =
      avg.blinkRate / (this.baselines.blinkRate + 1e-6);

    // ---- Case A — Focus fatigue (low focus, theta rising) ----
    if (focus < 55 && thetaRelAbs > baselineTheta * 1.05) {
      return {
        mode: "clarity",
        reason: "Focus low and theta rising — likely fatigue.",
        confidence: 0.82,
      };
    }

    // ---- Case B — Tension / muscle stress ----
    if (emgNorm > 1.2 || summary.stress > 60) {
      return {
        mode: "refresh",
        reason: "High muscle tension / stress indicators.",
        confidence: 0.8,
      };
    }

    // ---- Case C — Low focus, low fatigue (distracted) ----
    if (
      focus < 65 &&
      thetaRelAbs <= baselineTheta * 1.05 &&
      emgNorm <= 1.1
    ) {
      return {
        mode: "flow",
        reason: "Low focus but not fatigued — likely distraction.",
        confidence: 0.75,
      };
    }

    // ---- Case D — Over-arousal (very high Beta, low Alpha) ----
    if (
      betaRel > this.baselines.betaRel * 1.4 &&
      alphaRel < this.baselines.alphaRel * 0.8
    ) {
      return {
        mode: "clarity",
        reason: "Over-arousal (high beta, low alpha).",
        confidence: 0.78,
      };
    }

    // ---- Case E — Short distraction (blink / drift spike) ----
    if (blinkNorm > 1.5 || Math.abs(avg.eyeDrift) > 0.05) {
      return {
        mode: "clarity",
        reason: "Short distraction detected (blink/eye drift spike).",
        confidence: 0.65,
      };
    }

    return null;
  }
}
