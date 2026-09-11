export function generateAdvisory(profile = {}, marketData = {}) {
  const {
    businessCategory = "dairy",
    businessIdea = "Rural Enterprise",
    beneficiaryCategory = "OBC",
    gender = "female",
    capitalAvailable = 14000,
    expectedInvestment = 140000,
    experience = "beginner",
  } = profile;

  const categoryAdvisories = {
    dairy: {
      strengths: [
        "High per-capita daily demand for fresh unadulterated milk, curd, and paneer in local mandi",
        "Immediate daily cash inflow improving working capital liquidity",
        "Availability of agricultural crop residues (soybean, wheat straw) for low-cost cattle feed",
        "Direct community trust and relationship with neighboring farming families",
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
        "Doorstep morning delivery subscription for premium households",
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
        "Zero obsolescence risk for whole grain raw inventory",
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
        "Custom spices grinding for marriage and festival bulk orders",
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
        "Repeat customer loyalty based on precise fitting and personal comfort",
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
        "Specialization in blouse embroidery and festive designer tailoring",
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

  const fallback = {
    strengths: [
      "Hyper-local presence eliminating high travel costs for village consumers",
      "Direct personal relationship and trust with community elders and residents",
      "Agile operations with low fixed overheads compared to city counterparts",
      "Flexible credit and customized service adapting to rural agricultural cycles",
    ],
    weaknesses: [
      "Limited working capital buffers for bulk purchasing discounts",
      "Informal bookkeeping and credit tracking challenges",
      "Reliance on single founder / operator for all operational tasks",
    ],
    opportunities: [
      "Tap concessional government credit lines (NBCFDC / NSFDC / PMEGP / MUDRA)",
      "Adopt UPI digital payments (PhonePe/GPay) to reduce cash leakage and build bankable credit score",
      "Expand product mix based on unfulfilled local village requests",
      "Participate in Gramin Haats and weekly agricultural cluster bazaars",
    ],
    threats: [
      "Urban distributors opening branch counters at major highways",
      "Credit defaults when extending informal Udhar (credit) to neighbors",
      "Rising logistics and transport freight expenses from the district headquarters",
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

  const base = categoryAdvisories[businessCategory] || fallback;

  // Add gender and category specific advantages
  const customizedStrengths = [...base.strengths];
  if (gender === "female") {
    customizedStrengths.unshift(
      "Eligible for priority Mahila subvention and 0-5% equity margin concessions under MoSJE schemes",
    );
  }
  if (
    beneficiaryCategory === "SC" ||
    beneficiaryCategory === "Safai Karamchari"
  ) {
    customizedStrengths.unshift(
      `High priority allotment under ${beneficiaryCategory === "SC" ? "NSFDC" : "NSKFDC"} specialized target corpus`,
    );
  }

  const nextActions = [
    {
      priority: 1,
      action: "Register enterprise for free on Udyam Aadhaar Portal",
      timeline: "Within 7 Days",
      impact: "High",
      detail:
        "Mandatory MSME number required for interest subventions and government scheme eligibility.",
    },
    {
      priority: 2,
      action:
        "Obtain proforma invoice & machinery quotation from 2 certified vendors",
      timeline: "Days 7 - 14",
      impact: "High",
      detail:
        "Crucial collateral document for bank loan appraisal under NBCFDC / PMEGP / MUDRA.",
    },
    {
      priority: 3,
      action:
        "Submit project dossier to District Industries Centre (DIC) or Lead Bank Branch",
      timeline: "Days 15 - 25",
      impact: "High",
      detail:
        "Include this Parivartan Feasibility Dossier and 10% promoter contribution deposit receipt.",
    },
    {
      priority: 4,
      action:
        "Finalize site lease agreement and commercial electricity connection",
      timeline: "Days 20 - 30",
      impact: "Medium",
      detail:
        "Necessary for physical bank field inspection and safety certificate compliance.",
    },
    {
      priority: 5,
      action:
        "Launch 30-day village pre-order campaign with introductory launch discount",
      timeline: "Days 30 - 45",
      impact: "High",
      detail:
        "Builds positive cash flow and tests operational capacity before first EMI payment cycle.",
    },
  ];

  return {
    ...base,
    strengths: customizedStrengths,
    nextActions,
    enterpriseName: businessIdea,
    generatedAt: new Date().toISOString(),
  };
}
