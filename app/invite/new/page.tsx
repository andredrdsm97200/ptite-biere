import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import { getInviteBlockReasons } from "@/lib/invitable";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import InviteComposer from "@/components/InviteComposer";
import MoodEffects from "@/components/MoodEffects";

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
  const blockReasons = await getInviteBlockReasons(friendUsers.map((u) => u.id));

  const friends = friendUsers.map((u) => ({
    id: u.id,
    username: u.username,
    blocked: blockReasons[u.id],
  }));

  return (
    <div className={`screen ${intense ? "mood-intense" : ""}`} data-mood={mood}>
      <MoodEffects mood={mood} intense={intense} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">📣</span> Lancer un appel
        </div>
        <LogoutButton />
      </div>
      <div className="container">
        <InviteComposer friends={friends} />
      </div>
      <BottomNav />
    </div>
  );
}
