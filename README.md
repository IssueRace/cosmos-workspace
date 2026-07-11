# 🌌 Cosmos — Spatial AI Workspace

> Every question is a node. Every tangent is a branch. Context is never lost.

Have you ever run into the problem where, while working with AI on a large project, you want to ask a side clarifying question about the project or already completed work, but you don't want to lose the main branch of the dialogue? 

Standard chat feeds (like ChatGPT or Claude) are strictly linear. Any tangent you take derails the AI's train of thought, and opening a new chat tab forces you to upload your files all over again and re-explain the context. 

**Cosmos** solves this by turning your AI conversations into a visual tree on an infinite 2D canvas. You work within workspaces ("planets") where each turn of prompt and response is a card node:
- 🌳 **Context Branching**: Spawn side branches from any message to explore alternative paths. The AI context is strictly bounded to the ancestry path from the root node to your current active node, keeping sibling branches completely isolated.
- 📎 **File Attachments**: Drag and drop source code or documents onto the canvas as separate nodes, then connect them directly to your dialogue tree for targeted context injection.
- 🔍 **Semantic Zoom (LOD)**: As you zoom out, nodes smoothly transition from full markdown cards to compact summaries, and finally to Obsidian-style colored dots, giving you a macro view of your entire workspace at a glance.

---

## Features
- 🌳 **Interactive Canvas**: Drag, select, resize, and connect nodes manually with smart auto-layout repulsion physics.
- 🤖 **Bring Your Own Key**: Configure any OpenAI-compatible API base URL and select custom models.
- 💾 **Local-First & Private**: Your API keys, workspace spaces, and dialogue history are saved directly in browser localStorage.
- 🎨 **Apple-inspired UI**: Minimalist dark mode layout featuring responsive glassmorphism drawer panels.
- ⌨️ **Keyboard Shortcuts & Search**: Spotlight search with text match highlighting, global keyboard shortcuts, and a floating canvas node statistics panel.

## License
Proprietary. All rights reserved. Refer to the `LICENSE` file for details.
