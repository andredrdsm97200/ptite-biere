import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import ProfileMenu from "@/components/ProfileMenu";
import BottomNav from "@/components/BottomNav";
import MoodEffects from "@/components/MoodEffects";
import DeleteAccountForm from "@/components/DeleteAccountForm";
import AdminSelfPardon from "@/components/AdminSelfPardon";
import AvatarUpload from "@/components/AvatarUpload";
import { isAdminUser } from "@/lib/admin";

export default async function SettingsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const mood = await getUserMood(me.id, me.drinkStatus, me.drinkStatusDate);
  const intense = mood === "cursed" ? await isCurseFresh(me.id) : false;

  return (
    <div className={`screen ${intense ? "mood-intense" : ""}`} data-mood={mood}>
      <MoodEffects mood={mood} intense={intense} />
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">⚙️</span> Réglages
        </div>
        <ProfileMenu username={me.username} avatarUrl={me.avatarUrl} />
      </div>

      <div className="container">
        <div className="section-title" style={{ marginTop: 0 }}>Ta photo</div>
        <AvatarUpload currentAvatarUrl={me.avatarUrl} />

        {isAdminUser(me) && mood === "cursed" && (
          <>
            <div className="section-title">Toi seul vois ceci</div>
            <AdminSelfPardon />
          </>
        )}

        <div className="section-title">Ton compte</div>
        <div className="card">
          <div className="row" style={{ padding: "4px 0" }}>
            <span style={{ color: "var(--foam-dim)" }}>Pseudo</span>
            <strong>{me.username}</strong>
          </div>
          <div className="row" style={{ padding: "4px 0" }}>
            <span style={{ color: "var(--foam-dim)" }}>E-mail</span>
            <strong>{me.email}</strong>
          </div>
        </div>

        <div className="section-title">Zone dangereuse</div>
        <DeleteAccountForm />
      </div>

      <BottomNav username={me.username} />
    </div>
  );
}
