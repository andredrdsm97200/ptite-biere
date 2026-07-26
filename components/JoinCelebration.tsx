"use client";

import { useEffect, useState } from "react";

export default function JoinCelebration({ onDone }: { onDone: () => void }) {
  const [pieces] = useState(() =>
    Array.from({ length: 10 }).map((_, i) => ({
      left: 10 + ((i * 37) % 80),
      delay: (i % 5) * 0.05,
      emoji: ["🎉", "✨", "🍺"][i % 3],
    }))
  );

  useEffect(() => {
    const t = setTimeout(onDone, 1100);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="celebration-overlay" aria-hidden="true">
      <div className="celebration-clink">🍻</div>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="celebration-confetti"
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s` }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
