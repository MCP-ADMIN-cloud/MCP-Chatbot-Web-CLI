# Multi-stage production build for MCP Chatbot
# Owned by Zyven Technologies Pvt Ltd - MCP Admin Product Line

FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build React client and bundle server.ts -> server.js
RUN npm run build

# --- Production Runner Image ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled artifacts, cli, and documentation
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/bin ./bin
COPY --from=builder /app/README.md ./README.md
COPY --from=builder /app/NPM_README.md ./NPM_README.md
COPY --from=builder /app/output ./output

# Create workspace directory for file and audio attachments in CLI mode
RUN mkdir -p /app/workspace

# Expose standard Web UI port
EXPOSE 3000

# Default entrypoint runs the CLI binary with mode parameter
ENTRYPOINT ["node", "bin/cli.js"]

# Default mode is Web UI; override with "--mode cli" for terminal REPL
CMD ["--mode", "ui"]
