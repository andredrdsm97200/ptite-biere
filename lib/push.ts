import webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:hello@ptite-biere.app",
    publicKey,
    privateKey
  );
}

export async function sendPush(
  subscriptionJson: string,
  payload: { title: string; body: string; url: string }
) {
  try {
    const subscription = JSON.parse(subscriptionJson);
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error("Push failed:", err);
    return false;
  }
}
