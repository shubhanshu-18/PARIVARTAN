export const CLIENT_SCHEMES = [
  {
    id: "SCH-NBCFDC-01",
    name: "NBCFDC Micro Finance Scheme",
    nameHindi: "राष्ट्रीय पिछड़ा वर्ग वित्त एवं विकास निगम सूक्ष्म वित्त योजना",
    agency:
      "National Backward Classes Finance & Development Corporation (MoSJE)",
    targetCategory: ["OBC"],
    minCost: 10000,
    maxCost: 150000,
    minMarginPercent: 5,
    subsidyPercent: 15,
    interestRate: 5.0,
    maxTenureMonths: 36,
    moratoriumMonths: 3,
    womenPreference: true,
    ruralOnly: false,
    description:
      "Targeted micro-credit finance for Other Backward Classes (OBC) living below double poverty line in rural and semi-urban clusters.",
    eligibilityCriteria: [
      "Beneficiary must belong to Backward Class (OBC) as notified by Central/State Govt",
      "Annual household income within rural limit (Rs. 3.00 Lakhs)",
      "Promoter equity margin of at least 5%",
      "Age between 18 and 55 years",
    ],
    documentsRequired: [
      "Caste / Community Certificate issued by competent authority",
      "Income Certificate / Ration Card",
      "Aadhaar Card and Voter ID",
      "Basic Project Cost Estimate / Quotation of Machinery",
      "Bank Account passbook copy",
    ],
    officialUrl: "https://nbcfdc.gov.in",
    disclaimer:
      "Interest subvention and state channelising agency (SCA) quota subject to state allocation.",
  },
  {
    id: "SCH-NSFDC-01",
    name: "NSFDC Micro Credit Finance Scheme (MCF)",
    nameHindi: "राष्ट्रीय अनुसूचित जाति वित्त एवं विकास निगम सूक्ष्म ऋण योजना",
    agency:
      "National Scheduled Castes Finance & Development Corporation (MoSJE)",
    targetCategory: ["SC"],
    minCost: 10000,
    maxCost: 140000,
    minMarginPercent: 5,
    subsidyPercent: 20,
    interestRate: 4.5,
    maxTenureMonths: 36,
    moratoriumMonths: 3,
    womenPreference: true,
    ruralOnly: false,
    description:
      "Highly concessional small loan facility for Scheduled Caste persons to start micro-trades, tailoring, dairy, and artisanal units.",
    eligibilityCriteria: [
      "Applicant must belong to Scheduled Caste (SC)",
      "Annual family income up to Rs. 3.00 Lakhs",
      "No prior default with any bank or government financial body",
    ],
    documentsRequired: [
      "Scheduled Caste Certificate",
      "Family Income Certificate",
      "Aadhaar & Bank Passbook",
      "Two passport size photographs",
    ],
    officialUrl: "https://nsfdc.nic.in",
    disclaimer:
      "Verify current interest rate via SCA as rate may vary by 0.5%.",
  },
  {
    id: "SCH-NSKFDC-01",
    name: "NSKFDC Swarnima Scheme for Women",
    nameHindi: "एनएसकेएफडीसी स्वर्णिमा योजना (सफाई कर्मचारी / स्वच्छकार)",
    agency:
      "National Safai Karamcharis Finance & Development Corporation (MoSJE)",
    targetCategory: ["Safai Karamchari"],
    minCost: 10000,
    maxCost: 200000,
    minMarginPercent: 0,
    subsidyPercent: 30,
    interestRate: 4.0,
    maxTenureMonths: 48,
    moratoriumMonths: 6,
    womenPreference: true,
    ruralOnly: false,
    description:
      "Social rehabilitation loan scheme offering up to 100% project financing with 0% required promoter margin for women sanitation workers.",
    eligibilityCriteria: [
      "Target group: Identified Safai Karamchari, Manual Scavenger or dependent",
      "No income limit qualification for target group",
      "Female applicant",
    ],
    documentsRequired: [
      "Safai Karamchari Certificate from local body / Gram Panchayat",
      "Aadhaar Card",
      "Bank Passbook",
    ],
    officialUrl: "https://nskfdc.nic.in",
    disclaimer:
      "Zero promoter margin requirement applies up to Rs. 2,00,000 project outlay.",
  },
  {
    id: "SCH-PMEGP-01",
    name: "Prime Minister Employment Generation Programme (PMEGP)",
    nameHindi: "प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)",
    agency: "Khadi & Village Industries Commission (KVIC) / MSME",
    targetCategory: ["General", "OBC", "SC", "ST", "Safai Karamchari", "Women"],
    minCost: 50000,
    maxCost: 5000000,
    minMarginPercent: 5,
    subsidyPercent: 35,
    interestRate: 8.5,
    maxTenureMonths: 84,
    moratoriumMonths: 6,
    womenPreference: true,
    ruralOnly: false,
    description:
      "Credit-linked subsidy programme providing 25% (Urban) to 35% (Rural special category) back-ended capital subsidy on bank loans.",
    eligibilityCriteria: [
      "Any individual above 18 years of age",
      "At least VIII standard pass for projects above Rs. 10 Lakhs in manufacturing",
      "Self Help Groups (SHGs) and individuals eligible",
    ],
    documentsRequired: [
      "Detailed Project Profile with cost breakdown",
      "Educational Qualification marksheet",
      "Special Category / Rural certificate for 35% subsidy claim",
      "PAN Card and Aadhaar Card",
    ],
    officialUrl: "https://kviconline.gov.in/pmegpeportal",
    disclaimer:
      "Subsidy is locked in TDR (Term Deposit Receipt) for 3 years without interest.",
  },
  {
    id: "SCH-MUDRA-01",
    name: "Pradhan Mantri MUDRA Yojana (PMMY) - Shishu & Kishore",
    nameHindi: "पीएम मुद्रा योजना - शिशु एवं किशोर",
    agency: "MUDRA / Commercial & Grameen Banks",
    targetCategory: ["General", "OBC", "SC", "ST", "Safai Karamchari", "Women"],
    minCost: 10000,
    maxCost: 500000,
    minMarginPercent: 10,
    subsidyPercent: 0,
    interestRate: 8.5,
    maxTenureMonths: 60,
    moratoriumMonths: 3,
    womenPreference: false,
    ruralOnly: false,
    description:
      "Collateral-free small business financing covering machinery, livestock, inventory, and working capital tooling.",
    eligibilityCriteria: [
      "Existing or new micro enterprise",
      "No collateral required",
      "Promoter contribution minimum 10%",
    ],
    documentsRequired: [
      "Business Registration / Udyam Aadhaar",
      "Identity & Address Proof",
      "Asset Quotation / Invoice",
    ],
    officialUrl: "https://mudra.org.in",
    disclaimer: "Collateral-free loan covered under CGFMU guarantee pool.",
  },
  {
    id: "SCH-STANDUP-01",
    name: "Stand-Up India Scheme",
    nameHindi: "स्टैंड-अप इंडिया योजना",
    agency: "SIDBI / Department of Financial Services",
    targetCategory: ["SC", "ST", "Women"],
    minCost: 1000000,
    maxCost: 10000000,
    minMarginPercent: 15,
    subsidyPercent: 0,
    interestRate: 7.5,
    maxTenureMonths: 84,
    moratoriumMonths: 18,
    womenPreference: true,
    ruralOnly: false,
    description:
      "Facilitates bank loans between Rs. 10 Lakhs and Rs. 1 Crore to at least one SC/ST and one woman borrower per bank branch.",
    eligibilityCriteria: [
      "SC/ST and/or Women entrepreneur",
      "Greenfield enterprise (first time venture)",
      "Manufacturing, services or trading sectors",
    ],
    documentsRequired: [
      "Caste certificate (if applicable)",
      "Detailed Project Feasibility Report",
      "Bank application form",
    ],
    officialUrl: "https://standupmitra.in",
    disclaimer: "Reserved exclusively for greenfield projects.",
  },
];

export function matchSchemes(profile = {}) {
  const {
    beneficiaryCategory = "OBC",
    expectedInvestment = 140000,
    capitalAvailable = 14000,
    gender = "female",
    state = "Madhya Pradesh",
  } = profile;

  const cost = Number(expectedInvestment) || 140000;
  const margin = Number(capitalAvailable) || 14000;
  const marginPercent = cost > 0 ? (margin / cost) * 100 : 10;

  const scored = CLIENT_SCHEMES.map((scheme) => {
    let score = 50;
    const matchReasons = [];
    const matchWarnings = [];

    // Category match
    if (scheme.targetCategory.includes(beneficiaryCategory)) {
      score += 25;
      matchReasons.push(
        `✓ Specifically created for ${beneficiaryCategory} beneficiaries (${scheme.agency})`,
      );
    } else if (scheme.targetCategory.includes("General")) {
      score += 15;
      matchReasons.push(
        `✓ Universally open to all social categories including ${beneficiaryCategory}`,
      );
    } else {
      score -= 20;
      matchWarnings.push(
        `⚠ Priority is ${scheme.targetCategory.join("/")}; verify general quota`,
      );
    }

    // Cost match
    if (cost >= scheme.minCost && cost <= scheme.maxCost) {
      score += 20;
      matchReasons.push(
        `✓ Project cost of ₹${cost.toLocaleString("en-IN")} fits comfortably within scheme ceiling (₹${scheme.maxCost.toLocaleString("en-IN")})`,
      );
    } else if (cost < scheme.minCost) {
      score -= 25;
      matchWarnings.push(
        `⚠ Project cost is below scheme threshold of ₹${scheme.minCost.toLocaleString("en-IN")}`,
      );
    } else {
      score -= 30;
      matchWarnings.push(
        `⚠ Project cost exceeds scheme limit of ₹${scheme.maxCost.toLocaleString("en-IN")}`,
      );
    }

    // Margin match
    if (marginPercent >= scheme.minMarginPercent) {
      score += 15;
      matchReasons.push(
        `✓ Available own margin (${marginPercent.toFixed(0)}%) meets the required minimum (${scheme.minMarginPercent}%)`,
      );
    } else {
      score -= 15;
      matchWarnings.push(
        `⚠ Scheme requires minimum ${scheme.minMarginPercent}% promoter margin, you currently have ${marginPercent.toFixed(0)}%`,
      );
    }

    // Gender preference
    if (gender === "female" && scheme.womenPreference) {
      score += 15;
      matchReasons.push(
        "✓ Dedicated concessions and higher priority for women micro-entrepreneurs",
      );
    }

    // Rural location
    if (scheme.ruralOnly) {
      score += 10;
      matchReasons.push(
        "✓ Exclusive rural development grant criteria satisfied",
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

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
