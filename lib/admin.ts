// Vérifie que c'est bien toi (pseudo + e-mail combinés, en dur, pour que
// ça ne dépende jamais d'une variable d'environnement mal configurée).
export function isAdminUser(user: { username: string; email: string } | null): boolean {
  if (!user) return false;
  return user.username === "Ded" && user.email === "andredrdsm@gmail.com";
}
