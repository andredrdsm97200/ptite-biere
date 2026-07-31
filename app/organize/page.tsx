import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProfileMenu from "@/components/ProfileMenu";
import BottomNav from "@/components/BottomNav";
import CancelInviteButton from "@/components/CancelInviteButton";
import EditInviteForm from "@/components/EditInviteForm";
import { IconPin } from "@/components/icons";

export default async function OrganizePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const invites = await prisma.invite.findMany({
    where: { hostId: me.id },
    include: { recipients: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const active = invites.filter((i) => !i.cancelledAt && Date.now() - i.createdAt.getTime() < 24 * 60 * 60 * 1000);
  const past = invites.filter((i) => i.cancelledAt || Date.now() - i.createdAt.getTime() >= 24 * 60 * 60 * 1000);

  function timeAgo(date: Date) {
    const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
    if (days <= 0) return "aujourd'hui";
    if (days === 1) return "hier";
    return `il y a ${days} jours`;
  }

  return (
    <div className="screen">
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">📍</span> Organiser
        </div>
        <ProfileMenu username={me.username} avatarUrl={me.avatarUrl} />
      </div>

      <div className="scroll">
        <div className="container">
          <Link href="/invite/new" className="btn btn-primary" style={{ textDecoration: "none", marginBottom: 18 }}>
            + Nouvel appel
          </Link>

          {invites.length === 0 && (
            <p className="empty">Tu n'as encore organisé aucune soirée. Lance-toi !</p>
          )}

          {active.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 0 }}>En cours</div>
              {active.map((invite) => {
                const joined = invite.recipients.filter((r) => r.status === "JOINED").length;
                return (
                  <div key={invite.id} className="card" style={{ borderLeft: "4px solid var(--amber)", marginBottom: 10 }}>
                    <div className="row">
                      <strong>
                        <span style={{ color: "var(--copper)", display: "inline-flex", verticalAlign: "middle", marginRight: 4 }}>
                          <IconPin size={13} />
                        </span>
                        {invite.location}
                      </strong>
                      <span className="pill" style={{ background: "rgba(242,169,59,.15)", color: "var(--amber)" }}>
                        {joined}/{invite.recipients.length} ok
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "6px 0 8px" }}>
                      "{invite.message.length > 70 ? invite.message.slice(0, 70) + "…" : invite.message}"
                    </p>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <EditInviteForm inviteId={invite.id} message={invite.message} location={invite.location} />
                      <CancelInviteButton inviteId={invite.id} />
                      <Link href={`/invite/${invite.id}`} className="link-muted" style={{ fontSize: 12, alignSelf: "center" }}>
                        Voir →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {past.length > 0 && (
            <>
              <div className="section-title">Historique</div>
              {past.map((invite) => {
                const joined = invite.recipients.filter((r) => r.status === "JOINED").length;
                return (
                  <Link
                    key={invite.id}
                    href={`/invite/${invite.id}`}
                    className="card"
                    style={{ display: "block", borderLeft: "4px solid var(--foam-dim)", opacity: 0.75, marginBottom: 10, textDecoration: "none", color: "inherit" }}
                  >
                    <div className="row">
                      <strong>{invite.location}</strong>
                      <span className="pill">{invite.cancelledAt ? "Annulée" : timeAgo(invite.createdAt)}</span>
                    </div>
                    {!invite.cancelledAt && (
                      <p style={{ fontSize: 12, color: "var(--foam-dim)", margin: "6px 0 0" }}>
                        {joined}/{invite.recipients.length} sont venus
                      </p>
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>

      <BottomNav username={me.username} />
    </div>
  );
}
