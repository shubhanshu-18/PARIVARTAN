const API_BASE = import.meta.env.VITE_API_URL || "MISSING_API_URL";
console.log("API_BASE =", API_BASE);

export const ApiService = {
  async getMarketIntelligence(lat, lng, category = "dairy", radius = 5) {
    try {
      const marketLat = Number.isFinite(Number(lat)) ? Number(lat) : 23.2032;
      const marketLng = Number.isFinite(Number(lng)) ? Number(lng) : 77.0844;
      const res = await fetch(
        `${API_BASE}/api/market-intelligence?lat=${marketLat}&lng=${marketLng}&category=${category}&radius=${radius}`,
      );
      if (!res.ok) throw new Error("API server returned status " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("Live market intelligence unavailable:", err.message);
      throw new Error(`Live market data unavailable: ${err.message}`);
      /* return {
        opportunityScore: 82,
        demandLevel: "HIGH",
        demandScore: 85,
        competitionLevel: "MEDIUM",
        competitionScore: 45,
        marketGap: "HIGH",
        marketGapScore: 78,
        potentialScore: "GOOD",
        potentialCustomerBase: 14500,
        competitorsWithin1km: 1,
        competitorsWithin3km: 3,
        competitorsWithin5km: 5,
        totalNearbyCompetitors: 4,
        categoryDistribution: [
          { categoryKey: "dairy", count: 4 },
          { categoryKey: "food_processing", count: 4 },
          { categoryKey: "tailoring", count: 3 },
          { categoryKey: "agri_equipment", count: 3 },
        ],
        nearbyCompetitors: [
          {
            id: "FB-01",
            name: "Narmada Valley Fresh Milk & Curd",
            category: "Dairy & Milk Products",
            categoryKey: "dairy",
            distanceKm: 0.8,
            scale: "micro",
            competitionLevel: "Direct",
          },
          {
            id: "FB-02",
            name: "Shree Krishna Chilling & Paneer",
            category: "Dairy & Milk Products",
            categoryKey: "dairy",
            distanceKm: 2.1,
            scale: "small",
            competitionLevel: "Moderate",
          },
          {
            id: "FB-03",
            name: "Gopal Dairy Collection Center",
            category: "Dairy & Milk Products",
            categoryKey: "dairy",
            distanceKm: 3.4,
            scale: "micro",
            competitionLevel: "Moderate",
          },
        ],
        nearestDistrict: "Sehore",
        state: "Madhya Pradesh",
        ruralPercent: 81.1,
        methodology:
          "Computed from localized spatial density benchmarks and demographic indicators.",
      }; */
    }
  },

  async calculateFinancials(params) {
    try {
      const res = await fetch(`${API_BASE}/api/financials/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Financial calculation error");
      return await res.json();
    } catch (err) {
      console.warn("Financials API error, calculating locally:", err.message);
      // Financial calculations remain available offline because they use user inputs only.
      const cost = Number(params.projectCost);
      if (!Number.isFinite(cost) || cost < 10000) {
        throw new Error("Project cost must be at least Rs. 10,000");
      }
      const marginPercent = Number(params.promoterSharePercent) || 10;
      const rate = Number(params.annualInterestRate) || 6.5;
      const tenure = Number(params.tenureMonths) || 36;
      const moratorium = Number(params.moratoriumMonths) || 3;
      const subsidy = Number(params.subsidyPercent) || 0;

      const promoterContribution = Math.round(cost * (marginPercent / 100));
      const governmentSubsidyAmount = Math.round(cost * (subsidy / 100));
      const loanAmount = Math.max(
        0,
        cost - promoterContribution - governmentSubsidyAmount,
      );

      const activeRepayment = Math.max(1, tenure - moratorium);
      const monthlyRate = rate / 12 / 100;
      const num =
        loanAmount * monthlyRate * Math.pow(1 + monthlyRate, activeRepayment);
      const den = Math.pow(1 + monthlyRate, activeRepayment) - 1;
      const monthlyEmi =
        monthlyRate > 0
          ? Math.round(num / den)
          : Math.round(loanAmount / activeRepayment);

      const grossRev = params.estimatedMonthlyRevenue
        ? Number(params.estimatedMonthlyRevenue)
        : Math.round(cost * 0.35);
      const grossOpex = params.estimatedMonthlyOpex
        ? Number(params.estimatedMonthlyOpex)
        : Math.round(grossRev * 0.55);
      const profitBeforeEmi = grossRev - grossOpex;
      const profitAfterEmi = Math.max(0, profitBeforeEmi - monthlyEmi);
      const dscr = Number((profitBeforeEmi / (monthlyEmi || 1)).toFixed(2));

      return {
        summary: {
          projectCost: cost,
          promoterContribution,
          promoterSharePercent: marginPercent,
          governmentSubsidyAmount,
          loanAmount,
          annualInterestRate: rate,
          tenureMonths: tenure,
          moratoriumMonths: moratorium,
          monthlyEmi,
          totalInterestPayable: Math.round(
            monthlyEmi * activeRepayment - loanAmount,
          ),
          grossMonthlyRevenue: grossRev,
          grossMonthlyOpex: grossOpex,
          monthlyNetProfitAfterEMI: profitAfterEmi,
          breakEvenDaysPerMonth: 8,
          debtServiceCoverageRatio: dscr,
          dscrRating:
            dscr >= 2.0
              ? "High Bankability (Excellent)"
              : dscr >= 1.3
                ? "Viable & Bankable (Good)"
                : "Borderline",
        },
        breakEvenChartData: [
          {
            capacityPercent: 20,
            revenue: Math.round(grossRev * 0.2),
            totalCost: Math.round(monthlyEmi + 3000 + grossOpex * 0.2),
          },
          {
            capacityPercent: 40,
            revenue: Math.round(grossRev * 0.4),
            totalCost: Math.round(monthlyEmi + 3000 + grossOpex * 0.4),
          },
          {
            capacityPercent: 60,
            revenue: Math.round(grossRev * 0.6),
            totalCost: Math.round(monthlyEmi + 3000 + grossOpex * 0.6),
          },
          {
            capacityPercent: 80,
            revenue: Math.round(grossRev * 0.8),
            totalCost: Math.round(monthlyEmi + 3000 + grossOpex * 0.8),
          },
          {
            capacityPercent: 100,
            revenue: grossRev,
            totalCost: Math.round(monthlyEmi + 3000 + grossOpex),
          },
        ],
        amortizationSchedule: [],
      };
    }
  },

  async getAdvisory(profile, marketData) {
    try {
      const res = await fetch(`${API_BASE}/api/advisory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, marketData }),
      });
      if (!res.ok) throw new Error("Advisory API error");
      return await res.json();
    } catch (err) {
      console.warn(
        "Advisory API failed, using client rule engine:",
        err.message,
      );
      throw new Error(`AI advisory unavailable: ${err.message}`);
    }
  },

  async matchSchemes(profile) {
    try {
      const res = await fetch(`${API_BASE}/api/schemes/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Scheme matching error");
      return await res.json();
    } catch (err) {
      console.warn(
        "Scheme matching API failed, using client engine:",
        err.message,
      );
      throw new Error(`Scheme service unavailable: ${err.message}`);
    }
  },

  async saveAssessment(assessmentData) {
    const res = await fetch(`${API_BASE}/api/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentData),
    });
    if (!res.ok) throw new Error("Failed to save assessment");
    return await res.json();
  },

  async getAssessments() {
    const res = await fetch(`${API_BASE}/api/assessments`);
    if (!res.ok) throw new Error("Failed to fetch assessments");
    return await res.json();
  },

  async deleteAssessment(id) {
    let res = await fetch(
      `${API_BASE}/api/assessments/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (res.status === 404 || res.status === 405) {
      res = await fetch(
        `${API_BASE}/api/assessments/${encodeURIComponent(id)}/delete`,
        { method: "POST" },
      );
    }
    if (!res.ok) throw new Error("Failed to delete assessment");
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/api/admin/stats`);
    if (!res.ok) throw new Error("Failed to fetch admin stats");
    return await res.json();
  },

  async downloadPdfReport(reportData) {
    const res = await fetch(`${API_BASE}/api/reports/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });
    if (!res.ok) throw new Error("Failed to generate PDF on server");
    return await res.blob();
  },
};
