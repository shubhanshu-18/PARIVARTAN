export const CATEGORIES = [
  {
    key: "dairy",
    label: "Dairy & Milk Products",
    labelHi: "डेयरी एवं दुग्ध उत्पाद",
    icon: "Milk",
    desc: "Milk collection, chilling, paneer, ghee, curd",
  },
  {
    key: "food_processing",
    label: "Food Processing & Flour Mill",
    labelHi: "खाद्य प्रसंस्करण एवं आटा चक्की",
    icon: "Wheat",
    desc: "Atta chakki, spices grinding, dal mill, papad",
  },
  {
    key: "tailoring",
    label: "Tailoring & Garment Stitching",
    labelHi: "सिलाई एवं वस्त्र निर्माण",
    icon: "Scissors",
    desc: "Boutique, school uniforms, alterations, ladies wear",
  },
  {
    key: "agri_equipment",
    label: "Agricultural Equipment & Tools",
    labelHi: "कृषि उपकरण एवं स्पेयर पार्ट्स",
    icon: "Wrench",
    desc: "Pump repair, sprayers, cultivators, pipe fittings",
  },
  {
    key: "grocery",
    label: "Village Grocery & Provisions",
    labelHi: "किराना एवं दैनिक आवश्यकता दुकान",
    icon: "ShoppingBag",
    desc: "Daily ration, packaged goods, farm inputs",
  },
  {
    key: "handicrafts",
    label: "Handicrafts & Terracotta Pottery",
    labelHi: "हस्तशिल्प एवं मिट्टी कला",
    icon: "Palette",
    desc: "Terracotta, clay pots, handloom fabrics, toys",
  },
  {
    key: "poultry",
    label: "Poultry & Animal Husbandry",
    labelHi: "मुर्गी पालन एवं पशुपालन",
    icon: "Egg",
    desc: "Broiler chicken, desi kadaknath, goat rearing",
  },
  {
    key: "food_stall",
    label: "Food Stall & Snacks Counter",
    labelHi: "नाश्ता एवं अल्पाहार केंद्र",
    icon: "Coffee",
    desc: "Tea kiosk, poha jalebi, samosa, tiffin center",
  },
  {
    key: "repair_services",
    label: "Automobile & Electrical Repair",
    labelHi: "ऑटोमोबाइल एवं इलेक्ट्रॉनिक मरम्मत",
    icon: "Tool",
    desc: "Bike repair, solar pump electrician, mobile fix",
  },
  {
    key: "other",
    label: "Other Rural Micro-Enterprise",
    labelHi: "अन्य ग्रामीण सूक्ष्म उद्यम",
    icon: "Store",
    desc: "General retail, trading, or local service",
  },
];

export const BENEFICIARY_CATEGORIES = [
  {
    key: "OBC",
    label: "Other Backward Class (OBC)",
    labelHi: "अन्य पिछड़ा वर्ग (OBC)",
    schemeFocus: "NBCFDC Schemes",
  },
  {
    key: "SC",
    label: "Scheduled Caste (SC)",
    labelHi: "अनुसूचित जाति (SC)",
    schemeFocus: "NSFDC Schemes",
  },
  {
    key: "ST",
    label: "Scheduled Tribe (ST)",
    labelHi: "अनुसूचित जनजाति (ST)",
    schemeFocus: "Stand-Up / NSTFDC",
  },
  {
    key: "Safai Karamchari",
    label: "Safai Karamchari / Sanitation Worker",
    labelHi: "सफाई कर्मचारी / स्वच्छकार",
    schemeFocus: "NSKFDC Swarnima",
  },
  {
    key: "General",
    label: "General / Unreserved",
    labelHi: "सामान्य वर्ग (General)",
    schemeFocus: "PMEGP / MUDRA",
  },
  {
    key: "Women",
    label: "Women Entrepreneur (Any Category)",
    labelHi: "महिला उद्यमी (कोई भी वर्ग)",
    schemeFocus: "Stand-Up / Mahila Samriddhi",
  },
];

export const translations = {
  en: {
    // App
    "app.title": "Gram Sarthi AI",
    "app.subtitle": "ग्राम सारथी AI",
    "app.tagline":
      "AI-Driven Hyper-Local Business Advisory & Financial Structuring",
    "app.sihBadge": "Smart India Hackathon 2026 | PS ID: 26091",
    "app.mosje": "Ministry of Social Justice & Empowerment",

    // Nav
    "nav.language": "English / हिंदी",
    "nav.voiceAssistant": "Voice Input",
    "nav.voiceListening": "Listening...",
    "nav.beneficiaryView": "Entrepreneur Portal",
    "nav.officerLogin": "Officer Login",
    "nav.officerPortal": "Officer Portal",
    "nav.privacyPolicy": "Privacy & Consent",
    "nav.privacyActive": "DPDP 2023 Compliant",

    // Stepper
    "step.1": "1. Business Profile",
    "step.2": "2. Market Intel",
    "step.3": "3. AI Advisory",
    "step.4": "4. Financial Structuring",
    "step.5": "5. Scheme Match",
    "step.6": "6. Feasibility Dossier",

    // Form
    "form.title": "Rural Micro-Enterprise Assessment",
    "form.subtitle":
      "Provide your enterprise concept and location for hyper-local intelligence and credit structuring.",
    "form.applicantName": "Applicant / Entrepreneur Name",
    "form.businessIdea": "Proposed Business Idea / Product",
    "form.businessIdeaPlaceholder":
      "e.g., Village milk collection and paneer processing unit",
    "form.category": "Enterprise Sector / Category",
    "form.state": "State",
    "form.district": "District",
    "form.village": "Village / Gram Panchayat / Town",
    "form.villagePlaceholder": "e.g., Ashta, Village Mugispur",
    "form.detectLocation": "Detect Current Location (GPS)",
    "form.locationDetected": "Location captured accurately via GPS",
    "form.capitalAvailable": "Available Own Margin Capital (₹)",
    "form.capitalHint": "Cash or savings you can invest yourself (5% - 25%)",
    "form.expectedInvestment": "Estimated Total Project Cost (₹)",
    "form.beneficiaryCategory": "Beneficiary Social Category",
    "form.gender": "Gender of Primary Promoter",
    "form.female": "Female",
    "form.male": "Male",
    "form.otherGender": "Other",
    "form.experience": "Prior Business / Craft Experience",
    "form.expNone": "New Beginner (0 - 1 year)",
    "form.expSome": "Moderate Familiarity (1 - 3 years)",
    "form.expHigh": "Experienced Practitioner (3+ years)",
    "form.firstTime": "First-Time Micro-Entrepreneur (Greenfield)",
    "form.continue": "Generate Hyper-Local Intelligence →",
    "form.back": "← Previous Step",

    // Market Intel
    "market.title": "Hyper-Local Market Intelligence",
    "market.subtitle":
      "Spatial competitor density, demand gap analysis, and catchment viability.",
    "market.oppScore": "Opportunity Score",
    "market.demand": "Market Demand",
    "market.competition": "Competition Density",
    "market.gap": "Unmet Demand Gap",
    "market.potential": "Commercial Viability",
    "market.filterRadius": "Competitor Radius Filter",
    "market.filterCategory": "Category Filter",
    "market.allCategories": "All Categories",
    "market.nearbyCompetitors": "Identified Nearby Competitors",
    "market.distance": "Distance (km)",
    "market.scale": "Scale",
    "market.threat": "Threat Level",
    "market.catchment": "Estimated Catchment Population",
    "market.methodologyTitle": "How is this calculated?",

    // Advisory
    "advisory.title": "AI-Driven Business Advisory",
    "advisory.subtitle":
      "Personalized SWOT analysis, risk mitigation roadmap, and market positioning.",
    "advisory.readAloud": "Read Advisory Aloud (Hindi/English)",
    "advisory.stopSpeaking": "Stop Voice",
    "advisory.strengths": "Strengths (Internal Advantages)",
    "advisory.weaknesses": "Weaknesses (Operational Gaps)",
    "advisory.opportunities": "Opportunities (Market Levers)",
    "advisory.threats": "Threats (External Risks)",
    "advisory.risks": "Identified Business Risks & Mitigations",
    "advisory.pricing": "Recommended Pricing Strategy",
    "advisory.targetCustomer": "Target Customer Persona",
    "advisory.locationStrategy": "Recommended Location Strategy",
    "advisory.nextActions": "Next-Best Actions (Prioritized 1 - 5)",

    // Financial
    "financial.title": "Financial Structuring & Viability Engine",
    "financial.subtitle":
      "Project outlay, loan requirement, EMI amortization, break-even analysis, and DSCR.",
    "financial.projectCost": "Total Project Cost",
    "financial.promoterMargin": "Promoter Contribution",
    "financial.loanAmount": "Net Bank Loan Required",
    "financial.monthlyEmi": "Monthly Loan EMI",
    "financial.grossRevenue": "Estimated Monthly Revenue",
    "financial.netProfit": "Estimated Net Monthly Profit",
    "financial.dscr": "Debt Service Coverage (DSCR)",
    "financial.breakEven": "Monthly Break-Even Period",
    "financial.breakEvenDays": "Days to Break Even Each Month",
    "financial.adjustAssumptions": "Adjust Financial Assumptions",
    "financial.tenure": "Loan Repayment Tenure (Months)",
    "financial.interest": "Annual Interest Rate (%)",
    "financial.subsidy": "Government Subsidy (%)",
    "financial.moratorium": "Grace / Moratorium Period (Months)",
    "financial.recalculate": "Recalculate Financials",
    "financial.breakEvenChart": "Break-Even Capacity Analysis",
    "financial.amortizationTable": "Amortization & Repayment Schedule",

    // Schemes
    "scheme.title": "Government Credit & Subsidy Scheme Match",
    "scheme.subtitle":
      "Automated eligibility mapping across NBCFDC, NSFDC, NSKFDC, PMEGP, and MUDRA.",
    "scheme.bestMatch": "Top Recommended Scheme",
    "scheme.matchScore": "Eligibility Compatibility Score",
    "scheme.whyMatches": "Why This Scheme Matches Your Profile",
    "scheme.warnings": "Important Eligibility Conditions",
    "scheme.docsRequired": "Mandatory Documents Required",
    "scheme.applyPortal": "Official Portal Link",
    "scheme.disclaimer":
      "Important: Verify latest guidelines on official government portal before final submission.",
    "scheme.otherMatches": "Other Eligible Financing Options",

    // Report
    "report.title": "Bank-Ready Feasibility Dossier",
    "report.subtitle":
      "Official evaluation report ready for Bank Appraisal and District Industries Centre (DIC).",
    "report.overallScore": "Overall Project Feasibility Score",
    "report.downloadPdf": "Download Official A4 PDF Dossier",
    "report.printReport": "Print Feasibility Dossier",
    "report.generating": "Generating Certified PDF...",
    "report.executiveSummary": "Executive Appraisal Summary",
    "report.roadmap": "Next 30 - 90 Days Execution Roadmap",

    // Officer
    "admin.title": "Officer & Bank Manager Dashboard",
    "admin.subtitle":
      "District-level analytics, pending appraisals, and socio-economic distribution.",
    "admin.totalAssessments": "Total Assessments Filed",
    "admin.totalOutlay": "Total Proposed Capital Outlay",
    "admin.avgFeasibility": "Average Feasibility Score",
    "admin.avgOpportunity": "Average Opportunity Score",
    "admin.recentAssessments": "Submitted Beneficiary Assessments",
    "admin.searchPlaceholder":
      "Search by applicant, enterprise, or district...",
    "admin.viewDetails": "View Dossier Details",
    "admin.officerLogout": "Exit Officer View",
  },
  hi: {
    // App
    "app.title": "ग्राम सारथी AI",
    "app.subtitle": "Gram Sarthi AI",
    "app.tagline":
      "ग्रामीण सूक्ष्म उद्यमियों के लिए AI-संचालित बाज़ार सलाह एवं वित्तीय संरचना",
    "app.sihBadge": "स्मार्ट इंडिया हैकाथॉन 2026 | समस्या क्रमांक: 26091",
    "app.mosje": "सामाजिक न्याय एवं अधिकारिता मंत्रालय, भारत सरकार",

    // Nav
    "nav.language": "हिंदी / English",
    "nav.voiceAssistant": "आवाज़ इनपुट",
    "nav.voiceListening": "सुन रहे हैं...",
    "nav.beneficiaryView": "उद्यमी पोर्टल",
    "nav.officerLogin": "अधिकारी लॉगिन",
    "nav.officerPortal": "अधिकारी पोर्टल",
    "nav.privacyPolicy": "डेटा गोपनीयता एवं सहमति",
    "nav.privacyActive": "DPDP 2023 सुरक्षित",

    // Stepper
    "step.1": "1. बिज़नेस प्रोफ़ाइल",
    "step.2": "2. बाज़ार विश्लेषण",
    "step.3": "3. AI बिज़नेस सलाह",
    "step.4": "4. वित्तीय संरचना",
    "step.5": "5. योजना मिलान",
    "step.6": "6. व्यवहार्यता रिपोर्ट",

    // Form
    "form.title": "ग्रामीण सूक्ष्म उद्यम मूल्यांकन",
    "form.subtitle":
      "स्थानीय बाज़ार जानकारी एवं ऋण संरचना के लिए अपने उद्यम का विवरण दर्ज करें।",
    "form.applicantName": "उद्यमी / आवेदक का नाम",
    "form.businessIdea": "प्रस्तावित व्यवसाय का विचार / उत्पाद",
    "form.businessIdeaPlaceholder":
      "उदा. गांव में दूध संकलन एवं पनीर निर्माण इकाई",
    "form.category": "व्यवसाय क्षेत्र / श्रेणी",
    "form.state": "राज्य",
    "form.district": "ज़िला",
    "form.village": "गांव / ग्राम पंचायत / कस्बा",
    "form.villagePlaceholder": "उदा. आष्टा, ग्राम मुगीसपुर",
    "form.detectLocation": "जीपीएस से वर्तमान स्थान चुनें",
    "form.locationDetected": "जीपीएस द्वारा स्थान सफलतापूर्वक प्राप्त हुआ",
    "form.capitalAvailable": "आपके पास उपलब्ध स्वयं की पूंजी (₹)",
    "form.capitalHint": "वह राशि जो आप स्वयं लगा सकते हैं (5% से 25%)",
    "form.expectedInvestment": "अनुमानित कुल परियोजना लागत (₹)",
    "form.beneficiaryCategory": "लाभार्थी सामाजिक वर्ग",
    "form.gender": "मुख्य प्रमोटर का लिंग",
    "form.female": "महिला",
    "form.male": "पुरुष",
    "form.otherGender": "अन्य",
    "form.experience": "व्यवसाय / शिल्प में पिछला अनुभव",
    "form.expNone": "नया व्यवसायी (0 - 1 वर्ष)",
    "form.expSome": "सामान्य जानकारी (1 - 3 वर्ष)",
    "form.expHigh": "अनुभवी कारीगर (3+ वर्ष)",
    "form.firstTime": "प्रथम बार उद्यमी (ग्रीनफ़ील्ड उद्यम)",
    "form.continue": "बाज़ार विश्लेषण देखें →",
    "form.back": "← पिछला चरण",

    // Market Intel
    "market.title": "हाइपर-लोकल बाज़ार विश्लेषण",
    "market.subtitle":
      "नज़दीकी प्रतियोगी, बाज़ार मांग सूचकांक एवं उपभोक्ता अवसर।",
    "market.oppScore": "अवसर स्कोर (Opportunity Score)",
    "market.demand": "स्थानीय बाज़ार मांग",
    "market.competition": "प्रतिस्पर्धा स्तर",
    "market.gap": "बाज़ार में कमी (Market Gap)",
    "market.potential": "व्यावसायिक संभावना",
    "market.filterRadius": "दूरी दायरा (किलोमीटर)",
    "market.filterCategory": "श्रेणी अनुसार फ़िल्टर",
    "market.allCategories": "सभी श्रेणियां",
    "market.nearbyCompetitors": "नज़दीकी चिन्हित प्रतियोगी",
    "market.distance": "दूरी (किमी)",
    "market.scale": "आकार",
    "market.threat": "प्रतिस्पर्धा असर",
    "market.catchment": "अनुमानित ग्राहक संख्या",
    "market.methodologyTitle": "इस स्कोर की गणना कैसे की गई?",

    // Advisory
    "advisory.title": "AI-संचालित बिज़नेस सलाह",
    "advisory.subtitle":
      "व्यक्तिगत SWOT विश्लेषण, जोखिम समाधान एवं बाज़ार रणनीति।",
    "advisory.readAloud": "सलाह बोलकर सुनाएं (आवाज़ में)",
    "advisory.stopSpeaking": "आवाज़ बंद करें",
    "advisory.strengths": "ताकत (आंतरिक खूबियां)",
    "advisory.weaknesses": "कमियां (सुधार के क्षेत्र)",
    "advisory.opportunities": "अवसर (विकास के रास्ते)",
    "advisory.threats": "चुनौतियां (बाहरी जोखिम)",
    "advisory.risks": "संभावित जोखिम एवं बचाव के उपाय",
    "advisory.pricing": "अनुशंसित मूल्य निर्धारण रणनीति",
    "advisory.targetCustomer": "लक्षित ग्राहक वर्ग",
    "advisory.locationStrategy": "दुकान / केंद्र का अनुशंसित स्थान",
    "advisory.nextActions": "सर्वोत्तम अगले कदम (प्राथमिकता 1 - 5)",

    // Financial
    "financial.title": "वित्तीय संरचना एवं ईएमआई कैलकुलेटर",
    "financial.subtitle":
      "परियोजना लागत, बैंक ऋण, मासिक ईएमआई, लाभ एवं बैंक व्यवहार्यता (DSCR)।",
    "financial.projectCost": "कुल परियोजना लागत",
    "financial.promoterMargin": "उद्यमी का अंशदान (मार्जिन)",
    "financial.loanAmount": "आवश्यक बैंक ऋण",
    "financial.monthlyEmi": "मासिक बैंक ईएमआई",
    "financial.grossRevenue": "अनुमानित मासिक कुल बिक्री",
    "financial.netProfit": "ईएमआई बाद शुद्ध मासिक लाभ",
    "financial.dscr": "ऋण सेवा कवरेज अनुपात (DSCR)",
    "financial.breakEven": "मासिक ब्रेक-इवेन अवधि",
    "financial.breakEvenDays": "प्रति माह लाभ शुरू होने के दिन",
    "financial.adjustAssumptions": "वित्तीय शर्तें बदलें (पुनः गणना)",
    "financial.tenure": "ऋण चुकाने की अवधि (माह)",
    "financial.interest": "वार्षिक ब्याज दर (%)",
    "financial.subsidy": "सरकारी सब्सिडी (%)",
    "financial.moratorium": "मोराटोरियम / छूट अवधि (माह)",
    "financial.recalculate": "तुरंत पुनः गणना करें",
    "financial.breakEvenChart": "ब्रेक-इवेन क्षमता विश्लेषण",
    "financial.amortizationTable": "मासिक किस्त एवं ब्याज तालिका",

    // Schemes
    "scheme.title": "सरकारी योजना मिलान एवं सब्सिडी",
    "scheme.subtitle":
      "NBCFDC, NSFDC, NSKFDC, PMEGP एवं MUDRA में सबसे उपयुक्त योजना।",
    "scheme.bestMatch": "सर्वश्रेष्ठ अनुशंसित योजना",
    "scheme.matchScore": "पात्रता मिलान स्कोर",
    "scheme.whyMatches": "यह योजना आपके लिए क्यों उपयुक्त है?",
    "scheme.warnings": "महत्वपूर्ण नियम एवं शर्तें",
    "scheme.docsRequired": "आवश्यक दस्तावेज़ सूची",
    "scheme.applyPortal": "आधिकारिक पोर्टल लिंक",
    "scheme.disclaimer":
      "महत्वपूर्ण: अंतिम आवेदन से पहले आधिकारिक सरकारी पोर्टल पर ताज़ा नियम अवश्य जांचें।",
    "scheme.otherMatches": "अन्य वैकल्पिक ऋण योजनाएं",

    // Report
    "report.title": "बैंक-तैयार व्यवहार्यता रिपोर्ट (Dossier)",
    "report.subtitle":
      "बैंक शाखा प्रबंधक एवं ज़िला उद्योग केंद्र (DIC) के लिए आधिकारिक परियोजना रिपोर्ट।",
    "report.overallScore": "समग्र उद्यम व्यवहार्यता स्कोर",
    "report.downloadPdf": "आधिकारिक A4 PDF रिपोर्ट डाउनलोड करें",
    "report.printReport": "रिपोर्ट प्रिंट करें",
    "report.generating": "प्रमाणित PDF तैयार हो रही है...",
    "report.executiveSummary": "कार्यकारी सारांश",
    "report.roadmap": "अगले 30 से 90 दिनों की कार्ययोजना",

    // Officer
    "admin.title": "अधिकारी एवं बैंक प्रबंधक डैशबोर्ड",
    "admin.subtitle":
      "ज़िला स्तरीय आंकड़े, लंबित आवेदन एवं सामाजिक-आर्थिक वितरण।",
    "admin.totalAssessments": "कुल पंजीकृत मूल्यांकन",
    "admin.totalOutlay": "प्रस्तावित कुल पूंजी निवेश",
    "admin.avgFeasibility": "औसत व्यवहार्यता स्कोर",
    "admin.avgOpportunity": "औसत अवसर स्कोर",
    "admin.recentAssessments": "हाल ही में जमा किए गए मूल्यांकन",
    "admin.searchPlaceholder": "उद्यमी, व्यवसाय या ज़िले से खोजें...",
    "admin.viewDetails": "पूर्ण रिपोर्ट देखें",
    "admin.officerLogout": "अधिकारी दृश्य से बाहर निकलें",
  },
};

export function t(key, lang = "hi") {
  return translations[lang]?.[key] || translations["en"]?.[key] || key;
}
import { STATES_DISTRICTS } from "../data/indiaLocations";
export { STATES_DISTRICTS };
