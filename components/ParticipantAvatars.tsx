import ChopeArt from "./ChopeArt";
import type { ChopeInfo } from "@/lib/chope";

type Participant = { id: string; username: string; status: string };

export default function ParticipantAvatars({
  participants,
  chopeMap,
}: {
  participants: Participant[];
  chopeMap: Record<string, ChopeInfo>;
}) {
  return (
    <div className="avatars-row">
      {participants.map((p, i) => {
        const joined = p.status === "JOINED";
        const gone = p.status === "DECLINED" || p.status === "CANCELLED";
        return (
          <div
            key={p.id}
            className={`avatar-chip ${gone ? "avatar-ghost" : ""}`}
            title={`${p.username} — ${joined ? "j'y serai" : gone ? "ne vient pas" : "pas encore répondu"}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="avatar-circle">{joined ? "👤" : gone ? "💨" : "👻"}</div>
            {joined && chopeMap[p.id] && (
              <span className="avatar-chope">
                <ChopeArt tier={chopeMap[p.id].tierIndex} size={16} seed={"av-" + p.id} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
