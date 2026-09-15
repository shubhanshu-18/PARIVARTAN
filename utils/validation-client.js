export const CATEGORY_KEYS = [
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

const text = (value) => (typeof value === "string" ? value : "");

export function trimText(value, maxLength = 200) {
  return text(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function lettersAndSpaces(value) {
  return text(value).replace(/[^\p{L}\s]/gu, "").replace(/\s+/g, " ").trim();
}

export function locationText(value) {
  return text(value)
    .replace(/[^\p{L}\s.'-]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s.'-]+|[\s.'-]+$/g, "");
}

export function digitsOnly(value) {
  return text(value).replace(/\D/g, "");
}

export function validateProfile(profile = {}) {
  const errors = {};
  const value = { ...profile };
  const name = lettersAndSpaces(profile.applicantName);
  value.applicantName = name;
  if (!name) errors.applicantName = "Please enter your name";
  else if (!/^\p{L}+(?:\s+\p{L}+)*$/u.test(name)) {
    errors.applicantName = "Name can contain letters and spaces only";
  }

  value.businessIdea = trimText(profile.businessIdea, 200);
  if (value.businessIdea.length < 3) errors.businessIdea = "Please enter a business idea";
  if (!CATEGORY_KEYS.includes(profile.businessCategory)) {
    errors.businessCategory = "Choose a valid business category";
  }
  value.village = locationText(profile.village);

  const cost = Number(profile.expectedInvestment);
  const capital = Number(profile.capitalAvailable);
  if (!Number.isInteger(cost) || cost < 5000 || cost > 10000000) {
    errors.expectedInvestment = "Project cost must be a whole number from ₹5,000 to ₹1 crore";
  }
  if (!Number.isInteger(capital) || capital < 0) {
    errors.capitalAvailable = "Available capital must be a non-negative whole number";
  } else if (Number.isInteger(cost) && capital > cost) {
    errors.capitalAvailable = "Available capital cannot exceed project cost";
  }
  return { value, errors };
}
