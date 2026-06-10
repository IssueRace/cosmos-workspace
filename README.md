# 🌌 Cosmos — Spatial AI Workspace

> Every question is a node. Every tangent is a branch. Context is never lost.

I got tired of constantly switching context in standard ChatGPT/Claude linear chats. Whenever I asked a side question, the AI would get derailed or forget the main topic. Starting a new chat meant losing all the previous work and context. 

So, I built **Cosmos** — a spatial AI workspace that turns your AI conversations into a visual tree on an infinite 2D canvas. You can branch off any message to explore a tangent without losing your place, and the AI only sees the direct path from root to your current node.

## Features
- 🌳 **Spatial Dialogue Tree**: Branch conversations on an infinite 2D canvas.
- 🤖 **Bring Your Own Key**: Select and configure any OpenAI-compatible API base URL and model.
- 🔍 **Level of Detail (LOD) Zoom**: Cards automatically transition from full text to compact pills and colored dots.
- 💾 **Local-First & Private**: Your API keys and tree state are stored directly in your browser's localStorage.
- 🎨 **Apple-inspired Aesthetics**: Fully responsive dark mode with glassmorphism overlays and CSS variable styling.
- ⌨️ **Keyboard Shortcuts & Search**: Search matching nodes with text highlighting and use global shortcut controls.
- 📎 **File Attachments**: Drag and drop text files to connect them to any dialogue node for context injection.

## Tech Stack
- **Framework**: React 18, TypeScript, Vite
- **Canvas engine**: React Flow (@xyflow/react)
- **Styling**: Vanilla CSS with custom properties (CSS variables)
- **Markdown & Code**: react-markdown, rehype-highlight

## License
Proprietary. All rights reserved. Refer to the `LICENSE` file for details.
