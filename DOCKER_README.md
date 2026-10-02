# Docker Deployment Guide: MCP Chatbot

> **Containerized Model Context Protocol (MCP) AI Chatbot**  
> Run the full Android-style Web UI or interactive Terminal CLI in isolated Docker containers with persistent volumes for file and audio attachments.

**Part of the [MCP Admin](https://mcpadmin.cloud) Product Line**  
**Owned by [Zyven Technologies Pvt Ltd](https://zyven-technologies.com)**

---

## 🚀 Quick Start with Docker

### 1. Build the Docker Image
```bash
docker build -t mcp-chatbot:latest .
```

---

## 🌐 Running Mode 1: Web UI (Default)

Launch the container and expose port `3000`:

```bash
docker run -d \
  --name mcp-chatbot-ui \
  -p 3000:3000 \
  -e GEMINI_API_KEY="AIzaSy..." \
  -e OPENAI_API_KEY="sk-proj-..." \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  mcp-chatbot:latest
```

Open your browser at `http://localhost:3000`.

---

## 💻 Running Mode 2: Interactive Terminal CLI

Run the container in interactive TTY mode (`-it`) with a local volume mount so you can attach local files and audio recordings directly from your machine:

```bash
docker run -it --rm \
  --name mcp-chatbot-cli \
  -v "$(pwd)":/app/workspace \
  -e OPENAI_API_KEY="sk-proj-..." \
  -e DEFAULT_PROVIDER="openai" \
  -e DEFAULT_MODEL="gpt-4o" \
  mcp-chatbot:latest --mode cli
```

Inside the Docker CLI, attach files from your mounted workspace:
```text
mcp> /attach /app/workspace/server.ts
mcp> /audio /app/workspace/voice_note.wav
mcp> What tools can analyze these files?
mcp> /tools
mcp> /exit
```

---

## 🐳 Docker Compose Deployment

Use `docker-compose.yml` for unified management:

### 1. Configure Environment (`.env`)
Create a `.env` file in the project root:
```env
PORT=3000
DEFAULT_PROVIDER=openai
DEFAULT_MODEL=gpt-4o
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-v1-...
```

### 2. Start the Web UI
```bash
docker compose up -d mcp-chatbot-ui
```

Access the UI at `http://localhost:3000`.

### 3. Start the Interactive Terminal CLI
```bash
docker compose run --rm mcp-chatbot-cli
```

---

## 📦 Container Configuration Reference

| Environment Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Web UI internal and external HTTP port | `3000` |
| `DEFAULT_PROVIDER` | Pre-selected provider (`gemini`, `openai`, `anthropic`, `openrouter`) | `""` |
| `DEFAULT_MODEL` | Pre-selected model name (e.g. `gpt-4o`, `gemini-3.8-flash`) | `""` |
| `OPENAI_API_KEY` | OpenAI secret API key | `""` |
| `GEMINI_API_KEY` | Google Gemini API key | `""` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | `""` |
| `OPENROUTER_API_KEY` | OpenRouter aggregator API key | `""` |
| `STARTUP_MCP_SERVERS` | Initial comma-separated MCP server specifications | `""` |

---

## 📄 License & Attribution
Distributed under the **MIT License**. Copyright © 2026 Zyven Technologies Pvt Ltd. Part of the MCP Admin line.
