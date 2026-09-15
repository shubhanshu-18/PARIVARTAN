const CATEGORY_KEYS = [
  "dairy",
  "food_processing",
  "tailoring",
  "agri_equipment",
  "grocery",
  "handicrafts",
  "poultry",
  "food_stall",
  "repair_services",
  "other",
];

const BENEFICIARY_CATEGORIES = [
  "OBC",
  "SC",
  "ST",
  "Safai Karamchari",
  "General",
  "Women",
];

const GENDERS = ["female", "male", "other"];
const EXPERIENCES = ["beginner", "intermediate", "expert"];
const ALLOWED_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Gujarat",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const FIELD_LIMITS = {
  applicantName: 100,
  businessIdea: 200,
  village: 120,
  state: 80,
  district: 80,
};

function text(value) {
  return typeof value === "string" ? value : "";
}

function trimText(value, maxLength = 200) {
  return text(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function lettersAndSpaces(value) {
  return text(value)
    .replace(/[^\p{L}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function locationText(value) {
  return text(value)
    .replace(/[^\p{L}\s.'-]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s.'-]+|[\s.'-]+$/g, "");
}

function digitsOnly(value) {
  return text(value).replace(/\D/g, "");
}

function numberValue(value, field, { min, max, integer = false, required = true } = {}) {
  if (value === "" || value === null || typeof value === "undefined") {
    if (!required) return { value: null };
    return { error: `${field} is required` };
  }
  const stringValue = String(value).trim();
  if (!/^\d+(?:\.\d+)?$/.test(stringValue)) {
    return { error: `${field} must be a valid number` };
  }
  const number = Number(stringValue);
  if (!Number.isFinite(number) || (integer && !Number.isInteger(number))) {
    return { error: `${field} must be a valid number` };
  }
  if (typeof min === "number" && number < min) {
    return { error: `${field} must be at least ${min}` };
  }
  if (typeof max === "number" && number > max) {
    return { error: `${field} must be at most ${max}` };
  }
  return { value: number };
}

function validateEmail(value) {
  const email = trimText(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
    ? { value: email }
    : { error: "Enter a valid email address" };
}

function validateProfile(input = {}, { partial = false } = {}) {
  const source = input && typeof input === "object" ? input : {};
  const errors = {};
  const output = { ...source };

  const originalName = text(source.applicantName);
  const name = lettersAndSpaces(originalName);
  output.applicantName = name;
  if (!partial || source.applicantName !== undefined) {
    if (!name) errors.applicantName = "Please enter your name";
    else if (
      !/^\p{L}+(?:\s+\p{L}+)*$/u.test(name) ||
      name !== originalName.replace(/\s+/g, " ").trim()
    ) {
      errors.applicantName = "Name can contain letters and spaces only";
    }
  }

  const idea = trimText(source.businessIdea, FIELD_LIMITS.businessIdea);
  output.businessIdea = idea;
  if (!partial || source.businessIdea !== undefined) {
    if (idea.length < 3) errors.businessIdea = "Please enter a business idea";
    else if (/<|>|javascript\s*:/i.test(text(source.businessIdea))) {
      errors.businessIdea = "Please enter normal text only";
    }
  }

  const category = trimText(source.businessCategory, 40);
  output.businessCategory = category;
  if (!partial || source.businessCategory !== undefined) {
    if (!CATEGORY_KEYS.includes(category)) errors.businessCategory = "Choose a valid business category";
  }

  const originalState = text(source.state);
  const originalDistrict = text(source.district);
  const originalVillage = text(source.village);
  const state = locationText(originalState);
  const district = locationText(originalDistrict);
  const village = locationText(originalVillage);
  output.state = state;
  output.district = district;
  output.village = village;
  if (!partial || source.state !== undefined) {
    if (!ALLOWED_STATES.includes(state) || state !== originalState.replace(/\s+/g, " ").trim()) {
      errors.state = "Choose a valid state";
    }
  }
  if (!partial || source.district !== undefined) {
    if (
      !district ||
      district.length > FIELD_LIMITS.district ||
      district !== originalDistrict.replace(/\s+/g, " ").trim()
    ) {
      errors.district = "Choose a valid district";
    }
  }
  if (
    village.length > FIELD_LIMITS.village ||
    village !== originalVillage.replace(/\s+/g, " ").trim()
  ) {
    errors.village = "Location can contain letters, spaces, and hyphens only";
  }

  const investment = numberValue(source.expectedInvestment, "Project cost", {
    min: 5000,
    max: 10000000,
    integer: true,
    required: !partial || source.expectedInvestment !== undefined,
  });
  const capital = numberValue(source.capitalAvailable, "Available capital", {
    min: 0,
    max: 10000000,
    integer: true,
    required: !partial || source.capitalAvailable !== undefined,
  });
  if (investment.error) errors.expectedInvestment = "Project cost must be a whole number from ₹5,000 to ₹1 crore";
  if (capital.error) errors.capitalAvailable = "Available capital must be a non-negative whole number";
  if (!investment.error && !capital.error && investment.value !== null && capital.value > investment.value) {
    errors.capitalAvailable = "Available capital cannot exceed project cost";
  }
  if (investment.value !== undefined) output.expectedInvestment = investment.value;
  if (capital.value !== undefined) output.capitalAvailable = capital.value;

  if (!partial || source.beneficiaryCategory !== undefined) {
    if (!BENEFICIARY_CATEGORIES.includes(source.beneficiaryCategory)) {
      errors.beneficiaryCategory = "Choose a valid beneficiary category";
    }
  }
  if (!partial || source.gender !== undefined) {
    if (!GENDERS.includes(source.gender)) errors.gender = "Choose a valid gender";
  }
  if (!partial || source.experience !== undefined) {
    if (!EXPERIENCES.includes(source.experience)) errors.experience = "Choose a valid experience level";
  }

  return { value: output, errors };
}

function validateFinancialInput(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const fields = {
    projectCost: ["Project cost", 10000, 100000000, true],
    promoterSharePercent: ["Promoter share", 0, 50, false],
    annualInterestRate: ["Interest rate", 0, 100, false],
    tenureMonths: ["Tenure", 1, 360, true],
    moratoriumMonths: ["Moratorium", 0, 359, true],
    subsidyPercent: ["Subsidy", 0, 100, false],
    estimatedMonthlyRevenue: ["Monthly revenue", 0, 100000000, false],
    estimatedMonthlyOpex: ["Monthly operating cost", 0, 100000000, false],
  };
  const errors = {};
  const value = { ...source };
  for (const [key, [label, min, max, integer]] of Object.entries(fields)) {
    const result = numberValue(source[key], label, {
      min,
      max,
      integer,
      required: key === "projectCost",
    });
    if (result.error) errors[key] = result.error;
    else if (result.value !== null) value[key] = result.value;
  }
  if (!errors.tenureMonths && !errors.moratoriumMonths &&
      value.moratoriumMonths >= value.tenureMonths) {
    errors.moratoriumMonths = "Moratorium must be shorter than the repayment tenure";
  }
  return { value, errors };
}

function assertValid(result, message = "Please correct the highlighted fields") {
  if (Object.keys(result.errors).length) {
    const error = new Error(message);
    error.status = 400;
    error.validationErrors = result.errors;
    throw error;
  }
  return result.value;
}

module.exports = {
  CATEGORY_KEYS,
  BENEFICIARY_CATEGORIES,
  GENDERS,
  EXPERIENCES,
  ALLOWED_STATES,
  trimText,
  lettersAndSpaces,
  locationText,
  digitsOnly,
  validateEmail,
  validateProfile,
  validateFinancialInput,
  assertValid,
};
