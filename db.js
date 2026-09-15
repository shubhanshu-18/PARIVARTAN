const { pool } = require("./database");
const { trimText, validateProfile, assertValid } = require("./utils/validation");

class SpatialDatabase {
  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (
      !Number.isFinite(lat1) ||
      !Number.isFinite(lon1) ||
      !Number.isFinite(lat2) ||
      !Number.isFinite(lon2)
    ) {
      return 999;
    }
    const radius = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return Number((radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
  }

  async getBusinesses() {
    const { rows } = await pool.query(
      `SELECT id, name, category, category_key AS "categoryKey", scale, lat, lng,
              state, district, established, monthly_revenue AS "monthlyRevenue",
              employees, rating
       FROM businesses ORDER BY id`,
    );
    return rows;
  }

  async getDistricts() {
    const { rows } = await pool.query(
      `SELECT name, state, lat, lng, population,
              rural_percent AS "ruralPercent", literacy_rate AS "literacyRate",
              avg_household_income AS "avgHouseholdIncome", top_crops AS "topCrops"
       FROM districts ORDER BY id`,
    );
    return rows;
  }

  async getBenchmarks() {
    const { rows } = await pool.query(
      `SELECT category_key AS "categoryKey", demand_index AS "demandIndex",
              saturation, avg_ticket_size AS "avgTicketSize",
              growth_rate AS "growthRate", margin_percent AS "marginPercent"
       FROM market_benchmarks`,
    );
    return Object.fromEntries(rows.map((row) => [row.categoryKey, row]));
  }

  findNearbyCompetitors(lat, lng, radiusKm = 5, categoryFilter = null, businesses = []) {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radius = Number(radiusKm) || 5;
    return businesses
      .map((business) => {
        const distanceKm = this.calculateDistanceKm(
          latNum,
          lngNum,
          business.lat,
          business.lng,
        );
        return {
          ...business,
          distanceKm,
          competitionLevel:
            distanceKm < 1.5
              ? "Direct"
              : distanceKm < 3.5
                ? "Moderate"
                : "Peripheral",
        };
      })
      .filter((business) => {
        if (business.distanceKm > radius) return false;
        if (categoryFilter && categoryFilter !== "all") {
          const category = categoryFilter.toLowerCase();
          return (
            business.categoryKey.toLowerCase() === category ||
            business.category.toLowerCase().includes(category)
          );
        }
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async getMarketIntelligence(
    lat,
    lng,
    category = "dairy",
    radiusKm = 5,
    businesses,
    dataMode = "database",
  ) {
    const [districts, benchmarks, databaseBusinesses] = await Promise.all([
      this.getDistricts(),
      this.getBenchmarks(),
      businesses ? Promise.resolve(null) : this.getBusinesses(),
    ]);
    const sourceBusinesses = businesses || databaseBusinesses;
    const latNum = Number(lat) || 23.2032;
    const lngNum = Number(lng) || 77.0844;
    const radius = Number(radiusKm) || 5;
    const nearbyFromSource = (categoryFilter) =>
      sourceBusinesses
        .map((business) => ({
          ...business,
          distanceKm: this.calculateDistanceKm(
            latNum,
            lngNum,
            business.lat,
            business.lng,
          ),
          competitionLevel: "Observed",
        }))
        .filter((business) => {
          if (business.distanceKm > radius) return false;
          if (!categoryFilter || categoryFilter === "all") return true;
          return (
            business.categoryKey === categoryFilter ||
            business.category?.toLowerCase().includes(categoryFilter.toLowerCase())
          );
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
    const allNearby = nearbyFromSource(null);
    const categoryCompetitors = nearbyFromSource(category);
    const within1km = categoryCompetitors.filter((c) => c.distanceKm <= 1).length;
    const within3km = categoryCompetitors.filter((c) => c.distanceKm <= 3).length;
    const within5km = categoryCompetitors.filter((c) => c.distanceKm <= 5).length;
    const catBenchmark = benchmarks[category] || benchmarks.other || {
      demandIndex: 75,
      saturation: 40,
      growthRate: 12,
      marginPercent: 30,
    };
    const competitorCount = categoryCompetitors.length;
    const localCompetitionScore = Math.min(
      95,
      Math.max(15, competitorCount * 18 + within1km * 15),
    );
    const demandScore = Number(catBenchmark.demandIndex);
    const marketGapScore = Math.max(
      10,
      100 - (localCompetitionScore * 0.7 + Number(catBenchmark.saturation) * 0.3),
    );
    const opportunityScore = Math.min(
      98,
      Math.max(
        35,
        Math.round(
          demandScore * 0.4 +
            marketGapScore * 0.35 +
            (100 - Number(catBenchmark.saturation)) * 0.25,
        ),
      ),
    );
    const categoryDistribution = Object.entries(
      allNearby.reduce((counts, business) => {
        const key = business.categoryKey || "other";
        counts[key] = (counts[key] || 0) + 1;
        return counts;
      }, {}),
    ).map(([categoryKey, count]) => ({ categoryKey, count }));
    let nearestDistrict = districts[0];
    let minDistance = 9999;
    districts.forEach((district) => {
      const distance = this.calculateDistanceKm(
        latNum,
        lngNum,
        district.lat,
        district.lng,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestDistrict = district;
      }
    });
    if (!nearestDistrict) {
      throw new Error("No districts found. Run npm run db:seed.");
    }
    const catchmentPopulation = Math.round(nearestDistrict.population * (radius / 15));
    return {
      opportunityScore,
      demandLevel: demandScore > 80 ? "HIGH" : demandScore > 65 ? "MEDIUM" : "LOW",
      demandScore,
      competitionLevel:
        competitorCount > 4 ? "HIGH" : competitorCount >= 2 ? "MEDIUM" : "LOW",
      competitionScore: Math.round(localCompetitionScore),
      marketGap:
        marketGapScore > 60 ? "HIGH" : marketGapScore > 40 ? "MEDIUM" : "LOW",
      marketGapScore: Math.round(marketGapScore),
      potentialScore:
        opportunityScore > 75 ? "GOOD" : opportunityScore > 50 ? "MODERATE" : "CHALLENGING",
      potentialCustomerBase: Math.min(45000, Math.max(2500, catchmentPopulation)),
      competitorsWithin1km: within1km,
      competitorsWithin3km: within3km,
      competitorsWithin5km: within5km,
      totalNearbyCompetitors: competitorCount,
      allNearbyTotal: allNearby.length,
      categoryDistribution,
      nearbyCompetitors: categoryCompetitors,
      nearestDistrict: nearestDistrict.name,
      state: nearestDistrict.state,
      ruralPercent: nearestDistrict.ruralPercent,
      avgHouseholdIncome: nearestDistrict.avgHouseholdIncome,
      methodology:
        "Opportunity Score is synthesized from hyper-local competitor density (Haversine 1-5km radius), district agricultural/income indicators, category demand index, and unsatisfied rural consumer gap.",
      dataMode,
      dataSources:
        dataMode === "live"
          ? [
              { name: "OpenStreetMap Overpass API", url: process.env.OVERPASS_URL, type: "real" },
              { name: "PostgreSQL district and benchmark data", type: "database" },
            ]
          : [{ name: "PostgreSQL businesses, districts, and benchmarks", type: "database" }],
    };
  }

  async saveAssessment(data) {
    const cleaned = assertValid(
      validateProfile(data, { partial: true }),
      "Invalid assessment data",
    );
    const id = `PRV-${Date.now().toString(36).toUpperCase()}`;
    const assessment = {
      id,
      createdAt: new Date().toISOString(),
      ...cleaned,
      status: trimText(data.status || "Assessment Completed", 50),
    };
    await pool.query(
      `INSERT INTO assessments
        (id, created_at, status, opportunity_score, feasibility_score,
         project_cost, business_category, target_scheme, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
      [
        assessment.id,
        assessment.createdAt,
        assessment.status,
        assessment.opportunityScore || assessment.marketData?.opportunityScore || null,
        assessment.feasibilityScore || assessment.overallScore || null,
        assessment.projectCost || assessment.expectedInvestment || null,
        assessment.businessCategory || null,
        assessment.targetScheme || assessment.matchedSchemes?.[0]?.name || null,
        JSON.stringify(assessment),
      ],
    );
    return assessment;
  }

  async getAllAssessments() {
    const { rows } = await pool.query(
      "SELECT payload FROM assessments ORDER BY created_at DESC",
    );
    return rows.map((row) => row.payload);
  }

  async deleteAssessment(id) {
    const result = await pool.query("DELETE FROM assessments WHERE id = $1", [
      id,
    ]);
    return result.rowCount > 0;
  }

  async getAdminStats() {
    const assessments = await this.getAllAssessments();
    const total = assessments.length;
    if (!total) {
      return {
        totalAssessments: 0,
        avgOpportunityScore: 0,
        avgFeasibilityScore: 0,
        totalCapitalOutlay: 0,
        categoryBreakdown: [],
        schemeDistribution: [],
      };
    }
    const catMap = {};
    const schemeMap = {};
    let sumOpp = 0;
    let sumFeas = 0;
    let sumOutlay = 0;
    assessments.forEach((assessment) => {
      sumOpp += Number(assessment.opportunityScore || assessment.marketData?.opportunityScore) || 75;
      sumFeas += Number(assessment.feasibilityScore || assessment.overallScore) || 78;
      sumOutlay += Number(assessment.projectCost || assessment.expectedInvestment) || 140000;
      const category = assessment.businessCategory || "other";
      const scheme = assessment.targetScheme || assessment.matchedSchemes?.[0]?.name || "PMEGP";
      catMap[category] = (catMap[category] || 0) + 1;
      schemeMap[scheme] = (schemeMap[scheme] || 0) + 1;
    });
    return {
      totalAssessments: total,
      avgOpportunityScore: Math.round(sumOpp / total),
      avgFeasibilityScore: Math.round(sumFeas / total),
      totalCapitalOutlay: sumOutlay,
      categoryBreakdown: Object.entries(catMap).map(([category, count]) => ({ category, count })),
      schemeDistribution: Object.entries(schemeMap).map(([scheme, count]) => ({ scheme, count })),
    };
  }
}

module.exports = new SpatialDatabase();
