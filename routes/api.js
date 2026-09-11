const express = require("express");
const db = require("../db");
const engine = require("../engine");
const pdfService = require("../pdfservice");
const { schemes } = require("../data/schemes");
const bcrypt = require("bcryptjs");
const {
  clearAdminCookie,
  createAdminToken,
  requireAdmin,
  requireAuth,
  setAdminCookie,
} = require("../middleware/adminAuth");

const router = express.Router();
const overpassUrl =
  process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";
const defaultMarketLocation = { lat: 23.2032, lng: 77.0844 };
const overpassUserAgent =
  process.env.NOMINATIM_USER_AGENT || "parivartan-market-intelligence";

router.post("/admin/login", async (req, res, next) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password || email.length > 254 || password.length > 256) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    const admin = await db.findAdminByEmail(email);
    const valid = admin && (await bcrypt.compare(password, admin.passwordHash));
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    setAdminCookie(res, createAdminToken(admin));
    res.json({ user: { id: admin.id, email: admin.email, role: admin.role } });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/logout", (req, res) => {
  clearAdminCookie(res);
  res.status(204).send();
});

router.get("/admin/me", (req, res) => {
  const token = req.headers.cookie;
  if (!token) return res.json({ authenticated: false });
  return requireAuth(req, res, () =>
    res.json({
      authenticated: true,
      user: { id: req.user.sub, email: req.user.email, role: req.user.role },
    }),
  );
});

async function fetchJson(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { Accept: "application/json", ...(options.headers || {}) },
    });
    if (!response.ok) throw new Error(`External service returned ${response.status}`);
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
    return [{
      id: `OSM-${element.type}-${element.id}`,
      name: tags.name || "Unnamed public business",
      category: tags.shop || tags.craft || category,
      categoryKey: category,
      lat: point.lat,
      lng: point.lon,
      source: "OpenStreetMap",
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    }];
  });
}

// 1. Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Parivartan Rural Enterprise Advisory API",
    version: "2.0.0",
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
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: "Valid lat and lng are required" });
  try {
    const businesses = await findLiveBusinesses(lat, lng, radius, category);
    res.json({ dataMode: "live", dataSources: ["OpenStreetMap"], businesses: db.findNearbyCompetitors(lat, lng, radius, category, businesses) });
  } catch (error) {
    try {
      const databaseBusinesses = await db.getBusinesses();
      res.json({
        dataMode: "database",
        dataSources: ["PostgreSQL businesses"],
        warning: "OpenStreetMap data is currently unavailable; showing PostgreSQL business records.",
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
        error: "Live competitor data and PostgreSQL business data are unavailable",
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

router.get("/location/geocode", async (req, res) => {
  const query = String(req.query.q || "").trim();
  if (query.length < 3) return res.status(400).json({ error: "A location query is required" });
  try {
    const encoded = encodeURIComponent(query);
    const results = await fetchJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encoded}`, {
      headers: { "User-Agent": process.env.NOMINATIM_USER_AGENT || "parivartan-development" },
    });
    res.json({
      dataMode: "live",
      dataSource: { name: "Nominatim / OpenStreetMap", url: "https://nominatim.openstreetmap.org/" },
      results: results.map((item) => ({ displayName: item.display_name, lat: Number(item.lat), lng: Number(item.lon), type: item.type })),
    });
  } catch (error) {
    res.status(503).json({ error: "Location lookup is currently unavailable", details: error.message });
  }
});

// 5. Financial Calculation
router.post("/financials/calculate", (req, res) => {
  try {
    const result = engine.calculateFinancials(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. AI Business Advisory
router.post("/advisory", (req, res) => {
  try {
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
    } = req.body || {};

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

// 7. Scheme Match
router.post("/schemes/match", (req, res) => {
  try {
    const {
      beneficiaryCategory = "OBC",
      businessCategory = "dairy",
      expectedInvestment = 140000,
      capitalAvailable = 14000,
      gender = "female",
      isFirstTimeEntrepreneur = true,
      state = "Madhya Pradesh",
    } = req.body || {};

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
    const saved = await db.saveAssessment(req.body);
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

// 9. Officer Admin Stats
router.get("/admin/stats", requireAdmin, async (req, res, next) => {
  try {
    res.json(await db.getAdminStats());
  } catch (error) {
    next(error);
  }
});

// 10. PDF Report Generation
router.post("/reports/pdf", requireAdmin, (req, res) => {
  try {
    const pdfBuffer = pdfService.generateFeasibilityReport(req.body || {});
    res.type("application/pdf");
    res.set({
      "Content-Disposition":
        'attachment; filename="parivartan-feasibility-dossier.pdf"',
      "Content-Length": pdfBuffer.byteLength,
    });
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    res.status(500).json({ error: "PDF generation failed: " + error.message });
  }
});

module.exports = router;
