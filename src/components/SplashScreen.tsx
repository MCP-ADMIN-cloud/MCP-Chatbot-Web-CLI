import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { MCPLogo } from './MCPLogo';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onDismiss, 400);
    }, 2400);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleManualDismiss = () => {
    setFading(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col items-center justify-between p-6 sm:p-10 transition-opacity duration-400 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="w-full flex justify-end">
        <button
          onClick={handleManualDismiss}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-slate-700/80 bg-slate-800/60 backdrop-blur-md transition-colors"
        >
          Skip Intro
        </button>
      </div>

      <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-5 my-auto animate-in zoom-in-95 duration-500">
        {/* Zyven Technologies Pvt Ltd Logo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-white p-2.5 shadow-2xl ring-4 ring-indigo-500/30 flex items-center justify-center overflow-hidden">
            <img
              src="https://news.mcpadmin.cloud/wp-content/uploads/2026/10/Gemini_Generated_Image_9n5n8q9n5n8q9n5ns.png"
              alt="Zyven Technologies Pvt Ltd"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback icon if image network is slow
                (e.target as any).style.display = 'none';
              }}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-xl shadow-md border-2 border-slate-900 p-0.5 overflow-hidden">
            <MCPLogo className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>MCP Admin Product Line</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            MCP Chatbot
          </h1>

          <p className="text-xs sm:text-sm text-indigo-200 font-medium max-w-sm">
            Chat with your MCP servers using cloud LLMs
          </p>
        </div>

        {/* Corporation ownership badge */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 w-full text-center space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Developed & Owned By</div>
          <div className="text-sm font-bold text-white tracking-wide">Zyven Technologies Pvt Ltd</div>
          <div className="text-[11px] text-slate-300">Enterprise Cloud MCP Orchestration</div>
        </div>
      </div>

      <div className="w-full max-w-xs flex flex-col items-center gap-3">
        <button
          onClick={handleManualDismiss}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>Launch MCP Chatbot</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>AES-256 Encrypted Session Storage</span>
        </div>
      </div>
    </div>
  );
};
