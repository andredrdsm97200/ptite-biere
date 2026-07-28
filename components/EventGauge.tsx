export default function EventGauge({ joined, total }: { joined: number; total: number }) {
  const pct = total > 0 ? Math.round((joined / total) * 100) : 0;
  const bubbleCount = Math.min(joined, 6);

  return (
    <div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${pct}%` }}>
          {Array.from({ length: bubbleCount }).map((_, i) => (
            <span
              key={i}
              className="gauge-bubble"
              style={{ left: `${8 + i * 14}%`, animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
      <p className="gauge-label">
        🍺 {joined}/{total} — {pct >= 60 ? "la soirée décolle !" : pct > 0 ? "ça se prépare..." : "en attente des premiers"}
      </p>
    </div>
  );
}
