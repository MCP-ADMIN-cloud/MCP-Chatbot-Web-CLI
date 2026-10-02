export type ProviderType = 'gemini' | 'openai' | 'anthropic' | 'openrouter';

export type TransportType = 'sse' | 'http';
export type AuthType = 'none' | 'bearer' | 'query_param';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type?: string;
      description?: string;
      enum?: string[];
      default?: any;
    }>;
    required?: string[];
  };
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  transport: TransportType;
  authType: AuthType;
  authToken?: string;
  queryParamName?: string;
  status: 'connected' | 'disconnected' | 'error' | 'offline';
  latencyMs: number;
  lastConnected: string;
  tools: MCPTool[];
  isCustom?: boolean;
  enabled?: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: 'document' | 'image' | 'audio' | 'video' | 'code';
  mimeType: string;
  sizeBytes: number;
  url?: string;
  base64?: string;
  parsedText?: string;
  tokenEstimate?: number;
}

export interface ToolCallExecution {
  id: string;
  toolName: string;
  serverName?: string;
  serverId?: string;
  args: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: string;
  executionMs?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  toolCalls?: ToolCallExecution[];
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  tokenCount?: number;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  pinned?: boolean;
  provider: ProviderType | '';
  modelName: string;
  contextLimit: number;
  autoExecuteTools: boolean;
}

export interface ProviderKeys {
  gemini?: string;
  openai?: string;
  anthropic?: string;
  openrouter?: string;
  [key: string]: string | undefined;
}

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
}

export interface AppSettings {
  activeTab: 'chat' | 'mcp' | 'providers' | 'context';
  provider: ProviderType | '';
  modelName: string;
  contextWindowLimit: number;
  autoExecuteTools: boolean;
  autoTTS: boolean;
  theme: 'light';
  encryptionPassphrase?: string;
}
