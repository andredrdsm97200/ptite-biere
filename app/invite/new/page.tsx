import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { effectiveDrinkStatus } from "@/lib/drinkStatus";
import { getUserMood } from "@/lib/mood";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import InviteComposer from "@/components/InviteComposer";
import MoodEffects from "@/components/MoodEffects";

export default async function NewInvitePage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const mood = await getUserMood(me.id, me.drinkStatus, me.drinkStatusDate);

  const friendships = await prisma.friendship.findMany({
    where: { status: "ACCEPTED", OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: { userA: true, userB: true },
  });
  const friends = friendships.map((f) => {
    const friend = f.userAId === me.id ? f.userB : f.userA;
    return {
      id: friend.id,
      username: friend.username,
      status: effectiveDrinkStatus(friend.drinkStatus, friend.drinkStatusDate),
    };
  });

  return (
    <div className="screen" data-mood={mood}>
      <MoodEffects mood={mood} />
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
