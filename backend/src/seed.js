/**
 * Legacy bootstrap seed for PST ERP.
 * Prefer `npm run seed:users` going forward — this file is kept only as a quick admin/staff fallback.
 */
import "./loadEnv.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI missing in pst-erp/backend/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany({
    email: { $in: ["admin@purestreamenergy.com", "staff@purestreamenergy.com"] },
  });

  const adminHash = await bcrypt.hash("admin123", 10);
  const staffHash = await bcrypt.hash("staff123", 10);

  await User.create([
    {
      name: "Admin",
      email: "admin@purestreamenergy.com",
      username: "admin",
      passwordHash: adminHash,
      role: "admin",
    },
    {
      name: "Staff",
      email: "staff@purestreamenergy.com",
      username: "staff",
      passwordHash: staffHash,
      role: "staff",
    },
  ]);

  console.log("✅ Seeded users (admin / staff)");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
