import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

export interface RunCLIConfig {
  mode?: 'cli' | 'ui';
  port?: number | string;
  provider?: 'gemini' | 'openai' | 'anthropic' | 'openrouter';
  model?: string;
  apiKey?: string;
  geminiKey?: string;
  openaiKey?: string;
  anthropicKey?: string;
  openrouterKey?: string;
  mcpServers?: Array<{
    name: string;
    url: string;
    transport?: 'sse' | 'http';
    authType?: 'none' | 'bearer' | 'query_param';
    authToken?: string;
  }>;
}

export async function runCLI(config: RunCLIConfig = {}): Promise<void> {
  const env: NodeJS.ProcessEnv = { ...process.env };

  env.NODE_ENV = 'production';
  if (config.port) env.PORT = config.port.toString();
  if (config.provider) env.DEFAULT_PROVIDER = config.provider;
  if (config.model) env.DEFAULT_MODEL = config.model;

  if (config.apiKey) {
    if (config.provider === 'openai') env.OPENAI_API_KEY = config.apiKey;
    else if (config.provider === 'gemini') env.GEMINI_API_KEY = config.apiKey;
    else if (config.provider === 'anthropic') env.ANTHROPIC_API_KEY = config.apiKey;
    else if (config.provider === 'openrouter') env.OPENROUTER_API_KEY = config.apiKey;
  }

  if (config.geminiKey) env.GEMINI_API_KEY = config.geminiKey;
  if (config.openaiKey) env.OPENAI_API_KEY = config.openaiKey;
  if (config.anthropicKey) env.ANTHROPIC_API_KEY = config.anthropicKey;
  if (config.openrouterKey) env.OPENROUTER_API_KEY = config.openrouterKey;

  if (config.mcpServers && config.mcpServers.length > 0) {
    env.STARTUP_MCP_SERVERS = config.mcpServers
      .map((s) => `${s.name}|${s.url}|${s.transport || 'sse'}|${s.authType || 'none'}|${s.authToken || ''}`)
      .join(',');
  }

  const cliPath = path.resolve(process.cwd(), 'bin/cli.js');
  const args = ['--mode', config.mode || 'cli'];

  return new Promise((resolve, reject) => {
    const child = fork(cliPath, args, { env, stdio: 'inherit' });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`CLI process exited with code ${code}`));
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}
