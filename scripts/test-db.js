const { pool, testConnection } = require("../database");
const db = require("../db");

async function main() {
  await testConnection();
  const businesses = await db.getBusinesses();
  if (!businesses.length) {
    throw new Error("No businesses found. Run npm run db:seed first.");
  }

  const id = `PRV-DB-TEST-${Date.now()}`;
  const saved = await db.saveAssessment({
    id,
    applicantName: "PostgreSQL connection test",
    businessCategory: "dairy",
    expectedInvestment: 10000,
    opportunityScore: 80,
  });
  const assessments = await db.getAllAssessments();
  const retrieved = assessments.find((assessment) => assessment.id === saved.id);
  if (!retrieved) throw new Error("Saved assessment could not be retrieved.");

  console.log(`Database connection passed; retrieved ${businesses.length} businesses.`);
  console.log(`Assessment round-trip passed: ${retrieved.id}`);
  await pool.query("DELETE FROM assessments WHERE id = $1", [id]);
}

main()
  .catch((error) => {
    console.error("Database test failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
