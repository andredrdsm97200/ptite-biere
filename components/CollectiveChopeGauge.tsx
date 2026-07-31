"use client";

import { useEffect, useRef, useState } from "react";

const DECLIC_THRESHOLD = 5;
const SCALE_TICKS = [0, 2, 4, 6, 8, 10];

// La chope collective : son niveau reflète le nombre d'amis "chauds" en ce
// moment (plafonné à 10 pour le remplissage, au-delà ça déborde). La mousse
// n'apparaît que lorsque la chope est totalement pleine — jamais avant.
// Un halo pulsé grandit avec le nombre de chauds, et un petit effet de
// coulée se déclenche quand quelqu'un vient de se déclarer chaud.
export default function CollectiveChopeGauge({ hotCount }: { hotCount: number }) {
  const [pouring, setPouring] = useState(false);
  const prevHot = useRef(hotCount);

  useEffect(() => {
    if (hotCount > prevHot.current) {
      setPouring(true);
      const t = setTimeout(() => setPouring(false), 1100);
      prevHot.current = hotCount;
      return () => clearTimeout(t);
    }
    prevHot.current = hotCount;
  }, [hotCount]);

  const capped = Math.min(hotCount, 10);
  const pct = Math.round((capped / 10) * 100);
  const overflowing = hotCount >= 10;

  const glassBottom = 116;
  const glassTop = 40;
  const liquidY = glassBottom - (pct / 100) * (glassBottom - glassTop);

  const intensity = Math.min(1, hotCount / 10);

  return (
    <div className="collective-gauge-wrap">
      <div className="collective-scale">
        {[...SCALE_TICKS].reverse().map((t) => (
          <span key={t} className={hotCount >= t && t > 0 ? "reached" : ""}>
            {t === 10 ? "10+" : t}
          </span>
        ))}
        <div className="collective-scale-marker" style={{ bottom: `${Math.min(100, (hotCount / 10) * 100)}%` }} />
      </div>

      <div className="collective-glass-col">
        <div
          className={`mug-glow ${hotCount > 0 ? "on" : ""}`}
          style={{
            opacity: hotCount > 0 ? 0.35 + intensity * 0.65 : 0,
            animationDuration: `${2.8 - intensity * 1.4}s`,
          }}
        />
        <svg width="120" height="140" viewBox="0 0 120 140">
          <defs>
            <linearGradient id="cg-beer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2a93b" />
              <stop offset="100%" stopColor="#dc9827" />
            </linearGradient>
            <clipPath id="cg-clip">
              <path d="M28 40 H80 V108 Q80 116 72 116 H36 Q28 116 28 108 Z" />
            </clipPath>
          </defs>

          <ellipse cx="54" cy="122" rx="30" ry="5" fill="#000" opacity="0.2" />
          <path d="M80 52 Q100 52 100 68 Q100 84 80 84" fill="none" stroke="#3b2a1a" strokeWidth="5" />
          <path d="M28 40 H80 V108 Q80 116 72 116 H36 Q28 116 28 108 Z" fill="none" stroke="#3b2a1a" strokeWidth="2.5" />

          <g clipPath="url(#cg-clip)">
            <rect
              x="26"
              y={liquidY}
              width="56"
              height={glassBottom - liquidY}
              fill="url(#cg-beer)"
              className="collective-liquid"
            />
            <circle cx="46" cy="90" r="4" fill="#fff8ea" opacity="0.7" />
          </g>

          {/* la mousse n'apparaît que lorsque c'est totalement plein */}
          <g style={{ opacity: pct >= 100 ? 1 : 0, transition: "opacity 0.4s ease" }}>
            <path
              d="M28 40 Q30 30 38 32 Q44 24 54 30 Q62 22 70 30 Q78 28 80 38 Q80 40 80 40 H28 Z"
              fill="#fbf3e4"
              stroke="#3b2a1a"
              strokeWidth="2"
            />
            <path d="M40 40 Q38 52 40 62 Q42 66 44 62 Q46 52 44 40 Z" fill="#fbf3e4" />
            <path d="M64 40 Q62 50 64 58 Q66 62 68 58 Q70 50 68 40 Z" fill="#fbf3e4" />
          </g>
        </svg>

        {pouring && <div className="tap-pour pouring" />}

        {!overflowing && hotCount > 0 && hotCount < DECLIC_THRESHOLD && (
          <div className="collective-callout">Encore {DECLIC_THRESHOLD - hotCount}, c'est parti !</div>
        )}
      </div>
    </div>
  );
}
