import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertCircle, 
  Zap,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ProviderKeys, ProviderType, ModelOption } from '../types';
import { saveSecureKeys } from '../services/security';

interface ProvidersPageProps {
  providerKeys: ProviderKeys;
  setProviderKeys: React.Dispatch<React.SetStateAction<ProviderKeys>>;
  selectedProvider: ProviderType | '';
  setSelectedProvider: (p: ProviderType | '') => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  isEncrypted: boolean;
  setIsEncrypted: (val: boolean) => void;
}

export const ProvidersPage: React.FC<ProvidersPageProps> = ({
  providerKeys,
  setProviderKeys,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  isEncrypted,
  setIsEncrypted,
}) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [passphrase, setPassphrase] = useState('mcp_master_pass_2026');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});
  const [dynamicModels, setDynamicModels] = useState<Record<string, ModelOption[]>>({});
  const [fetchErrors, setFetchErrors] = useState<Record<string, string>>({});

  const providersConfig = [
    {
      id: 'gemini',
      name: 'Google Gemini AI',
      description: 'Ultra fast multi-modal models with native tool calling capabilities.',
      keyField: 'gemini' as const,
      placeholder: 'AIzaSy...',
      docsUrl: 'https://aistudio.google.com/app/apikey',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
    },
    {
      id: 'openai',
      name: 'OpenAI API',
      description: 'GPT-4o, GPT-4o-mini, o1, and o3-mini models via your OpenAI secret key.',
      keyField: 'openai' as const,
      placeholder: 'sk-proj-...',
      docsUrl: 'https://platform.openai.com/api-keys',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Claude 3.5 Sonnet & Claude 3.5 Haiku models via Anthropic console key.',
      keyField: 'anthropic' as const,
      placeholder: 'sk-ant-api...',
      docsUrl: 'https://console.anthropic.com/settings/keys',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Aggregator',
      description: 'Access DeepSeek, Llama 3.3, Mistral, and dozens of cloud LLMs through one key.',
      keyField: 'openrouter' as const,
      placeholder: 'sk-or-v1-...',
      docsUrl: 'https://openrouter.ai/keys',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
    },
  ];

  // Function to dynamically fetch models from API
  const fetchModelsForProvider = async (providerId: string, customKey?: string) => {
    const key = customKey || providerKeys[providerId];
    if (!key) return;

    setLoadingModels((prev) => ({ ...prev, [providerId]: true }));
    setFetchErrors((prev) => ({ ...prev, [providerId]: '' }));

    try {
      const resp = await fetch('/api/models/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          apiKey: key,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to fetch model list');
      }

      if (Array.isArray(data.models) && data.models.length > 0) {
        setDynamicModels((prev) => ({ ...prev, [providerId]: data.models }));
        // If current selected model belongs to this provider and isn't set, select first
        if (selectedProvider === providerId && (!selectedModel || !data.models.some((m: any) => m.id === selectedModel))) {
          setSelectedModel(data.models[0].id);
          localStorage.setItem('mcp_selected_model', data.models[0].id);
        }
      }
    } catch (err: any) {
      setFetchErrors((prev) => ({ ...prev, [providerId]: err.message || 'Error querying models' }));
    } finally {
      setLoadingModels((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  // Auto fetch models when provider keys change or on mount
  useEffect(() => {
    providersConfig.forEach((prov) => {
      const key = providerKeys[prov.keyField];
      if (key && !dynamicModels[prov.id]) {
        fetchModelsForProvider(prov.id, key);
      }
    });
  }, [providerKeys]);

  const handleKeyChange = (field: keyof ProviderKeys, value: string) => {
    setProviderKeys((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const handleSaveAll = async () => {
    setSaveStatus('Encrypting credentials using AES-GCM...');
    await saveSecureKeys(providerKeys as any, passphrase);
    setIsEncrypted(true);
    setSaveStatus('Credentials securely encrypted and persisted!');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectProvider = (provId: ProviderType) => {
    setSelectedProvider(provId);
    localStorage.setItem('mcp_selected_provider', provId);

    const available = dynamicModels[provId];
    if (available && available.length > 0) {
      setSelectedModel(available[0].id);
      localStorage.setItem('mcp_selected_model', available[0].id);
    } else {
      // Trigger fetch
      fetchModelsForProvider(provId);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Cloud LLM Providers & Credentials</h2>
            <p className="text-xs text-slate-700 font-medium">
              Configure your API keys to power tool execution and chat with your MCP servers.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
        >
          <Lock className="w-4 h-4" />
          <span>Encrypt & Save Keys</span>
        </button>
      </div>

      {saveStatus && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Encryption Storage Vault Status */}
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-800">Local AES-256 Storage:</span>
          <span className="text-emerald-800 font-bold">{isEncrypted ? 'Encrypted & Active' : 'Unencrypted Local Session'}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-700 font-mono font-semibold">Passphrase:</span>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono text-slate-900 w-36 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providersConfig.map((prov) => {
          const keyVal = (providerKeys as any)[prov.keyField] || '';
          const isSelected = selectedProvider === prov.id;
          const isLoading = loadingModels[prov.id];
          const modelsList = dynamicModels[prov.id] || [];
          const errorMsg = fetchErrors[prov.id];

          return (
            <div
              key={prov.id}
              className={`bg-white rounded-2xl border-2 transition-all p-5 flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${prov.badgeColor}`}>
                      {prov.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectProvider(prov.id as ProviderType)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ Active Provider' : 'Select'}
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-medium mb-3">{prov.description}</p>

                {/* API Key Input */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>API Key</span>
                    <a
                      href={prov.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <span>Get Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="relative">
                    <input
                      type={showKeys[prov.id] ? 'text' : 'password'}
                      value={keyVal}
                      onChange={(e) => handleKeyChange(prov.keyField, e.target.value)}
                      placeholder={prov.placeholder}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 pr-10 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(prov.id)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-800"
                    >
                      {showKeys[prov.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Dynamic Models Dropdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Active Model</span>
                    <button
                      onClick={() => fetchModelsForProvider(prov.id, keyVal)}
                      disabled={isLoading || !keyVal}
                      className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{isLoading ? 'Querying API...' : 'Fetch Models'}</span>
                    </button>
                  </div>

                  {modelsList.length > 0 ? (
                    <select
                      value={isSelected ? selectedModel : modelsList[0]?.id}
                      onChange={(e) => {
                        const newModel = e.target.value;
                        if (isSelected) {
                          setSelectedModel(newModel);
                          localStorage.setItem('mcp_selected_model', newModel);
                        }
                      }}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                    >
                      {modelsList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name || m.id} {m.description ? `(${m.description.slice(0, 35)}...)` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-[11px] text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-300 font-medium">
                      {keyVal ? 'Click "Fetch Models" to load available models from provider API.' : 'Enter API key above to load models.'}
                    </div>
                  )}

                  {errorMsg && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                {keyVal ? (
                  <span className="text-emerald-700 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Configured
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium text-[11px]">Key Not Set</span>
                )}

                {modelsList.length > 0 && (
                  <span className="text-slate-700 font-mono font-semibold text-[11px]">
                    {modelsList.length} models fetched
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
