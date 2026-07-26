// Génère une paire de clés VAPID, nécessaires pour envoyer des notifications push.
// À lancer une seule fois : npm run generate:vapid
// Copie ensuite les deux clés affichées dans ton fichier .env
const webpush = require("web-push");
const keys = webpush.generateVAPIDKeys();
console.log("\nAjoute ces lignes à ton fichier .env :\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}\n`);
