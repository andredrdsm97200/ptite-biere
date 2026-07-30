import Link from "next/link";

const THRESHOLD = 5;

export default function DeclicCard({ hotCount }: { hotCount: number }) {
  if (hotCount < THRESHOLD) return null;

  return (
    <Link href="/invite/new" className="declic-card">
      <span className="declic-emoji">🍺</span>
      <div>
        <p className="declic-title">Ça sent la P'tite bière...</p>
        <p className="declic-sub">{hotCount} potes sont chauds en même temps. Lance une soirée ?</p>
      </div>
    </Link>
  );
}
