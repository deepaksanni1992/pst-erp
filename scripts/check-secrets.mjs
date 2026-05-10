#!/usr/bin/env node
/**
 * Basic secret leak detector for CI and pre-commit.
 * Run from repo root: npm run check:secrets
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  "uploads",
  "coverage",
]);

const TEXT_EXT = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".txt",
  ".html",
  ".css",
  ".env",
  ".example",
]);

function listTrackedFiles() {
  try {
    const out = execSync("git ls-files -z", {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    return out.split("\0").filter(Boolean);
  } catch {
    console.warn("⚠️  Not a git repo or git unavailable — scanning working tree only.");
    return walkFiles(ROOT);
  }
}

function walkFiles(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const rel = path.join(dir, e.name);
    const short = path.relative(ROOT, rel);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walkFiles(rel, acc);
    } else if (e.isFile()) {
      if (e.name === ".env" || (e.name.startsWith(".env") && !e.name.endsWith(".example")))
        continue;
      if (TEXT_EXT.has(path.extname(e.name)) || e.name.startsWith(".env")) {
        acc.push(short.replace(/\\/g, "/"));
      }
    }
  }
  return acc;
}

function isIgnoredPath(rel) {
  const parts = rel.split("/");
  return parts.some((p) => IGNORE_DIRS.has(p));
}

/** Mongo connection strings with embedded credentials (not placeholders). */
const MONGO_WITH_CREDS =
  /mongodb(\+srv)?:\/\/([^/"'\s]+):([^@"'\s]+)@/;

function looksLikePlaceholder(user, pass) {
  const u = String(user || "").toLowerCase();
  const p = String(pass || "").toLowerCase();
  if (u.includes("<") || p.includes("<")) return true;
  if (
    u.includes("your_") ||
    p.includes("your_") ||
    u.includes("example") ||
    p === "password" ||
    p === "<password>"
  )
    return true;
  return false;
}

const AWS_ACCESS_KEY = /\bAKIA[0-9A-Z]{16}\b/;
const PEM_BEGIN = /-----BEGIN [A-Z ]*PRIVATE KEY-----/;

const issues = [];

function scanContent(relPath, text) {
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = line.match(MONGO_WITH_CREDS);
    if (m && !looksLikePlaceholder(m[2], m[3])) {
      issues.push({
        relPath,
        line: i + 1,
        msg: "Possible MongoDB URI with embedded credentials",
        snippet: line.trim().slice(0, 120),
      });
    }
    if (AWS_ACCESS_KEY.test(line)) {
      issues.push({
        relPath,
        line: i + 1,
        msg: "Possible AWS access key id (AKIA…)",
        snippet: line.trim().slice(0, 120),
      });
    }
    if (PEM_BEGIN.test(line)) {
      issues.push({
        relPath,
        line: i + 1,
        msg: "Private key material (PEM)",
        snippet: line.trim().slice(0, 80),
      });
    }
  });
}

function main() {
  const tracked = listTrackedFiles().filter((r) => !isIgnoredPath(r));

  for (const rel of tracked) {
    const base = path.basename(rel);
    if (base === ".env" || (base.startsWith(".env") && !base.endsWith(".example"))) {
      issues.push({
        relPath: rel,
        line: 0,
        msg: "Secrets file should not be tracked by git — remove from index and rely on .gitignore",
        snippet: "",
      });
      continue;
    }

    const ext = path.extname(rel);
    if (!TEXT_EXT.has(ext) && !base.startsWith(".env")) continue;

    const full = path.join(ROOT, rel);
    let buf;
    try {
      buf = fs.readFileSync(full);
    } catch {
      continue;
    }
    if (buf.includes(0)) continue;
    const text = buf.toString("utf8");
    scanContent(rel, text);
  }

  if (issues.length) {
    console.error("\n❌ check:secrets found potential issues:\n");
    for (const x of issues) {
      console.error(`  ${x.relPath}${x.line ? `:${x.line}` : ""} — ${x.msg}`);
      if (x.snippet) console.error(`    ${x.snippet}`);
    }
    console.error("\nRemove secrets from tracked files, rotate leaked credentials, add to .gitignore.\n");
    process.exit(1);
  }

  console.log("✅ check:secrets — no obvious leaked patterns in scanned files.");
}

main();
