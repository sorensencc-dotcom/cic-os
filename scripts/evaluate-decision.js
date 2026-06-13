#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function args() {
  const out = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 2) out[a[i].replace(/^--/, "")] = a[i + 1];
  return out;
}

const a = args();
if (!a["decision-file"]) {
  console.error("Usage: evaluate-decision.js --decision-file <file>");
  process.exit(1);
}

const decision = JSON.parse(fs.readFileSync(path.resolve(a["decision-file"]), "utf8"));

console.log(`Governance decision: ${decision.decision}`);
console.log(`Reason: ${decision.decision_reason || ""}`);

console.log(`::set-output name=decision::${decision.decision}`);
console.log(`::set-output name=reason::${decision.decision_reason || ""}`);
