import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import { getCircle } from "@/lib/leaderboard";
import { getBadgeMap } from "@/lib/badges";
import LogoutButton from "@/components/LogoutButton";
import BottomNav from "@/components/BottomNav";
import FriendsManager from "@/components/FriendsManager";
import ContactsFinder from "@/components/ContactsFinder";
import PhoneSetup from "@/components/PhoneSetup";
import MoodEffects from "@/components/MoodEffects";

export default async function FriendsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const mood = await getUserMood(me.id, me.drinkStatus, me.drinkStatusDate);
  const intense = mood === "cursed" ? await isCurseFresh(me.id) : false;
  const circle = await getCircle(me.id);
  const badgeMap = await getBadgeMap(circle);

  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: { userA: true, userB: true },
  });

  const accepted = friendships
    .filter((f) => f.status === "ACCEPTED")
    .map((f) => {
      const friend = f.userAId === me.id ? f.userB : f.userA;
      return { id: friend.id, username: friend.username };
    });

  const incoming = friendships
    .filter((f) => f.status === "PENDING" && f.requestedBy !== me.id)
    .map((f) => {
      const friend = f.userAId === me.id ? f.userB : f.userA;
      return { friendshipId: f.id, id: friend.id, username: friend.username };
    });

  const outgoing = friendships
    .filter((f) => f.status === "PENDING" && f.requestedBy === me.id)
    .map((f) => {
      const friend = f.userAId === me.id ? f.userB : f.userA;
      return { friendshipId: f.id, id: friend.id, username: friend.username };
    });

  return (
    <div className={`screen ${intense ? "mood-intense" : ""}`} data-mood={mood}>
      <MoodEffects mood={mood} intense={intense} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">👥</span> Amis
        </div>
        <LogoutButton />
      </div>
      <div className="container">
        {!me.phone && <PhoneSetup />}
        <ContactsFinder username={me.username} />
        <FriendsManager accepted={accepted} incoming={incoming} outgoing={outgoing} badgeMap={badgeMap} />
      </div>
      <BottomNav />
    </div>
  );
}
