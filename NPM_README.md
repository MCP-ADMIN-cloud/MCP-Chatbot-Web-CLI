# `mcp-admin-chatbot`

> **Enterprise Model Context Protocol (MCP) AI Chatbot for React & Node.js**  
> Connect and chat with any MCP server over SSE or HTTP JSON-RPC using Cloud LLMs (Gemini, OpenAI, Claude, OpenRouter) with complete multi-turn tool calling synthesis.

[![npm version](https://img.shields.io/npm/v/mcp-admin-chatbot.svg)](https://www.npmjs.com/package/mcp-admin-chatbot)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)
[![Product Line](https://img.shields.io/badge/Product%20Line-MCP%20Admin-4F46E5.svg)](https://mcpadmin.cloud)

**Owned and maintained by [Zyven Technologies Pvt Ltd](https://zyven-technologies.com)**  
**Part of the [MCP Admin](https://mcpadmin.cloud) Product Line**

---

## 📦 Installation

Install via npm, yarn, or pnpm:

```bash
# Using npm
npm install mcp-admin-chatbot

# Using yarn
yarn add mcp-admin-chatbot

# Using pnpm
pnpm add mcp-admin-chatbot
```

---

## 🖥️ 1. UI Mode (React App Setup)

The package provides `<MCPChatbotProvider />` to wrap your React application or dashboard, managing active cloud LLM providers, credentials encryption, MCP server discovery, and chat threads.

### A. Basic React Setup

Wrap your application root or chat view with `<MCPChatbotProvider />` and render `<MCPChatbot />`:

```tsx
import React from 'react';
import { MCPChatbotProvider, MCPChatbot } from 'mcp-admin-chatbot';

export default function App() {
  return (
    <MCPChatbotProvider
      config={{
        defaultProvider: 'openai',
        defaultModel: 'gpt-4o',
      }}
    >
      <div style={{ height: '100vh', width: '100vw' }}>
        <MCPChatbot />
      </div>
    </MCPChatbotProvider>
  );
}
```

---

### B. Advanced React Setup (Custom Servers, Keys & Callbacks)

You can pass pre-connected MCP servers (SSE or HTTP endpoints), API keys, and custom tool execution listeners:

```tsx
import React from 'react';
import { 
  MCPChatbotProvider, 
  MCPChatbot, 
  MCPServer, 
  MCPChatbotConfig 
} from 'mcp-admin-chatbot';

// 1. Define pre-configured MCP Servers
const initialServers: MCPServer[] = [
  {
    id: 'postgres-analytics-mcp',
    name: 'Production Database MCP',
    url: 'https://mcp.mcpadmin.cloud/v1/postgres',
    transport: 'sse',
    authType: 'bearer',
    authToken: 'sk_mcp_live_token_7781',
    status: 'connected',
    latencyMs: 16,
    lastConnected: new Date().toISOString(),
    tools: [
      {
        name: 'query_database',
        description: 'Execute read-only SQL queries against primary database',
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string', description: 'SQL SELECT query' },
          },
          required: ['sql'],
        },
      },
    ],
    enabled: true,
  },
];

// 2. Configure initial chatbot settings
const chatbotConfig: MCPChatbotConfig = {
  defaultProvider: 'gemini',
  defaultModel: 'gemini-3.8-flash',
  providerKeys: {
    gemini: process.env.REACT_APP_GEMINI_KEY,
    openai: process.env.REACT_APP_OPENAI_KEY,
  },
  initialMcpServers: initialServers,
  contextWindowLimit: 65536,
  autoExecuteTools: true,
  showSplash: false, // Skip intro splash screen
};

export default function DashboardChat() {
  return (
    <MCPChatbotProvider config={chatbotConfig}>
      <main className="h-screen w-screen flex flex-col">
        <MCPChatbot
          onToolCall={(toolName, args) => {
            console.log(`[MCP Tool Invocated]: ${toolName}`, args);
          }}
        />
      </main>
    </MCPChatbotProvider>
  );
}
```

---

### C. Using the `useMCPChatbot` Hook (Custom Headless UI)

Components inside `<MCPChatbotProvider />` can consume and control the state directly:

```tsx
import React from 'react';
import { useMCPChatbot } from 'mcp-admin-chatbot';

export function CustomHeaderBar() {
  const {
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    mcpServers,
    isConversationMenuOpen,
    setIsConversationMenuOpen,
  } = useMCPChatbot();

  return (
    <div className="flex items-center justify-between p-3 bg-white border-b">
      <div>
        Active: <strong>{selectedProvider}</strong> ({selectedModel})
      </div>
      <div>Connected Servers: {mcpServers.length}</div>
      <button onClick={() => setIsConversationMenuOpen((prev) => !prev)}>
        {isConversationMenuOpen ? 'Hide Chats' : 'Show Chats'}
      </button>
    </div>
  );
}
```

---

## 💻 2. CLI Mode (Programmatic & Script Setup)

The package provides a programmatic **`runCLI(config)`** function to launch the interactive command-line interface in Node.js scripts, automation agents, or terminal workflows without opening any browser.

### A. Programmatic `runCLI` Script Example

Create a script file (e.g. `start-cli.ts` or `cli.js`):

```typescript
import { runCLI, RunCLIConfig } from 'mcp-admin-chatbot';

const config: RunCLIConfig = {
  mode: 'cli', // Direct Terminal REPL (no browser UI)
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-...',
  mcpServers: [
    {
      name: 'LocalTools',
      url: 'http://localhost:8000/mcp',
      transport: 'http',
      authType: 'none',
    },
    {
      name: 'CloudAnalytics',
      url: 'https://mcp.mcpadmin.cloud/v1/analytics',
      transport: 'sse',
      authType: 'bearer',
      authToken: 'mcp_token_xyz',
    },
  ],
};

// Launch the CLI
runCLI(config).catch((err) => {
  console.error('CLI execution error:', err);
});
```

---

### B. What Happens in CLI Mode?

When running in CLI mode:
1. **Interactive Terminal REPL**: Prompts user with `mcp> ` for continuous chatting.
2. **File Attachments**: Users can attach documents, code, or data directly from disk using:
   ```text
   mcp> /attach ./src/server.ts
   mcp> /file ./database_schema.sql
   mcp> Analyze these files and verify compatibility with our MCP database
   ```
3. **Audio Attachments & Transcription**:
   ```text
   mcp> /audio ./voice_instruction.wav
   mcp> /voice ./meeting_clip.mp3
   ```
   *Transcribes local audio recordings using cloud speech recognition and passes the transcript to your prompt context.*
4. **Live Tool Execution**:
   When the LLM triggers an MCP tool, the CLI prints the invocation block, runs the tool on the target server, displays the output payload, and lets the model synthesize the final answer!

#### Built-in CLI Commands:
| Command | Action |
| :--- | :--- |
| `/attach <path>` or `/file <path>` | Attach text, code, or document files into context |
| `/audio <path>` or `/voice <path>` | Transcribe and attach local audio recording |
| `/tools` | List all discovered MCP tools and argument schemas |
| `/servers` | List all connected MCP servers and statuses |
| `/add-server <name> <url> [sse\|http]` | Connect to a new MCP server on the fly |
| `/provider <name>` | Switch cloud LLM provider (`gemini`, `openai`, `anthropic`, `openrouter`) |
| `/model <model-name>` | Switch active LLM model (e.g. `gpt-4o`, `gemini-3.8-flash`) |
| `/clear` | Clear the current conversation turns |
| `/help` | Print command cheat sheet |
| `/exit` | Exit the CLI session |

---

### C. Running via NPX / Command Line

You can also launch either mode directly from your shell without writing any code:

```bash
# 1. Run Interactive CLI Mode
npx mcp-admin-chatbot --mode cli --provider openai --model gpt-4o --openai-key sk-...

# 2. Run Full Web UI Mode (Default)
npx mcp-admin-chatbot --mode ui --port 3000
```

---

## ⚙️ Configuration Reference

### `<MCPChatbotProvider />` Configuration Object (`MCPChatbotConfig`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultProvider` | `'gemini' \| 'openai' \| 'anthropic' \| 'openrouter'` | `''` | Initial active cloud LLM provider |
| `defaultModel` | `string` | `''` | Initial model identifier (e.g. `gpt-4o`, `gemini-3.8-flash`) |
| `providerKeys` | `Record<string, string>` | `{}` | Pre-populated provider API keys |
| `initialMcpServers` | `MCPServer[]` | `[]` | List of pre-connected SSE/HTTP MCP servers |
| `contextWindowLimit`| `number` | `32768` | Dynamic token window limit (4k to 1M) |
| `autoExecuteTools` | `boolean` | `true` | Whether tools execute automatically during chat |
| `showSplash` | `boolean` | `true` | Whether to display the introductory splash screen |

---

### `runCLI(config)` Configuration Object (`RunCLIConfig`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `mode` | `'cli' \| 'ui'` | `'cli'` | Execution mode: terminal REPL or web server |
| `port` | `number \| string` | `3182` | Port for internal engine communication |
| `provider` | `'gemini' \| 'openai' \| 'anthropic' \| 'openrouter'` | `'gemini'` | Active LLM provider |
| `model` | `string` | `'gemini-3.8-flash'`| Model name |
| `apiKey` | `string` | `process.env.*` | Master API key for selected provider |
| `mcpServers` | `Array<ServerConfig>` | `[]` | MCP servers to initialize on startup |

---

## 🌐 Official Corporate Resources

- **MCP Admin Cloud**: [https://mcpadmin.cloud](https://mcpadmin.cloud) - Cloud MCP server hosting & deployment
- **Zyven Technologies**: [https://zyven-technologies.com](https://zyven-technologies.com) - Enterprise AI protocol solutions

---

## 📄 License

Distributed under the **MIT License**. Copyright © 2026 Zyven Technologies Pvt Ltd.
