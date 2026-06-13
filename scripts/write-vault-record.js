#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");

function args() {
  const out = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 2) out[a[i].replace(/^--/, "")] = a[i + 1];
  return out;
}

function canonicalize(value) {
  const sort = (obj) => {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(sort);
    const out = {};
    for (const k of Object.keys(obj).sort()) out[k] = sort(obj[k]);
    return out;
  };
  return JSON.stringify(sort(value));
}

function digest(record) {
  const h = crypto.createHash("sha256");
  h.update(canonicalize(record));
  return `sha256:${h.digest("hex")}`;
}

function writeVault(endpoint, apiKey, files) {
  const lineage = JSON.parse(fs.readFileSync(files.lineage, "utf8"));
  const decision = JSON.parse(fs.readFileSync(files.decision, "utf8"));
  const signing = JSON.parse(fs.readFileSync(files.signing, "utf8"));
  const promotion = JSON.parse(fs.readFileSync(files.promotion, "utf8"));

  const now = new Date().toISOString();

  const record = {
    vault_record_id: crypto.randomUUID(),
    schema_version: "24.5.0",
    created_at: now,

    build_id: lineage.build_id,
    cic_pipeline_id: lineage.cic_pipeline_id,
    git: lineage.git,
    environment: lineage.environment,

    sbom_ref: lineage.sbom_ref,
    provenance_ref: lineage.provenance_ref,
    determinism_hash: lineage.determinism_hash,
    test_summary: lineage.test_summary,

    type: lineage.artifact.type,
    coordinates: lineage.artifact.coordinates,
    artifact_store_ref: promotion.artifact_store_ref || null,
    digest: lineage.artifact.digest,
    size_bytes: lineage.artifact.size_bytes,

    decision: decision.decision,
    decision_reason: decision.decision_reason,
    policy_version: decision.policy_version,
    council: decision.council,

    signing_status: signing.signing_status || signing.status,
    signing_key_id: signing.signing_key_id || null,
    signature_ref: signing.signature_ref || null,
    signing_timestamp: signing.signing_timestamp || signing.timestamp || now,

    promotion_status: promotion.promotion_status || promotion.status,
    target_environment: promotion.target_environment || null,
    promotion_timestamp: promotion.promotion_timestamp || promotion.timestamp || null,
    initiator: promotion.initiator || null,

    request_id: decision.request_id,
    ci_job_id: lineage.audit.ci_job_id,
    ip_or_node_id: lineage.audit.ip_or_node_id,
    extra_metadata: lineage.audit.extra_metadata || {},
  };

  const d = digest(record);
  const payload = { ...record, vault_digest: d };
  const body = canonicalize(payload);

  const url = new URL(endpoint);

  const req = https.request(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(body),
      },
    },
    (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.error(`Vault write failed: ${res.statusCode} ${data}`);
          process.exit(1);
        }
        console.log("Vault record written:", data);
      });
    }
  );

  req.on("error", (e) => {
    console.error("Vault write error:", e);
    process.exit(1);
  });

  req.write(body);
  req.end();
}

const a = args();
if (!a["vault-endpoint"] || !a["vault-api-key"] || !a["lineage-file"] || !a["decision-file"] || !a["signing-file"] || !a["promotion-file"]) {
  console.error(
    "Usage: write-vault-record.js --vault-endpoint <url> --vault-api-key <key> --lineage-file <file> --decision-file <file> --signing-file <file> --promotion-file <file>"
  );
  process.exit(1);
}

writeVault(a["vault-endpoint"], a["vault-api-key"], {
  lineage: a["lineage-file"],
  decision: a["decision-file"],
  signing: a["signing-file"],
  promotion: a["promotion-file"],
});
