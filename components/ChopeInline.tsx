import type { ChopeInfo } from "@/lib/chope";
import ChopeArt from "./ChopeArt";

export default function ChopeInline({ chope, seed }: { chope?: ChopeInfo; seed?: string }) {
  if (!chope) return null;
  return (
    <span title={chope.name} style={{ marginRight: 6, display: "inline-flex", verticalAlign: "middle" }}>
      <ChopeArt tier={chope.tierIndex} size={20} seed={seed || "inline"} />
    </span>
  );
}
