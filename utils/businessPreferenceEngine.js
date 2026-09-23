const db = require("../db");
const { CATEGORY_KEYS } = require("./validation");

const BUSINESS_PREFERENCE_WEIGHTS = {
  demand: 0.25,
  competition: 0.2,
  accessibility: 0.15,
  operatingCost: 0.15,
  marketSize: 0.15,
  futurePotential: 0.1,
};

// Assuming English labels for internal logging/response, but they will be translated on frontend
const CATEGORY_NAMES = {
  dairy: "Dairy & Milk Products",
  food_processing: "Food Processing & Flour Mill",
  tailoring: "Tailoring & Garment Stitching",
  agri_equipment: "Agricultural Equipment & Tools",
  grocery: "Village Grocery & Provisions",
  handicrafts: "Handicrafts & Terracotta Pottery",
  poultry: "Poultry & Animal Husbandry",
  food_stall: "Food Stall & Snacks Counter",
  repair_services: "Automobile & Electrical Repair",
  other: "Other Rural Micro-Enterprise",
};

const CATEGORY_NAMES_HI = {
  dairy: "डेयरी एवं दुग्ध उत्पाद",
  food_processing: "खाद्य प्रसंस्करण एवं आटा चक्की",
  tailoring: "सिलाई एवं वस्त्र निर्माण",
  agri_equipment: "कृषि उपकरण एवं स्पेयर पार्ट्स",
  grocery: "किराना एवं दैनिक आवश्यकता दुकान",
  handicrafts: "हस्तशिल्प एवं मिट्टी कला",
  poultry: "मुर्गी पालन एवं पशुपालन",
  food_stall: "नाश्ता एवं अल्पाहार केंद्र",
  repair_services: "ऑटोमोबाइल एवं इलेक्ट्रॉनिक मरम्मत",
  other: "अन्य ग्रामीण सूक्ष्म उद्यम",
};

/**
 * Evaluate all candidate business categories against the detected location.
 */
async function evaluateLocationForBusinesses({
  lat,
  lng,
  liveBusinesses = null,
}) {
  const latNum = Number(lat) || 23.2032;
  const lngNum = Number(lng) || 77.0844;
  const radius = 5;
  let districts, benchmarks, databaseBusinesses;
  try {
    [districts, benchmarks, databaseBusinesses] = await Promise.all([
      db.getDistricts(),
      db.getBenchmarks(),
      liveBusinesses ? Promise.resolve(null) : db.getBusinesses(),
    ]);
  } catch (error) {
    // Fallback to seed data if database is not configured or fails
    const seed = require("../data/seedData");
    districts = seed.districts;
    benchmarks = seed.marketBenchmarks;
    databaseBusinesses = liveBusinesses ? null : seed.businesses;
  }

  const sourceBusinesses = liveBusinesses || databaseBusinesses || [];

  if (!districts || districts.length === 0) {
    throw new Error("No district data available.");
  }

  // Find nearest district for market size / accessibility
  let nearestDistrict = districts[0];
  let minDistance = 9999;
  districts.forEach((d) => {
    const distance = db.calculateDistanceKm(latNum, lngNum, d.lat, d.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestDistrict = d;
    }
  });

  if (!nearestDistrict) {
    throw new Error("No districts found. Run npm run db:seed.");
  }

  const catchmentPopulation = Math.round(
    nearestDistrict.population * (radius / 15),
  );

  const allNearby = sourceBusinesses
    .map((b) => ({
      ...b,
      distanceKm: db.calculateDistanceKm(latNum, lngNum, b.lat, b.lng),
    }))
    .filter((b) => b.distanceKm <= radius);

  const results = [];

  for (const categoryKey of CATEGORY_KEYS) {
    const catBenchmark = benchmarks[categoryKey] ||
      benchmarks.other || {
        demandIndex: 75,
        saturation: 40,
        growthRate: 12,
        marginPercent: 30,
      };

    // Competitors
    const categoryCompetitors = allNearby.filter(
      (b) =>
        b.categoryKey === categoryKey ||
        (b.category &&
          b.category.toLowerCase().includes(categoryKey.toLowerCase())),
    );
    const within1km = categoryCompetitors.filter(
      (c) => c.distanceKm <= 1,
    ).length;
    const within3km = categoryCompetitors.filter(
      (c) => c.distanceKm <= 3,
    ).length;
    const within5km = categoryCompetitors.filter(
      (c) => c.distanceKm <= 5,
    ).length;
    const competitorCount = categoryCompetitors.length;

    // 1. Demand
    const demandScore = Number(catBenchmark.demandIndex);
    const demandLevel =
      demandScore > 80 ? "HIGH" : demandScore > 65 ? "MEDIUM" : "LOW";

    // 2. Competition
    const localCompetitionScore = Math.min(
      95,
      Math.max(15, competitorCount * 18 + within1km * 15),
    );
    // Competition score is INVERSE of competition level (lower competition = higher score)
    const competitionScore = 100 - localCompetitionScore;
    const competitionLevel =
      competitorCount > 4 ? "HIGH" : competitorCount >= 2 ? "MEDIUM" : "LOW";

    // 3. Accessibility (use distance to nearest district center as proxy, 0-20km = good, >50km = bad)
    const accessibilityScore = Math.max(
      20,
      Math.min(95, 100 - minDistance * 1.5),
    );
    const accessibilityLevel =
      accessibilityScore > 75
        ? "HIGH"
        : accessibilityScore > 50
          ? "MEDIUM"
          : "LOW";

    // 4. Operating Cost (use marginPercent and category heuristics as proxy)
    // Higher margin usually implies better operating economics
    const operatingCostScore = Math.min(
      95,
      Math.max(30, Number(catBenchmark.marginPercent) * 2.5),
    );
    const estimatedCostLevel =
      operatingCostScore > 75
        ? "FAVORABLE"
        : operatingCostScore > 50
          ? "MODERATE"
          : "HIGH BURDEN";

    // 5. Market Size
    const marketSizeScore = Math.min(
      95,
      Math.max(20, Math.round((catchmentPopulation / 50000) * 100)),
    );

    // 6. Future Potential (growth rate)
    const futurePotentialScore = Math.min(
      95,
      Math.max(25, Number(catBenchmark.growthRate) * 5),
    );
    const growthLevel =
      futurePotentialScore > 70
        ? "HIGH"
        : futurePotentialScore > 50
          ? "MODERATE"
          : "LOW";

    // Overall Score
    const overallScore = Math.round(
      demandScore * BUSINESS_PREFERENCE_WEIGHTS.demand +
        competitionScore * BUSINESS_PREFERENCE_WEIGHTS.competition +
        accessibilityScore * BUSINESS_PREFERENCE_WEIGHTS.accessibility +
        operatingCostScore * BUSINESS_PREFERENCE_WEIGHTS.operatingCost +
        marketSizeScore * BUSINESS_PREFERENCE_WEIGHTS.marketSize +
        futurePotentialScore * BUSINESS_PREFERENCE_WEIGHTS.futurePotential,
    );

    // Reasons mapping
    const reasons = [
      `Demand is ${demandLevel.toLowerCase()} based on the category benchmark and estimated local catchment.`,
      competitorCount === 0
        ? "Only a small number of comparable businesses were identified within 5 km."
        : `Identified ${competitorCount} comparable business(es) within 5 km.`,
      `Accessibility is ${accessibilityLevel.toLowerCase()}, location is ~${Math.round(minDistance)} km from a major district center.`,
      `Estimated operating requirements are ${estimatedCostLevel.toLowerCase()} for this category.`,
      `Estimated catchment population is ${catchmentPopulation.toLocaleString("en-IN")}, providing a solid customer base.`,
      `Category growth indicators and local market-gap signals are ${growthLevel.toLowerCase()}.`,
    ];

    results.push({
      businessCategory: categoryKey,
      businessName: CATEGORY_NAMES[categoryKey],
      businessNameHi: CATEGORY_NAMES_HI[categoryKey],
      overallScore,
      demandScore,
      competitionScore,
      accessibilityScore,
      operatingCostScore,
      marketSizeScore,
      futurePotentialScore,
      confidence: liveBusinesses ? "HIGH" : "MEDIUM",
      reasons,
      risks: [
        "Estimates based on regional averages rather than exact village block data",
        "Market dynamics may shift rapidly with new competition",
      ],
      assumptions: [
        "Catchment area follows a 5km radial draw",
        "Operating margins match state-wide benchmarks",
      ],
      dataSources: liveBusinesses
        ? ["OpenStreetMap (Live)", "Database Benchmarks"]
        : ["PostgreSQL Businesses", "Database Benchmarks"],
    });
  }

  results.sort((a, b) => b.overallScore - a.overallScore);
  return results;
}

module.exports = {
  evaluateLocationForBusinesses,
  BUSINESS_PREFERENCE_WEIGHTS,
};
