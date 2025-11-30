export default function BrainInsightCard({ alpha, beta, theta, delta, gamma }) {
    const dominant = Object.entries({ alpha, beta, theta, delta, gamma })
        .sort((a, b) => b[1] - a[1])[0][0];

    const mapping = {
        alpha: "Relaxed / Calm",
        beta: "Focus / Thinking",
        theta: "Meditative / Deep daydream",
        delta: "Drowsy / Tired",
        gamma: "Processing / High cognitive load",
    };

    return (
        <div className="h-full flex flex-col justify-center items-center text-center p-4">
            <h3 className="text-lg font-semibold text-amber-600">Brain Insight</h3>

            <div className="mt-3 text-xl font-bold capitalize">
                {dominant}
            </div>

            <p className="text-sm mt-1 text-stone-500">
                {mapping[dominant]}
            </p>

            <div className="mt-4 text-xs text-stone-400">
                {`α:${alpha.toFixed(2)} β:${beta.toFixed(2)} θ:${theta.toFixed(2)} δ:${delta.toFixed(2)} γ:${gamma.toFixed(2)}`}
            </div>
        </div>
    );
}
