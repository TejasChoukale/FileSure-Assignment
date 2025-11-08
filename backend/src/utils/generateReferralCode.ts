export function generateReferralCode(nameOrEmail: string) {
  const base = (nameOrEmail.split("@")[0] || "USER").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0,8);
  const rand = Math.random().toString(36).slice(2,6).toUpperCase();
  return `${base}-${rand}`;
}
