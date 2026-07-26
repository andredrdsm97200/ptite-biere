// Service worker : reçoit les pushs du serveur et affiche la notification,
// même quand l'app n'est pas ouverte. C'est le cœur du "ping" de l'appli.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "P'tite bière ?", body: event.data.text(), url: "/" };
  }

  const title = payload.title || "P'tite bière ?";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: payload.url || "/" },
    vibrate: [100, 50, 100],
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Au clic sur la notif, on ouvre (ou on remet au premier plan) la page de l'invitation.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
