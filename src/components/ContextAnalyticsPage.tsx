import React, { useState } from 'react';
import { Gauge, Sliders, Activity, Database, Download, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';
import { MCPServer } from '../types';

interface ContextAnalyticsPageProps {
  contextWindowLimit: number;
  setContextWindowLimit: (limit: number) => void;
  usedTokens: number;
  mcpServers: MCPServer[];
  autoExecuteTools: boolean;
  setAutoExecuteTools: (val: boolean) => void;
}

export const ContextAnalyticsPage: React.FC<ContextAnalyticsPageProps> = ({
  contextWindowLimit,
  setContextWindowLimit,
  usedTokens,
  mcpServers,
  autoExecuteTools,
  setAutoExecuteTools,
}) => {
  const [pruneThreshold, setPruneThreshold] = useState(80);

  const contextOptions = [4096, 8192, 16384, 32768, 65536, 131072, 1048576];

  const allTools = mcpServers.flatMap((s) => s.tools);
  const toolSchemaBytes = new TextEncoder().encode(JSON.stringify(allTools)).length;
  const toolSchemaTokens = Math.ceil(toolSchemaBytes / 3.8);

  const systemTokensEstimate = 450;
  const messageTokensEstimate = Math.max(0, usedTokens - toolSchemaTokens - systemTokensEstimate);

  const percentageUsed = Math.min(100, Math.round((usedTokens / contextWindowLimit) * 100));

  const handleExportCache = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mcpServers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mcp_cached_tools_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Dynamic Context Window & Analytics</h2>
            <p className="text-xs text-slate-700 font-medium">
              Adjust LLM token limits, monitor prompt capacity allocation, and export offline tool schemas.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCache}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Offline Cache</span>
        </button>
      </div>

      {/* Main Dynamic Context Slider Card */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Max Context Window Limit</h3>
          </div>
          <span className="text-sm font-mono font-bold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-300">
            {contextWindowLimit.toLocaleString()} Tokens
          </span>
        </div>

        {/* Custom Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {contextOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setContextWindowLimit(opt)}
              className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all border-2 cursor-pointer ${
                contextWindowLimit === opt
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {opt >= 1000000 ? '1M' : `${Math.round(opt / 1024)}k`}
            </button>
          ))}
        </div>

        {/* Visual Token Allocation Gauge Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Context Capacity Utilization</span>
            <span className="font-mono text-indigo-700">{percentageUsed}% used ({usedTokens.toLocaleString()} tokens)</span>
          </div>

          <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex border border-slate-300">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (systemTokensEstimate / contextWindowLimit) * 100)}%` }}
              title={`System Prompt: ~${systemTokensEstimate} tokens`}
            />
            <div
              className="bg-teal-600 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (toolSchemaTokens / contextWindowLimit) * 100)}%` }}
              title={`MCP Tools Schema: ~${toolSchemaTokens} tokens`}
            />
            <div
              className="bg-sky-600 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (messageTokensEstimate / contextWindowLimit) * 100)}%` }}
              title={`Chat Messages & Attachments: ~${messageTokensEstimate} tokens`}
            />
          </div>

          {/* Breakdown Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <span className="w-3 h-3 rounded-full bg-indigo-600 shrink-0" />
              <span>System Prompt: ~{systemTokensEstimate} tokens</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <span className="w-3 h-3 rounded-full bg-teal-600 shrink-0" />
              <span>MCP Schemas: ~{toolSchemaTokens} tokens</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <span className="w-3 h-3 rounded-full bg-sky-600 shrink-0" />
              <span>Chat Context: ~{messageTokensEstimate} tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pruning & Execution Governance */}
        <div className="bg-white border border-slate-300 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Context Compression & Execution</h3>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-300 text-xs">
            <div>
              <div className="font-bold text-slate-900">Auto-Execute MCP Tools</div>
              <div className="text-slate-600 text-[11px] font-medium">Execute tool calls automatically during chat</div>
            </div>
            <input
              type="checkbox"
              checked={autoExecuteTools}
              onChange={(e) => setAutoExecuteTools(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600 accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Auto-Prune Truncation Threshold</span>
              <span className="font-mono text-indigo-600 font-extrabold">{pruneThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={pruneThreshold}
              onChange={(e) => setPruneThreshold(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-600 font-medium">
              When message history reaches {pruneThreshold}% of capacity, older turns will be automatically pruned.
            </p>
          </div>
        </div>

        {/* Offline Tool Cache Stats */}
        <div className="bg-white border border-slate-300 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Offline Tool Cache Storage</h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-800 font-medium">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span>Total Servers Cached:</span>
              <span className="font-mono font-bold text-slate-900">{mcpServers.length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span>Total Tool Definitions:</span>
              <span className="font-mono font-bold text-slate-900">{allTools.length}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Schema Memory Size:</span>
              <span className="font-mono font-bold text-slate-900">{(toolSchemaBytes / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-700 bg-slate-100 p-2.5 rounded-xl border border-slate-300 font-mono font-medium">
            Status: Persisted local storage cache active.
          </div>
        </div>
      </div>
    </div>
  );
};
