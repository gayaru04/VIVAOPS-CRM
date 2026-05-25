import * as dotenv from "dotenv";
import { existsSync } from "fs";

dotenv.config({ path: ".env.local" });

console.log("VivaOps CRM — Setup\n");

// Check env
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "DATABASE_URL",
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("❌ Missing env vars:", missing.join(", "));
  console.error("Copy .env.example → .env.local and fill in your Supabase credentials.");
  process.exit(1);
}

console.log("✅ Environment variables present");
console.log("▶️  Run `npm run db:push` to push schema to database");
console.log("▶️  Run `npm run db:seed` to seed Melbourne demo data");
console.log("▶️  Run `npm run dev` to start the dev server");
console.log("\nDemo credentials: demo@vivamelbourne.com.au / vivaops2024");
