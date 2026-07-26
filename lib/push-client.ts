// Convertit la clé VAPID publique (base64 url-safe) au format attendu par l'API Push.
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function enablePushNotifications(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, error: "Les notifications ne sont pas supportées sur cet appareil." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, error: "Tu as refusé les notifications — tu peux les réactiver dans les réglages du navigateur." };
  }

  const registration = await navigator.serviceWorker.ready;

  const keyRes = await fetch("/api/push/vapid-public-key");
  const { key } = await keyRes.json();
  if (!key) {
    return { ok: false, error: "Le serveur n'est pas encore configuré pour les notifications." };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
  }

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  return { ok: true };
}
