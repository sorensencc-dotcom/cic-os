import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ModelSpec } from "./modelSpec.js";
import { ConfigurationError } from "./errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODELS_DIR = path.join(__dirname, "..", "models");

let registry: Map<string, ModelSpec> | null = null;

export function loadModelRegistry(): Map<string, ModelSpec> {
  if (registry) return registry;

  registry = new Map();

  const files = fs.readdirSync(MODELS_DIR).filter((f: string) => f.endsWith(".json"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(MODELS_DIR, file), "utf8");
    const spec = JSON.parse(raw) as ModelSpec;
    validateModelSpec(spec);
    registry.set(spec.name, spec);
  }

  return registry;
}

export function getModelSpec(name: string): ModelSpec {
  const reg = loadModelRegistry();
  const spec = reg.get(name);
  if (!spec) {
    throw new ConfigurationError(`Unknown model: ${name}`);
  }
  return spec;
}

function validateModelSpec(spec: ModelSpec): void {
  if (!spec.name || !spec.provider || !spec.type || !spec.apiBase || !spec.env) {
    throw new ConfigurationError(`Invalid model spec: ${spec?.name || 'unknown'}`);
  }
}
