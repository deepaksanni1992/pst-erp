/**
 * Seed a single super_admin user for PST ERP (replaces all legacy seed accounts).
 *
 * Run from backend folder:  node src/seedUsers.js
 * Requires MONGO_URI and DEFAULT_ADMIN_PASSWORD in pst-erp/backend/.env
 *
 * This script DELETES ALL existing users (including retired admin/accounts/purchase),
 * then creates one super_admin account. Passwords never belong in source code.
 */
import "./loadEnv.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Company from "./models/Company.js";
import { validateRequiredEnv } from "./config/validateEnv.js";

/** Retired demo passwords — refuse in production so they are not re-seeded by mistake. */
const RETIRED_LEGACY_PASSWORDS = new Set([
  "admin@pst2026",
  "accounts@pst2026",
  "purchase@pst2026",
]);

function trimEnv(key) {
  return String(process.env[key] ?? "").trim();
}

function resolveSeedPassword() {
  const pw = trimEnv("DEFAULT_ADMIN_PASSWORD");
  if (!pw) {
    console.warn("⚠️  DEFAULT_ADMIN_PASSWORD is not set.");
    console.error(
      "Set DEFAULT_ADMIN_PASSWORD in backend/.env (see backend/.env.example). Do not commit secrets."
    );
    process.exit(1);
  }

  const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";
  if (isProd && RETIRED_LEGACY_PASSWORDS.has(pw.toLowerCase())) {
    console.error(
      "❌ Refusing retired legacy seed passwords (admin@pst2026 / accounts@pst2026 / purchase@pst2026). Choose a new strong password."
    );
    process.exit(1);
  }
  if (isProd) {
    if (pw.length < 12) {
      console.error(
        "❌ Refusing DEFAULT_ADMIN_PASSWORD shorter than 12 characters in production (NODE_ENV=production)."
      );
      process.exit(1);
    }
    if (/^(change_me|changeme|password|admin123)$/i.test(pw)) {
      console.error(
        "❌ Refusing a predictable DEFAULT_ADMIN_PASSWORD in production. Use a strong unique password."
      );
      process.exit(1);
    }
  } else if (/^change_me$/i.test(pw)) {
    console.warn(
      "⚠️  Using placeholder DEFAULT_ADMIN_PASSWORD=change_me for non-production only. Change before any shared or deployed environment."
    );
  }

  return pw;
}

async function run() {
  validateRequiredEnv({ requireJwt: false });

  const password = resolveSeedPassword();

  const username =
    trimEnv("DEFAULT_ADMIN_USERNAME") ||
    trimEnv("SEED_ADMIN_USERNAME") ||
    "pst_super_admin";
  const displayName = trimEnv("DEFAULT_ADMIN_NAME") || "PST Super Admin";
  const role = "super_admin";

  await mongoose.connect(process.env.MONGO_URI);

  const companies = await Company.find({ isActive: true }).sort({ name: 1 }).select("_id").lean();
  const allCompanyIds = companies.map((c) => c._id);
  if (!allCompanyIds.length) {
    const pst = await Company.findOne({ code: "PST" }).select("_id").lean();
    if (pst?._id) allCompanyIds.push(pst._id);
  }

  if (!allCompanyIds.length) {
    console.warn(
      "⚠️  No companies found. Run `npm run seed:company` first or login will return \"No active company access\"."
    );
  }

  const deleted = await User.deleteMany({});
  console.log("Removed users:", deleted.deletedCount);

  const email =
    trimEnv("DEFAULT_ADMIN_EMAIL") || `${username}@purestreamenergy.com`;
  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    name: displayName,
    passwordHash,
    role,
    allowedCompanies: allCompanyIds,
    defaultCompany: allCompanyIds[0] || null,
  });

  console.log("Created single super_admin:", username, email);
  console.log("Companies linked:", allCompanyIds.length);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
