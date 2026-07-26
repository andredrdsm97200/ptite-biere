import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserMood, isCurseFresh } from "@/lib/mood";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import MoodEffects from "@/components/MoodEffects";
import DeleteAccountForm from "@/components/DeleteAccountForm";

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
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/settings" className="nav-link" style={{ fontSize: 18, padding: "6px 8px" }} title="Réglages">⚙️</Link>
          <NotificationBell />
          <LogoutButton />
        </div>
      </div>

      <div className="container">
        <div className="section-title" style={{ marginTop: 0 }}>Ton compte</div>
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

      <BottomNav />
    </div>
  );
}
