"use client";

// La chope collective : son niveau reflète le % d'amis "chauds" en ce moment.
// À 10 amis chauds ou plus, elle déborde en continu. Le remplissage est
// animé (transition CSS), le liquide oscille légèrement, quelques bulles
// montent, et des gouttes coulent en cas de débordement.
export default function CollectiveChopeGauge({ hotCount }: { hotCount: number }) {
  const pct = Math.min(100, Math.round((hotCount / 10) * 100));
  const overflowing = hotCount >= 10;

  // Le niveau du liquide dans le repère du SVG (glass va de y=24 à y=100).
  const glassTop = 24;
  const glassBottom = 100;
  const liquidY = glassBottom - (pct / 100) * (glassBottom - glassTop);

  const bubbleCount = Math.max(2, Math.min(7, Math.round((hotCount / 10) * 7)));

  return (
    <div className="collective-gauge-wrap">
      <svg width="120" height="140" viewBox="0 0 120 140" className={overflowing ? "collective-glow" : ""}>
        <defs>
          <linearGradient id="cg-beer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8ce74" />
            <stop offset="100%" stopColor="#dc9827" />
          </linearGradient>
          <clipPath id="cg-clip">
            <path d="M30 24 H90 V96 Q90 106 80 106 H40 Q30 106 30 96 Z" />
          </clipPath>
        </defs>

        {/* Verre (contour) */}
        <path d="M30 24 H90 V96 Q90 106 80 106 H40 Q30 106 30 96 Z" fill="rgba(242,238,230,0.04)" stroke="rgba(242,238,230,0.25)" strokeWidth="2" />
        {/* Anse */}
        <path d="M90 40 Q108 40 108 58 Q108 76 90 76" fill="none" stroke="rgba(242,238,230,0.25)" strokeWidth="4" />

        {/* Liquide, animé via clipPath */}
        <g clipPath="url(#cg-clip)">
          <rect
            x="28"
            y={liquidY}
            width="64"
            height={glassBottom - liquidY + 10}
            fill="url(#cg-beer)"
            className="collective-liquid"
          />
          {/* légère oscillation de surface */}
          <ellipse cx="60" cy={liquidY} rx="34" ry="3" fill="#f8ce74" opacity="0.7" className="collective-wave" />
          {Array.from({ length: bubbleCount }).map((_, i) => (
            <circle
              key={i}
              cx={38 + ((i * 11) % 44)}
              cy={100}
              r={1.4 + (i % 3) * 0.4}
              fill="#fff"
              opacity="0.55"
              className="collective-bubble"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </g>

        {/* Mousse, grossit avec le niveau */}
        {pct > 5 && (
          <ellipse
            cx="60"
            cy={liquidY}
            rx="32"
            ry={4 + (pct / 100) * 6}
            fill="#fbf3e4"
            className="collective-foam"
          />
        )}

        {/* Débordement continu si 10+ */}
        {overflowing && (
          <>
            <path d="M32 22 Q30 30 34 36" stroke="#fbf3e4" strokeWidth="2.5" fill="none" strokeLinecap="round" className="collective-drip" style={{ animationDelay: "0s" }} />
            <path d="M60 20 Q58 30 62 38" stroke="#fbf3e4" strokeWidth="2.5" fill="none" strokeLinecap="round" className="collective-drip" style={{ animationDelay: "0.6s" }} />
            <path d="M86 22 Q88 30 84 36" stroke="#fbf3e4" strokeWidth="2.5" fill="none" strokeLinecap="round" className="collective-drip" style={{ animationDelay: "1.1s" }} />
          </>
        )}
      </svg>
      <p className="collective-gauge-label">
        {hotCount === 0
          ? "Personne de chaud pour l'instant"
          : overflowing
          ? "🍺 Ça déborde — le groupe est prêt !"
          : `🍺 ${hotCount} pote${hotCount > 1 ? "s" : ""} chaud${hotCount > 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
