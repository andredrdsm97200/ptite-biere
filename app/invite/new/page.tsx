import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import { effectiveDrinkStatus } from "@/lib/drinkStatus";
import { getFriendStatuses, getCursedTodayIds } from "@/lib/invitable";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import InviteComposer from "@/components/InviteComposer";
import MoodEffects from "@/components/MoodEffects";
import { IconSettings } from "@/components/icons";

export default async function NewInvitePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const mood = await getUserMood(me.id, me.drinkStatus, me.drinkStatusDate);
  const intense = mood === "cursed" ? await isCurseFresh(me.id) : false;

  const friendships = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: { userA: true, userB: true },
  });
  const friendUsers = friendships.map((f) => (f.userAId === me.id ? f.userB : f.userA));
  const friendStatuses = await getFriendStatuses(friendUsers.map((u) => u.id));
  const cursedIds = await getCursedTodayIds(friendUsers.map((u) => u.id));

  const friends = friendUsers
    .map((u) => {
      const status = effectiveDrinkStatus(u.drinkStatus, u.drinkStatusDate);
      const state: "UNAVAILABLE" | "AVAILABLE" | "NEUTRAL" =
        friendStatuses[u.id] === "UNAVAILABLE" ? "UNAVAILABLE" : status === "AVAILABLE" ? "AVAILABLE" : "NEUTRAL";
      return { id: u.id, username: u.username, state, cursed: cursedIds.has(u.id) };
    })
    .sort((a, b) => {
      const rank = { AVAILABLE: 0, NEUTRAL: 1, UNAVAILABLE: 2 };
      return rank[a.state] - rank[b.state];
    });

  const teams = await prisma.team.findMany({
    where: { ownerId: me.id },
    include: { members: true },
    orderBy: [{ favorite: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className={`screen ${intense ? "mood-intense" : ""}`} data-mood={mood}>
      <MoodEffects mood={mood} intense={intense} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">📣</span> Lancer un appel
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/settings" className="nav-link" style={{ padding: "6px 8px", display: "flex", color: "var(--foam-dim)" }} title="Réglages"><IconSettings size={19} /></Link>
          <NotificationBell />
          <LogoutButton />
        </div>
      </div>
      <div className="container">
        <InviteComposer
          friends={friends}
          teams={teams.map((t) => ({ id: t.id, name: t.name, icon: t.icon, memberIds: t.members.map((m) => m.userId) }))}
        />
      </div>
      <BottomNav username={me.username} />
    </div>
  );
}
