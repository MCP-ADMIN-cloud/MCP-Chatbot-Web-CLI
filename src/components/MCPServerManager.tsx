import React, { useState } from 'react';
import { 
  Plus, 
  Server, 
  Trash2, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Wifi, 
  Cpu, 
  X, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { MCPServer, TransportType, AuthType } from '../types';
import { MCPToolInspector } from './MCPToolInspector';

interface MCPServerManagerProps {
  mcpServers: MCPServer[];
  setMcpServers: React.Dispatch<React.SetStateAction<MCPServer[]>>;
  onConnectServer: (config: Partial<MCPServer>) => Promise<void>;
  onDeleteServer: (id: string) => Promise<void>;
}

export const MCPServerManager: React.FC<MCPServerManagerProps> = ({
  mcpServers,
  setMcpServers,
  onConnectServer,
  onDeleteServer,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectServer, setInspectServer] = useState<MCPServer | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [transport, setTransport] = useState<TransportType>('sse');
  const [authType, setAuthType] = useState<AuthType>('none');
  const [authToken, setAuthToken] = useState('');
  const [queryParamName, setQueryParamName] = useState('api_key');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onConnectServer({
        name,
        url,
        transport,
        authType,
        authToken,
        queryParamName,
        isCustom: true,
      });

      setShowAddModal(false);
      setName('');
      setUrl('');
      setAuthToken('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to connect server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEnable = (id: string) => {
    setMcpServers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: s.enabled === false ? true : false } : s))
    );
  };

  const totalTools = mcpServers.reduce((acc, s) => acc + s.tools.length, 0);
  const activeServers = mcpServers.filter((s) => s.status === 'connected' && s.enabled !== false).length;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header & Dashboard Stats Banner */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Model Context Protocol (MCP) Server Hub</h2>
              <p className="text-xs text-slate-700 font-medium">
                Connect your SSE or HTTP MCP tool servers to trigger system actions via cloud LLMs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href="https://mcpadmin.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl font-bold text-xs transition-colors"
          >
            <span>Cloud Servers</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
          </a>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add MCP Server</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-300 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Active Connected</div>
            <div className="text-lg font-extrabold font-mono text-slate-900">
              {activeServers} / {mcpServers.length} Servers
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Exposed Tools</div>
            <div className="text-lg font-extrabold font-mono text-slate-900">{totalTools} Tools Ready</div>
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Offline Cache</div>
            <div className="text-xs font-bold text-emerald-800">Tool Schemas Persisted</div>
          </div>
        </div>
      </div>

      {/* Servers List Grid / Clean Empty State */}
      {mcpServers.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-indigo-100">
            <Server className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No MCP Servers Connected</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Add any SSE or HTTP MCP server endpoint to expose live tools, database querying, APIs, or scripts to your AI chatbot.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Connect MCP Server</span>
            </button>
            <a
              href="https://mcpadmin.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs transition-colors"
            >
              <span>Explore mcpadmin.cloud</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mcpServers.map((server) => {
            const isEnabled = server.enabled !== false;
            return (
              <div
                key={server.id}
                className={`bg-white rounded-2xl border-2 transition-all p-5 flex flex-col justify-between ${
                  isEnabled
                    ? 'border-slate-300 hover:border-slate-400 shadow-xs'
                    : 'border-slate-200 bg-slate-50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{server.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-800 rounded border border-slate-300">
                        {server.transport}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleEnable(server.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        isEnabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isEnabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <p className="text-xs font-mono font-medium text-slate-700 mb-3 truncate">{server.url}</p>

                  <div className="flex items-center gap-3 text-xs text-slate-700 font-mono mb-4">
                    <span className="flex items-center gap-1 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{server.latencyMs}ms</span>
                    </span>
                    <span>·</span>
                    <span className="font-semibold">{server.tools.length} Tools Discovered</span>
                    <span>·</span>
                    <span className="capitalize">{server.authType} Auth</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectServer(server)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Inspect Tools ({server.tools.length})</span>
                  </button>

                  <button
                    onClick={() => onDeleteServer(server.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Server"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Server Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900">Add SSE or HTTP MCP Server</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Server Friendly Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Analytics MCP"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Endpoint URL (SSE or HTTP)</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://mcp.example.com/sse or http://localhost:8000/mcp"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Transport Protocol</label>
                  <select
                    value={transport}
                    onChange={(e) => setTransport(e.target.value as TransportType)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="sse">SSE (Server-Sent Events)</option>
                    <option value="http">HTTP POST / JSON-RPC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Authentication Type</label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as AuthType)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="none">None / Public</option>
                    <option value="bearer">Bearer Header Token</option>
                    <option value="query_param">API Key Query Param</option>
                  </select>
                </div>
              </div>

              {authType !== 'none' && (
                <div className="space-y-3 p-3 bg-slate-100 rounded-xl border border-slate-300">
                  {authType === 'query_param' && (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">Query Parameter Key Name</label>
                      <input
                        type="text"
                        value={queryParamName}
                        onChange={(e) => setQueryParamName(e.target.value)}
                        placeholder="api_key or token"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Token or Secret Key</label>
                    <input
                      type="password"
                      required
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="Enter secret token..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 hover:bg-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Connecting & Syncing...' : 'Connect & Discover Tools'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tool Inspector Drawer Modal */}
      {inspectServer && (
        <MCPToolInspector
          server={inspectServer}
          onClose={() => setInspectServer(null)}
          onRefreshServer={(id) => {
            // refresh ping
          }}
        />
      )}
    </div>
  );
};
