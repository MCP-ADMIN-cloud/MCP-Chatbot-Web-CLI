<div align="center">

# MCP Chatbot : Chat with your MCP servers using cloud llms

<img src="https://news.mcpadmin.cloud/wp-content/uploads/2026/10/Gemini_Generated_Image_9n5n8q9n5n8q9n5ns.png" alt="Zyven Technologies Pvt Ltd" width="130" style="border-radius: 24px; margin-bottom: 12px;" />

### Enterprise Dual-Mode (Web UI & Terminal CLI) AI Chatbot for Model Context Protocol (MCP)
**Part of the [MCP Admin](https://mcpadmin.cloud) Product Line**  
**Developed & Maintained by [Zyven Technologies Pvt Ltd](https://zyven-technologies.com)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/badge/npm-v1.0.0-CB3837.svg)](https://www.npmjs.com/package/mcp-admin-chatbot)
[![Docker Support](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Android APK](https://img.shields.io/badge/Android-APK%20Included-3DDC84.svg)](output/apk/)

</div>

---

## 🌟 Overview

**MCP Chatbot** is a production-grade, open-source dual-mode application that lets you chat with any **Model Context Protocol (MCP)** server over **SSE (Server-Sent Events)** or **HTTP POST** using state-of-the-art cloud LLMs (**Google Gemini**, **OpenAI**, **Anthropic Claude**, and **OpenRouter**).

It can be run as:
1. **Interactive Terminal CLI (`--mode cli`)**: 100% terminal-based REPL with file attachments, audio file transcription, tool execution, and response synthesis without opening any browser.
2. **Responsive Web UI (`--mode ui`)**: Full-featured Android-style web app with collapsible sidebars, real-time meters, and mobile-friendly composer.
3. **Embeddable React Library**: Import `<MCPChatbot />` directly into any React / Next.js web application.

---

## 🚀 Running via NPX

### Mode 1: Terminal CLI Mode (No Browser UI)

Run entirely inside your terminal:

```bash
# Launch interactive terminal CLI
npx mcp-admin-chatbot --mode cli --provider openai --model gpt-4o --openai-key sk-proj-...
```

Inside the CLI, you have full multi-modal capabilities:
```text
mcp> What MCP tools are available?
mcp> /attach ./src/server.ts
mcp> Summarize this file and execute any related MCP server health check
mcp> /audio ./recording.wav
mcp> /tools
mcp> /add-server DatabaseServer http://localhost:8000/mcp http
mcp> /provider gemini
mcp> /model gemini-3.8-flash
mcp> /exit
```

#### Terminal CLI Commands:
| Command | Description |
| :--- | :--- |
| `/attach <path>` or `/file <path>` | Attach any text, code, or document file from disk into your prompt context |
| `/audio <path>` or `/voice <path>` | Attach an audio file (`.mp3`, `.wav`, `.m4a`, `.webm`) for cloud speech transcription |
| `/tools` | List all discovered MCP tools, descriptions, and parameter schemas |
| `/servers` | List all connected SSE and HTTP MCP servers |
| `/add-server <name> <url> [sse\|http]` | Connect to a new MCP server on the fly |
| `/provider <name>` | Switch cloud LLM provider (`gemini`, `openai`, `anthropic`, `openrouter`) |
| `/model <name>` | Switch model (e.g. `gpt-4o`, `gemini-3.8-flash`, `claude-3-5-sonnet`) |
| `/clear` | Clear the current conversation history |
| `/help` | Display list of commands |
| `/exit` | Exit the CLI |

---

### Mode 2: Web UI Mode (Default)

Launch the complete web application:

```bash
# Launch on port 3000
npx mcp-admin-chatbot --mode ui

# Launch with pre-configured parameters and custom port
npx mcp-admin-chatbot --mode ui --port 4000 --provider gemini --model gemini-3.8-flash --gemini-key AIzaSy...
```

Open `http://localhost:3000` in any browser or mobile device.

---

## ⚛️ How to Setup in Your React App

You can embed the full **MCP Chatbot** experience directly into your own React application.

### 1. Install the Package

```bash
npm install mcp-admin-chatbot
```

### 2. Basic Setup Example

```tsx
import React from 'react';
import { MCPChatbot } from 'mcp-admin-chatbot';

export default function MyDashboard() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MCPChatbot />
    </div>
  );
}
```

### 3. Advanced Integration Example

You can pre-configure active cloud LLM providers, pre-connect MCP servers, and listen to tool call events:

```tsx
import React from 'react';
import { MCPChatbot, MCPServer } from 'mcp-admin-chatbot';

// Pre-define custom MCP servers
const myInitialMcpServers: MCPServer[] = [
  {
    id: 'postgres-mcp',
    name: 'PostgreSQL Production Hub',
    url: 'https://mcp.mcpadmin.cloud/v1/postgres',
    transport: 'sse',
    authType: 'bearer',
    authToken: 'secret_mcp_token_xyz',
    status: 'connected',
    latencyMs: 18,
    lastConnected: new Date().toISOString(),
    tools: [
      {
        name: 'query_database',
        description: 'Execute read-only SQL queries against primary database',
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string', description: 'SQL select query' }
          },
          required: ['sql']
        }
      }
    ],
    enabled: true
  }
];

export default function App() {
  return (
    <div className="h-screen w-screen">
      <MCPChatbot
        // Pre-select AI Provider & Model
        initialProvider="openai"
        initialModel="gpt-4o"
        
        // Pass API keys securely (or let users configure via UI)
        providerKeys={{
          openai: process.env.REACT_APP_OPENAI_KEY,
          gemini: process.env.REACT_APP_GEMINI_KEY,
        }}
        
        // Connect initial MCP servers
        initialMcpServers={myInitialMcpServers}
        
        // Custom tool callback listener
        onToolCall={(toolName, args) => {
          console.log(`Tool invoked: ${toolName}`, args);
        }}
        
        // Optional: disable splash screen
        showSplash={false}
      />
    </div>
  );
}
```

---

## 📱 Android APK Package

A pre-compiled Android release APK is available in the repository:
- **Location**: `output/apk/mcp-chatbot-release.apk`
- **Build Guide**: See [output/apk/BUILD_INSTRUCTIONS.md](output/apk/BUILD_INSTRUCTIONS.md) to package with Capacitor or Android Studio.

---

## 🌐 Official Resources

- **MCP Admin Cloud**: [https://mcpadmin.cloud](https://mcpadmin.cloud) - Create serverless MCP servers in seconds.
- **Zyven Technologies**: [https://zyven-technologies.com](https://zyven-technologies.com) - Enterprise AI protocol solutions.

---

## 📄 License

Distributed under the **MIT License**. Copyright © 2026 Zyven Technologies Pvt Ltd.
