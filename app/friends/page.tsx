import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserMood } from "@/lib/mood";
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
    <div className="screen" data-mood={mood}>
      <MoodEffects mood={mood} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">👥</span> Amis
        </div>
        <LogoutButton />
      </div>
      <div className="container">
        {!me.phone && <PhoneSetup />}
        <ContactsFinder username={me.username} />
        <FriendsManager accepted={accepted} incoming={incoming} outgoing={outgoing} />
      </div>
      <BottomNav />
    </div>
  );
}
