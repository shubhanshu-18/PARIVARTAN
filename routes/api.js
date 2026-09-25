const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");
const { pool } = require("../database");
const { COOKIE_NAME, requireAdmin } = require("../middleware/adminAuth");
const engine = require("../engine");
const pdfService = require("../pdfservice");
const { schemes } = require("../data/schemes");
const {
  BUSINESS_REQUIREMENTS,
  MATCH_WEIGHTS,
} = require("../data/businessRequirements");
const {
  CATEGORY_KEYS,
  trimText,
  validateProfile,
  validateFinancialInput,
  validateFeedback,
  validateUserRegistration,
  assertValid,
} = require("../utils/validation");
const {
  evaluateLocationForBusinesses,
} = require("../utils/businessPreferenceEngine");

const router = express.Router();
const authCookieOptions = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production" ||
    process.env.COOKIE_SECURE === "true",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000,
  path: "/",
};
const USER_COOKIE_NAME = "gram_sarthi_user";
const GOOGLE_STATE_COOKIE = "gram_sarthi_google_state";
const overpassUrl =
  process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";
const defaultMarketLocation = { lat: 23.2032, lng: 77.0844 };
const overpassUserAgent =
  process.env.NOMINATIM_USER_AGENT || "gram-sarthi-ai-market-intelligence";

async function fetchJson(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { Accept: "application/json", ...(options.headers || {}) },
    });
    if (!response.ok)
      throw new Error(`External service returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function findLiveBusinesses(lat, lng, radiusKm, category) {
  const terms = {
    dairy: ["shop=dairy", "shop=cheese"],
    food_processing: ["craft=food", "shop=flour"],
    tailoring: ["craft=tailor", "shop=tailor"],
  };
  const filters = terms[category] || ["shop", "craft"];
  const query = filters
    .map((filter) => `nwr(around:${radiusKm * 1000},${lat},${lng})[${filter}];`)
    .join("");
  const data = await fetchJson(overpassUrl, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": overpassUserAgent,
    },
    body: `data=[out:json][timeout:10];(${query});out center tags;`,
  });
  return (data.elements || []).flatMap((element) => {
    const point = element.center || element;
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return [];
    const tags = element.tags || {};
    return [
      {
        id: `OSM-${element.type}-${element.id}`,
        name: tags.name || "Unnamed public business",
        category: tags.shop || tags.craft || category,
        categoryKey: category,
        lat: point.lat,
        lng: point.lon,
        source: "OpenStreetMap",
        sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      },
    ];
  });
}

function validSupplierQuery(query) {
  const lat = Number(query.lat ?? query.latitude);
  const lng = Number(query.lng ?? query.longitude);
  const radius = Number(query.radius || 5);
  const businessCategory = trimText(query.businessCategory, 40);
  const supplierCategory = trimText(query.supplierCategory, 80);
  if (
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180 ||
    ![1, 3, 5, 10, 25].includes(radius) ||
    !CATEGORY_KEYS.includes(businessCategory)
  )
    return null;
  const allowed = (BUSINESS_REQUIREMENTS[businessCategory] || []).map(
    (item) => item.key,
  );
  if (supplierCategory && !allowed.includes(supplierCategory)) return null;
  return {
    lat,
    lng,
    radius,
    businessCategory,
    supplierCategory,
    product: trimText(query.product, 100),
  };
}

function supplierScore(supplier, requirement, radius) {
  const haystack =
    `${supplier.category} ${(supplier.products || []).join(" ")}`.toLowerCase();
  const terms = [requirement?.label, ...(requirement?.osmTerms || [])]
    .filter(Boolean)
    .map((term) => term.toLowerCase());
  const categoryRelevance = terms.some((term) =>
    supplier.category.toLowerCase().includes(term),
  )
    ? 40
    : 24;
  const productMatch = terms.some((term) => haystack.includes(term)) ? 30 : 0;
  const distance = Math.max(
    0,
    Math.round(20 * (1 - supplier.distanceKm / radius)),
  );
  const delivery = supplier.deliveryAvailable === true ? 10 : 0;
  return {
    score: categoryRelevance + productMatch + distance + delivery,
    factors: {
      categoryRelevance,
      productMatch,
      distance,
      deliveryAvailable: delivery,
    },
  };
}

async function findLiveSuppliers(lat, lng, radius, requirements) {
  const terms = [
    ...new Set(requirements.flatMap((item) => item.osmTerms || [])),
  ].slice(0, 20);
  if (!terms.length) return [];
  const clauses = terms
    .map(
      (term) =>
        `nwr(around:${radius * 1000},${lat},${lng})[name]["name"~"${term.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")}",i];`,
    )
    .join("");
  const data = await fetchJson(
    overpassUrl,
    {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": overpassUserAgent,
      },
      body: `data=[out:json][timeout:12];(${clauses});out center tags;`,
    },
    15000,
  );
  return (data.elements || []).flatMap((element) => {
    const point = element.center || element;
    const tags = element.tags || {};
    if (
      !Number.isFinite(point.lat) ||
      !Number.isFinite(point.lon) ||
      !tags.name
    )
      return [];
    const address = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:city"],
    ]
      .filter(Boolean)
      .join(", ");
    return [
      {
        id: `osm-${element.type}-${element.id}`,
        name: tags.name,
        category: tags.shop || tags.craft || tags.amenity || "Local business",
        products: [],
        address: address || null,
        lat: point.lat,
        lng: point.lon,
        phone: tags.phone || tags["contact:phone"] || null,
        website: tags.website || tags["contact:website"] || null,
        deliveryAvailable: null,
        source: "OpenStreetMap",
        sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
        verified: false,
        updatedAt: null,
      },
    ];
  });
}

// 1. Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Gram Sarthi AI Rural Enterprise Advisory API",
    version: "2.0.0",
  });
});

router.post("/admin/login", async (req, res, next) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret)
    return res
      .status(500)
      .json({ error: "Authentication is not configured on the server" });

  try {
    const result = await pool.query(
      "SELECT id, name, email, password_hash, role FROM admin_users WHERE email = $1 LIMIT 1",
      [email],
    );
    const admin = result.rows[0];
    const valid =
      admin &&
      admin.role === "admin" &&
      (await bcrypt.compare(password, admin.password_hash));
    if (!valid)
      return res.status(401).json({ error: "Invalid email or password" });

    await pool.query(
      "UPDATE admin_users SET last_login = NOW(), updated_at = NOW() WHERE id = $1",
      [admin.id],
    );
    const token = jwt.sign(
      { name: admin.name, email: admin.email, role: admin.role },
      secret,
      { subject: String(admin.id), expiresIn: "8h" },
    );
    res.cookie(COOKIE_NAME, token, authCookieOptions);
    return res.json({
      authenticated: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/admin/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...authCookieOptions, maxAge: undefined });
  res.json({ authenticated: false });
});

router.post("/auth/register", async (req, res, next) => {
  try {
    const user = assertValid(validateUserRegistration(req.body), "Invalid registration data");
    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
    if (!secret) return res.status(500).json({ error: "Authentication is not configured on the server" });
    const passwordHash = await bcrypt.hash(user.password, 12);
    const account = await db.createUser({ name: user.name, email: user.email, passwordHash });
    const token = jwt.sign({ name: account.name, email: account.email, role: "user" }, secret, { subject: String(account.id), expiresIn: "8h" });
    res.cookie(USER_COOKIE_NAME, token, authCookieOptions);
    res.status(201).json({ authenticated: true, user: account });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "An account with this email already exists" });
    console.error("User registration failed:", error);
    return res.status(500).json({ error: "Unable to create account. Please try again." });
  }
});

router.get("/auth/google", (req, res) => {
  const { GOOGLE_CLIENT_ID: clientId, GOOGLE_REDIRECT_URI: configuredRedirect } = process.env;
  if (!clientId) return res.status(503).send("Google sign-in is not configured.");
  const redirectUri = configuredRedirect || `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
  const state = crypto.randomBytes(24).toString("hex");
  res.cookie(GOOGLE_STATE_COOKIE, state, { ...authCookieOptions, httpOnly: true, maxAge: 10 * 60 * 1000 });
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/auth/google/callback", async (req, res, next) => {
  const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret, GOOGLE_REDIRECT_URI: configuredRedirect } = process.env;
  const frontendOrigin = (process.env.FRONTEND_URL || process.env.FRONTEND_ORIGIN || "").split(",")[0].replace(/\/+$/, "");
  const stateCookie = req.headers.cookie?.match(new RegExp(`${GOOGLE_STATE_COOKIE}=([^;]+)`))?.[1];
  if (!clientId || !clientSecret || !stateCookie || !req.query.code || stateCookie !== req.query.state) {
    return res.redirect(`${frontendOrigin || ""}/?authError=google`);
  }
  const redirectUri = configuredRedirect || `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResponse.ok) throw new Error("Google token exchange failed");
    const tokens = await tokenResponse.json();
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileResponse.ok) throw new Error("Google profile request failed");
    const profile = await profileResponse.json();
    if (!profile.email || profile.email_verified !== true) throw new Error("Google account email is not verified");

    const email = profile.email.toLowerCase();
    let user = await db.getUserByEmail(email);
    if (!user) {
      user = await db.createUser({
        name: profile.name || email.split("@")[0],
        email,
        passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12),
      });
    }
    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
    if (!secret) throw new Error("Authentication is not configured on the server");
    const token = jwt.sign({ name: user.name, email: user.email, role: "user" }, secret, { subject: String(user.id), expiresIn: "8h" });
    res.clearCookie(GOOGLE_STATE_COOKIE, { ...authCookieOptions, maxAge: undefined });
    res.cookie(USER_COOKIE_NAME, token, authCookieOptions);
    res.redirect(`${frontendOrigin || ""}/`);
  } catch (error) {
    next(error);
  }
});

router.post("/auth/login", async (req, res, next) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !password) {
    return res.status(400).json({ error: "Enter a valid email and password." });
  }
  try {
    const result = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = $1 LIMIT 1", [email]);
    const user = result.rows[0]; const valid = user && await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Incorrect email or password." });
    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
    if (!secret) return res.status(500).json({ error: "Authentication is not configured on the server" });
    await pool.query("UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1", [user.id]);
    const token = jwt.sign({ name: user.name, email: user.email, role: "user" }, secret, { subject: String(user.id), expiresIn: "8h" });
    res.cookie(USER_COOKIE_NAME, token, authCookieOptions);
    res.json({ authenticated: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("User login failed:", error);
    return res.status(500).json({ error: "Unable to sign in. Please try again." });
  }
});

router.get("/auth/me", (req, res) => {
  const cookies = (req.get("Cookie") || "").split(";").reduce((all, item) => { const index = item.indexOf("="); if (index > -1) all[item.slice(0, index).trim()] = decodeURIComponent(item.slice(index + 1).trim()); return all; }, {});
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret || !cookies[USER_COOKIE_NAME]) return res.status(401).json({ authenticated: false });
  try { const claims = jwt.verify(cookies[USER_COOKIE_NAME], secret); if (claims.role !== "user") throw new Error(); res.json({ authenticated: true, user: { id: claims.sub, name: claims.name, email: claims.email } }); } catch { res.status(401).json({ authenticated: false }); }
});

router.post("/auth/logout", (req, res) => { res.clearCookie(USER_COOKIE_NAME, { ...authCookieOptions, maxAge: undefined }); res.json({ authenticated: false }); });

router.get("/admin/me", requireAdmin, (req, res) => {
  res.json({ authenticated: true, admin: req.admin });
});

router.post("/feedback", async (req, res) => {
  try {
    const feedback = assertValid(validateFeedback(req.body), "Invalid feedback data");
    const created = await db.createFeedback(feedback);
    res.status(201).json({ id: created.id, createdAt: created.createdAt, message: "Your feedback has been recorded successfully." });
  } catch (error) {
    if (error.status === 400) return res.status(400).json({ error: error.message, validationErrors: error.validationErrors });
    return res.status(500).json({ error: "Unable to submit feedback. Please try again." });
  }
});

router.get("/feedback", requireAdmin, async (req, res, next) => {
  try { res.json(await db.getFeedback()); } catch (error) { next(error); }
});

router.patch("/feedback/:id", requireAdmin, async (req, res, next) => {
  const id = Number(req.params.id); const status = trimText(req.body?.status, 20);
  if (!Number.isInteger(id) || id < 1 || !["new", "reviewed", "resolved"].includes(status)) return res.status(400).json({ error: "Valid feedback ID and status are required" });
  try {
    const feedback = await db.updateFeedbackStatus(id, status);
    if (!feedback) return res.status(404).json({ error: "Feedback not found" });
    res.json(feedback);
  } catch (error) { next(error); }
});

// Supplier Discovery: requirements are configuration-driven; records remain source-labelled.
router.get("/suppliers/requirements", (req, res) => {
  const category = trimText(req.query.businessCategory, 40);
  if (category && !CATEGORY_KEYS.includes(category))
    return res
      .status(400)
      .json({ error: "Valid businessCategory is required" });
  res.json({
    businessCategory: category || null,
    requirements: category
      ? BUSINESS_REQUIREMENTS[category] || []
      : BUSINESS_REQUIREMENTS,
    matchWeights: MATCH_WEIGHTS,
  });
});

router.get("/suppliers/categories", (req, res) => {
  const category = trimText(req.query.businessCategory, 40);
  if (!CATEGORY_KEYS.includes(category))
    return res
      .status(400)
      .json({ error: "Valid businessCategory is required" });
  res.json({ categories: BUSINESS_REQUIREMENTS[category] || [] });
});

router.get(["/suppliers", "/suppliers/nearby"], async (req, res) => {
  const query = validSupplierQuery(req.query);
  if (!query)
    return res.status(400).json({
      error:
        "Valid latitude, longitude, radius (1, 3, 5, 10, or 25), and businessCategory are required",
    });
  const requirements = (
    BUSINESS_REQUIREMENTS[query.businessCategory] || []
  ).filter(
    (item) => !query.supplierCategory || item.key === query.supplierCategory,
  );
  if (!requirements.length)
    return res.json({
      suppliers: [],
      requirements: [],
      matchWeights: MATCH_WEIGHTS,
      message:
        "No configured procurement requirements for this business category.",
    });
  let databaseSuppliers = [];
  let liveSuppliers = [];
  let liveWarning = null;
  try {
    databaseSuppliers = await db.getNearbySuppliers(
      query.lat,
      query.lng,
      query.radius,
      query.supplierCategory,
    );
  } catch (error) {
    liveWarning = "Supplier database is currently unavailable.";
  }
  try {
    liveSuppliers = await findLiveSuppliers(
      query.lat,
      query.lng,
      query.radius,
      requirements,
    );
  } catch (error) {
    liveWarning =
      liveWarning || "OpenStreetMap supplier search is currently unavailable.";
  }
  const all = [...databaseSuppliers, ...liveSuppliers]
    .map((supplier) => ({
      ...supplier,
      distanceKm: db.calculateDistanceKm(
        query.lat,
        query.lng,
        supplier.lat,
        supplier.lng,
      ),
    }))
    .filter((supplier) => supplier.distanceKm <= query.radius)
    .filter(
      (supplier, index, source) =>
        source.findIndex((item) => item.id === supplier.id) === index,
    )
    .map((supplier) => {
      const requirement =
        requirements.find((item) =>
          `${supplier.category} ${(supplier.products || []).join(" ")}`
            .toLowerCase()
            .includes(item.label.toLowerCase()),
        ) || requirements[0];
      return {
        ...supplier,
        matchedRequirement: requirement.key,
        match: supplierScore(supplier, requirement, query.radius),
      };
    })
    .sort(
      (a, b) => b.match.score - a.match.score || a.distanceKm - b.distanceKm,
    );
  res.json({
    suppliers: all,
    requirements,
    matchWeights: MATCH_WEIGHTS,
    dataSources: [...new Set(all.map((item) => item.source))],
    warning: liveWarning,
    message: all.length
      ? null
      : `No relevant suppliers found within ${query.radius} km.`,
    searchLocation: { lat: query.lat, lng: query.lng, radius: query.radius },
  });
});

// 2. All businesses
router.get("/businesses", async (req, res, next) => {
  try {
    res.json(await db.getBusinesses());
  } catch (error) {
    next(error);
  }
});

// 3. Nearby businesses
router.get("/businesses/nearby", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius || 5);
  const category = req.query.category || null;
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    !Number.isFinite(radius) ||
    radius <= 0 ||
    radius > 100 ||
    (category && !CATEGORY_KEYS.includes(category))
  ) {
    return res
      .status(400)
      .json({ error: "Valid location, radius, and category are required" });
  }
  try {
    const businesses = await findLiveBusinesses(lat, lng, radius, category);
    res.json({
      dataMode: "live",
      dataSources: ["OpenStreetMap"],
      businesses: db.findNearbyCompetitors(
        lat,
        lng,
        radius,
        category,
        businesses,
      ),
    });
  } catch (error) {
    try {
      const databaseBusinesses = await db.getBusinesses();
      res.json({
        dataMode: "database",
        dataSources: ["PostgreSQL businesses"],
        warning:
          "OpenStreetMap data is currently unavailable; showing PostgreSQL business records.",
        businesses: db.findNearbyCompetitors(
          lat,
          lng,
          radius,
          category,
          databaseBusinesses,
        ),
      });
    } catch (databaseError) {
      res.status(503).json({
        error:
          "Live competitor data and PostgreSQL business data are unavailable",
        details: `${error.message}; database: ${databaseError.message}`,
        dataMode: "unavailable",
      });
    }
  }
});

// 4. Market Intelligence
router.get("/market-intelligence", async (req, res) => {
  const requestedLat = Number(req.query.lat);
  const requestedLng = Number(req.query.lng);
  const lat = Number.isFinite(requestedLat)
    ? requestedLat
    : defaultMarketLocation.lat;
  const lng = Number.isFinite(requestedLng)
    ? requestedLng
    : defaultMarketLocation.lng;
  const category = req.query.category || "dairy";
  const radius = Number(req.query.radius || 5);
  if (
    (Number.isFinite(requestedLat) &&
      (requestedLat < -90 || requestedLat > 90)) ||
    (Number.isFinite(requestedLng) &&
      (requestedLng < -180 || requestedLng > 180)) ||
    !CATEGORY_KEYS.includes(category) ||
    !Number.isFinite(radius) ||
    radius <= 0 ||
    radius > 100
  ) {
    return res
      .status(400)
      .json({ error: "Valid location, radius, and category are required" });
  }

  try {
    const businesses = await findLiveBusinesses(lat, lng, radius, category);
    res.json(
      await db.getMarketIntelligence(
        lat,
        lng,
        category,
        radius,
        businesses,
        "live",
      ),
    );
  } catch (liveError) {
    try {
      res.json(
        await db.getMarketIntelligence(
          lat,
          lng,
          category,
          radius,
          undefined,
          "database",
        ),
      );
    } catch (databaseError) {
      res.status(503).json({
        error: "Live market data and PostgreSQL market data are unavailable",
        details: `${liveError.message}; database: ${databaseError.message}`,
        dataMode: "unavailable",
        dataSources: [{ name: "OpenStreetMap Overpass API", type: "real" }],
      });
    }
  }
});

router.post("/business-preferences", async (req, res) => {
  const { lat, lng, state, district, village } = req.body;
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return res
      .status(400)
      .json({ error: "Valid latitude and longitude are required" });
  }

  try {
    // Attempt to get live businesses for competition factor, with a timeout or fallback
    let liveBusinesses = null;
    try {
      // Find all live businesses in 5km radius (combining shops and crafts)
      liveBusinesses = await findLiveBusinesses(lat, lng, 5, "all");
    } catch (err) {
      // It's okay if OSM fails, we'll fall back to database
    }

    const recommendations = await evaluateLocationForBusinesses({
      lat,
      lng,
      state,
      district,
      village,
      liveBusinesses,
    });

    res.json({
      location: { lat, lng, state, district, village },
      recommendations,
      dataMode: liveBusinesses ? "live" : "database",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to evaluate business preferences",
      details: error.message,
    });
  }
});

router.get("/location/geocode", async (req, res) => {
  const query = trimText(req.query.q, 120);
  if (query.length < 3)
    return res.status(400).json({ error: "A location query is required" });
  try {
    const encoded = encodeURIComponent(query);
    const results = await fetchJson(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encoded}`,
      {
        headers: {
          "User-Agent":
            process.env.NOMINATIM_USER_AGENT || "gram-sarthi-ai-development",
        },
      },
    );

    res.json({
      dataMode: "live",
      dataSource: {
        name: "Nominatim / OpenStreetMap",
        url: "https://nominatim.openstreetmap.org/",
      },
      results: results.map((item) => ({
        displayName: item.display_name,
        lat: Number(item.lat),
        lng: Number(item.lon),
        type: item.type,
      })),
    });
  } catch (error) {
    res.status(503).json({
      error: "Location lookup is currently unavailable",
      details: error.message,
    });
  }
});

router.get("/location/reverse-geocode", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    return res
      .status(400)
      .json({ error: "Valid latitude and longitude are required" });
  }
  try {
    const result = await fetchJson(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent":
            process.env.NOMINATIM_USER_AGENT || "gram-sarthi-ai-production",
        },
      },
    );
    const address = result.address || {};
    const locality =
      address.village ||
      address.town ||
      address.city ||
      address.municipality ||
      address.suburb ||
      address.neighbourhood ||
      address.locality ||
      "";
    res.json({
      country: address.country || "",
      state: address.state || "",
      district: address.state_district || address.district || "",
      city: address.city || address.town || address.municipality || "",
      locality,
      postcode: address.postcode || "",
      displayName: result.display_name || "",
      latitude: lat,
      longitude: lng,
    });
  } catch (error) {
    res
      .status(503)
      .json({ error: "Reverse geocoding is currently unavailable" });
  }
});

// 5. Financial Calculation
router.post("/financials/calculate", (req, res) => {
  try {
    const result = engine.calculateFinancials(
      assertValid(
        validateFinancialInput(req.body || {}),
        "Invalid financial inputs",
      ),
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. AI Business Advisory
router.post("/advisory", (req, res) => {
  try {
    const profile = assertValid(
      validateProfile({
        applicantName: "Rural Entrepreneur",
        businessIdea: "Rural Enterprise",
        businessCategory: "dairy",
        state: "Madhya Pradesh",
        district: "Sehore",
        beneficiaryCategory: "OBC",
        capitalAvailable: 20000,
        expectedInvestment: 140000,
        gender: "female",
        experience: "beginner",
        ...req.body,
      }),
      "Invalid advisory inputs",
    );
    const {
      businessIdea = "Rural Enterprise",
      businessCategory = "dairy",
      location = "Sehore, MP",
      beneficiaryCategory = "OBC",
      capitalAvailable = 20000,
      expectedInvestment = 140000,
      gender = "female",
      experience = "beginner",
      isFirstTimeEntrepreneur = true,
    } = profile;

    // Intelligent domain advisory rules by category
    const categoryAdvisories = {
      dairy: {
        strengths: [
          "High per-capita daily demand for fresh unadulterated milk, curd, and paneer in local mandi",
          "Immediate daily cash inflow improving working capital liquidity",
          "Availability of agricultural crop residues (soybean, wheat straw) for low-cost cattle feed",
        ],
        weaknesses: [
          "Cold chain perishability risk without insulated chiller storage during summer months",
          "High dependence on timely veterinary healthcare and disease vaccination schedules",
          "Seasonal fluctuations in milk yield and fat percentage (lactation cycles)",
        ],
        opportunities: [
          "Direct value-addition margin expansion (curd, mawa, ghee, paneer sell at 3x raw milk price)",
          "Supply contract with local sweet shops, tea kiosks, and institutional canteens",
          "Leverage NABARD DEDS and National Dairy Development Board bulk milk incentives",
        ],
        threats: [
          "Feed cost inflation during summer dry months",
          "Price undercut competition from established cooperative dairy brands (Amul, Sanchi)",
          "Livestock mortality risk if cattle insurance coverage lapses",
        ],
        risks: [
          {
            risk: "Spoilage due to power cuts / ambient summer heat",
            severity: "High",
            mitigation:
              "Invest in solar-assisted cooling or tie up with local chilling center within 4 km radius",
          },
          {
            risk: "Cattle sickness or sudden drop in milk yield",
            severity: "High",
            mitigation:
              "Enroll in Pashu Dhan Bima Yojana and maintain bi-monthly vet checkup logs",
          },
          {
            risk: "Delayed payments from institutional buyers",
            severity: "Medium",
            mitigation:
              "Retain 60% sales via direct cash-and-carry retail consumers",
          },
        ],
        pricing: {
          strategy:
            "Direct-to-consumer quality premium with transparent lactometer purity testing",
          recommendedPriceRange:
            "₹55 - ₹65 per litre (Buffalo), ₹45 - ₹52 per litre (Cow)",
          rationale:
            "Local consumers willingly pay 10-15% above cooperative baseline if freshness and density are verified in front of them.",
        },
        targetCustomers: {
          primary:
            "Local households with children, tea shops, and community halwais",
          secondary: "Weekly haat mandis and road-side dhaba stalls",
          ageGroup: "25-60 years (Household procurement heads)",
          incomeLevel: "Low to Middle Rural Households (₹8,000 - ₹25,000/mo)",
        },
        locationStrategy:
          "Proximity to peri-urban connecting road with clean borehole water source and adequate shed ventilation.",
        positioning:
          "Purity, zero-preservative farm-fresh milk directly from verified local milch cows.",
        operatingModel:
          "Morning and evening milking cycles with direct doorstep delivery, converting afternoon surplus into paneer and ghee.",
      },
      food_processing: {
        strengths: [
          "Direct access to low-cost local agricultural raw harvest (wheat, gram, spices, mustard)",
          "Low working capital lock-in with high turnover frequency",
          "Year-round household staple consumption regardless of economic cycles",
        ],
        weaknesses: [
          "High power dependence for motor pulverizers and processing machinery",
          "Moisture sensitivity requiring airtight sealed packaging",
          "Initial consumer trust barrier against unbranded powdered items",
        ],
        opportunities: [
          "Expansion into hygienically packed stone-ground (Chakki) whole-wheat flour and unpolished dals",
          "Supply packaging for local anganwadi and midday-meal programs",
          "FSSAI basic registration enabling retail placement in town grocery stores",
        ],
        threats: [
          "Seasonal price spikes in raw crop commodities",
          "Local millers offering credit lines to long-standing customers",
          "Equipment breakdown during peak harvest grinding season",
        ],
        risks: [
          {
            risk: "Raw material procurement price volatility",
            severity: "High",
            mitigation:
              "Pre-book harvest volumes from local farmers using harvest contract purchase",
          },
          {
            risk: "Electrical motor burnout during rural voltage fluctuations",
            severity: "Medium",
            mitigation:
              "Install three-phase stabilizer and servo protection unit",
          },
          {
            risk: "Infestation / weevils in stored grain",
            severity: "Medium",
            mitigation: "Use hermetic sealed bags and elevated pallet storage",
          },
        ],
        pricing: {
          strategy: "Cost-plus with value-add milling service charge",
          recommendedPriceRange:
            "₹4 - ₹6 / kg milling fee or 25% margin on packaged spices/flour",
          rationale:
            "Rural consumers prefer bringing their own grain or buying fresh ground spices over aged factory packages.",
        },
        targetCustomers: {
          primary:
            "Village households, hostel kitchens, and small roadside eateries",
          secondary: "Town wholesale merchants and weekly rural markets",
          ageGroup: "All age demographics",
          incomeLevel: "Rural families (₹7,000 - ₹30,000/mo)",
        },
        locationStrategy:
          "Main village intersection or entrance road adjacent to primary grocery cluster.",
        positioning:
          "Stone-ground unadulterated purity, maintaining natural fiber and authentic aroma.",
        operatingModel:
          "Custom custom-job milling in mornings, packaging and branded retail sale in afternoons.",
      },
      tailoring: {
        strengths: [
          "Negligible raw material holding risk as customers usually supply their own cloth",
          "High profit margin on custom alterations and festive garments",
          "Low energy consumption; can operate with manual treadle or solar-assisted sewing machines",
        ],
        weaknesses: [
          "High demand seasonality (peaks during wedding and festival seasons, dips in monsoon)",
          "High dependence on skilled manual stitching hands",
          "Time constraints limiting individual daily output",
        ],
        opportunities: [
          "Annual bulk uniform stitching contracts with local government & private schools",
          "Ready-to-wear nightgowns, petticoats, and school uniforms during lean months",
          "Skill training & subcontracting with local women SHGs under NRLM",
        ],
        threats: [
          "Low-cost fast fashion polyester ready-made garments from nearby cities",
          "Customer disputes over sizing or delay during peak wedding rush",
          "Rising rental costs on prime market frontage",
        ],
        risks: [
          {
            risk: "Post-festival seasonal revenue slump",
            severity: "Medium",
            mitigation:
              "Produce standard size ready-to-wear basics and uniforms during off-peak periods",
          },
          {
            risk: "Fabric damage or stitching errors",
            severity: "Medium",
            mitigation:
              "Take precise measurements, sign trial slips, and maintain clear sample books",
          },
        ],
        pricing: {
          strategy: "Tiered pricing based on complexity and turnaround speed",
          recommendedPriceRange:
            "₹120 - ₹250 (Basic blouse/kurti), ₹350 - ₹650 (Designer festive)",
          rationale:
            "Competitive with town rates while saving village women travel time and transport fare.",
        },
        targetCustomers: {
          primary: "Rural women, teenage girls, and school children",
          secondary: "Local schools and wedding entourages",
          ageGroup: "10-55 years",
          incomeLevel: "All socioeconomic categories",
        },
        locationStrategy:
          "Central village market near textile/sari retail shops or residential quarter accessible to women.",
        positioning:
          "Flawless fit, modern cut designs, and punctual on-time delivery before auspicious dates.",
        operatingModel:
          "Direct client intake with appointment fittings and parallel batch production for bulk orders.",
      },
    };

    // Default template for other categories
    const fallbackAdvisory = {
      strengths: [
        "Hyper-local presence eliminating high travel costs for village consumers",
        "Direct personal relationship and trust with community elders and residents",
        "Agile operations with low fixed overheads compared to city counterparts",
      ],
      weaknesses: [
        "Limited working capital buffers for bulk purchasing discounts",
        "Informal bookkeeping and credit tracking challenges",
        "Reliance on single founder / operator for all tasks",
      ],
      opportunities: [
        "Tap government subsidized credit lines (NBCFDC / PMEGP / MUDRA)",
        "Adopt UPI digital payments (PhonePe/GPay) to reduce cash leakage and build credit score",
        "Expand product mix based on unfulfilled local requests",
      ],
      threats: [
        "Urban distributors opening branch counters at major highways",
        "Credit defaults when extending informal Udhar (credit) to neighbors",
        "Rising logistics and transport freight expenses",
      ],
      risks: [
        {
          risk: "Excessive unpaid customer credit (Udhar)",
          severity: "High",
          mitigation:
            "Enforce strict 7-day credit cap and use digital ledger app (Khatabook/Vyapar)",
        },
        {
          risk: "Under-capitalization in the first 90 days",
          severity: "Medium",
          mitigation:
            "Preserve at least 25% of loan proceeds strictly for working capital buffer",
        },
        {
          risk: "Lack of formal registration blocking subsidies",
          severity: "Medium",
          mitigation:
            "Obtain Udyam MSME certificate within first 14 days of setup",
        },
      ],
      pricing: {
        strategy: "Competitive parity with fair convenience margin",
        recommendedPriceRange: "Cost + 20% to 35% gross markup",
        rationale:
          "Matches town pricing while providing immediate local availability and zero transport cost.",
      },
      targetCustomers: {
        primary: "Local farming families and village residents",
        secondary:
          "Commuters and roadside travellers along the main district route",
        ageGroup: "18-65 years",
        incomeLevel: "Rural and semi-urban households",
      },
      locationStrategy:
        "Panchayat Bhavan road, bus stop corner, or weekly mandi thoroughfare.",
      positioning:
        "Honest pricing, dependable service, and genuine after-sales support.",
      operatingModel:
        "Owner-operated counter with flexible morning-to-night availability matching agricultural hours.",
    };

    const chosen = categoryAdvisories[businessCategory] || fallbackAdvisory;

    // Next-best actions prioritized 1 to 5
    const nextActions = [
      {
        priority: 1,
        action: "Register enterprise for free on the Udyam Aadhaar Portal",
        timeline: "Within 7 Days",
        impact: "High",
        detail:
          "Unlocks formal MSME status required for government scheme interest subventions.",
      },
      {
        priority: 2,
        action:
          "Finalize quotation for core machinery/tools from 2 certified vendors",
        timeline: "Days 7 - 14",
        impact: "High",
        detail:
          "Mandatory document for bank loan appraisal under PMEGP/NBCFDC/MUDRA.",
      },
      {
        priority: 3,
        action:
          "Apply for suitable scheme through DIC / Bank Channelising Agency",
        timeline: "Days 15 - 25",
        impact: "High",
        detail:
          "Submit project profile with 5-10% promoter contribution deposit receipt.",
      },
      {
        priority: 4,
        action:
          "Secure commercial premises agreement with clean electricity meter connection",
        timeline: "Days 20 - 30",
        impact: "Medium",
        detail:
          "Essential for bank verification and commercial power tariff compliance.",
      },
      {
        priority: 5,
        action:
          "Launch 30-day pre-order campaign with introductory launch discount",
        timeline: "Days 30 - 45",
        impact: "High",
        detail:
          "Validates real cash demand and generates early working capital before EMI starts.",
      },
    ];

    res.json({
      ...chosen,
      nextActions,
      enterpriseName: businessIdea,
      category: businessCategory,
      generatedAt: new Date().toISOString(),
      dataMode: "rule-based",
      dataSources: [
        {
          name: "User-provided profile and market assessment",
          type: "input",
        },
      ],
      disclaimer:
        "This advisory is rule-based guidance from supplied inputs; it is not a guarantee, official market statistic, or financial approval.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { MOCK_VIDEOS, CATEGORY_TAGS } = require("../data/mockVideos");

// 6b. AI Business Strategy Videos
router.post("/advisory/videos", async (req, res) => {
  try {
    const {
      businessIdea = "Rural Business",
      businessCategory,
      location = "India",
    } = req.body || {};

    // Strict fallback logic
    const getFallback = () => {
      if (businessCategory && MOCK_VIDEOS[businessCategory])
        return MOCK_VIDEOS[businessCategory];
      const lowerIdea = businessIdea.toLowerCase();
      if (lowerIdea.includes("dairy")) return MOCK_VIDEOS.dairy;
      if (lowerIdea.includes("flour") || lowerIdea.includes("food"))
        return MOCK_VIDEOS.food_processing;
      if (lowerIdea.includes("tailor")) return MOCK_VIDEOS.tailoring;
      if (lowerIdea.includes("potter") || lowerIdea.includes("handicraft"))
        return MOCK_VIDEOS.handicrafts;
      if (lowerIdea.includes("poultry")) return MOCK_VIDEOS.poultry;
      if (lowerIdea.includes("grocer") || lowerIdea.includes("kirana"))
        return MOCK_VIDEOS.grocery;
      return MOCK_VIDEOS.default;
    };

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn(
        "YOUTUBE_API_KEY is missing. Using offline fallback videos.",
      );
      return res.json({ businessIdea, videos: getFallback() });
    }

    const topics = [
      { label: "STARTING THE BUSINESS", suffix: "how to start business plan" },
      { label: "MARKETING", suffix: "marketing customer acquisition" },
      {
        label: "FINANCIAL PLANNING",
        suffix: "profitability financial planning",
      },
      { label: "BUSINESS GROWTH", suffix: "growth strategy" },
    ];

    const videoResults = await Promise.all(
      topics.map(async (topic) => {
        const query = encodeURIComponent(
          `${businessIdea} ${topic.suffix} India`,
        );
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${query}&key=${apiKey}`;

        try {
          const response = await fetch(url);
          if (!response.ok) return null;
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            // STRICT FILTERING LOGIC
            const tags = CATEGORY_TAGS[businessCategory] || CATEGORY_TAGS.other;
            let bestVideo = null;

            for (const item of data.items) {
              const textToSearch = (
                item.snippet.title +
                " " +
                item.snippet.description
              ).toLowerCase();
              const isValid = tags.some((tag) => textToSearch.includes(tag));

              if (
                isValid ||
                !businessCategory ||
                businessCategory === "other"
              ) {
                bestVideo = item;
                break;
              }
            }

            if (!bestVideo) return null; // Discard if none pass validation

            return {
              videoId: bestVideo.id.videoId,
              title: bestVideo.snippet.title,
              channelTitle: bestVideo.snippet.channelTitle,
              thumbnail:
                bestVideo.snippet.thumbnails?.high?.url ||
                bestVideo.snippet.thumbnails?.default?.url,
              description: bestVideo.snippet.description,
              publishedAt: bestVideo.snippet.publishedAt,
              query: topic.label,
            };
          }
        } catch (e) {
          console.error("YouTube API error:", e);
        }
        return null;
      }),
    );

    const videos = videoResults.filter(Boolean);

    // If live search yielded completely irrelevant results, use safe fallback
    if (videos.length === 0) {
      console.warn(
        "Strict filtering removed all results. Falling back to safe defaults.",
      );
      return res.json({ businessIdea, videos: getFallback() });
    }

    res.json({ businessIdea, videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Scheme Match
router.post("/schemes/match", (req, res) => {
  try {
    const profile = assertValid(
      validateProfile({
        applicantName: "Rural Entrepreneur",
        businessIdea: "Rural Enterprise",
        businessCategory: "dairy",
        state: "Madhya Pradesh",
        district: "Sehore",
        beneficiaryCategory: "OBC",
        expectedInvestment: 140000,
        capitalAvailable: 14000,
        gender: "female",
        experience: "beginner",
        ...req.body,
      }),
      "Invalid scheme matching inputs",
    );
    const {
      beneficiaryCategory = "OBC",
      businessCategory = "dairy",
      expectedInvestment = 140000,
      capitalAvailable = 14000,
      gender = "female",
      isFirstTimeEntrepreneur = true,
      state = "Madhya Pradesh",
    } = profile;

    const cost = Number(expectedInvestment) || 140000;
    const margin = Number(capitalAvailable) || 14000;
    const marginPercent = cost > 0 ? (margin / cost) * 100 : 10;

    const scoredSchemes = schemes.map((scheme) => {
      let score = 50; // base score
      const matchReasons = [];
      const matchWarnings = [];

      // Category compatibility
      if (scheme.targetCategory.includes(beneficiaryCategory)) {
        score += 25;
        matchReasons.push(
          `✓ Targeted specifically for ${beneficiaryCategory} beneficiaries (${scheme.agency})`,
        );
      } else if (scheme.targetCategory.includes("General")) {
        score += 15;
        matchReasons.push(
          `✓ Open to all community categories including ${beneficiaryCategory}`,
        );
      } else {
        score -= 20;
        matchWarnings.push(
          `⚠ Primary focus is ${scheme.targetCategory.join("/")}; verify special quota`,
        );
      }

      // Cost compatibility
      if (cost >= scheme.minCost && cost <= scheme.maxCost) {
        score += 20;
        matchReasons.push(
          `✓ Project outlay of ₹${cost.toLocaleString("en-IN")} fits comfortably within scheme ceiling (₹${scheme.maxCost.toLocaleString("en-IN")})`,
        );
      } else if (cost < scheme.minCost) {
        score -= 25;
        matchWarnings.push(
          `⚠ Project cost is lower than scheme minimum ₹${scheme.minCost.toLocaleString("en-IN")}`,
        );
      } else {
        score -= 30;
        matchWarnings.push(
          `⚠ Project cost exceeds scheme maximum limit of ₹${scheme.maxCost.toLocaleString("en-IN")}`,
        );
      }

      // Margin equity compatibility
      if (marginPercent >= scheme.minMarginPercent) {
        score += 15;
        matchReasons.push(
          `✓ Your available capital (${marginPercent.toFixed(0)}%) meets the required minimum promoter margin (${scheme.minMarginPercent}%)`,
        );
      } else {
        score -= 15;
        matchWarnings.push(
          `⚠ Promoter margin required is ${scheme.minMarginPercent}%, you currently have ${marginPercent.toFixed(0)}%`,
        );
      }

      // Gender preference
      if (gender === "female" && scheme.womenPreference) {
        score += 15;
        matchReasons.push(
          "✓ Dedicated concessions and higher priority for women micro-entrepreneurs",
        );
      }

      // Rural preference
      if (scheme.ruralOnly) {
        score += 10;
        matchReasons.push(
          "✓ Exclusive rural development grant criteria satisfied",
        );
      }

      // State scheme compatibility
      if (scheme.id.includes("MP") && state === "Madhya Pradesh") {
        score += 15;
        matchReasons.push(
          "✓ Direct state domicile advantage in Madhya Pradesh",
        );
      }

      const finalScore = Math.min(96, Math.max(20, score));

      return {
        ...scheme,
        matchScore: finalScore,
        matchReasons,
        matchWarnings,
      };
    });

    scoredSchemes.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scoredSchemes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Assessments CRUD
router.post("/assessments", async (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Assessment data is required" });
  }
  try {
    const saved = await db.saveAssessment(
      assertValid(validateProfile(req.body), "Invalid assessment data"),
    );
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

router.get("/assessments", requireAdmin, async (req, res, next) => {
  try {
    res.json(await db.getAllAssessments());
  } catch (error) {
    next(error);
  }
});

router.delete("/assessments/:id", requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  if (!id || id.length > 100) {
    return res.status(400).json({ error: "A valid assessment ID is required" });
  }

  try {
    const deleted = await db.deleteAssessment(id);
    if (!deleted) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    res.json({ deleted: true, id });
  } catch (error) {
    next(error);
  }
});

// POST fallback for deployments or proxies that do not forward DELETE requests.
router.post("/assessments/:id/delete", requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  if (!id || id.length > 100) {
    return res.status(400).json({ error: "A valid assessment ID is required" });
  }

  try {
    const deleted = await db.deleteAssessment(id);
    if (!deleted) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    res.json({ deleted: true, id });
  } catch (error) {
    next(error);
  }
});

// 9. Officer Admin Stats
router.get("/admin/stats", requireAdmin, async (req, res, next) => {
  try {
    res.json(await db.getAdminStats());
  } catch (error) {
    next(error);
  }
});

// 10. PDF Report Generation
router.post("/reports/pdf", (req, res) => {
  try {
    const payload = assertValid(
      validateProfile(req.body || {}, { partial: true }),
      "Invalid report data",
    );
    const pdfBuffer = pdfService.generateFeasibilityReport(payload);
    res.type("application/pdf");
    res.set({
      "Content-Disposition":
        'attachment; filename="gram-sarthi-ai-feasibility-dossier.pdf"',
      "Content-Length": pdfBuffer.byteLength,
    });
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    res.status(500).json({ error: "PDF generation failed: " + error.message });
  }
});

module.exports = router;
