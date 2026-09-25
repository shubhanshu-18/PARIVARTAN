const jwt = require("jsonwebtoken");

const COOKIE_NAME = "gram_sarthi_admin";
const USER_COOKIE_NAME = "gram_sarthi_user";

function getToken(req) {
  const header = req.get("Authorization");
  if (header && header.startsWith("Bearer ")) return header.slice(7);

  const cookies = (req.get("Cookie") || "").split(";").reduce((result, item) => {
    const separator = item.indexOf("=");
    if (separator > -1) {
      result[item.slice(0, separator).trim()] = decodeURIComponent(item.slice(separator + 1).trim());
    }
    return result;
  }, {});
  return cookies[COOKIE_NAME];
}

function requireAdmin(req, res, next) {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Authentication is not configured on the server" });
  }

  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const claims = jwt.verify(token, secret);
    if (claims.role !== "admin" || !claims.sub) {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.admin = { id: claims.sub, name: claims.name, email: claims.email, role: claims.role };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication required" });
  }
}

module.exports = { COOKIE_NAME, requireAdmin };
