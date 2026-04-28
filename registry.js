/**
 * Model Registry
 *
 * Every model listed here can be added to the active panel via `npm run configure`
 * or by editing config.json directly.
 *
 * To add a new model: copy any entry, update the fields, and run `npm run configure`.
 * Find valid OpenRouter model IDs at: https://openrouter.ai/models
 *
 * Fields:
 *   id          — unique slug used in config.json
 *   name        — display name shown in review output
 *   model       — OpenRouter model ID (provider/model-name)
 *   provider    — human-readable provider name
 *   inputCost   — USD per 1M input tokens (for display only)
 *   outputCost  — USD per 1M output tokens (for display only)
 *   context     — context window in tokens
 *   tags        — ["fast", "reasoning", "coding", "cheap", "large"]
 *   description — one-line summary shown during configure
 */

export const REGISTRY = [
  // ── OpenAI ──────────────────────────────────────────────────────────────
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    model: "openai/gpt-5.4-mini",
    provider: "OpenAI",
    inputCost: 0.75,
    outputCost: 4.50,
    context: 400_000,
    tags: ["reasoning", "fast"],
    description: "Strong reasoning at mini cost. Good all-rounder.",
  },
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    model: "openai/gpt-5.4",
    provider: "OpenAI",
    inputCost: 2.00,
    outputCost: 10.00,
    context: 400_000,
    tags: ["reasoning", "large"],
    description: "Flagship OpenAI model. Best for complex logic errors.",
  },

  // ── Anthropic ────────────────────────────────────────────────────────────
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    model: "anthropic/claude-sonnet-4-6",
    provider: "Anthropic",
    inputCost: 3.00,
    outputCost: 15.00,
    context: 200_000,
    tags: ["reasoning", "coding"],
    description: "Excellent at nuanced bugs and understanding intent vs implementation.",
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    model: "anthropic/claude-haiku-4-5",
    provider: "Anthropic",
    inputCost: 0.80,
    outputCost: 4.00,
    context: 200_000,
    tags: ["fast", "cheap"],
    description: "Fastest Anthropic model. Great for quick sanity checks.",
  },

  // ── xAI ─────────────────────────────────────────────────────────────────
  {
    id: "grok-4.1-fast",
    name: "Grok 4.1 Fast",
    model: "x-ai/grok-4.1-fast",
    provider: "xAI",
    inputCost: 0.20,
    outputCost: 0.50,
    context: 2_000_000,
    tags: ["fast", "cheap", "reasoning"],
    description: "Ultra-cheap with built-in fast reasoning. Best cost/value.",
  },
  {
    id: "grok-4.1",
    name: "Grok 4.1",
    model: "x-ai/grok-4.1",
    provider: "xAI",
    inputCost: 0.30,
    outputCost: 1.00,
    context: 2_000_000,
    tags: ["reasoning", "large"],
    description: "Full Grok model with deep reasoning. Good for architectural review.",
  },

  // ── DeepSeek ─────────────────────────────────────────────────────────────
  {
    id: "deepseek-v3.2",
    name: "DeepSeek V3.2",
    model: "deepseek/deepseek-v3.2",
    provider: "DeepSeek",
    inputCost: 0.25,
    outputCost: 0.38,
    context: 131_000,
    tags: ["cheap", "coding", "reasoning"],
    description: "IMO gold-medal reasoning. One of the cheapest in the registry.",
  },
  {
    id: "deepseek-v3.2-speciale",
    name: "DeepSeek V3.2 Speciale",
    model: "deepseek/deepseek-v3.2-speciale",
    provider: "DeepSeek",
    inputCost: 0.40,
    outputCost: 1.20,
    context: 164_000,
    tags: ["reasoning", "coding", "large"],
    description: "High-compute DeepSeek variant. Reportedly ahead of GPT-5 on hard reasoning.",
  },

  // ── Google ───────────────────────────────────────────────────────────────
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    model: "google/gemini-3-flash-preview",
    provider: "Google",
    inputCost: 0.50,
    outputCost: 3.00,
    context: 1_000_000,
    tags: ["fast", "reasoning", "coding"],
    description: "Fast thinking. 1M context. Good at edge cases and type errors.",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    model: "google/gemini-3.1-flash-lite-preview",
    provider: "Google",
    inputCost: 0.25,
    outputCost: 1.50,
    context: 1_048_576,
    tags: ["cheap", "fast"],
    description: "Lightest Gemini. Extremely fast, good for volume checks.",
  },

  // ── Moonshot (Kimi) ──────────────────────────────────────────────────────
  {
    id: "kimi-k2.6",
    name: "Kimi K2.6",
    model: "moonshotai/kimi-k2.6",
    provider: "Moonshot AI",
    inputCost: 0.74,
    outputCost: 4.66,
    context: 256_000,
    tags: ["coding", "reasoning", "large"],
    description: "SOTA open-source coding model. Excels at long-horizon code tasks.",
  },

  // ── MiniMax ──────────────────────────────────────────────────────────────
  {
    id: "minimax-m2.7",
    name: "MiniMax M2.7",
    model: "minimax/minimax-m2.7",
    provider: "MiniMax",
    inputCost: 0.30,
    outputCost: 1.20,
    context: 197_000,
    tags: ["coding", "reasoning"],
    description: "56.2% SWE-Pro, strong at real-world production bugs.",
  },
  {
    id: "minimax-m2.1",
    name: "MiniMax M2.1",
    model: "minimax/minimax-m2.1",
    provider: "MiniMax",
    inputCost: 0.27,
    outputCost: 0.95,
    context: 197_000,
    tags: ["coding", "cheap"],
    description: "Lightweight MiniMax. Optimized for coding agent workflows.",
  },

  // ── Qwen ────────────────────────────────────────────────────────────────
  {
    id: "qwen3-coder",
    name: "Qwen3 Coder 480B",
    model: "qwen/qwen3-coder",
    provider: "Alibaba",
    inputCost: 0.22,
    outputCost: 1.00,
    context: 262_000,
    tags: ["coding", "large"],
    description: "480B MoE specialized for agentic coding and tool use.",
  },
  {
    id: "qwen3-coder-next",
    name: "Qwen3 Coder Next",
    model: "qwen/qwen3-coder-next",
    provider: "Alibaba",
    inputCost: 0.15,
    outputCost: 0.80,
    context: 256_000,
    tags: ["coding", "fast", "cheap"],
    description: "80B/3B-active MoE. Fast, cheap, no thinking blocks. Great for agents.",
  },
];

/**
 * Look up a model in the registry by its id field.
 */
export function findById(id) {
  return REGISTRY.find((m) => m.id === id) ?? null;
}

/**
 * Filter by tag.
 */
export function filterByTag(tag) {
  return REGISTRY.filter((m) => m.tags.includes(tag));
}
