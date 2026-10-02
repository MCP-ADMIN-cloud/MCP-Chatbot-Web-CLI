import React, { createContext, useContext, useState } from 'react';
import { MCPServer, ProviderKeys, ProviderType } from '../types';

export interface MCPChatbotConfig {
  defaultProvider?: ProviderType | '';
  defaultModel?: string;
  providerKeys?: ProviderKeys;
  initialMcpServers?: MCPServer[];
  contextWindowLimit?: number;
  autoExecuteTools?: boolean;
  showSplash?: boolean;
}

export interface MCPChatbotContextType {
  config: MCPChatbotConfig;
  selectedProvider: ProviderType | '';
  setSelectedProvider: (provider: ProviderType | '') => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  providerKeys: ProviderKeys;
  setProviderKeys: React.Dispatch<React.SetStateAction<ProviderKeys>>;
  mcpServers: MCPServer[];
  setMcpServers: React.Dispatch<React.SetStateAction<MCPServer[]>>;
  isNavMenuOpen: boolean;
  setIsNavMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isConversationMenuOpen: boolean;
  setIsConversationMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MCPChatbotContext = createContext<MCPChatbotContextType | undefined>(undefined);

export const MCPChatbotProvider: React.FC<{
  config?: MCPChatbotConfig;
  children: React.ReactNode;
}> = ({ config = {}, children }) => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | ''>(
    config.defaultProvider || ''
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    config.defaultModel || ''
  );
  const [providerKeys, setProviderKeys] = useState<ProviderKeys>(
    config.providerKeys || {}
  );
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(
    config.initialMcpServers || []
  );

  const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  });

  const [isConversationMenuOpen, setIsConversationMenuOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  });

  return (
    <MCPChatbotContext.Provider
      value={{
        config,
        selectedProvider,
        setSelectedProvider,
        selectedModel,
        setSelectedModel,
        providerKeys,
        setProviderKeys,
        mcpServers,
        setMcpServers,
        isNavMenuOpen,
        setIsNavMenuOpen,
        isConversationMenuOpen,
        setIsConversationMenuOpen,
      }}
    >
      {children}
    </MCPChatbotContext.Provider>
  );
};

export const useMCPChatbot = (): MCPChatbotContextType => {
  const context = useContext(MCPChatbotContext);
  if (!context) {
    throw new Error('useMCPChatbot must be used within an MCPChatbotProvider');
  }
  return context;
};
