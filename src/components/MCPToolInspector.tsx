import React, { useState } from 'react';
import { X, Play, Code2, CheckCircle2, AlertCircle, Search, RefreshCw, Terminal, Clock, ShieldCheck } from 'lucide-react';
import { MCPServer, MCPTool } from '../types';

interface MCPToolInspectorProps {
  server: MCPServer | null;
  onClose: () => void;
  onRefreshServer: (serverId: string) => void;
}

export const MCPToolInspector: React.FC<MCPToolInspectorProps> = ({
  server,
  onClose,
  onRefreshServer,
}) => {
  if (!server) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(server.tools[0] || null);
  const [testArgs, setTestArgs] = useState<string>('{}');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<any | null>(null);
  const [execTimeMs, setExecTimeMs] = useState<number | null>(null);
  const [execError, setExecError] = useState<string | null>(null);

  const filteredTools = server.tools.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTool = (tool: MCPTool) => {
    setSelectedTool(tool);
    setExecutionOutput(null);
    setExecError(null);

    // Generate default sample JSON args from schema
    const sample: Record<string, any> = {};
    if (tool.inputSchema && tool.inputSchema.properties) {
      Object.entries(tool.inputSchema.properties).forEach(([key, schema]) => {
        if (schema.type === 'string') sample[key] = schema.enum ? schema.enum[0] : 'sample_text';
        else if (schema.type === 'number') sample[key] = 10;
        else if (schema.type === 'boolean') sample[key] = true;
        else sample[key] = null;
      });
    }
    setTestArgs(JSON.stringify(sample, null, 2));
  };

  const handleRunTool = async () => {
    if (!selectedTool) return;

    setIsExecuting(true);
    setExecError(null);
    setExecutionOutput(null);

    const start = Date.now();

    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(testArgs);
      } catch (e) {
        throw new Error('Invalid JSON arguments formatting.');
      }

      const resp = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: server.id,
          toolName: selectedTool.name,
          arguments: parsedArgs,
        }),
      });

      const data = await resp.json();
      setExecTimeMs(Date.now() - start);

      if (!resp.ok) {
        throw new Error(data.error || 'Execution failed');
      }

      setExecutionOutput(data.result);
    } catch (err: any) {
      setExecError(err.message || 'Failed to execute tool');
      setExecTimeMs(Date.now() - start);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Inspector Top Bar */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">{server.name}</span>
              <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                {server.transport.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {server.latencyMs}ms
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-xl">
              URL: {server.url} {server.authType !== 'none' && `(${server.authType} auth active)`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefreshServer(server.id)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
              title="Ping & Sync Server Tools"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inspector Body split view */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left Column: Tool List & Filter */}
          <div className="w-full md:w-80 p-4 bg-slate-50/50 flex flex-col gap-3 shrink-0 overflow-hidden">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter tools..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Discovered Tools ({filteredTools.length})
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredTools.map((tool) => {
                const isSelected = selectedTool?.name === tool.name;
                return (
                  <button
                    key={tool.name}
                    onClick={() => handleSelectTool(tool)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-mono font-bold truncate mb-1">{tool.name}</div>
                    <div
                      className={`text-[11px] line-clamp-2 ${
                        isSelected ? 'text-indigo-100' : 'text-slate-500'
                      }`}
                    >
                      {tool.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Tool Schema & Test Execution Runner */}
          {selectedTool ? (
            <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-white">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-slate-900 font-mono">{selectedTool.name}</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {Object.keys(selectedTool.inputSchema?.properties || {}).length} params
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedTool.description}</p>
              </div>

              {/* JSON Schema Details View */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Input Parameter Schema</span>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-xl p-3 text-xs font-mono overflow-x-auto border border-slate-800 max-h-48">
                  <pre>{JSON.stringify(selectedTool.inputSchema, null, 2)}</pre>
                </div>
              </div>

              {/* Live Test Runner Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-600" />
                    <span>Interactive Manual Tool Execution</span>
                  </div>

                  <button
                    onClick={handleRunTool}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
                    <span>{isExecuting ? 'Executing...' : 'Run Tool'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Test Arguments JSON</label>
                  <textarea
                    rows={4}
                    value={testArgs}
                    onChange={(e) => setTestArgs(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Execution Result Box */}
                {execError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 font-mono">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Execution Failed</div>
                      <div>{execError}</div>
                    </div>
                  </div>
                )}

                {executionOutput && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Result Payload
                      </span>
                      {execTimeMs && <span>Executed in {execTimeMs}ms</span>}
                    </div>

                    <div className="bg-slate-900 text-emerald-400 rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-60 border border-slate-800">
                      <pre>{JSON.stringify(executionOutput, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-slate-400 text-xs">
              Select a tool from the list to view schema and run tests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
