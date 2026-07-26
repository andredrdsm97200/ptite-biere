# 🍺 P'tite bière ?

Une appli pour inviter tes potes à boire un coup, en un clic, avec une vraie
notification push sur leur téléphone.

## Ce que ça fait

- Tu crées un compte, tu ajoutes tes amis par pseudo.
- Tu écris un message ("Je finis le taff dans 10 min, rdv au bar du 16ème"),
  tu choisis le lieu et à qui l'envoyer.
- Tes potes reçoivent une notification **"P'tite bière ? 🍺"** même si l'appli
  est fermée. En cliquant dessus, ils arrivent sur une page qui montre ton
  message, l'adresse, et (si tu l'as choisi) qui d'autre est invité.
- Ils répondent "J'arrive" ou "Pas cette fois".

## Stack technique

- **Next.js 14** (App Router) — frontend + API dans le même projet
- **Prisma** + SQLite en local (facilement remplaçable par Postgres en prod)
- **web-push** — vraies notifications push navigateur (protocole standard,
  fonctionne sur Android/Chrome/Firefox/Edge ; sur iPhone, l'utilisateur doit
  d'abord "Ajouter à l'écran d'accueil" — c'est une limitation d'Apple, pas
  de l'appli)
- Authentification maison (cookie de session signé, mots de passe hashés)

Aucune clé API tierce n'est nécessaire — pas de Firebase, pas de Twilio.
Le protocole Web Push est géré directement par les navigateurs.

## Fonctionnalités (état actuel du projet)

- Comptes, amis (demande/acceptation), ajout par pseudo, par contacts
  téléphone (Android/Chrome) ou par lien d'invitation personnel.
- Invitations "P'tite bière ?" avec notifications push, message, lieu, choix
  des invités, visibilité des autres invités on/off.
- Statut du jour "🍻 Chaud" / "🙅 Pas envie", journée de jeu 5h-5h (pas
  minuit) : tout se réinitialise chaque matin.
- Classement (onglet 🏆) : classement général (score combiné) + catégories
  détaillées (meilleur hôte, plus chaud sans interruption, le moins chaud,
  badge malédiction) — calculé parmi soi + ses amis, cumulé dans le temps.
  Les badges apparaissent à côté des pseudos partout dans l'appli, et sur
  la page profil de chacun.
- Malédiction avec de vraies conséquences : un maudit passe en quarantaine
  (personne ne peut l'inviter jusqu'au lendemain 5h) et doit une "tournée
  double" tant que l'hôte concerné ne l'a pas validée.
- Annuler sa présence après avoir dit "j'arrive", avec un petit mot
  optionnel, visible par l'hôte seul ou par tous les invités.
- Pastilles de notification en temps réel (demandes d'amis, invitations non
  répondues) et actualisation automatique de l'accueil et du classement.
- Thème visuel qui s'adapte à l'humeur (chaud / pas envie / maudit), sur
  fond du thème clair "Terrasse d'été".

## Démarrer en local

```bash
npm install
cp .env.example .env
```

Édite `.env` :
- `DATABASE_URL="file:./dev.db"` (par défaut, rien à faire)
- `JWT_SECRET` : n'importe quelle longue chaîne aléatoire

Génère tes clés de notification (une seule fois) :

```bash
npm run generate:vapid
```

Colle les deux clés affichées dans `.env`, y compris dans
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` (même valeur que `VAPID_PUBLIC_KEY`).

Crée la base de données :

```bash
npx prisma db push
```

Lance l'appli :

```bash
npm run dev
```

Ouvre `http://localhost:3000`. Pour tester les notifications entre deux
comptes, ouvre l'appli dans deux navigateurs différents (ou un normal + un en
navigation privée), crée deux comptes, ajoutez-vous en amis, activez les
notifications sur les deux, puis envoyez une invitation.

⚠️ Les notifications push exigent HTTPS. `localhost` fait exception (ça
marche en local), mais dès que tu déploies, il te faut un vrai domaine en
HTTPS — ce que Vercel fournit automatiquement.

## Déployer pour de vrai (avoir un vrai lien du type `https://exemple.app`)

1. **Mets le projet sur GitHub** (`git init`, commit, push sur un nouveau repo).
2. **Crée une base Postgres gratuite** sur [neon.tech](https://neon.tech) (ou
   Vercel Postgres). Récupère l'URL de connexion.
3. Dans `prisma/schema.prisma`, change :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. **Importe le repo sur [vercel.com](https://vercel.com)**. Dans les
   réglages du projet, ajoute les variables d'environnement :
   - `DATABASE_URL` (celle de Neon)
   - `JWT_SECRET`
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
     (générées avec `npm run generate:vapid`)
5. Lance `npx prisma db push` une fois en local en pointant sur l'URL Neon
   (ou laisse Vercel le faire via le script de build).
6. Déploie. Vercel te donne un lien `https://ton-projet.vercel.app`.
7. **Domaine personnalisé** : dans les réglages Vercel → Domains, ajoute
   `exemple.app` (ou ce que tu as acheté) et suis les instructions DNS.

## Idées pour la suite

- Icônes d'app personnalisées (celles fournies sont des placeholders simples
  dans `public/icons/` — remplace-les par ton propre logo en 192×192 et
  512×512).
- Un historique "tournées passées" avec un petit compteur de bières envoyées.
- Un mode "je suis déjà là" qui géolocalise automatiquement le lieu.
- Des réactions rapides (🍻 / 😅 / 👀) sur l'invitation, en plus de J'arrive /
  Pas cette fois.

## Structure du projet

```
app/              pages et routes API (Next.js App Router)
  api/            toutes les routes serveur (auth, amis, invitations, push)
  invite/[id]/    page qu'on voit en cliquant sur la notification
  invite/new/     formulaire de création d'invitation
  friends/        gestion des amis
components/       composants React réutilisables (client)
lib/              prisma, auth, envoi de push
prisma/schema.prisma   modèle de données
public/sw.js      service worker : reçoit le push, affiche la notif
```
