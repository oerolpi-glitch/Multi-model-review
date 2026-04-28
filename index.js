#!/usr/bin/env node

/**
 * Multi-Model Review — MCP Server for Claude Code
 *
 * Fans out code/plan reviews to your configured AI models in parallel.
 * Manage your model panel with: npm run configure
 *
 * Security:
 *   - API key read from env only, never logged or exposed
 *   - Input length capped to prevent runaway costs
 *   - Per-model timeouts enforced
 *   - No data persisted to disk
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { loadConfig, saveConfig } from "./config.js";
import { REGISTRY } from "./registry.js";

// ── Startup ──────────────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error(
    "[multi-review] ERROR: OPENROUTER_API_KEY is not set.\n" +
    "  Get one at https://openrouter.ai/settings/keys\n" +
    "  Then add it to your claude.json env block."
  );
  process.exit(1);
}

// Config is loaded once at startup. Reload the MCP server to apply config changes.
let { models: activeModels, settings } = loadConfig();

console.error(`[multi-review] Loaded ${activeModels.length} models:`);
activeModels.forEach((m) => console.error(`  • ${m.name} (${m.model})`));

// ── OpenRouter API ───────────────────────────────────────────────────────────

async function callModel(modelEntry) {
  const { model, maxTokens: modelMaxTokens } = modelEntry;
  const maxTokens = modelMaxTokens || settings.maxResponseTokens;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), settings.timeoutMs);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/multi-model-review",
        "X-Title": "Multi-Model Code Review",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: modelEntry._prompt }],
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response");

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Fan-out ──────────────────────────────────────────────────────────────────

async function fanOut(prompt) {
  const results = await Promise.allSettled(
    activeModels.map(async (m) => {
      const start = Date.now();
      const text = await callModel({ ...m, _prompt: prompt });
      return { name: m.name, text, ms: Date.now() - start };
    })
  );

  let succeeded = 0;
  let failed = 0;
  const sections = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      const { name, text, ms } = r.value;
      sections.push(`### ${name} (${ms}ms)\n\n${text}`);
      succeeded++;
    } else {
      sections.push(`### ${activeModels[i].name}\n\n⚠️ Failed: ${r.reason?.message ?? r.reason}`);
      failed++;
    }
  }

  return [
    `## Multi-Model Review`,
    ``,
    `> ${succeeded}/${activeModels.length} models responded${failed > 0 ? ` · ${failed} failed` : ""}`,
    ``,
    sections.join("\n\n---\n\n"),
    ``,
    `---`,
    ``,
    `**Next step:** Fix issues flagged by 2+ models first. Ignore single-model style nits.`,
  ].join("\n");
}

// ── Prompt builders ──────────────────────────────────────────────────────────

function truncate(input) {
  if (input.length <= settings.maxInputChars) return input;
  const half = Math.floor(settings.maxInputChars / 2);
  return (
    input.slice(0, half) +
    "\n\n[... middle section truncated for review ...]\n\n" +
    input.slice(-half)
  );
}

function codeReviewPrompt(code, context) {
  return [
    "You are a senior code reviewer. Review this code for:",
    "- Bugs and logic errors",
    "- Security vulnerabilities",
    "- Missing error handling and edge cases",
    "- Race conditions or concurrency issues",
    "- Performance problems",
    "",
    "Rules: Be concise. List only real issues, not style preferences.",
    "For each issue: state what is wrong and suggest a fix.",
    "If the code looks correct, say LGTM and briefly explain why.",
    "",
    context ? `Context: ${context}\n` : "",
    "```",
    truncate(code),
    "```",
  ].filter(Boolean).join("\n");
}

function planReviewPrompt(plan, context) {
  return [
    "You are a senior software architect. Review this plan for:",
    "- Incorrect assumptions",
    "- Missing edge cases or error states",
    "- Architectural or scalability flaws",
    "- Security concerns",
    "- Better alternatives worth considering",
    "",
    "Rules: Be concise. List only real issues. If the plan is solid, say so briefly.",
    "",
    context ? `Context: ${context}\n` : "",
    truncate(plan),
  ].filter(Boolean).join("\n");
}

// ── MCP Server ───────────────────────────────────────────────────────────────

const server = new Server(
  { name: "multi-review", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "review_code",
      description:
        `Fan out a code review to ${activeModels.length} AI models in parallel. ` +
        "Each model independently reviews for bugs, security issues, and logic errors. " +
        "Use after writing or modifying code.",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "The code to review" },
          context: { type: "string", description: "Optional: what the code should do, recent changes, or constraints" },
        },
        required: ["code"],
      },
    },
    {
      name: "review_plan",
      description:
        `Fan out a plan/design review to ${activeModels.length} AI models in parallel. ` +
        "Catches architectural flaws before writing code.",
      inputSchema: {
        type: "object",
        properties: {
          plan: { type: "string", description: "The plan or design to review" },
          context: { type: "string", description: "Optional: project context or constraints" },
        },
        required: ["plan"],
      },
    },
    {
      name: "list_models",
      description:
        "List all available models in the registry and show which are currently active. " +
        "Use this to see what models you can enable.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "set_models",
      description:
        "Change which models are active for reviews. " +
        "Pass an array of model ids from list_models. " +
        "Changes are saved to config.json immediately.",
      inputSchema: {
        type: "object",
        properties: {
          modelIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of model ids to activate (from list_models). Min 1, max all.",
          },
        },
        required: ["modelIds"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ── review_code ────────────────────────────────────────────────────────
  if (name === "review_code") {
    if (!args?.code || typeof args.code !== "string") {
      return { content: [{ type: "text", text: "Error: 'code' is required." }], isError: true };
    }
    const output = await fanOut(codeReviewPrompt(args.code, args.context)).catch((e) => {
      return `Review failed: ${e.message}`;
    });
    return { content: [{ type: "text", text: output }] };
  }

  // ── review_plan ────────────────────────────────────────────────────────
  if (name === "review_plan") {
    if (!args?.plan || typeof args.plan !== "string") {
      return { content: [{ type: "text", text: "Error: 'plan' is required." }], isError: true };
    }
    const output = await fanOut(planReviewPrompt(args.plan, args.context)).catch((e) => {
      return `Review failed: ${e.message}`;
    });
    return { content: [{ type: "text", text: output }] };
  }

  // ── list_models ────────────────────────────────────────────────────────
  if (name === "list_models") {
    const activeIds = new Set(activeModels.map((m) => m.id));
    const lines = [
      "## Available Models\n",
      "| Status | ID | Name | Provider | $/M input |",
      "|--------|----|------|----------|-----------|",
    ];
    for (const m of REGISTRY) {
      const status = activeIds.has(m.id) ? "✅ active" : "○ inactive";
      lines.push(`| ${status} | \`${m.id}\` | ${m.name} | ${m.provider} | $${m.inputCost.toFixed(2)} |`);
    }
    lines.push("");
    lines.push(`**Currently active:** ${activeModels.length} of ${REGISTRY.length} models`);
    lines.push("");
    lines.push("To change: use `set_models` with an array of ids, or run `npm run configure` in the terminal.");
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }

  // ── set_models ─────────────────────────────────────────────────────────
  if (name === "set_models") {
    const ids = args?.modelIds;
    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        content: [{ type: "text", text: "Error: 'modelIds' must be a non-empty array." }],
        isError: true,
      };
    }

    const invalid = ids.filter((id) => !REGISTRY.find((m) => m.id === id));
    if (invalid.length > 0) {
      return {
        content: [{
          type: "text",
          text: `Error: Unknown model ids: ${invalid.join(", ")}\n\nUse list_models to see valid ids.`,
        }],
        isError: true,
      };
    }

    // Update active models in memory
    activeModels = REGISTRY.filter((m) => ids.includes(m.id));

    // Persist to config.json
    const orderedIds = REGISTRY.filter((m) => ids.includes(m.id)).map((m) => m.id);
    try {
      saveConfig({ activeIds: orderedIds, settings });
    } catch (e) {
      return {
        content: [{ type: "text", text: `Models updated in memory but failed to save: ${e.message}` }],
        isError: true,
      };
    }

    const lines = [
      `✅ Panel updated. ${activeModels.length} models now active:\n`,
      ...activeModels.map((m) => `• **${m.name}** (\`${m.id}\`) — $${m.inputCost.toFixed(2)}/M in`),
    ];
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }

  return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
});

// ── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[multi-review] MCP server ready");
