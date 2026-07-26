"use client";

import { useMemo } from "react";

// Petites bulles de poison flottantes, uniquement quand on est maudit.
// Purement décoratif : pointer-events désactivés pour ne jamais gêner les clics.
export default function MoodEffects({ mood }: { mood: "hot" | "cold" | "cursed" | "neutral" }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        left: Math.round(6 + ((i * 37) % 90)),
        size: 10 + ((i * 13) % 22),
        delay: (i * 0.9).toFixed(1),
        duration: (7 + (i % 4)).toFixed(1),
      })),
    []
  );

  if (mood !== "cursed") return null;

  return (
    <div className="poison-overlay" aria-hidden="true">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="poison-bubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
      <div className="poison-drip" />
    </div>
  );
}
