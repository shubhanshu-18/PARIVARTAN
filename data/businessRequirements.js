// Maintain this catalogue separately from UI and search logic so new enterprise
// categories and procurement needs can be added without changing components.
const BUSINESS_REQUIREMENTS = {
  dairy: [
    { key: "cattle_feed", label: "Cattle Feed", osmTerms: ["animal feed", "fodder", "feed store"] },
    { key: "milk_cans", label: "Milk Cans", osmTerms: ["milk can", "dairy equipment"] },
    { key: "dairy_equipment", label: "Dairy Equipment", osmTerms: ["dairy equipment", "milking equipment"] },
    { key: "veterinary_supplies", label: "Veterinary Supplies", osmTerms: ["veterinary", "animal health"] },
    { key: "packaging", label: "Packaging", osmTerms: ["packaging", "containers"] },
  ],
  food_processing: [
    { key: "flour", label: "Flour & Ingredients", osmTerms: ["flour", "food wholesaler", "grocery"] },
    { key: "processing_equipment", label: "Processing Equipment", osmTerms: ["food equipment", "machinery"] },
    { key: "packaging", label: "Packaging", osmTerms: ["packaging", "containers"] },
  ],
  tailoring: [
    { key: "fabric", label: "Fabric", osmTerms: ["fabric", "textile"] },
    { key: "thread", label: "Thread & Notions", osmTerms: ["thread", "sewing supplies"] },
    { key: "sewing_machines", label: "Sewing Machines", osmTerms: ["sewing machine", "machinery"] },
    { key: "buttons", label: "Buttons & Fasteners", osmTerms: ["buttons", "tailoring supplies"] },
    { key: "packaging", label: "Packaging", osmTerms: ["packaging"] },
  ],
  grocery: [
    { key: "wholesalers", label: "Wholesalers", osmTerms: ["wholesale", "wholesaler"] },
    { key: "distributors", label: "Distributors", osmTerms: ["distributor", "distribution"] },
    { key: "packaging", label: "Packaging", osmTerms: ["packaging", "bags"] },
    { key: "inventory", label: "Category-specific Inventory", osmTerms: ["grocery", "general store"] },
  ],
  agri_equipment: [{ key: "farm_equipment", label: "Farm Equipment", osmTerms: ["agricultural equipment", "farm machinery"] }],
  poultry: [{ key: "poultry_feed", label: "Poultry Feed & Supplies", osmTerms: ["poultry feed", "animal feed"] }],
  handicrafts: [{ key: "craft_materials", label: "Craft Materials", osmTerms: ["craft supplies", "handicraft"] }],
  food_stall: [{ key: "food_ingredients", label: "Food Ingredients", osmTerms: ["food wholesaler", "grocery"] }, { key: "packaging", label: "Packaging", osmTerms: ["packaging", "containers"] }],
  repair_services: [{ key: "tools", label: "Tools & Spare Parts", osmTerms: ["tools", "hardware", "spare parts"] }],
  other: [],
};

const MATCH_WEIGHTS = { categoryRelevance: 40, productMatch: 30, distance: 20, deliveryAvailable: 10 };

module.exports = { BUSINESS_REQUIREMENTS, MATCH_WEIGHTS };
