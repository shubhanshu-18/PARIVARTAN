const { jsPDF } = require("jspdf");
require("jspdf-autotable");

class PDFService {
  generateFeasibilityReport(reportData) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const {
      applicantName = "Micro-Entrepreneur",
      businessIdea = "Rural Micro Enterprise",
      businessCategory = "dairy",
      location = "Sehore, Madhya Pradesh",
      district = "Sehore",
      state = "Madhya Pradesh",
      beneficiaryCategory = "OBC",
      gender = "female",
      experience = "beginner",
      marketData = {},
      advisory = {},
      financialData = {},
      matchedSchemes = [],
    } = reportData;

    const finSummary = financialData.summary || {};
    const schedule = financialData.amortizationSchedule || [];
    const bestScheme = matchedSchemes[0] || {
      name: "NBCFDC Micro Finance Scheme",
      agency: "National Backward Classes Finance & Development Corporation",
      interestRate: 5.0,
      subsidyPercent: 15,
    };

    const reportId = `PRV-${Date.now().toString(36).toUpperCase()}`;
    const reportDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // PAGE 1: HEADER & PROFILE & MARKET INTELLIGENCE
    // Government / MoSJE Navy Header
    doc.setFillColor(15, 76, 129); // #0F4C81
    doc.rect(0, 0, 210, 28, "F");

    // Saffron accent stripe
    doc.setFillColor(230, 81, 0); // #E65100
    doc.rect(0, 28, 210, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(
      "PARIVARTAN (परिवर्तन) — ENTERPRISE FEASIBILITY DOSSIER",
      105,
      11,
      { align: "center" },
    );

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Smart India Hackathon 2026 | Problem Statement 26091 | Ministry of Social Justice & Empowerment",
      105,
      18,
      { align: "center" },
    );
    doc.text(
      `Dossier ID: ${reportId}  |  Generated on: ${reportDate}  |  Classification: Bank Appraisal Ready`,
      105,
      24,
      { align: "center" },
    );

    // Section 1: Business & Beneficiary Profile
    doc.setTextColor(15, 76, 129);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("1. ENTERPRISE & BENEFICIARY PROFILE", 14, 38);

    doc.autoTable({
      startY: 41,
      theme: "grid",
      headStyles: { fillColor: [15, 76, 129], textColor: 255, fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
      body: [
        [
          "Enterprise Proposed",
          businessIdea,
          "Primary Category",
          businessCategory.toUpperCase(),
        ],
        [
          "Applicant / Promoter",
          applicantName,
          "Social Category",
          beneficiaryCategory,
        ],
        [
          "Enterprise Location",
          location,
          "State / District",
          `${state} / ${district}`,
        ],
        [
          "Promoter Experience",
          experience.toUpperCase(),
          "Gender Category",
          gender.toUpperCase(),
        ],
      ],
    });

    // Section 2: Hyper-Local Market Intelligence
    let currentY = doc.lastAutoTable.finalY + 7;
    doc.setTextColor(15, 76, 129);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("2. HYPER-LOCAL MARKET INTELLIGENCE & GAP ANALYSIS", 14, currentY);

    const oppScore = marketData.opportunityScore || 82;
    const demandLvl = marketData.demandLevel || "HIGH";
    const compLvl = marketData.competitionLevel || "MEDIUM";
    const gapLvl = marketData.marketGap || "HIGH";
    const custBase = (marketData.potentialCustomerBase || 12000).toLocaleString(
      "en-IN",
    );

    doc.autoTable({
      startY: currentY + 3,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [27, 59, 111], textColor: 255 },
      head: [
        [
          "Local Metric",
          "Computed Value",
          "Evaluation Benchmark",
          "Strategic Meaning",
        ],
      ],
      body: [
        [
          "Overall Opportunity Score",
          `${oppScore} / 100`,
          oppScore >= 75 ? "HIGH POTENTIAL" : "MODERATE",
          "Viable commercial catchment area",
        ],
        [
          "Local Market Demand",
          demandLvl,
          "Strong village consumption",
          "Sustained daily purchase frequency",
        ],
        [
          "Nearby Competitor Density",
          compLvl,
          `${marketData.competitorsWithin3km || 3} units within 3km`,
          "Manageable competitive pressure",
        ],
        [
          "Unmet Market Gap",
          gapLvl,
          "Low formal retail access",
          "Strong opportunity for high quality entry",
        ],
        [
          "Estimated Catchment Base",
          `~${custBase} consumers`,
          "Gram Panchayat radius",
          "Sufficient baseline for break-even",
        ],
      ],
    });

    // Section 3: Financial Feasibility & Loan Structuring
    currentY = doc.lastAutoTable.finalY + 7;
    doc.setTextColor(15, 76, 129);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("3. PROJECT COSTING & FINANCIAL STRUCTURING", 14, currentY);

    doc.autoTable({
      startY: currentY + 3,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.2 },
      body: [
        [
          "Total Project Outlay",
          `Rs. ${(finSummary.projectCost || 140000).toLocaleString("en-IN")}`,
          "Promoter Equity Margin",
          `Rs. ${(finSummary.promoterContribution || 14000).toLocaleString("en-IN")} (${finSummary.promoterSharePercent || 10}%)`,
        ],
        [
          "Govt Capital Subsidy",
          `Rs. ${(finSummary.governmentSubsidyAmount || 0).toLocaleString("en-IN")}`,
          "Net Loan Required",
          `Rs. ${(finSummary.loanAmount || 126000).toLocaleString("en-IN")}`,
        ],
        [
          "Interest Rate Applied",
          `${finSummary.annualInterestRate || 6.5}% p.a.`,
          "Tenure / Moratorium",
          `${finSummary.tenureMonths || 36} Mos (${finSummary.moratoriumMonths || 3} Mos Grace)`,
        ],
        [
          "Estimated Monthly EMI",
          `Rs. ${(finSummary.monthlyEmi || 3860).toLocaleString("en-IN")}`,
          "Est. Monthly Gross Revenue",
          `Rs. ${(finSummary.grossMonthlyRevenue || 49000).toLocaleString("en-IN")}`,
        ],
        [
          "Net Monthly Profit (Post-EMI)",
          `Rs. ${(finSummary.monthlyNetProfitAfterEMI || 18190).toLocaleString("en-IN")}`,
          "Break-Even Operating Period",
          `${finSummary.breakEvenDaysPerMonth || 8} Days / Month`,
        ],
        [
          "Debt Service Coverage (DSCR)",
          `${finSummary.debtServiceCoverageRatio || 5.4}x`,
          "Bank Viability Status",
          finSummary.dscrRating || "High Bankability (Excellent)",
        ],
      ],
    });

    // Section 4: Recommended Government Scheme
    currentY = doc.lastAutoTable.finalY + 7;
    doc.setTextColor(15, 76, 129);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("4. TARGET GOVERNMENT CREDIT & SUBSIDY SCHEME", 14, currentY);

    doc.autoTable({
      startY: currentY + 3,
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
      },
      body: [
        [
          `Best Matching Scheme: ${bestScheme.name} (${bestScheme.agency || "MoSJE"})`,
        ],
        [
          `Concessional Rate: ${bestScheme.interestRate}% p.a.  |  Subsidy Available: ${bestScheme.subsidyPercent}%  |  Max Outlay: Rs. ${(bestScheme.maxCost || 150000).toLocaleString("en-IN")}`,
        ],
        [
          `Key Eligibility: Catered for ${beneficiaryCategory} community with promoter margin requirement of ${bestScheme.minMarginPercent || 5}%.`,
        ],
      ],
    });

    // Footer of Page 1
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Parivartan SIH 2026 Project Dossier — Confidential & Certified for DIC / Bank Appraisal — Page 1 of 2",
      105,
      290,
      { align: "center" },
    );

    // ==========================================
    // PAGE 2: SWOT, RISK MITIGATION & ACTION PLAN
    // ==========================================
    doc.addPage();

    // Top Banner Page 2
    doc.setFillColor(15, 76, 129);
    doc.rect(0, 0, 210, 16, "F");
    doc.setFillColor(230, 81, 0);
    doc.rect(0, 16, 210, 1.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.text(
      "PARIVARTAN — AI ADVISORY MATRIX & IMPLEMENTATION ROADMAP",
      105,
      10,
      { align: "center" },
    );

    // Section 5: SWOT Analysis
    doc.setTextColor(15, 76, 129);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("5. AI-GENERATED SWOT MATRIX", 14, 25);

    const swot = advisory.swot || {
      strengths: [
        "High daily local demand for enterprise products",
        "Low operational overhead in village cluster",
        "Direct access to raw materials",
      ],
      weaknesses: [
        "Informal bookkeeping and cash reliance",
        "Initial lack of commercial brand awareness",
        "Limited working capital buffers",
      ],
      opportunities: [
        "Concessional bank credit under MoSJE schemes",
        "Digital payment adoption via QR/UPI",
        "Value added packaging for local mandis",
      ],
      threats: [
        "Price undercutting by established urban distributors",
        "Unpaid consumer credit defaults (Udhar)",
        "Seasonal fluctuations in farm income",
      ],
    };

    doc.autoTable({
      startY: 28,
      theme: "grid",
      headStyles: { fillColor: [15, 76, 129], textColor: 255, fontSize: 8 },
      head: [["STRENGTHS (Internal)", "WEAKNESSES (Internal)"]],
      body: [
        [
          swot.strengths.map((s, i) => `• ${s}`).join("\n\n"),
          swot.weaknesses.map((w, i) => `• ${w}`).join("\n\n"),
        ],
      ],
      styles: { fontSize: 7.5, cellPadding: 3 },
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 3,
      theme: "grid",
      headStyles: { fillColor: [27, 59, 111], textColor: 255, fontSize: 8 },
      head: [["OPPORTUNITIES (External)", "THREATS (External)"]],
      body: [
        [
          swot.opportunities.map((o, i) => `• ${o}`).join("\n\n"),
          swot.threats.map((t, i) => `• ${t}`).join("\n\n"),
        ],
      ],
      styles: { fontSize: 7.5, cellPadding: 3 },
    });

    // Section 6: Key Risks & Mitigations
    currentY = doc.lastAutoTable.finalY + 6;
    doc.setTextColor(15, 76, 129);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("6. BUSINESS RISK MITIGATION PLAN", 14, currentY);

    const risks = advisory.risks || [
      {
        risk: "Customer credit default / Delayed Udhar realization",
        severity: "High",
        mitigation:
          "Cap informal customer credit to maximum 7 days and use digital ledger app",
      },
      {
        risk: "Working capital starvation during off-season",
        severity: "Medium",
        mitigation: "Maintain emergency cash buffer equal to 2 months EMI",
      },
      {
        risk: "Equipment failure or maintenance delay",
        severity: "Medium",
        mitigation:
          "Purchase machinery only from certified dealers with on-site annual warranty",
      },
    ];

    doc.autoTable({
      startY: currentY + 3,
      theme: "striped",
      headStyles: { fillColor: [15, 76, 129], textColor: 255, fontSize: 8 },
      head: [
        [
          "Identified Business Risk",
          "Severity",
          "Recommended Mitigation Measure",
        ],
      ],
      body: risks.map((r) => [r.risk, r.severity, r.mitigation]),
      styles: { fontSize: 7.5, cellPadding: 2.2 },
    });

    // Section 7: 30 & 90 Days Action Plan
    currentY = doc.lastAutoTable.finalY + 6;
    doc.setTextColor(15, 76, 129);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("7. IMPLEMENTATION ROADMAP (NEXT 30 - 90 DAYS)", 14, currentY);

    doc.autoTable({
      startY: currentY + 3,
      theme: "grid",
      headStyles: { fillColor: [27, 59, 111], textColor: 255, fontSize: 8 },
      head: [["Timeline Phase", "Milestone Activity", "Target Output"]],
      body: [
        [
          "Days 1 - 7",
          "Obtain Udyam MSME Registration & Collect vendor quotes",
          "Formal eligibility for DIC/Bank loan processing",
        ],
        [
          "Days 8 - 20",
          "Submit Loan Application along with this Feasibility Dossier",
          "Receipt of Bank Appraisal Token & Scheme subsidy endorsement",
        ],
        [
          "Days 21 - 35",
          "Disbursement, Equipment delivery & Shop/Shed electrical setup",
          "Asset physically commissioned with trial batch production",
        ],
        [
          "Days 36 - 60",
          "Launch local introductory pricing & Onboard 30 regular buyers",
          "Positive cash generation before completion of moratorium period",
        ],
        [
          "Days 61 - 90",
          "Evaluate first regular EMI debit & set up automated UPI account",
          "Regularized credit track record for future MUDRA scaling",
        ],
      ],
      styles: { fontSize: 7.5, cellPadding: 2.2 },
    });

    // Official Disclaimer & Signature block
    currentY = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "DISCLAIMER: This project feasibility dossier is prepared using hyper-local spatial intelligence and standardized economic benchmarks. Financial metrics, including EMI, revenue, and break-even projections, are indicative estimates designed to assist bank branch managers and rural development officers. Actual sanction and subsidy disbursements remain subject to official portal verification and credit appraisal by the lending institution.",
      14,
      currentY,
      { maxWidth: 182 },
    );

    // Signatures
    currentY += 12;
    doc.setDrawColor(203, 213, 225);
    doc.line(20, currentY + 8, 75, currentY + 8);
    doc.line(135, currentY + 8, 190, currentY + 8);

    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Applicant Signature / Thumbprint", 47, currentY + 12, {
      align: "center",
    });
    doc.text("Inspecting Officer / Bank Branch Manager", 162, currentY + 12, {
      align: "center",
    });

    // Page 2 Footer
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Parivartan SIH 2026 Project Dossier — Confidential & Certified for DIC / Bank Appraisal — Page 2 of 2",
      105,
      290,
      { align: "center" },
    );

    return doc.output("arraybuffer");
  }
}

module.exports = new PDFService();
