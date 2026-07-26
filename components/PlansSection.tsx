import Link from "next/link";
import BadgeInline from "./BadgeInline";

type ReceivedRow = {
  id: string;
  status: string;
  invite: { id: string; host: { username: string }; hostId: string; message: string };
};
type SentInvite = {
  id: string;
  location: string;
  message: string;
  recipients: { status: string }[];
};

const statusMeta: Record<string, { text: string; className: string }> = {
  SENT: { text: "À répondre", className: "plan-tag pending" },
  SEEN: { text: "À répondre", className: "plan-tag pending" },
  JOINED: { text: "J'y serai 🍻", className: "plan-tag joined" },
  DECLINED: { text: "Décliné", className: "plan-tag declined" },
  CANCELLED: { text: "Annulé", className: "plan-tag declined" },
};

export default function PlansSection({
  received,
  sent,
  badgeMap,
}: {
  received: ReceivedRow[];
  sent: SentInvite[];
  badgeMap: Record<string, { icon: string; title: string }[]>;
}) {
  const hasAny = received.length > 0 || sent.length > 0;

  return (
    <div className="plans-block">
      <div className="plans-header">🎉 Mes plans du soir</div>

      {!hasAny && (
        <div className="plans-empty">
          Rien de prévu ce soir... encore. Lance un appel, ou attends qu'un pote craque.
        </div>
      )}

      {received.map((r) => (
        <Link key={r.id} href={`/invite/${r.invite.id}`} className={`plan-card ${statusMeta[r.status].className}`}>
          <div className="plan-card-top">
            <strong>
              {r.invite.host.username}
              <BadgeInline badges={badgeMap[r.invite.hostId]} />
            </strong>
            <span className="plan-tag-pill">{statusMeta[r.status].text}</span>
          </div>
          <p className="plan-card-msg">
            {r.invite.message.length > 80 ? r.invite.message.slice(0, 80) + "…" : r.invite.message}
          </p>
        </Link>
      ))}

      {sent.map((invite) => {
        const joined = invite.recipients.filter((r) => r.status === "JOINED").length;
        return (
          <Link key={invite.id} href={`/invite/${invite.id}`} className="plan-card hosting">
            <div className="plan-card-top">
              <strong>📣 {invite.location}</strong>
              <span className="plan-tag-pill">{joined}/{invite.recipients.length} ok</span>
            </div>
            <p className="plan-card-msg">
              {invite.message.length > 80 ? invite.message.slice(0, 80) + "…" : invite.message}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
