const jwt = require("jsonwebtoken");

const COOKIE_NAME = "parivartan_admin";

function getJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  return process.env.JWT_SECRET;
}

function getCookieValue(cookieHeader, name) {
  const prefix = `${name}=`;
  const cookie = (cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function requireAuth(req, res, next) {
  const token = getCookieValue(req.headers.cookie, COOKIE_NAME);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, getJwtSecret());
    next();
  } catch {
    res.status(401).json({ error: "Authentication required" });
  }
}

function requireAdmin(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Administrator access required" });
    }
    next();
  });
}

function createAdminToken(admin) {
  return jwt.sign(
    { sub: String(admin.id), email: admin.email, role: admin.role },
    getJwtSecret(),
    { expiresIn: process.env.ADMIN_SESSION_TTL || "8h" },
  );
}

function setAdminCookie(res, token) {
  const secure = process.env.NODE_ENV === "production";
  const sameSite = secure ? "None" : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=28800; Path=/; HttpOnly; SameSite=${sameSite}${secure ? "; Secure" : ""}`,
  );
}

function clearAdminCookie(res) {
  const secure = process.env.NODE_ENV === "production";
  const sameSite = secure ? "None" : "Lax";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=${sameSite}${secure ? "; Secure" : ""}`,
  );
}

module.exports = {
  clearAdminCookie,
  createAdminToken,
  requireAdmin,
  requireAuth,
  setAdminCookie,
};
