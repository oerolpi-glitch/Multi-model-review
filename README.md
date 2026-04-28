<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Multi-Model Review Panel</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Instrument+Serif&family=DM+Sans:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: #08080c;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 20px;
  }

  .card {
    width: 620px;
    background: linear-gradient(165deg, #0f0f18 0%, #0a0a12 100%);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.03),
      0 20px 60px rgba(0,0,0,0.5),
      0 0 120px rgba(99,102,241,0.04);
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(129,140,248,0.4) 20%,
      rgba(59,130,246,0.5) 50%,
      rgba(14,165,233,0.4) 80%,
      transparent 100%
    );
  }

  .header {
    padding: 32px 32px 24px;
  }

  .eyebrow {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #6366f1;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .eyebrow::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #6366f1;
    border-radius: 2px;
    display: inline-block;
  }

  .title {
    font-family: 'Instrument Serif', serif;
    font-size: 30px;
    font-weight: 400;
    color: #f0f0ff;
    line-height: 1.2;
    margin-bottom: 10px;
    letter-spacing: -0.02em;
  }

  .title em {
    font-style: italic;
    color: #818cf8;
  }

  .subtitle {
    color: #4a4a6a;
    font-size: 13px;
    line-height: 1.6;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent);
    margin: 0 32px;
  }

  .insight {
    padding: 18px 32px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  .insight-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .insight-text {
    font-size: 12.5px;
    color: #7a7a9a;
    line-height: 1.65;
  }

  .insight-text strong {
    color: #a5b4fc;
    font-weight: 600;
  }

  .table-section { padding: 4px 0 0; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  thead th {
    padding: 10px 16px;
    text-align: left;
    color: #2e2e45;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 600;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  thead th:first-child { padding-left: 32px; }
  thead th:last-child { padding-right: 32px; }

  tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.025);
    transition: background 0.15s;
  }

  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(255,255,255,0.015); }

  td { padding: 12px 16px; vertical-align: middle; }
  td:first-child { padding-left: 32px; }
  td:last-child { padding-right: 32px; }

  .num {
    color: #2a2a40;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    width: 20px;
  }

  .model-name { font-weight: 700; font-size: 12.5px; }

  .m-gpt      { color: #34d399; }
  .m-sonnet   { color: #a78bfa; }
  .m-grok     { color: #fbbf24; }
  .m-deepseek { color: #60a5fa; }
  .m-gemini   { color: #f472b6; }
  .m-kimi     { color: #c084fc; }
  .m-minimax  { color: #2dd4bf; }

  .provider { color: #3a3a55; font-size: 11px; }
  .model-id { font-family: 'IBM Plex Mono', monospace; color: #3a3a55; font-size: 10px; }
  .cost-cell { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #3a3a55; }

  .footer {
    padding: 20px 32px;
    border-top: 1px solid rgba(255,255,255,0.04);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cost-badge-wrap { display: flex; align-items: center; gap: 10px; }

  .cost-badge {
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.2);
    color: #10b981;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 8px;
  }

  .cost-label { color: #3a3a55; font-size: 11px; }

  .tags { display: flex; gap: 6px; }

  .tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid;
  }

  .tag-green  { color: #10b981; border-color: rgba(16,185,129,0.2); background: rgba(16,185,129,0.06); }
  .tag-blue   { color: #6366f1; border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.06); }
  .tag-cyan   { color: #06b6d4; border-color: rgba(6,182,212,0.2); background: rgba(6,182,212,0.06); }

  .bottom-note {
    padding: 0 32px 20px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: #2a2a40;
    text-align: center;
  }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="eyebrow">Claude Code Workflow</div>
    <div class="title">Stop burning tokens.<br>Use a <em>7-model review panel.</em></div>
    <div class="subtitle">After planning, fan out to 7 cheap models in parallel via OpenRouter.<br>One always catches the bug. Total cost: 8–10 cents per round.</div>
  </div>

  <div class="divider"></div>

  <div class="insight">
    <div class="insight-icon">⚡</div>
    <div class="insight-text">
      Claude Code plans & writes → <strong>7 models review in parallel</strong> (~5 sec) →
      Opus reads the synthesis, says <strong>"how did I not see this"</strong>, and fixes it.
      One OpenRouter key. No extra setup.
    </div>
  </div>

  <div class="divider"></div>

  <div class="table-section">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Model</th>
          <th>Provider</th>
          <th>OpenRouter ID</th>
          <th>$/M in</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="num">1</td>
          <td class="model-name m-gpt">GPT-5.4 Mini</td>
          <td class="provider">OpenAI</td>
          <td class="model-id">openai/gpt-5.4-mini</td>
          <td class="cost-cell">$0.75</td>
        </tr>
        <tr>
          <td class="num">2</td>
          <td class="model-name m-sonnet">Sonnet 4.6</td>
          <td class="provider">Anthropic</td>
          <td class="model-id">anthropic/claude-sonnet-4-6</td>
          <td class="cost-cell">$3.00</td>
        </tr>
        <tr>
          <td class="num">3</td>
          <td class="model-name m-grok">Grok 4.1 Fast</td>
          <td class="provider">xAI</td>
          <td class="model-id">x-ai/grok-4.1-fast</td>
          <td class="cost-cell">$0.20</td>
        </tr>
        <tr>
          <td class="num">4</td>
          <td class="model-name m-deepseek">DeepSeek V3.2</td>
          <td class="provider">DeepSeek</td>
          <td class="model-id">deepseek/deepseek-v3.2</td>
          <td class="cost-cell">$0.25</td>
        </tr>
        <tr>
          <td class="num">5</td>
          <td class="model-name m-gemini">Gemini 3 Flash</td>
          <td class="provider">Google</td>
          <td class="model-id">google/gemini-3-flash-preview</td>
          <td class="cost-cell">$0.50</td>
        </tr>
        <tr>
          <td class="num">6</td>
          <td class="model-name m-kimi">Kimi K2.6</td>
          <td class="provider">Moonshot</td>
          <td class="model-id">moonshotai/kimi-k2.6</td>
          <td class="cost-cell">$0.74</td>
        </tr>
        <tr>
          <td class="num">7</td>
          <td class="model-name m-minimax">MiniMax M2.7</td>
          <td class="provider">MiniMax</td>
          <td class="model-id">minimax/minimax-m2.7</td>
          <td class="cost-cell">$0.30</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div class="cost-badge-wrap">
      <div class="cost-badge">~$0.08</div>
      <div class="cost-label">per full review round</div>
    </div>
    <div class="tags">
      <span class="tag tag-green">1 API key</span>
      <span class="tag tag-blue">↑ accuracy</span>
      <span class="tag tag-cyan">↓ quota</span>
    </div>
  </div>

  <div class="bottom-note">
    github.com/multi-model-review · MIT License
  </div>
</div>
</body>
</html>

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
