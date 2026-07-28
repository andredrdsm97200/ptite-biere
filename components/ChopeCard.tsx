import type { ChopeInfo } from "@/lib/chope";
import ChopeArt from "./ChopeArt";

export default function ChopeCard({ chope, seed }: { chope: ChopeInfo; seed?: string }) {
  return (
    <div className="chope-card">
      <div className="chope-icon">
        <ChopeArt tier={chope.tierIndex} size={72} seed={seed || "card"} />
      </div>
      <p className="chope-name">{chope.name}</p>
      <p className="chope-sub">
        {chope.isMax ? "Palier maximum atteint !" : `Encore un effort avant : ${chope.nextName}`}
      </p>
      <div className="chope-progress-track">
        <div className="chope-progress-fill" style={{ width: `${chope.progressPct}%` }} />
      </div>
      {!chope.isMax && <p className="chope-progress-label">{chope.progressPct}% jusqu'au prochain palier</p>}
    </div>
  );
}
