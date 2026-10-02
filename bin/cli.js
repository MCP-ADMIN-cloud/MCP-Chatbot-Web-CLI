#!/usr/bin/env node

import { fork } from 'child_process';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.NODE_ENV = 'production';

// ANSI Colors for clean terminal UI
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  indigo: '\x1b[38;5;63m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  amber: '\x1b[33m',
  rose: '\x1b[31m',
  slate: '\x1b[90m',
  bgIndigo: '\x1b[48;5;63m\x1b[37m',
};

// Helper to extract argument value by short or long flags
function getArgValue(flagShort, flagLong) {
  const shortIdx = process.argv.indexOf(flagShort);
  if (shortIdx !== -1 && process.argv[shortIdx + 1] && !process.argv[shortIdx + 1].startsWith('-')) {
    return process.argv[shortIdx + 1];
  }
  const longIdx = process.argv.indexOf(flagLong);
  if (longIdx !== -1 && process.argv[longIdx + 1] && !process.argv[longIdx + 1].startsWith('-')) {
    return process.argv[longIdx + 1];
  }
  return null;
}

function hasFlag(flagShort, flagLong) {
  return process.argv.includes(flagShort) || process.argv.includes(flagLong);
}

// Check requested mode
let mode = getArgValue('-M', '--mode');
if (!mode) {
  if (hasFlag('-c', '--cli')) mode = 'cli';
  else if (hasFlag('-u', '--ui')) mode = 'ui';
  else mode = 'ui'; // Default mode
}
mode = mode.toLowerCase();

// Parse CLI Configurations
const portVal = getArgValue('-p', '--port');
if (portVal) process.env.PORT = portVal;

const defaultProvider = getArgValue('-pr', '--provider');
if (defaultProvider) process.env.DEFAULT_PROVIDER = defaultProvider;

const defaultModel = getArgValue('-m', '--model');
if (defaultModel) process.env.DEFAULT_MODEL = defaultModel;

const geminiKey = getArgValue('-gk', '--gemini-key');
if (geminiKey) process.env.GEMINI_API_KEY = geminiKey;

const openaiKey = getArgValue('-ok', '--openai-key');
if (openaiKey) process.env.OPENAI_API_KEY = openaiKey;

const anthropicKey = getArgValue('-ak', '--anthropic-key');
if (anthropicKey) process.env.ANTHROPIC_API_KEY = anthropicKey;

const openrouterKey = getArgValue('-rk', '--openrouter-key');
if (openrouterKey) process.env.OPENROUTER_API_KEY = openrouterKey;

const startupMcps = getArgValue('-s', '--mcp');
if (startupMcps) process.env.STARTUP_MCP_SERVERS = startupMcps;

const serverPath = path.resolve(__dirname, '../server.js');

// ============================================================================
// MODE 1: UI MODE (Web Browser Full Stack Server)
// ============================================================================
if (mode === 'ui') {
  const port = process.env.PORT || 3000;
  console.log(`\n${C.indigo}========================================================${C.reset}`);
  console.log(`${C.bold} MCP Chatbot : Chat with your MCP servers using cloud llms${C.reset}`);
  console.log(`${C.dim} Owned by Zyven Technologies Pvt Ltd - MCP Admin Product Line${C.reset}`);
  console.log(`${C.indigo}========================================================${C.reset}`);
  console.log(`Mode      : ${C.green}Web UI Mode${C.reset}`);
  console.log(`Local URL : ${C.cyan}http://localhost:${port}${C.reset}`);
  console.log(`Provider  : ${C.bold}${process.env.DEFAULT_PROVIDER || 'Not configured (set in UI)'}${C.reset}`);
  console.log(`Model     : ${process.env.DEFAULT_MODEL || 'Not configured'}`);
  if (process.env.STARTUP_MCP_SERVERS) {
    console.log(`MCP Src   : ${process.env.STARTUP_MCP_SERVERS}`);
  }
  console.log(`${C.dim}--------------------------------------------------------${C.reset}`);
  console.log(`${C.green}✓ Web UI server launched. Open the URL above in your browser.${C.reset}`);
  console.log(`${C.dim}Tip: Run with '--mode cli' to use the interactive terminal mode.${C.reset}\n`);

  const serverProcess = fork(serverPath, [], { env: process.env });
  serverProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// ============================================================================
// MODE 2: CLI MODE (Terminal Interactive REPL with File & Audio Attachments)
// ============================================================================
else if (mode === 'cli') {
  // Use dedicated internal port for CLI background server
  const cliPort = process.env.PORT || 3182;
  process.env.PORT = cliPort.toString();

  // Start internal engine server in background silently
  const serverProcess = fork(serverPath, [], {
    env: process.env,
    stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
  });

  const baseUrl = `http://127.0.0.1:${cliPort}`;

  // State
  let activeProvider = process.env.DEFAULT_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : (process.env.OPENAI_API_KEY ? 'openai' : ''));
  let activeModel = process.env.DEFAULT_MODEL || (activeProvider === 'openai' ? 'gpt-4o' : 'gemini-3.8-flash');
  let stagedAttachments = [];
  const conversationMessages = [];

  // Wait for background server to become available
  async function waitForServer(retries = 30) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(`${baseUrl}/api/bootstrap`);
        if (res.ok) return true;
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 200));
    }
    return false;
  }

  async function startCli() {
    console.clear();
    console.log(`\n${C.indigo}======================================================================${C.reset}`);
    console.log(`${C.bold} MCP Chatbot CLI : Chat with your MCP servers using cloud llms${C.reset}`);
    console.log(`${C.dim} Part of MCP Admin product line by Zyven Technologies Pvt Ltd${C.reset}`);
    console.log(`${C.indigo}======================================================================${C.reset}`);

    const ready = await waitForServer();
    if (!ready) {
      console.error(`${C.rose}Failed to initialize CLI engine server.${C.reset}`);
      serverProcess.kill();
      process.exit(1);
    }

    console.log(`Status    : ${C.green}● CLI Engine Connected${C.reset}`);
    console.log(`Provider  : ${C.bold}${activeProvider || 'None configured'}${C.reset}`);
    console.log(`Model     : ${C.bold}${activeModel}${C.reset}`);
    console.log(`${C.dim}----------------------------------------------------------------------${C.reset}`);
    console.log(`${C.cyan}Commands:${C.reset}`);
    console.log(`  ${C.bold}/attach <path>${C.reset} or ${C.bold}/file <path>${C.reset}  : Attach a document/code file`);
    console.log(`  ${C.bold}/audio <path>${C.reset}               : Attach & transcribe local audio file`);
    console.log(`  ${C.bold}/tools${C.reset}                      : List all active MCP tools`);
    console.log(`  ${C.bold}/servers${C.reset}                    : List connected MCP servers`);
    console.log(`  ${C.bold}/add-server <name> <url>${C.reset}   : Connect an MCP server`);
    console.log(`  ${C.bold}/provider <name>${C.reset}            : Switch provider (gemini, openai, anthropic, openrouter)`);
    console.log(`  ${C.bold}/model <model-name>${C.reset}         : Switch active model`);
    console.log(`  ${C.bold}/clear${C.reset}                      : Clear chat session history`);
    console.log(`  ${C.bold}/help${C.reset}                       : Display help`);
    console.log(`  ${C.bold}/exit${C.reset}                       : Exit CLI`);
    console.log(`${C.dim}----------------------------------------------------------------------${C.reset}\n`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${C.indigo}mcp>${C.reset} `,
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();
      if (!input) {
        rl.prompt();
        return;
      }

      // Command handling
      if (input.startsWith('/')) {
        const [cmd, ...args] = input.split(' ');
        const argStr = args.join(' ').trim();

        if (cmd === '/exit' || cmd === '/quit') {
          console.log(`${C.dim}Exiting MCP Chatbot CLI. Goodbye!${C.reset}`);
          serverProcess.kill();
          process.exit(0);
        }

        if (cmd === '/help') {
          console.log(`\n${C.cyan}Available Commands:${C.reset}`);
          console.log(`  /attach <file>    Attach text, code or JSON file`);
          console.log(`  /audio <file>     Attach audio recording file (.mp3, .wav, .m4a, .webm)`);
          console.log(`  /tools            List discovered MCP tools & schemas`);
          console.log(`  /servers          List connected MCP servers`);
          console.log(`  /add-server       Connect an MCP server (e.g. /add-server DB http://localhost:8000/mcp)`);
          console.log(`  /provider         Switch LLM provider (gemini, openai, anthropic, openrouter)`);
          console.log(`  /model            Switch model (e.g. /model gpt-4o or /model gemini-3.8-flash)`);
          console.log(`  /clear            Reset conversation turns`);
          console.log(`  /exit             Exit CLI\n`);
          rl.prompt();
          return;
        }

        if (cmd === '/clear') {
          conversationMessages.length = 0;
          stagedAttachments.length = 0;
          console.log(`${C.green}✓ Conversation context cleared.${C.reset}\n`);
          rl.prompt();
          return;
        }

        // File Attachment Command
        if (cmd === '/attach' || cmd === '/file') {
          if (!argStr) {
            console.log(`${C.amber}Usage: /attach <relative-or-absolute-file-path>${C.reset}`);
            rl.prompt();
            return;
          }
          const filePath = path.resolve(process.cwd(), argStr);
          if (!fs.existsSync(filePath)) {
            console.log(`${C.rose}Error: File not found at '${filePath}'${C.reset}`);
            rl.prompt();
            return;
          }

          try {
            const stats = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, 'utf-8');
            const tokenEstimate = Math.ceil(content.length / 3.8);

            stagedAttachments.push({
              id: `att_${Date.now()}`,
              fileName: path.basename(filePath),
              fileType: 'document',
              mimeType: 'text/plain',
              sizeBytes: stats.size,
              parsedText: content,
              tokenEstimate,
            });

            console.log(`${C.green}✓ Attached file:${C.reset} ${path.basename(filePath)} (${stats.size} bytes, ~${tokenEstimate} tokens)`);
            console.log(`${C.dim}It will be included with your next message.${C.reset}\n`);
          } catch (err) {
            console.log(`${C.rose}Failed to read file: ${err.message}${C.reset}`);
          }
          rl.prompt();
          return;
        }

        // Audio Attachment Command
        if (cmd === '/audio' || cmd === '/voice') {
          if (!argStr) {
            console.log(`${C.amber}Usage: /audio <path-to-audio-file>${C.reset}`);
            rl.prompt();
            return;
          }
          const audioPath = path.resolve(process.cwd(), argStr);
          if (!fs.existsSync(audioPath)) {
            console.log(`${C.rose}Error: Audio file not found at '${audioPath}'${C.reset}`);
            rl.prompt();
            return;
          }

          try {
            console.log(`${C.cyan}Transcribing audio file with cloud speech engine...${C.reset}`);
            const audioBuffer = fs.readFileSync(audioPath);
            const base64Audio = audioBuffer.toString('base64');
            const ext = path.extname(audioPath).replace('.', '');
            const mimeType = ext === 'wav' ? 'audio/wav' : ext === 'mp3' ? 'audio/mp3' : 'audio/webm';

            const resp = await fetch(`${baseUrl}/api/media/speech-to-text`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType,
                apiKey: process.env.GEMINI_API_KEY,
              }),
            });
            const data = await resp.json();

            if (data.transcript) {
              console.log(`${C.green}✓ Audio Transcribed:${C.reset} "${data.transcript}"`);
              stagedAttachments.push({
                id: `att_audio_${Date.now()}`,
                fileName: path.basename(audioPath),
                fileType: 'audio',
                mimeType,
                sizeBytes: audioBuffer.length,
                parsedText: `[Audio Transcript from ${path.basename(audioPath)}]:\n${data.transcript}`,
              });
              console.log(`${C.dim}Audio transcript attached to next prompt.${C.reset}\n`);
            } else {
              console.log(`${C.amber}Audio processed, but transcription was empty.${C.reset}\n`);
            }
          } catch (err) {
            console.log(`${C.rose}Audio processing failed: ${err.message}${C.reset}`);
          }
          rl.prompt();
          return;
        }

        // List Tools
        if (cmd === '/tools') {
          try {
            const resp = await fetch(`${baseUrl}/api/mcp/servers`);
            const data = await resp.json();
            const tools = (data.servers || []).flatMap((s) => s.tools.map((t) => ({ ...t, server: s.name })));
            if (tools.length === 0) {
              console.log(`${C.amber}No active MCP tools loaded. Add an MCP server using /add-server${C.reset}\n`);
            } else {
              console.log(`\n${C.cyan}Discovered MCP Tools (${tools.length}):${C.reset}`);
              tools.forEach((t) => {
                console.log(`  ${C.bold}• ${t.name}${C.reset} ${C.dim}(from ${t.server})${C.reset}`);
                console.log(`    ${C.dim}${t.description || 'No description'}${C.reset}`);
              });
              console.log('');
            }
          } catch (e) {
            console.log(`${C.rose}Failed to fetch tools${C.reset}`);
          }
          rl.prompt();
          return;
        }

        // List Servers
        if (cmd === '/servers') {
          try {
            const resp = await fetch(`${baseUrl}/api/mcp/servers`);
            const data = await resp.json();
            const servers = data.servers || [];
            if (servers.length === 0) {
              console.log(`${C.amber}No MCP servers connected.${C.reset}\n`);
            } else {
              console.log(`\n${C.cyan}Connected MCP Servers (${servers.length}):${C.reset}`);
              servers.forEach((s) => {
                console.log(`  ${C.bold}• ${s.name}${C.reset} [${s.transport.toUpperCase()}]`);
                console.log(`    URL: ${s.url}`);
                console.log(`    Tools: ${s.tools?.length || 0} tools ready\n`);
              });
            }
          } catch (e) {
            console.log(`${C.rose}Failed to fetch servers${C.reset}`);
          }
          rl.prompt();
          return;
        }

        // Add Server
        if (cmd === '/add-server') {
          const parts = argStr.split(' ');
          const sName = parts[0];
          const sUrl = parts[1];
          const sTransport = parts[2] || 'sse';
          if (!sName || !sUrl) {
            console.log(`${C.amber}Usage: /add-server <name> <url> [transport=sse|http]${C.reset}`);
            rl.prompt();
            return;
          }

          console.log(`${C.cyan}Connecting to ${sName}...${C.reset}`);
          try {
            const resp = await fetch(`${baseUrl}/api/mcp/connect`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: sName, url: sUrl, transport: sTransport, authType: 'none' }),
            });
            const data = await resp.json();
            if (resp.ok) {
              console.log(`${C.green}✓ ${data.message || 'Connected successfully'}${C.reset}\n`);
            } else {
              console.log(`${C.rose}Connection failed: ${data.error}${C.reset}\n`);
            }
          } catch (e) {
            console.log(`${C.rose}Connection error: ${e.message}${C.reset}\n`);
          }
          rl.prompt();
          return;
        }

        // Switch Provider
        if (cmd === '/provider') {
          if (!argStr) {
            console.log(`${C.amber}Usage: /provider <gemini|openai|anthropic|openrouter>${C.reset}`);
            rl.prompt();
            return;
          }
          activeProvider = argStr.toLowerCase();
          console.log(`${C.green}✓ Active provider switched to: ${activeProvider}${C.reset}\n`);
          rl.prompt();
          return;
        }

        // Switch Model
        if (cmd === '/model') {
          if (!argStr) {
            console.log(`${C.amber}Usage: /model <model-name> (e.g. /model gpt-4o)${C.reset}`);
            rl.prompt();
            return;
          }
          activeModel = argStr;
          console.log(`${C.green}✓ Active model switched to: ${activeModel}${C.reset}\n`);
          rl.prompt();
          return;
        }

        console.log(`${C.amber}Unknown command: ${cmd}. Type /help for assistance.${C.reset}\n`);
        rl.prompt();
        return;
      }

      // ======================================================================
      // Regular Chat Message Execution
      // ======================================================================
      if (!activeProvider) {
        console.log(`${C.rose}Error: No AI Provider configured. Use '/provider <name>' or set your API key flag.${C.reset}\n`);
        rl.prompt();
        return;
      }

      const userMessage = {
        role: 'user',
        content: input,
        attachments: [...stagedAttachments],
      };
      conversationMessages.push(userMessage);

      if (stagedAttachments.length > 0) {
        console.log(`${C.dim}[Included ${stagedAttachments.length} attachment(s)]${C.reset}`);
        stagedAttachments = [];
      }

      // Fetch active tools from servers
      let activeTools = [];
      try {
        const sResp = await fetch(`${baseUrl}/api/mcp/servers`);
        const sData = await sResp.json();
        activeTools = (sData.servers || []).flatMap((s) => s.tools);
      } catch (e) {}

      process.stdout.write(`\n${C.bold}AI Assistant (${activeModel}):${C.reset}\n`);

      try {
        const streamResp = await fetch(`${baseUrl}/api/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationMessages,
            provider: activeProvider,
            modelName: activeModel,
            providerKeys: {
              gemini: process.env.GEMINI_API_KEY,
              openai: process.env.OPENAI_API_KEY,
              anthropic: process.env.ANTHROPIC_API_KEY,
              openrouter: process.env.OPENROUTER_API_KEY,
            },
            activeTools,
          }),
        });

        if (!streamResp.ok) {
          const err = await streamResp.text();
          console.log(`\n${C.rose}Stream Error: ${err}${C.reset}\n`);
          rl.prompt();
          return;
        }

        const reader = streamResp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantReply = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              const eventType = line.split('\n')[0].replace('event: ', '').trim();
              const dataStr = line.split('\ndata: ')[1];
              if (!dataStr) continue;

              try {
                const data = JSON.parse(dataStr);
                if (eventType === 'chunk' && data.text) {
                  process.stdout.write(data.text);
                  assistantReply += data.text;
                } else if (eventType === 'tool_call') {
                  console.log(`\n\n${C.amber}┌── [Tool Invocated by LLM] ─────────────────────${C.reset}`);
                  console.log(`${C.amber}│ Tool: ${C.bold}${data.name}${C.reset}`);
                  console.log(`${C.amber}│ Args: ${JSON.stringify(data.args || {})}${C.reset}`);
                  console.log(`${C.amber}└────────────────────────────────────────────────${C.reset}\n`);
                } else if (eventType === 'tool_result') {
                  console.log(`${C.green}┌── [Tool Output Received from MCP Server] ──────${C.reset}`);
                  console.log(`${C.green}│ Tool: ${data.name}${C.reset}`);
                  console.log(`${C.green}│ Data: ${JSON.stringify(data.result?.output || data.result)}${C.reset}`);
                  console.log(`${C.green}└── [Synthesizing final response...] ────────────${C.reset}\n`);
                } else if (eventType === 'error') {
                  console.log(`\n${C.rose}Error: ${data.message}${C.reset}`);
                }
              } catch (e) {}
            }
          }
        }

        conversationMessages.push({ role: 'assistant', content: assistantReply });
        console.log('\n');
      } catch (err) {
        console.log(`\n${C.rose}Execution failed: ${err.message}${C.reset}\n`);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log(`\n${C.dim}Closing MCP Chatbot CLI.${C.reset}`);
      serverProcess.kill();
      process.exit(0);
    });
  }

  startCli();
}
