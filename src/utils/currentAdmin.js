// The signed-in admin, as stored at login. Used so the console does not offer
// actions the server rejects anyway: you cannot change your own role or delete
// your own account, and only a super_admin may manage other admins.
export function getCurrentAdmin() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("lumihaus_admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isSuperAdmin(user) {
  const target = user === undefined ? getCurrentAdmin() : user;
  return target?.role === "super_admin";
}

export function isSameUser(a, b) {
  const idA = a?._id || a?.id;
  const idB = b?._id || b?.id;
  return Boolean(idA && idB && String(idA) === String(idB));
}
