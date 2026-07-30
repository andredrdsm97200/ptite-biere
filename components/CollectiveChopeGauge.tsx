"use client";

import { IconBeer } from "./icons";

const DECLIC_THRESHOLD = 5;
const SCALE_MAX = 25;
const SCALE_TICKS = [0, 5, 10, 15, 20, 25];

// La chope collective : son niveau reflète le % d'amis "chauds" en ce moment,
// avec une échelle graduée à côté (façon jauge de labo) pour lire le nombre
// exact d'un coup d'œil. C'est LE moment signature de l'accueil.
export default function CollectiveChopeGauge({ hotCount }: { hotCount: number }) {
  const cappedForFill = Math.min(hotCount, 10);
  const pct = Math.round((cappedForFill / 10) * 100);
  const overflowing = hotCount >= 10;

  const glassTop = 24;
  const glassBottom = 100;
  const liquidY = glassBottom - (pct / 100) * (glassBottom - glassTop);
  const bubbleCount = Math.max(2, Math.min(7, Math.round((cappedForFill / 10) * 7)));

  // Position du repère sur l'échelle graduée (0 en bas, 25+ en haut).
  const markerPct = Math.min(100, (hotCount / SCALE_MAX) * 100);

  return (
    <div className="collective-gauge-wrap">
      <div className="collective-scale">
        {[...SCALE_TICKS].reverse().map((t) => (
          <span key={t} className={hotCount >= t && t > 0 ? "reached" : ""}>
            {t === SCALE_MAX ? `${t}+` : t}
          </span>
        ))}
        <div className="collective-scale-marker" style={{ bottom: `${markerPct}%` }} />
      </div>

      <div className="collective-glass-col">
        <svg width="120" height="140" viewBox="0 0 120 140" className={overflowing ? "collective-glow" : ""}>
          <defs>
            <linearGradient id="cg-beer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd98a" />
              <stop offset="55%" stopColor="#f8ce74" />
              <stop offset="100%" stopColor="#dc9827" />
            </linearGradient>
            <clipPath id="cg-clip">
              <path d="M30 24 H90 V96 Q90 106 80 106 H40 Q30 106 30 96 Z" />
            </clipPath>
          </defs>

          <path d="M30 24 H90 V96 Q90 106 80 106 H40 Q30 106 30 96 Z" fill="rgba(74,144,164,0.05)" stroke="rgba(74,144,164,0.45)" strokeWidth="2" />
          <path d="M90 40 Q108 40 108 58 Q108 76 90 76" fill="none" stroke="rgba(74,144,164,0.45)" strokeWidth="4" />

          <g clipPath="url(#cg-clip)">
            <rect x="28" y={liquidY} width="64" height={glassBottom - liquidY + 10} fill="url(#cg-beer)" className="collective-liquid" />
            <ellipse cx="60" cy={liquidY} rx="34" ry="3" fill="#ffd98a" opacity="0.7" className="collective-wave" />
            {Array.from({ length: bubbleCount }).map((_, i) => (
              <circle key={i} cx={38 + ((i * 11) % 44)} cy={100} r={1.4 + (i % 3) * 0.4} fill="#fff" opacity="0.55" className="collective-bubble" style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
          </g>

          {/* reflet de verre, effet premium */}
          <path d="M35 30 L35 92" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round" />
          <path d="M41 30 L41 60" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" />
          {/* gouttes de condensation */}
          <circle cx="76" cy="52" r="1.3" fill="rgba(255,255,255,0.4)" />
          <circle cx="82" cy="66" r="1" fill="rgba(255,255,255,0.3)" />
          <circle cx="70" cy="80" r="1.1" fill="rgba(255,255,255,0.35)" />

          {pct > 5 && <ellipse cx="60" cy={liquidY} rx="32" ry={4 + (pct / 100) * 6} fill="#fff8e8" className="collective-foam" />}

          {overflowing && (
            <>
              <path d="M32 22 Q30 30 34 36" stroke="#fff8e8" strokeWidth="2.5" fill="none" strokeLinecap="round" className="collective-drip" style={{ animationDelay: "0s" }} />
              <path d="M60 20 Q58 30 62 38" stroke="#fff8e8" strokeWidth="2.5" fill="none" strokeLinecap="round" className="collective-drip" style={{ animationDelay: "0.6s" }} />
              <path d="M86 22 Q88 30 84 36" stroke="#fff8e8" strokeWidth="2.5" fill="none" strokeLinecap="round" className="collective-drip" style={{ animationDelay: "1.1s" }} />
            </>
          )}
        </svg>

        {!overflowing && hotCount > 0 && hotCount < DECLIC_THRESHOLD && (
          <div className="collective-callout">Encore {DECLIC_THRESHOLD - hotCount} et c'est parti !</div>
        )}
      </div>
    </div>
  );
}
