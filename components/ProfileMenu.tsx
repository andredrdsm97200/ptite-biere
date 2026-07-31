"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { enablePushNotifications } from "@/lib/push-client";
import { IconBell, IconSettings } from "./icons";

export default function ProfileMenu({ username, avatarUrl }: { username: string; avatarUrl?: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState<boolean | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setNotifEnabled(false);
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setNotifEnabled(!!sub))
      .catch(() => setNotifEnabled(false));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function handleEnableNotif() {
    if (notifEnabled || notifLoading) return;
    setNotifLoading(true);
    const result = await enablePushNotifications();
    setNotifLoading(false);
    setNotifEnabled(result.ok);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="profile-menu" ref={wrapRef}>
      <button className="profile-menu-avatar" onClick={() => setOpen((o) => !o)} style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}>
        {!avatarUrl && username.slice(0, 1).toUpperCase()}
      </button>

      {open && (
        <div className="profile-menu-panel">
          <Link href={`/u/${username}`} className="profile-menu-item" onClick={() => setOpen(false)}>
            <span className="profile-menu-avatar-sm" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}>
              {!avatarUrl && username.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{username}</strong>
              <span>Voir mon profil</span>
            </div>
          </Link>

          <button className="profile-menu-item" onClick={handleEnableNotif} disabled={notifEnabled === true}>
            <span className="profile-menu-ico"><IconBell size={17} off={!notifEnabled} /></span>
            {notifEnabled ? "Notifications activées" : notifLoading ? "..." : "Activer les notifications"}
          </button>

          <Link href="/settings" className="profile-menu-item" onClick={() => setOpen(false)}>
            <span className="profile-menu-ico"><IconSettings size={17} /></span>
            Réglages
          </Link>

          <button className="profile-menu-item danger" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
