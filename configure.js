#!/usr/bin/env node

/**
 * Interactive model configurator
 *
 * Run: npm run configure
 *
 * Lets you browse the registry, toggle models on/off,
 * and save your selection to config.json.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as readline from "node:readline";
import { REGISTRY } from "../src/registry.js";
import { CONFIG_PATH, saveConfig } from "../src/config.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── Terminal helpers ─────────────────────────────────────────────────────────

const ESC = "\x1b[";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const c = {
  green:   (s) => `\x1b[32m${s}${RESET}`,
  yellow:  (s) => `\x1b[33m${s}${RESET}`,
  blue:    (s) => `\x1b[34m${s}${RESET}`,
  cyan:    (s) => `\x1b[36m${s}${RESET}`,
  magenta: (s) => `\x1b[35m${s}${RESET}`,
  dim:     (s) => `${DIM}${s}${RESET}`,
  bold:    (s) => `${BOLD}${s}${RESET}`,
  red:     (s) => `\x1b[31m${s}${RESET}`,
};

function clear() { process.stdout.write("\x1bc"); }
function moveTo(row, col = 1) { process.stdout.write(`${ESC}${row};${col}H`); }
function hideCursor() { process.stdout.write("\x1b[?25l"); }
function showCursor() { process.stdout.write("\x1b[?25h"); }

// ── Load existing config ─────────────────────────────────────────────────────

function loadCurrentIds() {
  try {
    if (!existsSync(CONFIG_PATH)) return [];
    const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
    return Array.isArray(raw.activeModels) ? raw.activeModels : [];
  } catch {
    return [];
  }
}

// ── Estimate round cost ──────────────────────────────────────────────────────

function estimateCost(selectedModels) {
  // ~2K input tokens + ~500 output tokens per model (typical review)
  const INPUT_TOKENS = 2_000;
  const OUTPUT_TOKENS = 500;
  let total = 0;
  for (const m of selectedModels) {
    total += (m.inputCost / 1_000_000) * INPUT_TOKENS;
    total += (m.outputCost / 1_000_000) * OUTPUT_TOKENS;
  }
  return total;
}

// ── Tag color ────────────────────────────────────────────────────────────────

function colorTag(tag) {
  switch (tag) {
    case "fast":      return c.green(tag);
    case "cheap":     return c.cyan(tag);
    case "coding":    return c.blue(tag);
    case "reasoning": return c.magenta(tag);
    case "large":     return c.yellow(tag);
    default:          return c.dim(tag);
  }
}

// ── Main interactive UI ──────────────────────────────────────────────────────

async function main() {
  const currentIds = new Set(loadCurrentIds());
  const selected = new Set(currentIds);
  let cursor = 0;

  hideCursor();
  process.on("exit", showCursor);
  process.on("SIGINT", () => { showCursor(); process.exit(0); });

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  function render() {
    clear();
    const width = process.stdout.columns || 80;
    const divider = c.dim("─".repeat(width));

    console.log(c.bold("\n  🔍 Multi-Model Review — Configure Panel\n"));
    console.log(c.dim("  Space: toggle  ↑/↓: navigate  a: select all  n: none  Enter: save  q: quit\n"));
    console.log(divider);

    // Header row
    const header = [
      "     ",
      c.dim("Model".padEnd(22)),
      c.dim("Provider".padEnd(14)),
      c.dim("$/M in".padEnd(8)),
      c.dim("$/M out".padEnd(8)),
      c.dim("Tags"),
    ].join("");
    console.log(header);
    console.log(divider);

    REGISTRY.forEach((m, i) => {
      const isSelected = selected.has(m.id);
      const isCursor = i === cursor;
      const check = isSelected ? c.green("✓") : c.dim("○");
      const arrow = isCursor ? c.cyan("▶") : " ";
      const name  = isCursor ? c.bold(c.cyan(m.name.padEnd(22))) : m.name.padEnd(22);
      const prov  = m.provider.padEnd(14);
      const inCost = `$${m.inputCost.toFixed(2)}`.padEnd(8);
      const outCost = `$${m.outputCost.toFixed(2)}`.padEnd(8);
      const tags  = m.tags.map(colorTag).join(" ");
      const desc  = isCursor ? `\n  ${c.dim("  " + m.description)}` : "";

      const row = [
        `  ${arrow} ${check} `,
        name,
        c.dim(prov),
        c.dim(inCost),
        c.dim(outCost),
        tags,
        desc,
      ].join("");

      console.log(row);
    });

    console.log(divider);

    // Summary
    const selectedModels = REGISTRY.filter((m) => selected.has(m.id));
    const cost = estimateCost(selectedModels);
    const count = selectedModels.length;

    if (count === 0) {
      console.log(c.red(`\n  No models selected. Select at least 1.\n`));
    } else {
      console.log(
        `\n  ${c.bold(String(count))} model${count === 1 ? "" : "s"} selected  ` +
        c.dim("·") +
        `  Est. cost per round: ${c.green("~$" + cost.toFixed(3))}` +
        c.dim("  (2K input + 500 output tokens per model)\n")
      );
    }
  }

  render();

  for await (const [str, key] of keyStream()) {
    if (!key) continue;

    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      showCursor();
      console.log("\n  Cancelled. config.json unchanged.\n");
      process.exit(0);
    }

    if (key.name === "up"   || (key.ctrl && key.name === "p")) cursor = Math.max(0, cursor - 1);
    if (key.name === "down" || (key.ctrl && key.name === "n")) cursor = Math.min(REGISTRY.length - 1, cursor + 1);

    if (key.name === "space") {
      const id = REGISTRY[cursor].id;
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
    }

    if (str === "a" || str === "A") REGISTRY.forEach((m) => selected.add(m.id));
    if (str === "n" || str === "N") selected.clear();

    if (key.name === "return") {
      if (selected.size === 0) {
        render();
        continue;
      }

      // Preserve registry order in the saved config
      const orderedIds = REGISTRY.filter((m) => selected.has(m.id)).map((m) => m.id);

      // Load existing settings to preserve them
      let existingSettings = {};
      try {
        const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
        existingSettings = raw.settings ?? {};
      } catch {}

      saveConfig({ activeIds: orderedIds, settings: existingSettings });

      showCursor();
      clear();

      const saved = REGISTRY.filter((m) => selected.has(m.id));
      const cost  = estimateCost(saved);

      console.log(c.bold("\n  ✓ Saved to config.json\n"));
      console.log(`  ${c.bold(String(saved.length))} models active:\n`);
      saved.forEach((m) => {
        console.log(`    ${c.green("✓")} ${c.bold(m.name)} ${c.dim("(" + m.id + ")")}`);
      });
      console.log(c.dim(`\n  Est. cost per review round: ~$${cost.toFixed(3)}`));
      console.log(c.dim("\n  Restart your MCP server to apply changes.\n"));

      process.exit(0);
    }

    render();
  }
}

// ── Async keypress stream ────────────────────────────────────────────────────

async function* keyStream() {
  for await (const [str, key] of on(process.stdin, "keypress")) {
    yield [str, key];
  }
}

function on(emitter, event) {
  const buf = [];
  let resolve;
  emitter.on(event, (...args) => {
    if (resolve) { resolve(args); resolve = null; }
    else buf.push(args);
  });
  return {
    [Symbol.asyncIterator]() {
      return {
        next() {
          if (buf.length) return Promise.resolve({ value: buf.shift(), done: false });
          return new Promise((r) => { resolve = (v) => r({ value: v, done: false }); });
        },
      };
    },
  };
}

main().catch((err) => {
  showCursor();
  console.error(err);
  process.exit(1);
});
