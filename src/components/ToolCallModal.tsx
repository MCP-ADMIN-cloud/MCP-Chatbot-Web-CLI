import React, { useState } from 'react';
import { X, Terminal, CheckCircle2, Clock, Copy, Check, AlertCircle } from 'lucide-react';
import { ToolCallExecution } from '../types';

interface ToolCallModalProps {
  toolCall: ToolCallExecution | null;
  onClose: () => void;
}

export const ToolCallModal: React.FC<ToolCallModalProps> = ({ toolCall, onClose }) => {
  if (!toolCall) return null;

  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const inputJson = JSON.stringify(toolCall.args || {}, null, 2);
  const outputJson = toolCall.result
    ? JSON.stringify(toolCall.result, null, 2)
    : toolCall.error
    ? JSON.stringify({ error: toolCall.error }, null, 2)
    : 'Execution in progress or pending...';

  const copyToClipboard = (text: string, isInput: boolean) => {
    navigator.clipboard.writeText(text);
    if (isInput) {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-sm text-slate-900">{toolCall.toolName}</h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase font-mono ${
                    toolCall.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : toolCall.status === 'running'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {toolCall.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {toolCall.serverName ? `Server: ${toolCall.serverName}` : 'MCP Action Execution'} · {toolCall.timestamp}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Input Arguments Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Input Parameters JSON</span>
              <button
                onClick={() => copyToClipboard(inputJson, true)}
                className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-mono py-0.5 px-1.5 rounded hover:bg-indigo-50"
              >
                {copiedInput ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInput ? 'Copied' : 'Copy Input'}</span>
              </button>
            </div>
            <div className="bg-slate-950 text-slate-100 rounded-xl p-3 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
              <pre>{inputJson}</pre>
            </div>
          </div>

          {/* Output Results Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Output Response Payload</span>
              <button
                onClick={() => copyToClipboard(outputJson, false)}
                className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-mono py-0.5 px-1.5 rounded hover:bg-indigo-50"
              >
                {copiedOutput ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOutput ? 'Copied' : 'Copy Output'}</span>
              </button>
            </div>
            <div className="bg-slate-950 text-emerald-400 rounded-xl p-3 font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
              <pre>{outputJson}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
