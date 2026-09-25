const CATEGORY_TAGS = {
  dairy: [
    "dairy",
    "milk",
    "cattle",
    "cow",
    "buffalo",
    "ghee",
    "paneer",
    "farming",
  ],
  food_processing: [
    "flour",
    "mill",
    "chakki",
    "food processing",
    "spice",
    "dal",
    "packaging",
    "atta",
  ],
  tailoring: [
    "tailor",
    "stitching",
    "boutique",
    "garment",
    "sewing",
    "apparel",
    "clothing",
  ],
  agri_equipment: [
    "agri equipment",
    "tractor",
    "farm tools",
    "implement",
    "repair",
    "hardware",
  ],
  grocery: [
    "grocery",
    "kirana",
    "provisions",
    "retail",
    "fmcg",
    "store",
    "supermarket",
  ],
  handicrafts: [
    "handicraft",
    "pottery",
    "terracotta",
    "artisan",
    "craft",
    "bamboo",
    "weaving",
  ],
  poultry: ["poultry", "chicken", "egg", "broiler", "layer", "bird", "farm"],
  food_stall: [
    "food stall",
    "snacks",
    "dhaba",
    "street food",
    "restaurant",
    "cafe",
    "tea",
    "fast food",
  ],
  repair_services: [
    "repair",
    "automobile",
    "bike",
    "mechanic",
    "electrical",
    "service center",
    "garage",
  ],
  other: ["business", "msme", "rural", "enterprise", "entrepreneur", "startup"],
};

// Valid YouTube IDs for fallbacks to ensure player works
const MOCK_VIDEOS = {
  dairy: [
    {
      videoId: "69dCjNmj5H0",
      title: "How to Start a Dairy Farm Business in India",
      channelTitle: "Rural Business Hub",
      thumbnail: "https://i.ytimg.com/vi/69dCjNmj5H0/hqdefault.jpg",
      description:
        "Learn the step-by-step process of setting up a profitable dairy farm.",
      publishedAt: "2023-01-15T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
    {
      videoId: "W6cfYdgACsc",
      title: "Dairy Farm Marketing Strategy",
      channelTitle: "AgriTech India",
      thumbnail: "https://i.ytimg.com/vi/W6cfYdgACsc/hqdefault.jpg",
      description: "Maximize profits by cutting out the middleman.",
      publishedAt: "2023-03-22T00:00:00Z",
      query: "MARKETING",
    },
    {
      videoId: "zA2jPhZJsiU",
      title: "Dairy Farming Financial Planning & Subsidies",
      channelTitle: "Finance for Farmers",
      thumbnail: "https://i.ytimg.com/vi/zA2jPhZJsiU/hqdefault.jpg",
      description:
        "Detailed breakdown of capital requirements and government schemes.",
      publishedAt: "2023-05-10T00:00:00Z",
      query: "FINANCIAL PLANNING",
    },
  ],
  food_processing: [
    {
      videoId: "r0Ds0l3-DZA",
      title: "Flour Mill (Atta Chakki) Business Plan",
      channelTitle: "Small Business Ideas",
      thumbnail: "https://i.ytimg.com/vi/r0Ds0l3-DZA/hqdefault.jpg",
      description: "Complete guide on starting a local flour mill enterprise.",
      publishedAt: "2023-02-14T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
  ],
  tailoring: [
    {
      videoId: "UwfmDapoQhs",
      title: "Start a Tailoring & Boutique Shop at Home",
      channelTitle: "Creative Enterprise",
      thumbnail: "https://i.ytimg.com/vi/UwfmDapoQhs/hqdefault.jpg",
      description: "Step-by-step guide to setting up a stitching business.",
      publishedAt: "2023-01-20T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
  ],
  handicrafts: [
    {
      videoId: "W6cfYdgACsc",
      title: "Terracotta Pottery & Handicrafts Business Guide",
      channelTitle: "Artisan India",
      thumbnail: "https://i.ytimg.com/vi/W6cfYdgACsc/hqdefault.jpg",
      description:
        "How to commercialize traditional terracotta and clay pottery making.",
      publishedAt: "2023-04-12T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
  ],
  poultry: [
    {
      videoId: "r0Ds0l3-DZA",
      title: "Poultry Farming Business Plan for Beginners",
      channelTitle: "AgriTech India",
      thumbnail: "https://i.ytimg.com/vi/r0Ds0l3-DZA/hqdefault.jpg",
      description:
        "Step-by-step setup for a successful broiler or layer poultry farm.",
      publishedAt: "2023-02-18T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
  ],
  grocery: [
    {
      videoId: "2Cx936oIeBY",
      title: "Kirana Store Business Plan and Profit Margins",
      channelTitle: "Retail India",
      thumbnail: "https://i.ytimg.com/vi/2Cx936oIeBY/hqdefault.jpg",
      description:
        "How to successfully run a village grocery and provisions store.",
      publishedAt: "2023-07-09T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
  ],
  food_stall: [
    {
      videoId: "d4fPx30Ut7I",
      title: "Street Food Stall Business Plan",
      channelTitle: "Foodpreneur India",
      thumbnail: "https://i.ytimg.com/vi/d4fPx30Ut7I/hqdefault.jpg",
      description: "Starting a profitable street food or snacks stall.",
      publishedAt: "2023-08-01T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
  ],
  repair_services: [
    {
      videoId: "wit7LuORdIg",
      title: "Electrical Repair Shop Business",
      channelTitle: "Tech Mechanics",
      thumbnail: "https://i.ytimg.com/vi/wit7LuORdIg/hqdefault.jpg",
      description:
        "Setting up an electronics and electrical repair service center.",
      publishedAt: "2023-09-15T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
  ],
  agri_equipment: [
    {
      videoId: "EmT2U-pHtFA",
      title: "Tractor & Farm Equipment Repair Shop",
      channelTitle: "Agri Hardware",
      thumbnail: "https://i.ytimg.com/vi/EmT2U-pHtFA/hqdefault.jpg",
      description:
        "Business guide for maintaining and repairing agricultural tools.",
      publishedAt: "2023-10-05T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
  ],
  default: [
    {
      videoId: "5D73Om_kNRk",
      title: "Government Training Module: MSME Business Registration",
      channelTitle: "Gov MSME Training",
      thumbnail: "https://i.ytimg.com/vi/5D73Om_kNRk/hqdefault.jpg",
      description:
        "Official guidance on Udyam registration and rural enterprise setup.",
      publishedAt: "2023-02-10T00:00:00Z",
      query: "STARTING THE BUSINESS",
    },
  ],
};

// Aliases for missing categories are removed; every core category is explicitly mapped above.

module.exports = { MOCK_VIDEOS, CATEGORY_TAGS };
