import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Github, 
  Package, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  ExternalLink,
  Search,
  Terminal,
  Cpu
} from 'lucide-react';

interface SetupDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DocTab = 'github' | 'npm' | 'docker';

// Embedded Markdown Documentation
const GITHUB_DOCS = `# GitHub Docs: MCP Chatbot
**Chat with your MCP servers using cloud LLMs**  
*Owned & Maintained by Zyven Technologies Pvt Ltd · Part of MCP Admin Product Line*

---

## 🌟 Overview
MCP Chatbot is an open-source, Android-first dual-mode application (Web UI & Terminal CLI) that connects to any Model Context Protocol (MCP) server over SSE (Server-Sent Events) or HTTP JSON-RPC using state-of-the-art cloud LLMs (Google Gemini, OpenAI, Anthropic Claude, and OpenRouter).

Unlike basic chatbots that stop at calling a tool, MCP Chatbot features a complete multi-turn tool execution and response synthesis loop:
1. Model triggers tool call based on discovered MCP schemas.
2. App/CLI executes tool on target MCP server over HTTP/SSE.
3. Tool JSON output is captured and injected back into the LLM context.
4. Model synthesizes a final response grounded in real data.

---

## 🚀 Key Features
- **Dual Modes (UI & CLI)**: Run full-featured Web UI or 100% headless Terminal REPL with \`--mode ui\` or \`--mode cli\`.
- **Dynamic Model Selection**: Query active models from OpenAI, Gemini, Claude, and OpenRouter APIs without hardcoded fallbacks.
- **Dynamic Context Window**: Scale context limit dynamically from 4k to 1,000,000 tokens with live usage gauges.
- **Client-Side AES-256 GCM Storage**: Encrypted credential storage via WebCrypto.
- **Mobile Keyboard Compliance**: Optimized with \`interactive-widget=resizes-content\` and \`h-dvh\` layout.
- **Multi-Modal Engine**: Voice recording, cloud speech-to-text, audio player, document parsing, and image generation.

---

## 📱 Pre-Compiled Android APK
Located in the repository at \`output/apk/mcp-chatbot-release.apk\`.  
See \`output/apk/BUILD_INSTRUCTIONS.md\` for building with Capacitor or Android Studio.

---

## 🌐 Official Corporate Resources
- **MCP Admin Cloud**: https://mcpadmin.cloud
- **Zyven Technologies**: https://zyven-technologies.com
`;

const NPM_DOCS = `# NPM Docs: mcp-admin-chatbot
**Enterprise MCP AI Chatbot for React & Node.js**  
*Published Package: \`mcp-admin-chatbot\`*

---

## 📦 Installation
\`\`\`bash
npm install mcp-admin-chatbot
\`\`\`

---

## 🖥️ 1. UI Mode (React App Integration via <MCPChatbotProvider />)

### Basic React Setup
Wrap your application or page with \`<MCPChatbotProvider />\` and mount \`<MCPChatbot />\`:

\`\`\`tsx
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
\`\`\`

### Advanced React Setup (Custom Servers & Callbacks)
\`\`\`tsx
import React from 'react';
import { 
  MCPChatbotProvider, 
  MCPChatbot, 
  MCPServer, 
  MCPChatbotConfig 
} from 'mcp-admin-chatbot';

const initialServers: MCPServer[] = [
  {
    id: 'postgres-mcp',
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
  showSplash: false,
};

export default function DashboardChat() {
  return (
    <MCPChatbotProvider config={chatbotConfig}>
      <main className="h-screen w-screen flex flex-col">
        <MCPChatbot
          onToolCall={(toolName, args) => {
            console.log(\`[MCP Tool Invocated]: \${toolName}\`, args);
          }}
        />
      </main>
    </MCPChatbotProvider>
  );
}
\`\`\`

---

## 💻 2. CLI Mode (Programmatic Node.js Setup via runCLI)

You can run the terminal REPL without opening any browser:

\`\`\`typescript
import { runCLI, RunCLIConfig } from 'mcp-admin-chatbot';

const config: RunCLIConfig = {
  mode: 'cli',
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY,
  mcpServers: [
    {
      name: 'CloudAnalytics',
      url: 'https://mcp.mcpadmin.cloud/v1/analytics',
      transport: 'sse',
      authType: 'bearer',
      authToken: 'mcp_token_xyz',
    },
  ],
};

runCLI(config).catch(console.error);
\`\`\`

### CLI Terminal Commands
- \`/attach <path>\` or \`/file <path>\`: Attach documents or code from disk.
- \`/audio <path>\`: Transcribe local audio file and add to prompt.
- \`/tools\`: List discovered tools and argument schemas.
- \`/servers\`: List connected MCP servers.
- \`/add-server <name> <url>\`: Connect an MCP server on the fly.
- \`/provider <name>\` & \`/model <name>\`: Switch models in real time.
- \`/clear\`: Reset chat context.
- \`/exit\`: Exit CLI.
`;

const DOCKER_DOCS = `# Docker Docs: Container Deployment & CLI Mode
**Containerized MCP Chatbot with UI and CLI Profiles**  
*Part of the MCP Admin Line by Zyven Technologies Pvt Ltd*

---

## 🚀 Quick Build
\`\`\`bash
docker build -t mcp-chatbot:latest .
\`\`\`

---

## 🌐 Running Mode 1: Web UI (Default)
Expose port 3000 to launch the Android-style web app:

\`\`\`bash
docker run -d \\
  --name mcp-chatbot-ui \\
  -p 3000:3000 \\
  -e GEMINI_API_KEY="AIzaSy..." \\
  -e OPENAI_API_KEY="sk-proj-..." \\
  -e ANTHROPIC_API_KEY="sk-ant-..." \\
  mcp-chatbot:latest
\`\`\`
Visit: \`http://localhost:3000\`

---

## 💻 Running Mode 2: Interactive Terminal CLI
Run in interactive TTY mode (\`-it\`) with host volume mount to attach files and audio:

\`\`\`bash
docker run -it --rm \\
  --name mcp-chatbot-cli \\
  -v "$(pwd)":/app/workspace \\
  -e OPENAI_API_KEY="sk-proj-..." \\
  -e DEFAULT_PROVIDER="openai" \\
  -e DEFAULT_MODEL="gpt-4o" \\
  mcp-chatbot:latest --mode cli
\`\`\`

Inside the container terminal:
\`\`\`text
mcp> /attach /app/workspace/server.ts
mcp> /audio /app/workspace/voice_note.wav
mcp> Analyze these files with active MCP tools
mcp> /tools
mcp> /exit
\`\`\`

---

## 🐳 Docker Compose
Use \`docker-compose.yml\` for unified container management:

\`\`\`yaml
version: '3.8'

services:
  mcp-chatbot-ui:
    build: .
    container_name: mcp-chatbot-ui
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    restart: unless-stopped

  mcp-chatbot-cli:
    build: .
    container_name: mcp-chatbot-cli
    stdin_open: true
    tty: true
    command: ["--mode", "cli"]
    volumes:
      - ./:/app/workspace
    profiles:
      - cli
\`\`\`

### Commands:
\`\`\`bash
# Start Web UI in background
docker compose up -d mcp-chatbot-ui

# Run Interactive CLI
docker compose run --rm mcp-chatbot-cli
\`\`\`
`;

// Simple Markdown Renderer for Docs
const DocMarkdownRenderer: React.FC<{ content: string; filterQuery: string }> = ({ content, filterQuery }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const copyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer = '';
  let codeLang = '';
  let codeBlockIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const capturedCode = codeBuffer.trim();
        const currentIdx = codeBlockIdx++;
        elements.push(
          <div key={`code_${i}`} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs">
            <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-800 text-[11px] text-slate-400 font-semibold">
              <span>{codeLang || 'bash'}</span>
              <button
                onClick={() => copyCode(capturedCode, currentIdx)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedCodeIdx === currentIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeIdx === currentIdx ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-[11px] sm:text-xs">
              <code>{capturedCode}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = '';
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer += line + '\n';
      continue;
    }

    // Skip line if filter query is applied and line doesn't match
    if (filterQuery && !line.toLowerCase().includes(filterQuery.toLowerCase())) {
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-xl sm:text-2xl font-black text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200">
          {line.slice(2)}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-base sm:text-lg font-extrabold text-slate-900 mt-4 mb-1.5 flex items-center gap-2">
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm sm:text-base font-bold text-indigo-900 mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 ml-2 text-xs sm:text-sm text-slate-800 font-medium">
          <span className="text-indigo-600 font-bold">•</span>
          <span className="flex-1">{line.trim().slice(2)}</span>
        </div>
      );
      continue;
    }

    // Divider
    if (line.trim() === '---') {
      elements.push(<hr key={i} className="my-4 border-slate-200" />);
      continue;
    }

    // Paragraph
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="my-1 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">{line}</p>);
    }
  }

  return <div>{elements}</div>;
};

export const SetupDocsModal: React.FC<SetupDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<DocTab>('github');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedFullDoc, setCopiedFullDoc] = useState(false);

  const docData: Record<DocTab, { title: string; content: string; icon: any; subtitle: string; badge: string }> = {
    github: {
      title: 'GitHub Docs',
      subtitle: 'Open Source Repo & APK',
      content: GITHUB_DOCS,
      icon: Github,
      badge: 'v1.0.0',
    },
    npm: {
      title: 'NPM Docs',
      subtitle: 'React Provider & runCLI',
      content: NPM_DOCS,
      icon: Package,
      badge: 'npm install',
    },
    docker: {
      title: 'Docker Docs',
      subtitle: 'Compose, UI & CLI Volumes',
      content: DOCKER_DOCS,
      icon: Layers,
      badge: 'Dockerfile',
    },
  };

  const currentDoc = docData[activeTab];

  const handleCopyCurrentDoc = () => {
    navigator.clipboard.writeText(currentDoc.content);
    setCopiedFullDoc(true);
    setTimeout(() => setCopiedFullDoc(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white border-2 border-slate-300 rounded-3xl w-full max-w-5xl h-[92vh] sm:h-[86vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-1.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 transition-colors"
              title={isSidebarOpen ? 'Collapse Docs Sidebar' : 'Expand Docs Sidebar'}
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-none">
                  Documentation & Setup Instructions
                </h3>
                <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  Zyven Technologies Pvt Ltd · MCP Admin Product Line
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCurrentDoc}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-colors"
            >
              {copiedFullDoc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFullDoc ? 'Copied Doc' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body with Collapsible Sidebar */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Collapsible Left Sidebar */}
          {isSidebarOpen && (
            <div className="w-60 sm:w-64 bg-slate-50 border-r border-slate-200 p-3 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
                  Document Sections
                </div>

                <div className="space-y-1.5">
                  {(Object.keys(docData) as DocTab[]).map((tabKey) => {
                    const doc = docData[tabKey];
                    const Icon = doc.icon;
                    const isActive = activeTab === tabKey;

                    return (
                      <button
                        key={tabKey}
                        onClick={() => setActiveTab(tabKey)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                            : 'bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                        <div className="flex-1 truncate">
                          <div className="text-xs truncate">{doc.title}</div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {doc.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Footer Link */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5">
                <a
                  href="https://mcpadmin.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors"
                >
                  <span>mcpadmin.cloud</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
                <a
                  href="https://zyven-technologies.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors"
                >
                  <span>zyven-technologies.com</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>
            </div>
          )}

          {/* Right Main Reader Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Search within doc */}
            <div className="px-5 py-2.5 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={`Search inside ${currentDoc.title}...`}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="text-xs font-mono font-bold text-slate-500 hidden sm:block">
                Showing: {currentDoc.title}
              </div>
            </div>

            {/* Scrollable Document Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 max-w-4xl mx-auto w-full">
              <DocMarkdownRenderer content={currentDoc.content} filterQuery={filterQuery} />
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-600 font-medium hidden sm:block">
            Need custom MCP servers? Deploy serverless instances at <a href="https://mcpadmin.cloud" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">mcpadmin.cloud</a>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
