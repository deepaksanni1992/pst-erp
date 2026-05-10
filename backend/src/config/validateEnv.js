/**
 * Central validation for process.env before the API connects to MongoDB or signs JWTs.
 */

const WEAK_JWT_SECRETS = new Set([
  "replace-with-strong-secret",
  "your_secret",
  "your_jwt_secret",
  "changeme",
  "change_me",
  "",
]);

function trim(key) {
  return String(process.env[key] ?? "").trim();
}

/**
 * @param {{ requireJwt?: boolean }} [options]
 * @throws {Error} If required variables are missing or unsafe in production.
 */
export function validateRequiredEnv(options = {}) {
  const requireJwt = options.requireJwt !== false;

  const mongo = trim("MONGO_URI");
  if (!mongo) {
    throw new Error(
      "MONGO_URI is missing. Copy backend/.env.example to backend/.env and set your MongoDB URI."
    );
  }

  if (requireJwt) {
    const jwtSecret = trim("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET is missing. Copy backend/.env.example to backend/.env and set a strong random secret."
      );
    }

    const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";
    if (isProd && WEAK_JWT_SECRETS.has(jwtSecret.toLowerCase())) {
      throw new Error(
        "JWT_SECRET must not use a placeholder value in production. Generate a strong random string."
      );
    }
    if (isProd && jwtSecret.length < 32) {
      throw new Error(
        "JWT_SECRET should be at least 32 characters in production for adequate entropy."
      );
    }
  }
}
