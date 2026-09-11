const { pool, testConnection } = require("../database");
const seedData = require("../data/seedData");

async function seed() {
  await testConnection();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const district of seedData.districts) {
      await client.query(
        `INSERT INTO districts
          (name, state, lat, lng, population, rural_percent, literacy_rate,
           avg_household_income, top_crops)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
         ON CONFLICT (name, state) DO UPDATE SET
           lat = EXCLUDED.lat, lng = EXCLUDED.lng, population = EXCLUDED.population,
           rural_percent = EXCLUDED.rural_percent, literacy_rate = EXCLUDED.literacy_rate,
           avg_household_income = EXCLUDED.avg_household_income,
           top_crops = EXCLUDED.top_crops`,
        [
          district.name,
          district.state,
          district.lat,
          district.lng,
          district.population,
          district.ruralPercent,
          district.literacyRate,
          district.avgHouseholdIncome,
          JSON.stringify(district.topCrops || []),
        ],
      );
    }

    for (const business of seedData.businesses) {
      await client.query(
        `INSERT INTO businesses
          (id, name, category, category_key, scale, lat, lng, state, district,
           established, monthly_revenue, employees, rating)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, category = EXCLUDED.category,
           category_key = EXCLUDED.category_key, scale = EXCLUDED.scale,
           lat = EXCLUDED.lat, lng = EXCLUDED.lng, state = EXCLUDED.state,
           district = EXCLUDED.district, established = EXCLUDED.established,
           monthly_revenue = EXCLUDED.monthly_revenue, employees = EXCLUDED.employees,
           rating = EXCLUDED.rating`,
        [
          business.id,
          business.name,
          business.category,
          business.categoryKey,
          business.scale,
          business.lat,
          business.lng,
          business.state,
          business.district,
          business.established,
          business.monthlyRevenue,
          business.employees,
          business.rating,
        ],
      );
    }

    for (const [categoryKey, benchmark] of Object.entries(
      seedData.marketBenchmarks,
    )) {
      await client.query(
        `INSERT INTO market_benchmarks
          (category_key, demand_index, saturation, avg_ticket_size, growth_rate, margin_percent)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (category_key) DO UPDATE SET
           demand_index = EXCLUDED.demand_index, saturation = EXCLUDED.saturation,
           avg_ticket_size = EXCLUDED.avg_ticket_size, growth_rate = EXCLUDED.growth_rate,
           margin_percent = EXCLUDED.margin_percent`,
        [
          categoryKey,
          benchmark.demandIndex,
          benchmark.saturation,
          benchmark.avgTicketSize,
          benchmark.growthRate,
          benchmark.marginPercent,
        ],
      );
    }

    await client.query("COMMIT");
    console.log(
      `Seeded ${seedData.businesses.length} businesses, ${seedData.districts.length} districts, and ${Object.keys(seedData.marketBenchmarks).length} benchmarks.`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

seed()
  .catch((error) => {
    console.error("Database seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
