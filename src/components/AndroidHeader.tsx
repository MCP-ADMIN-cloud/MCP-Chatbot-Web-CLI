import React from 'react';
import { 
  ShieldCheck, 
  Zap,
  Activity,
  ChevronRight,
  AlertCircle,
  MessageSquare,
  Compass,
  BookOpen
} from 'lucide-react';
import { MCPServer, ProviderType } from '../types';
import { MCPLogo } from './MCPLogo';

interface AndroidHeaderProps {
  activeTab: 'chat' | 'mcp' | 'providers' | 'context';
  setActiveTab: (tab: 'chat' | 'mcp' | 'providers' | 'context') => void;
  mcpServers: MCPServer[];
  selectedProvider: ProviderType | '';
  selectedModel: string;
  usedTokens: number;
  maxTokens: number;
  isEncrypted: boolean;
  isNavMenuOpen: boolean;
  onToggleNavMenu: () => void;
  isConversationMenuOpen: boolean;
  onToggleConversationMenu: () => void;
  conversationCount: number;
  onOpenSetupDocs: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  activeTab,
  setActiveTab,
  mcpServers,
  selectedProvider,
  selectedModel,
  usedTokens,
  maxTokens,
  isEncrypted,
  isNavMenuOpen,
  onToggleNavMenu,
  isConversationMenuOpen,
  onToggleConversationMenu,
  conversationCount,
  onOpenSetupDocs,
}) => {
  const connectedServersCount = mcpServers.filter((s) => s.status === 'connected' && s.enabled !== false).length;
  const totalToolsCount = mcpServers
    .filter((s) => s.enabled !== false)
    .reduce((acc, s) => acc + s.tools.length, 0);

  const tokenPercentage = Math.min(100, Math.round((usedTokens / maxTokens) * 100));

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-300 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs shrink-0 select-none">
      {/* Upper Line: Brand Logo, MCP Chatbot title, 0 Active status & Provider badges */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-700 mb-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {/* Logo & MCP Chatbot Title moved to the upper line */}
          <div className="flex items-center gap-2 shrink-0">
            <MCPLogo className="w-5 h-5 sm:w-6 sm:h-6" />
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 flex items-center gap-1 leading-none">
              <span>MCP</span>
              <span className="text-indigo-600">Chatbot</span>
            </h1>
          </div>

          <span className="text-slate-300 font-bold hidden xs:inline">|</span>

          {/* Active status & tools count on the upper line */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${connectedServersCount > 0 ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${connectedServersCount > 0 ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
              </span>
              <span>{connectedServersCount} Active</span>
            </span>
            <span className="text-slate-400 font-bold">·</span>
            <span className="text-slate-600 font-semibold hidden xs:inline">{totalToolsCount} Tools</span>
          </div>
        </div>

        {/* Right side of upper line: Active Provider/Model pill & Encrypted badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {selectedProvider ? (
            <button
              onClick={() => setActiveTab('providers')}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-800 transition-colors"
              title="Change active provider or model"
            >
              <Zap className="w-3 h-3 text-indigo-600" />
              <span className="capitalize">{selectedProvider}</span>
              <span className="text-slate-400">/</span>
              <span className="truncate max-w-[80px] sm:max-w-[120px]">{selectedModel || 'Model'}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('providers')}
              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg text-[11px] font-bold text-rose-700 transition-colors animate-pulse"
            >
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>No LLM</span>
            </button>
          )}

          {isEncrypted && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-lg border border-emerald-300">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Encrypted
            </span>
          )}
        </div>
      </div>

      {/* Lower Line: Navigation switches, Setup Instructions button & Context Gauge */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Switch 1: App Navigation Menu Switch Button */}
          <button
            onClick={onToggleNavMenu}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isNavMenuOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title={isNavMenuOpen ? 'Collapse App Menu' : 'Open App Menu (Chat, MCP, Providers, Context)'}
          >
            <Compass className="w-4 h-4" />
            <span>Menu</span>
          </button>

          {/* Switch 2: Conversation History Menu Switch Button (Visible on Chat tab) */}
          {activeTab === 'chat' && (
            <button
              onClick={onToggleConversationMenu}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isConversationMenuOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
              title={isConversationMenuOpen ? 'Collapse Chats History' : 'Open Conversations History'}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chats</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isConversationMenuOpen ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {conversationCount}
              </span>
            </button>
          )}

          {/* Active Tab indicator */}
          <div className="text-[11px] font-bold text-slate-500 hidden sm:flex items-center gap-1.5 ml-1">
            <span className="capitalize">{activeTab} View</span>
          </div>
        </div>

        {/* Right Action Group: Setup Instructions Button & Dynamic Context Gauge */}
        <div className="flex items-center gap-2">
          {/* Setup Instructions / Docs Button */}
          <button
            onClick={onOpenSetupDocs}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-900 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Open Setup Instructions (GitHub, NPM, Docker docs)"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Setup Instructions</span>
            <span className="sm:hidden">Docs</span>
          </button>

          {/* Dynamic Context Gauge Pill */}
          <button
            onClick={() => setActiveTab('context')}
            className="flex flex-col items-end group cursor-pointer text-left"
            title="Adjust Dynamic Context Window"
          >
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-800 font-bold group-hover:text-indigo-600 transition-colors">
              <Activity className="w-3 h-3 text-indigo-600" />
              <span className="font-mono">{usedTokens.toLocaleString()} / {maxTokens >= 1000000 ? '1M' : `${Math.round(maxTokens/1024)}k`}</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden mt-0.5 border border-slate-300">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  tokenPercentage > 85
                    ? 'bg-rose-600'
                    : tokenPercentage > 60
                    ? 'bg-amber-600'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${tokenPercentage}%` }}
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
