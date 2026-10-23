# 🌌 Cosmos — Spatial AI Workspace

> **Every question is a node. Every tangent is a branch. Context is never lost.**

Have you ever run into the problem where, while working with AI on a large project, you want to ask a side clarifying question about the project or already completed work, but you don't want to lose the main branch of the dialogue?

Standard chat feeds (like ChatGPT or Claude) are strictly linear. Any tangent you take derails the AI's train of thought, and opening a new chat tab forces you to upload your files all over again and re-explain the context.

**Cosmos** solves this by turning your AI conversations into a visual tree on an infinite 2D canvas. You work within workspaces ("planets") where each turn of prompt and response is a card node:
- 🌳 **Context Branching**: Spawn side branches from any message to explore alternative paths. The AI context is strictly bounded to the ancestry path from the root node to your current active node, keeping sibling branches completely isolated.
- 📎 **File & Resource Attachments**: Drag and drop source code or documents onto the canvas as separate nodes, then connect them directly to your dialogue tree for targeted context injection.
- 📦 **Interactive Artifact Nodes**: Auto-extract code blocks into dedicated canvas cards. Edit code live directly on the canvas, download files with one click, or wire artifacts into downstream dialogue nodes as context!
- 🔀 **Cross-Branch Synthesis**: Connect multiple exploration branches into a single Synthesis Node. Cosmos aggregates parallel reasoning paths and prompts the AI to synthesize a unified solution.
- 🔍 **Semantic Zoom (LOD)**: As you zoom out, nodes smoothly transition from full markdown cards to compact summaries, and finally to Obsidian-style colored dots, giving you a macro view of your entire workspace at a glance.
- 🏷️ **Smart Auto-Titling**: AI automatically generates concise topic titles for dialogue nodes displayed across full, compact, and macro zoom views.

---

## ✨ Features

- 🌳 **Spatial Canvas**: Built with `@xyflow/react` on an infinite dark grid (`#0C0C0E`) with smooth bezier curves.
- 🕹️ **Manual Layout + Tidy Up**: Freely arrange, resize, and position nodes without unexpected shifts; auto-arrange into a clean hierarchy anytime via the **Tidy Up** (`Wand2`) button.
- ↩️ **Time-Travel (Undo / Redo)**: Full 50-step undo/redo stack (`Ctrl+Z` / `Ctrl+Y`) for node positions, edits, connections, and deletions.
- 🤖 **Bring Your Own Key (BYOK)**: Supports any OpenAI-compatible API endpoint (OpenAI, Groq, Ollama, OpenRouter) with real-time SSE token streaming.
- 💾 **Local-First & Private**: API keys, workspaces, and canvas state persist safely in browser `localStorage`. Complete JSON session export and import.
- 🎨 **Apple-Inspired Dark UI**: Minimalist glassmorphism cards, Inter & JetBrains Mono typography, Lucide icons, and collapsible drawer panels.
- ⌨️ **Shortcuts & Search**: Global spotlight search (`Ctrl+F`), keyboard shortcuts guide (`Ctrl+/`), and live canvas node statistics.

---

## 🚀 Quickstart

### Prerequisites
- Node.js (version 18 or newer)
- npm or pnpm / yarn

### Run Locally
```bash
# Clone the repository
git clone https://github.com/IssueRace/cosmos-workspace.git
cd cosmos-workspace

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser. Click the **⚙️ Settings** icon in the top-left toolbar to enter your API key (e.g. OpenAI or free Groq API key).

### Build for Production
```bash
npm run build
```

---

## ☁️ Deployment

### Deploy to Vercel (One-Click / CLI)

You can deploy Cosmos to Vercel instantly:

```bash
# Using Vercel CLI
npx vercel
```

Or connect the repository on [Vercel Dashboard](https://vercel.com):
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Canvas & Flow Engine** | `@xyflow/react` (React Flow v12) |
| **Markdown & Syntax Highlighting** | `react-markdown`, `rehype-highlight`, `highlight.js` |
| **Icons & Design** | `lucide-react`, Custom Apple-style Glassmorphism CSS |
| **Streaming & AI** | Server-Sent Events (SSE), OpenAI Chat Completions API |

---

## 📄 License

Proprietary. All rights reserved. Refer to the `LICENSE` file for details.
