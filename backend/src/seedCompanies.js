/**
 * Seed default company for PST ERP — Purestream Energy FZE.
 * Run from backend folder:  node src/seedCompanies.js
 * Requires MONGO_URI in pst-erp/backend/.env
 */
import "./loadEnv.js";
import mongoose from "mongoose";
import Company from "./models/Company.js";

const COMPANIES = [
  {
    name: "Purestream Energy FZE",
    code: "PST",
    logoUrl: "/pst-logo.png",
    address: "Hamriyah Free Zone, Sharjah, UAE",
    email: "info@purestreamenergy.com",
    phone: "+971-000000000",
    website: "www.purestreamenergy.com",
    currency: "USD",
    isActive: true,
  },
];

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI missing in pst-erp/backend/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  for (const c of COMPANIES) {
    await Company.findOneAndUpdate({ code: c.code }, { $set: c }, { upsert: true, new: true });
    console.log(`✅ Upserted company ${c.code} — ${c.name}`);
  }
  await mongoose.disconnect();
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
