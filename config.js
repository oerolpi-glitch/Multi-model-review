/**
 * Config loader
 *
 * Reads config.json, validates it, and resolves active models from the registry.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { REGISTRY, findById } from "./registry.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const CONFIG_PATH = join(ROOT, "config.json");

const DEFAULTS = {
  timeoutMs: 30_000,
  maxResponseTokens: 1_000,
  maxInputChars: 100_000,
};

export function loadConfig() {
  let raw;
  try {
    raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  } catch (err) {
    console.error(`[multi-review] Could not read config.json: ${err.message}`);
    console.error(`[multi-review] Run 'npm run configure' to set it up.`);
    process.exit(1);
  }

  const activeIds = Array.isArray(raw.activeModels) ? raw.activeModels : [];
  if (activeIds.length === 0) {
    console.error("[multi-review] config.json has no activeModels. Run 'npm run configure'.");
    process.exit(1);
  }

  const models = [];
  for (const id of activeIds) {
    const entry = findById(id);
    if (!entry) {
      console.error(
        `[multi-review] Unknown model id "${id}" in config.json.\n` +
        `  Valid ids: ${REGISTRY.map((m) => m.id).join(", ")}\n` +
        `  Run 'npm run configure' to fix this.`
      );
      process.exit(1);
    }
    models.push(entry);
  }

  const s = raw.settings ?? {};
  const settings = {
    timeoutMs: Number.isFinite(s.timeoutMs) ? s.timeoutMs : DEFAULTS.timeoutMs,
    maxResponseTokens: Number.isFinite(s.maxResponseTokens) ? s.maxResponseTokens : DEFAULTS.maxResponseTokens,
    maxInputChars: Number.isFinite(s.maxInputChars) ? s.maxInputChars : DEFAULTS.maxInputChars,
  };

  return { models, settings };
}

export function saveConfig({ activeIds, settings = {} }) {
  const config = {
    _comment: "Edit freely or run 'npm run configure' for an interactive picker.",
    _docs: "https://github.com/YOUR_USERNAME/multi-model-review#configuration",
    activeModels: activeIds,
    settings: {
      timeoutMs: settings.timeoutMs ?? DEFAULTS.timeoutMs,
      maxResponseTokens: settings.maxResponseTokens ?? DEFAULTS.maxResponseTokens,
      maxInputChars: settings.maxInputChars ?? DEFAULTS.maxInputChars,
    },
  };
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", "utf8");
}
