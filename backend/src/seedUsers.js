/**
 * Seed login credentials for PST ERP.
 *   admin (admin), accounts (accounts_logistics), purchase (purchase_sales)
 *
 * Run from backend folder:  node src/seedUsers.js
 * Requires MONGO_URI in pst-erp/backend/.env
 */
import "./loadEnv.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Company from "./models/Company.js";

const USERS = [
  { username: "admin",    password: "admin@pst2026",    name: "PST Admin",     role: "admin" },
  { username: "accounts", password: "accounts@pst2026", name: "PST Accounts",  role: "accounts_logistics" },
  { username: "purchase", password: "purchase@pst2026", name: "PST Purchase",  role: "purchase_sales" },
];

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI missing in pst-erp/backend/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);

  const pst = await Company.findOne({ code: "PST" }).lean();
  const allCompanyIds = [pst?._id].filter(Boolean);
  if (!allCompanyIds.length) {
    console.warn("⚠️  No PST company found. Run `npm run seed:company` first.");
  }

  for (const u of USERS) {
    const email = `${u.username}@purestreamenergy.com`;
    const existing = await User.findOne({
      $or: [{ username: u.username }, { email }],
    });
    const passwordHash = await bcrypt.hash(u.password, 10);
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.name = u.name;
      existing.role = u.role;
      existing.email = email;
      if (allCompanyIds.length) {
        existing.allowedCompanies = allCompanyIds;
        if (!existing.defaultCompany) existing.defaultCompany = allCompanyIds[0];
      }
      await existing.save();
      console.log("Updated:", u.username, "(", u.role, ")");
    } else {
      await User.create({
        username: u.username,
        email,
        name: u.name,
        passwordHash,
        role: u.role,
        allowedCompanies: allCompanyIds,
        defaultCompany: allCompanyIds[0] || null,
      });
      console.log("Created:", u.username, "(", u.role, ")");
    }
  }

  const all = await User.find().select("username email role").lean();
  console.log("\nAll users:", all.length);
  all.forEach((u) => console.log(" -", u.username, u.email, u.role));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
