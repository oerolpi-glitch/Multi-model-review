# 🔍 Multi-Model Code Review — MCP Server for Claude Code

Fan out code reviews to multiple AI models **simultaneously** via OpenRouter.
One API key. Fully configurable panel. Catches the bugs your primary model misses.

---

## Why

Different models have different blind spots. Running 5–7 in parallel takes the same time as running 1, and at least one will catch the issue that others miss. Each round costs a few cents — far cheaper than a debugging loop with a flagship model.

---

## Quick Start

### 1. Get an OpenRouter API key

Sign up at [openrouter.ai](https://openrouter.ai) → Settings → Keys → Create Key.
One key gives you access to every model in the registry.

### 2. Install

```bash
git clone https://github.com/YOUR_USERNAME/multi-model-review.git
cd multi-model-review
npm install
```

### 3. Configure your model panel

```bash
npm run configure
```

An interactive terminal UI lets you browse all available models, toggle them on/off, and see estimated cost per review round. Your selection is saved to `config.json`.

```
  🔍 Multi-Model Review — Configure Panel

  Space: toggle  ↑/↓: navigate  a: select all  n: none  Enter: save  q: quit

  ──────────────────────────────────────────────────────────────────────────────
       Model                  Provider        $/M in    $/M out   Tags
  ──────────────────────────────────────────────────────────────────────────────
    ▶ ✓ GPT-5.4 Mini          OpenAI          $0.75     $4.50     reasoning fast
      ✓ Claude Sonnet 4.6     Anthropic       $3.00     $15.00    reasoning coding
      ✓ Grok 4.1 Fast         xAI             $0.20     $0.50     cheap fast reasoning
      ✓ DeepSeek V3.2         DeepSeek        $0.25     $0.38     cheap coding reasoning
      ✓ Gemini 3 Flash        Google          $0.50     $3.00     fast reasoning coding
      ✓ Kimi K2.6             Moonshot AI     $0.74     $4.66     coding reasoning large
      ✓ MiniMax M2.7          MiniMax         $0.30     $1.20     coding reasoning
      ○ GPT-5.4               OpenAI          $2.00     $10.00    reasoning large
      ○ Qwen3 Coder 480B      Alibaba         $0.22     $1.00     coding large
      ...
  ──────────────────────────────────────────────────────────────────────────────

  7 models selected  ·  Est. cost per round: ~$0.083
```

### 4. Add to Claude Code

Add to `~/.claude/claude.json` (global) or `.claude/claude.json` (project-level):

```json
{
  "mcpServers": {
    "multi-review": {
      "command": "node",
      "args": ["/absolute/path/to/multi-model-review/src/index.js"],
      "env": {
        "OPENROUTER_API_KEY": "sk-or-v1-..."
      }
    }
  }
}
```

---

## Usage

### In Claude Code

After writing code, ask Claude to review it:

```
Use the review_code tool to check my latest changes
```

Or use the slash command (copy `.claude/commands/review.md` to your project):

```
/review
```

### Tools available inside Claude Code

| Tool | Description |
|------|-------------|
| `review_code` | Fan out code review to your active panel |
| `review_plan` | Fan out a design/plan review before writing code |
| `list_models` | See all available models and which are active |
| `set_models` | Change active models without leaving Claude Code |

**Example — change models from inside Claude Code:**

```
Use list_models to show me what's available, then set_models to switch to only
the cheapest 3 models for this quick check.
```

---

## Configuration

### Interactive (recommended)

```bash
npm run configure
```

### Manual

Edit `config.json` directly:

```json
{
  "activeModels": [
    "grok-4.1-fast",
    "deepseek-v3.2",
    "gemini-3-flash",
    "kimi-k2.6"
  ],
  "settings": {
    "timeoutMs": 30000,
    "maxResponseTokens": 1000,
    "maxInputChars": 100000
  }
}
```

Restart your MCP server after editing `config.json` manually.
Changes via the `set_models` tool take effect immediately without a restart.

### Adding a model not in the registry

Open `src/registry.js` and add an entry:

```js
{
  id: "my-new-model",           // unique slug for config.json
  name: "My New Model",         // display name
  model: "provider/model-id",   // OpenRouter model ID
  provider: "Provider Name",
  inputCost: 0.50,              // USD per 1M input tokens
  outputCost: 2.00,             // USD per 1M output tokens
  context: 128_000,
  tags: ["coding", "fast"],
  description: "One-line description shown in configure UI.",
},
```

Then run `npm run configure` to activate it.

---

## Model Registry

| ID | Name | Provider | $/M in | $/M out | Tags |
|----|------|----------|--------|---------|------|
| `gpt-5.4-mini` | GPT-5.4 Mini | OpenAI | $0.75 | $4.50 | reasoning, fast |
| `gpt-5.4` | GPT-5.4 | OpenAI | $2.00 | $10.00 | reasoning, large |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | Anthropic | $3.00 | $15.00 | reasoning, coding |
| `claude-haiku-4-5` | Claude Haiku 4.5 | Anthropic | $0.80 | $4.00 | fast, cheap |
| `grok-4.1-fast` | Grok 4.1 Fast | xAI | $0.20 | $0.50 | fast, cheap, reasoning |
| `grok-4.1` | Grok 4.1 | xAI | $0.30 | $1.00 | reasoning, large |
| `deepseek-v3.2` | DeepSeek V3.2 | DeepSeek | $0.25 | $0.38 | cheap, coding, reasoning |
| `deepseek-v3.2-speciale` | DeepSeek V3.2 Speciale | DeepSeek | $0.40 | $1.20 | reasoning, large |
| `gemini-3-flash` | Gemini 3 Flash | Google | $0.50 | $3.00 | fast, reasoning, coding |
| `gemini-3.1-flash-lite` | Gemini 3.1 Flash Lite | Google | $0.25 | $1.50 | cheap, fast |
| `kimi-k2.6` | Kimi K2.6 | Moonshot AI | $0.74 | $4.66 | coding, reasoning |
| `minimax-m2.7` | MiniMax M2.7 | MiniMax | $0.30 | $1.20 | coding, reasoning |
| `minimax-m2.1` | MiniMax M2.1 | MiniMax | $0.27 | $0.95 | coding, cheap |
| `qwen3-coder` | Qwen3 Coder 480B | Alibaba | $0.22 | $1.00 | coding, large |
| `qwen3-coder-next` | Qwen3 Coder Next | Alibaba | $0.15 | $0.80 | coding, fast, cheap |

---

## Security

- **API key stays in env** — never committed, never logged, never sent to Claude Code
- **Input is capped** — prevents accidentally sending huge files to many models
- **Timeouts enforced** — a slow model won't block others (`timeoutMs` in settings)
- **No data stored** — code goes to OpenRouter and back, nothing persisted
- **MCP server is local** — runs on your machine only

---

## Project Structure

```
multi-model-review/
├── src/
│   ├── index.js        # MCP server (tools: review_code, review_plan, list_models, set_models)
│   ├── registry.js     # All available models — add new models here
│   ├── config.js       # Config loader and saver
│   └── test.js         # Smoke tests
├── scripts/
│   └── configure.js    # Interactive terminal configurator
├── .claude/
│   └── commands/
│       └── review.md   # /review slash command
├── config.json         # YOUR active model selection
├── package.json
├── .env.example
└── .gitignore
```

---

## Contributing

PRs welcome:
- New models in `src/registry.js` (just add an entry)
- Benchmark comparisons between different panels
- Integration guides for Cursor, Windsurf, Cline

---

## License

MIT
