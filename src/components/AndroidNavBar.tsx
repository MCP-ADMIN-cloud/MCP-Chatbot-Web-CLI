import React from 'react';
import { MessageSquare, Server, Key, Gauge, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { MCPLogo } from './MCPLogo';

interface AndroidNavBarProps {
  activeTab: 'chat' | 'mcp' | 'providers' | 'context';
  setActiveTab: (tab: 'chat' | 'mcp' | 'providers' | 'context') => void;
  mcpServerCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeTab,
  setActiveTab,
  mcpServerCount,
  isOpen,
  onClose,
}) => {
  const tabs = [
    {
      id: 'chat',
      label: 'AI Chatbot',
      subtitle: 'Chat with tools & models',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'mcp',
      label: 'MCP Servers',
      subtitle: 'SSE & HTTP registry',
      icon: Server,
      badge: mcpServerCount > 0 ? mcpServerCount : null,
    },
    {
      id: 'providers',
      label: 'AI Providers',
      subtitle: 'Gemini, OpenAI, Claude',
      icon: Key,
      badge: null,
    },
    {
      id: 'context',
      label: 'Context & Stats',
      subtitle: 'Dynamic window allocation',
      icon: Gauge,
      badge: null,
    },
  ] as const;

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Nav Menu Sidebar / Drawer */}
      <nav
        className="fixed md:static inset-y-0 left-0 z-40 md:z-20 w-64 md:w-60 bg-white border-r border-slate-300 p-3.5 flex flex-col justify-between shadow-2xl md:shadow-none shrink-0 transition-transform duration-200 h-full select-none"
      >
        <div className="space-y-3">
          {/* Menu Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <MCPLogo className="w-6 h-6 shadow-xs" />
              <span className="font-extrabold text-sm text-slate-900">App Navigation</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
              Modules
            </div>

            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    // On mobile, auto close drawer after selecting tab
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left relative cursor-pointer ${
                    isActive
                      ? 'text-indigo-900 bg-indigo-50 border-2 border-indigo-400 shadow-2xs font-extrabold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent font-semibold'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    {tab.badge !== null && (
                      <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full font-mono">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 truncate">
                    <div className="truncate text-xs font-bold">{tab.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal truncate">{tab.subtitle}</div>
                  </div>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info in navigation drawer */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <a
            href="https://mcpadmin.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>mcpadmin.cloud</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>

          <div className="text-[10px] text-slate-500 font-mono text-center">
            Zyven Technologies · v2026.4
          </div>
        </div>
      </nav>
    </>
  );
};
