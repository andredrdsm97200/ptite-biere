"use client";

// Dix chopes dessinées à la main en SVG, une par palier — pas des emoji.
// Chaque palier a sa propre silhouette ou sa propre décoration :
// gobelet fin et cabossé -> verre -> gravures -> cuivre riveté -> bandes
// vikings -> couronne dorée -> facettes de cristal -> étoiles cosmiques ->
// flammes légendaires. `seed` évite les collisions d'ID de dégradé quand
// plusieurs chopes s'affichent sur la même page.

export default function ChopeArt({ tier, size = 56, seed = "x" }: { tier: number; size?: number; seed?: string }) {
  const id = (name: string) => `chope-${seed}-${tier}-${name}`;

  // --- Palier 0 : Gobelet plastique — fin, translucide, un peu cabossé ---
  if (tier === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={id("cup")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8e4dc" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c9c4b8" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path d="M22 22 L42 22 L39 50 Q32 53 25 50 Z" fill={`url(#${id("cup")})`} stroke="#8a8578" strokeWidth="1.2" />
        <path d="M25 27 L39 27 M24.3 33 L39.7 33 M23.7 39 L40.3 39" stroke="#8a8578" strokeOpacity="0.5" strokeWidth="0.8" />
        <ellipse cx="32" cy="22" rx="10" ry="2.4" fill="#f2eee6" fillOpacity="0.5" stroke="#8a8578" strokeWidth="1" />
        <path d="M27 30 L28 44" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  // Silhouette commune "vraie chope" pour les paliers 1 à 9 : corps + anse.
  const mugBody = "M16 24 H40 V47 Q40 52 35 52 H21 Q16 52 16 47 Z";
  const handle = "M40 29 Q52 29 52 38 Q52 47 40 47";

  // --- Palier 1 : Demi — petit verre, peu de mousse ---
  if (tier === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={id("beer")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6c96b" />
            <stop offset="100%" stopColor="#e0a233" />
          </linearGradient>
        </defs>
        <path d={mugBody} fill={`url(#${id("beer")})`} stroke="#3b2a1a" strokeWidth="1.4" />
        <path d={handle} fill="none" stroke="#3b2a1a" strokeWidth="2.6" />
        <path d="M16 27 H40" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" />
        <ellipse cx="28" cy="24" rx="12" ry="2.6" fill="#fbf3e4" />
      </svg>
    );
  }

  // --- Palier 2 : Chope classique — verre plein, mousse et bulles ---
  if (tier === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={id("beer")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8ce74" />
            <stop offset="100%" stopColor="#dc9827" />
          </linearGradient>
        </defs>
        <path d={mugBody} fill={`url(#${id("beer")})`} stroke="#3b2a1a" strokeWidth="1.4" />
        <path d={handle} fill="none" stroke="#3b2a1a" strokeWidth="2.6" />
        <path d="M17 20 Q22 14 28 19 Q33 13 39 18 Q41 21 39 24 H18 Q16 22 17 20 Z" fill="#fbf3e4" stroke="#3b2a1a" strokeWidth="1" />
        <circle cx="24" cy="36" r="1.3" fill="#fff" fillOpacity="0.6" />
        <circle cx="30" cy="42" r="1" fill="#fff" fillOpacity="0.5" />
        <circle cx="26" cy="46" r="0.9" fill="#fff" fillOpacity="0.5" />
      </svg>
    );
  }

  // --- Palier 3 : Chope gravée — motifs ciselés sur le verre ---
  if (tier === 3) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={id("beer")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8ce74" />
            <stop offset="100%" stopColor="#dc9827" />
          </linearGradient>
        </defs>
        <path d={mugBody} fill={`url(#${id("beer")})`} stroke="#3b2a1a" strokeWidth="1.4" />
        <path d={handle} fill="none" stroke="#3b2a1a" strokeWidth="2.6" />
        <path d="M17 20 Q22 14 28 19 Q33 13 39 18 Q41 21 39 24 H18 Q16 22 17 20 Z" fill="#fbf3e4" stroke="#3b2a1a" strokeWidth="1" />
        <path d="M20 30 Q28 34 20 38 M36 30 Q28 34 36 38" stroke="#8a5a1e" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M22 42 H34" stroke="#8a5a1e" strokeWidth="1" strokeDasharray="1.5 2" />
        <path d="M18 26 L20 24" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" />
      </svg>
    );
  }

  // --- Palier 4 : Chope en cuivre — métal riveté, reflet chaud ---
  if (tier === 4) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={id("copper")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e08a4a" />
            <stop offset="55%" stopColor="#b5622a" />
            <stop offset="100%" stopColor="#7a3f1c" />
          </linearGradient>
        </defs>
        <path d={mugBody} fill={`url(#${id("copper")})`} stroke="#4a2712" strokeWidth="1.4" />
        <path d={handle} fill="none" stroke="#4a2712" strokeWidth="3" />
        <ellipse cx="28" cy="24" rx="12" ry="2.4" fill="#fbf3e4" fillOpacity="0.9" />
        {[20, 26, 32, 36].map((cx) => (
          <circle key={cx} cx={cx} cy={30} r="1.1" fill="#3a2010" />
        ))}
        {[20, 26, 32, 36].map((cx) => (
          <circle key={"b" + cx} cx={cx} cy={44} r="1.1" fill="#3a2010" />
        ))}
        <path d="M19 27 L19 47" stroke="#fbd9a8" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // --- Palier 5 : Chope Viking — corne cerclée de fer, robuste ---
  if (tier === 5) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={id("horn")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9b28a" />
            <stop offset="100%" stopColor="#8a6a44" />
          </linearGradient>
        </defs>
        <path d="M24 18 Q20 34 26 50 Q32 54 38 50 Q44 34 38 18 Z" fill={`url(#${id("horn")})`} stroke="#3b2a1a" strokeWidth="1.4" />
        <path d="M40 26 Q50 27 49 37 Q48 45 39 44" fill="none" stroke="#3b2a1a" strokeWidth="2.6" />
        <rect x="21" y="24" width="20" height="3.5" rx="1" fill="#5a5a60" stroke="#2a2a2e" strokeWidth="0.8" />
        <rect x="23" y="38" width="17" height="3.5" rx="1" fill="#5a5a60" stroke="#2a2a2e" strokeWidth="0.8" />
        <path d="M25 19 Q22 32 27 47" stroke="#fbf3e4" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="31" cy="20" rx="7" ry="2" fill="#fbf3e4" />
      </svg>
    );
  }

  // --- Palier 6 : Chope Royale — or et couronne ---
  if (tier === 6) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={id("gold")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe08a" />
            <stop offset="100%" stopColor="#d4a017" />
          </linearGradient>
        </defs>
        <path d={mugBody} fill={`url(#${id("gold")})`} stroke="#7a5a06" strokeWidth="1.4" />
        <path d={handle} fill="none" stroke="#7a5a06" strokeWidth="2.8" />
        <path d="M20 12 L23 18 L28 11 L32 18 L36 11 L40 18 L38 22 H21 Z" fill="#ffd23f" stroke="#7a5a06" strokeWidth="1" />
        <circle cx="28" cy="14" r="1.4" fill="#e2685c" />
        <path d="M19 27 H39" stroke="#fff8e0" strokeOpacity="0.6" strokeWidth="1.4" />
        <path d="M20 26 L20 47" stroke="#fff2b8" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // --- Palier 7 : Chope Cristal — transparence et facettes ---
  if (tier === 7) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={id("crystal")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eaf6ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#9fd8f0" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path d={mugBody} fill={`url(#${id("crystal")})`} stroke="#4a90a4" strokeWidth="1.3" />
        <path d={handle} fill="none" stroke="#4a90a4" strokeWidth="2.4" />
        <path d="M22 26 L28 52 M28 26 L26 52 M34 26 L36 52" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" />
        <path d="M16 30 L24 24 L32 30 L40 24" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" fill="none" />
        <ellipse cx="28" cy="24" rx="12" ry="2.4" fill="#fff" fillOpacity="0.85" />
        <path d="M20 30 L22 33 L20 36" stroke="#fff" strokeWidth="1" fill="none" strokeOpacity="0.8" />
      </svg>
    );
  }

  // --- Palier 8 : Chope Cosmique — nuit étoilée dans le verre ---
  if (tier === 8) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <radialGradient id={id("cosmos")} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#4a2f8a" />
            <stop offset="100%" stopColor="#1a1030" />
          </radialGradient>
        </defs>
        <path d={mugBody} fill={`url(#${id("cosmos")})`} stroke="#b79ad9" strokeWidth="1.3" />
        <path d={handle} fill="none" stroke="#b79ad9" strokeWidth="2.6" />
        {[[22, 30], [33, 34], [26, 40], [36, 44], [29, 47], [24, 45]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 1.1 : 0.7} fill="#fff" fillOpacity="0.9" />
        ))}
        <ellipse cx="28" cy="24" rx="12" ry="2.4" fill="#e0d4ff" fillOpacity="0.85" />
        <path d="M19 27 Q28 30 39 27" stroke="#c9a8ff" strokeOpacity="0.4" strokeWidth="1" fill="none" />
      </svg>
    );
  }

  // --- Palier 9 : Chope Légendaire — flammes et lueur dorée ---
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <defs>
        <linearGradient id={id("fire")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffcf5c" />
          <stop offset="100%" stopColor="#e8622c" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffcf5c" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffcf5c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="28" cy="36" r="24" fill={`url(#${id("glow")})`} />
      <path d={mugBody} fill={`url(#${id("fire")})`} stroke="#7a2c0e" strokeWidth="1.4" />
      <path d={handle} fill="none" stroke="#7a2c0e" strokeWidth="2.8" />
      <path
        d="M20 10 Q17 15 21 17 Q19 20 23 21 Q22 16 26 15 Q23 13 24 9 Q21 9 20 10 Z"
        fill="#ffcf5c"
        stroke="#c94f1f"
        strokeWidth="0.8"
      />
      <path
        d="M32 8 Q29 13 33 15 Q31 18 35 19 Q34 14 38 13 Q35 11 36 7 Q33 7 32 8 Z"
        fill="#ffe08a"
        stroke="#c94f1f"
        strokeWidth="0.8"
      />
      <ellipse cx="28" cy="24" rx="12" ry="2.4" fill="#fff2d6" />
      {[22, 27, 32].map((cx) => (
        <circle key={cx} cx={cx} cy={18} r="0.8" fill="#fff2d6" fillOpacity="0.9" />
      ))}
    </svg>
  );
}
