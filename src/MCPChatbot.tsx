import React, { useState, useEffect } from 'react';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidNavBar } from './components/AndroidNavBar';
import { ChatView } from './components/ChatView';
import { MCPServerManager } from './components/MCPServerManager';
import { ProvidersPage } from './components/ProvidersPage';
import { ContextAnalyticsPage } from './components/ContextAnalyticsPage';
import { SplashScreen } from './components/SplashScreen';
import { SetupDocsModal } from './components/SetupDocsModal';
import { ChatThread, MCPServer, ProviderKeys, ProviderType } from './types';
import { loadSecureKeys } from './services/security';

export interface MCPChatbotProps {
  initialProvider?: ProviderType | '';
  initialModel?: string;
  providerKeys?: ProviderKeys;
  initialMcpServers?: MCPServer[];
  showSplash?: boolean;
  className?: string;
  onToolCall?: (toolName: string, args: any) => void;
}

export const MCPChatbot: React.FC<MCPChatbotProps> = ({
  initialProvider = '',
  initialModel = '',
  providerKeys: initialKeys = {},
  initialMcpServers = [],
  showSplash: enableSplash = true,
  className = '',
  onToolCall,
}) => {
  const [showSplash, setShowSplash] = useState<boolean>(enableSplash);
  const [showSetupDocs, setShowSetupDocs] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'mcp' | 'providers' | 'context'>('chat');
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(initialMcpServers);
  const [providerKeys, setProviderKeys] = useState<ProviderKeys>(initialKeys);

  const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  });

  const [isConversationMenuOpen, setIsConversationMenuOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  });

  const [selectedProvider, setSelectedProvider] = useState<ProviderType | ''>(() => {
    if (initialProvider) return initialProvider;
    return (localStorage.getItem('mcp_selected_provider') as ProviderType) || '';
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (initialModel) return initialModel;
    return localStorage.getItem('mcp_selected_model') || '';
  });

  const [contextWindowLimit, setContextWindowLimit] = useState<number>(32768);
  const [usedTokens, setUsedTokens] = useState<number>(0);
  const [autoExecuteTools, setAutoExecuteTools] = useState<boolean>(true);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);

  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 'thread_initial_1',
      title: 'Chat Session 1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      provider: selectedProvider,
      modelName: selectedModel,
      contextLimit: 32768,
      autoExecuteTools: true,
      pinned: true,
    },
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread_initial_1');

  useEffect(() => {
    async function initClient() {
      try {
        const bootResp = await fetch('/api/bootstrap').catch(() => null);
        if (bootResp && bootResp.ok) {
          const bootData = await bootResp.json();
          if (bootData?.providerKeys) {
            setProviderKeys((prev) => ({ ...bootData.providerKeys, ...prev }));
          }
        }
      } catch (err) {}

      try {
        const resp = await fetch('/api/mcp/servers').catch(() => null);
        if (resp && resp.ok) {
          const data = await resp.json();
          if (data.servers && data.servers.length > 0) {
            setMcpServers((prev) => (prev.length > 0 ? prev : data.servers));
          }
        }
      } catch (err) {}

      try {
        const keys = await loadSecureKeys();
        if (keys && Object.keys(keys).length > 0) {
          setProviderKeys((prev) => ({ ...prev, ...keys }));
          setIsEncrypted(true);
        }
      } catch (err) {}
    }

    initClient();
  }, []);

  const handleSetSelectedProvider = (provider: ProviderType | '') => {
    setSelectedProvider(provider);
    if (provider) {
      localStorage.setItem('mcp_selected_provider', provider);
    } else {
      localStorage.removeItem('mcp_selected_provider');
    }
  };

  const handleSetSelectedModel = (model: string) => {
    setSelectedModel(model);
    if (model) {
      localStorage.setItem('mcp_selected_model', model);
    } else {
      localStorage.removeItem('mcp_selected_model');
    }
  };

  const handleConnectServer = async (config: Partial<MCPServer>) => {
    const resp = await fetch('/api/mcp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || 'Connection failed');
    }

    if (data.server) {
      setMcpServers((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === data.server.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = data.server;
          return updated;
        }
        return [...prev, data.server];
      });
    }
  };

  const handleDeleteServer = async (id: string) => {
    try {
      await fetch(`/api/mcp/servers/${id}`, { method: 'DELETE' });
      setMcpServers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const handleNewThread = () => {
    const newId = `thread_${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: `Chat Session ${threads.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      provider: selectedProvider,
      modelName: selectedModel,
      contextLimit: contextWindowLimit,
      autoExecuteTools,
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
  };

  const handleDeleteThread = (id: string) => {
    if (threads.length <= 1) return;
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      const remaining = threads.filter((t) => t.id !== id);
      setActiveThreadId(remaining[0].id);
    }
  };

  const handlePinThread = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
    );
  };

  return (
    <div className={`h-full w-full bg-slate-100 flex flex-col font-sans text-slate-900 overflow-hidden ${className}`}>
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      <SetupDocsModal isOpen={showSetupDocs} onClose={() => setShowSetupDocs(false)} />

      <AndroidHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mcpServers={mcpServers}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        usedTokens={usedTokens}
        maxTokens={contextWindowLimit}
        isEncrypted={isEncrypted}
        isNavMenuOpen={isNavMenuOpen}
        onToggleNavMenu={() => setIsNavMenuOpen((prev) => !prev)}
        isConversationMenuOpen={isConversationMenuOpen}
        onToggleConversationMenu={() => setIsConversationMenuOpen((prev) => !prev)}
        conversationCount={threads.length}
        onOpenSetupDocs={() => setShowSetupDocs(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <AndroidNavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mcpServerCount={mcpServers.length}
          isOpen={isNavMenuOpen}
          onClose={() => setIsNavMenuOpen(false)}
        />

        <main className="flex-1 overflow-hidden flex flex-col bg-slate-50 relative min-w-0">
          {activeTab === 'chat' && (
            <ChatView
              threads={threads}
              activeThreadId={activeThreadId}
              setActiveThreadId={setActiveThreadId}
              onNewThread={handleNewThread}
              onDeleteThread={handleDeleteThread}
              onPinThread={handlePinThread}
              mcpServers={mcpServers}
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              contextWindowLimit={contextWindowLimit}
              providerKeys={providerKeys}
              autoExecuteTools={autoExecuteTools}
              setAutoExecuteTools={setAutoExecuteTools}
              onUpdateUsedTokens={setUsedTokens}
              onGoToProviders={() => setActiveTab('providers')}
              isConversationMenuOpen={isConversationMenuOpen}
              onToggleConversationMenu={() => setIsConversationMenuOpen((prev) => !prev)}
              onCloseConversationMenu={() => setIsConversationMenuOpen(false)}
            />
          )}

          {activeTab === 'mcp' && (
            <div className="flex-1 overflow-y-auto">
              <MCPServerManager
                mcpServers={mcpServers}
                setMcpServers={setMcpServers}
                onConnectServer={handleConnectServer}
                onDeleteServer={handleDeleteServer}
              />
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="flex-1 overflow-y-auto">
              <ProvidersPage
                providerKeys={providerKeys}
                setProviderKeys={setProviderKeys}
                selectedProvider={selectedProvider}
                setSelectedProvider={handleSetSelectedProvider}
                selectedModel={selectedModel}
                setSelectedModel={handleSetSelectedModel}
                isEncrypted={isEncrypted}
                setIsEncrypted={setIsEncrypted}
              />
            </div>
          )}

          {activeTab === 'context' && (
            <div className="flex-1 overflow-y-auto">
              <ContextAnalyticsPage
                contextWindowLimit={contextWindowLimit}
                setContextWindowLimit={setContextWindowLimit}
                usedTokens={usedTokens}
                mcpServers={mcpServers}
                autoExecuteTools={autoExecuteTools}
                setAutoExecuteTools={setAutoExecuteTools}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
