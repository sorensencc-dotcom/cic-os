#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");

function args() {
  const out = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 2) out[a[i].replace(/^--/, "")] = a[i + 1];
  return out;
}

function fetchLineage(buildId, output) {
  const endpoint = process.env.FOUNDRY_LINEAGE_ENDPOINT;
  const apiKey = process.env.FOUNDRY_API_KEY;

  if (!endpoint || !apiKey) {
    console.error("Missing FOUNDRY_LINEAGE_ENDPOINT or FOUNDRY_API_KEY");
    process.exit(1);
  }

  const url = new URL(endpoint);
  url.searchParams.set("build_id", buildId);

  const req = https.request(
    url,
    { method: "GET", headers: { Authorization: `Bearer ${apiKey}` } },
    (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error(`Lineage fetch failed: ${res.statusCode} ${data}`);
          process.exit(1);
        }
        fs.writeFileSync(path.resolve(output), data);
        console.log(`Lineage written to ${output}`);
      });
    }
  );

  req.on("error", (e) => {
    console.error("Lineage fetch error:", e);
    process.exit(1);
  });

  req.end();
}

const a = args();
if (!a["build-id"] || !a.output) {
  console.error("Usage: fetch-lineage.js --build-id <id> --output <file>");
  process.exit(1);
}

fetchLineage(a["build-id"], a.output);
