import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Paperclip, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  FileText, 
  Plus, 
  Trash2, 
  Pin, 
  Search, 
  Sliders, 
  Maximize2, 
  X,
  Cpu,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { ChatThread, ChatMessage, Attachment, ToolCallExecution, MCPServer, ProviderType, ProviderKeys } from '../types';
import { ToolCallModal } from './ToolCallModal';

interface ChatViewProps {
  threads: ChatThread[];
  activeThreadId: string;
  setActiveThreadId: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  onPinThread: (id: string) => void;
  mcpServers: MCPServer[];
  selectedProvider: ProviderType | '';
  selectedModel: string;
  contextWindowLimit: number;
  providerKeys: ProviderKeys;
  autoExecuteTools: boolean;
  setAutoExecuteTools: (val: boolean) => void;
  onUpdateUsedTokens: (tokens: number) => void;
  onGoToProviders: () => void;
  isConversationMenuOpen: boolean;
  onToggleConversationMenu: () => void;
  onCloseConversationMenu: () => void;
}

// Clean Markdown Formatter Component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const copyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer = '';
  let codeLang = '';
  let codeBlockIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const capturedCode = codeBuffer.trim();
        const currentIdx = codeBlockIdx++;
        elements.push(
          <div key={`code_${i}`} className="my-2.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs">
            <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-800 text-[11px] text-slate-400 font-semibold">
              <span>{codeLang || 'code'}</span>
              <button
                onClick={() => copyCode(capturedCode, currentIdx)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedCodeIdx === currentIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeIdx === currentIdx ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto">
              <code>{capturedCode}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = '';
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer += line + '\n';
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-sm font-bold text-slate-900 mt-2 mb-1">{line.slice(4)}</h3>);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-base font-extrabold text-slate-900 mt-2.5 mb-1">{line.slice(3)}</h2>);
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-lg font-extrabold text-slate-900 mt-3 mb-1.5">{line.slice(2)}</h1>);
      continue;
    }

    // Lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5 ml-1">
          <span className="text-indigo-600 font-bold mt-0.5 text-xs">•</span>
          <span className="flex-1">{formatInlineMarkdown(line.trim().slice(2))}</span>
        </div>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div key={i} className="border-l-4 border-indigo-500 pl-3 my-1.5 italic text-slate-700 font-medium">
          {formatInlineMarkdown(line.slice(2))}
        </div>
      );
      continue;
    }

    // Regular line with inline markdown
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i} className="my-0.5 text-slate-900">{formatInlineMarkdown(line)}</p>);
    }
  }

  if (inCodeBlock && codeBuffer) {
    elements.push(
      <div key="unclosed_code" className="my-2 rounded-xl bg-slate-950 text-slate-100 p-3 font-mono text-xs overflow-x-auto">
        <pre><code>{codeBuffer}</code></pre>
      </div>
    );
  }

  return <div className="space-y-0.5 text-xs sm:text-sm leading-relaxed">{elements}</div>;
};

function formatInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} className="bg-slate-100 text-indigo-700 border border-slate-200 px-1 py-0.5 rounded font-mono text-[11px] font-bold">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={index} className="italic text-slate-800">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export const ChatView: React.FC<ChatViewProps> = ({
  threads,
  activeThreadId,
  setActiveThreadId,
  onNewThread,
  onDeleteThread,
  onPinThread,
  mcpServers,
  selectedProvider,
  selectedModel,
  contextWindowLimit,
  providerKeys,
  autoExecuteTools,
  setAutoExecuteTools,
  onUpdateUsedTokens,
  onGoToProviders,
  isConversationMenuOpen,
  onToggleConversationMenu,
  onCloseConversationMenu,
}) => {
  const currentThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const [inputPrompt, setInputPrompt] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [searchThreadQuery, setSearchThreadQuery] = useState('');
  const [inspectToolCall, setInspectToolCall] = useState<ToolCallExecution | null>(null);
  const [streamingStatusText, setStreamingStatusText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const isProviderConfigured = Boolean(
    selectedProvider && providerKeys[selectedProvider]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages, isStreaming, streamingStatusText]);

  useEffect(() => {
    if (!currentThread) return;
    let totalChars = 0;
    currentThread.messages.forEach((m) => {
      totalChars += m.content.length;
      if (m.attachments) {
        m.attachments.forEach((a) => {
          if (a.parsedText) totalChars += a.parsedText.length;
        });
      }
    });
    const estTokens = Math.ceil(totalChars / 3.8);
    onUpdateUsedTokens(estTokens);
  }, [currentThread?.messages]);

  const activeMCPTools = mcpServers
    .filter((s) => s.status === 'connected' && s.enabled !== false)
    .flatMap((s) => s.tools);

  const maybeUpdateThreadTitle = (firstMessage: string) => {
    if (currentThread.messages.length <= 1) {
      const cleanTitle = firstMessage.trim().replace(/[^\w\s-]/g, '').slice(0, 36);
      if (cleanTitle) {
        currentThread.title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if ((!text.trim() && attachments.length === 0) || isStreaming) return;

    if (!isProviderConfigured) {
      onGoToProviders();
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: [...attachments],
    };

    maybeUpdateThreadTitle(text);

    currentThread.messages.push(userMessage);
    setInputPrompt('');
    setAttachments([]);
    setIsStreaming(true);
    setStreamingStatusText('Connecting to LLM...');

    const assistantMsgId = `asst_${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolCalls: [],
    };
    currentThread.messages.push(assistantMessage);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentThread.messages.slice(0, -1),
          provider: selectedProvider,
          modelName: selectedModel,
          providerKeys,
          activeTools: activeMCPTools,
          contextWindowLimit,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.split('\n')[0].replace('event: ', '').trim();
            const dataStr = line.split('\ndata: ')[1];
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (eventType === 'chunk' && data.text) {
                assistantMessage.content += data.text;
                setStreamingStatusText(null);
                currentThread.updatedAt = new Date().toISOString();
              } else if (eventType === 'tool_call') {
                setStreamingStatusText(`Executing tool: ${data.name}...`);
                const toolExecution: ToolCallExecution = {
                  id: data.id || `tc_${Date.now()}`,
                  toolName: data.name,
                  args: data.args || {},
                  status: 'running',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };

                assistantMessage.toolCalls = assistantMessage.toolCalls || [];
                assistantMessage.toolCalls.push(toolExecution);
              } else if (eventType === 'tool_result') {
                setStreamingStatusText('Synthesizing tool response...');
                if (assistantMessage.toolCalls) {
                  const call = assistantMessage.toolCalls.find((tc) => tc.id === data.id || tc.toolName === data.name);
                  if (call) {
                    call.status = 'completed';
                    call.result = data.result;
                  }
                }
              } else if (eventType === 'error') {
                assistantMessage.content += `\n\n**Error:** ${data.message || 'Stream processing failed'}`;
              }
            } catch (err) {
              console.error('SSE JSON error', err);
            }
          }
        }
      }
    } catch (err: any) {
      assistantMessage.content += `\n\n[System Error: ${err.message || 'Connection failed'}]`;
    } finally {
      setIsStreaming(false);
      setStreamingStatusText(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const textContent = evt.target?.result as string;
        try {
          const resp = await fetch('/api/media/parse-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type.includes('image') ? 'image' : 'document',
              textContent,
            }),
          });
          const data = await resp.json();

          const newAtt: Attachment = {
            id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            fileName: file.name,
            fileType: file.type.includes('image') ? 'image' : 'document',
            mimeType: file.type || 'text/plain',
            sizeBytes: file.size,
            parsedText: data.parsedText,
            tokenEstimate: data.estimatedTokens,
          };

          if (file.type.includes('image')) {
            newAtt.url = textContent;
          }

          setAttachments((prev) => [...prev, newAtt]);
        } catch (err) {
          console.error('File parsing error', err);
        }
      };

      if (file.type.includes('image')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const toggleMicRecording = () => {
    if (isRecordingMic) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (mediaRecorderRef.current) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
      setIsRecordingMic(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecordingMic(true);
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => {
          setIsRecordingMic(false);
        };

        recognition.onend = () => {
          setIsRecordingMic(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (e) {}
    }

    navigator.mediaDevices?.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsRecordingMic(false);
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const resp = await fetch('/api/media/speech-to-text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, apiKey: providerKeys.gemini }),
            });
            const data = await resp.json();
            if (data.transcript) {
              setInputPrompt((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
            }
          } catch (err) {
            console.error('STT error', err);
          }
        };
      };

      recorder.start();
      setIsRecordingMic(true);
    }).catch(() => {
      alert('Microphone permission required for voice recording.');
    });
  };

  const handlePlayTTS = async (messageId: string, text: string) => {
    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(messageId);
    try {
      const resp = await fetch('/api/media/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 500),
          apiKey: providerKeys.gemini,
        }),
      });
      const data = await resp.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setPlayingAudioId(null);
        audio.play();
      } else {
        setPlayingAudioId(null);
      }
    } catch (err) {
      setPlayingAudioId(null);
    }
  };

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchThreadQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden relative bg-slate-100 h-full w-full">
      {/* Mobile Backdrop for Conversation Menu */}
      {isConversationMenuOpen && (
        <div
          onClick={onCloseConversationMenu}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Conversation History Menu Sidebar (Collapsible on Mobile and Desktop) */}
      {isConversationMenuOpen && (
        <div
          className="fixed md:static inset-y-0 left-0 z-40 md:z-10 w-72 sm:w-80 bg-white border-r border-slate-300 p-3 sm:p-3.5 flex flex-col justify-between shrink-0 shadow-2xl md:shadow-none h-full transition-transform duration-200 select-none"
        >
          <div className="flex flex-col gap-3 overflow-hidden flex-1">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  onNewThread();
                  if (window.innerWidth < 768) {
                    onCloseConversationMenu();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>

              <button
                onClick={onCloseConversationMenu}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg ml-1"
                title="Collapse sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Threads */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchThreadQuery}
                onChange={(e) => setSearchThreadQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
                Conversations ({filteredThreads.length})
              </div>
              {filteredThreads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      if (window.innerWidth < 768) {
                        onCloseConversationMenu();
                      }
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-950 font-bold border border-indigo-300'
                        : 'text-slate-800 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 mr-1">
                      {thread.pinned && <Pin className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600 shrink-0" />}
                      <span className="truncate">{thread.title || 'New Conversation'}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPinThread(thread.id);
                        }}
                        className="p-1 hover:text-indigo-600 text-slate-400"
                        title={thread.pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${thread.pinned ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteThread(thread.id);
                        }}
                        className="p-1 hover:text-rose-700 text-slate-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

            {/* Zyven Technologies Sidebar Banner */}
          <div className="pt-2.5 border-t border-slate-300 shrink-0 mt-2">
            <a
              href="https://zyven-technologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md hover:ring-2 hover:ring-indigo-500 transition-all group"
            >
              <div className="w-full h-20 sm:h-24 rounded-xl bg-white p-2 mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src="https://news.mcpadmin.cloud/wp-content/uploads/2026/10/Gemini_Generated_Image_9n5n8q9n5n8q9n5ns.png"
                  alt="Zyven Technologies Pvt Ltd"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">Zyven Technologies</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug font-medium">
                Enterprise Cloud MCP Orchestration & Infrastructure. Creator of MCP Admin.
              </p>
            </a>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative min-w-0">
        {/* Chat Header Bar */}
        <div className="px-3 sm:px-4 py-2 bg-white border-b border-slate-300 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2 truncate">
            {/* Quick Toggle for Conversation Menu on Mobile if closed */}
            {!isConversationMenuOpen && (
              <button
                onClick={onToggleConversationMenu}
                className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
                title="Open Conversations"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
              </button>
            )}

            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
              {currentThread.title}
            </h2>

            <button
              onClick={() => onPinThread(currentThread.id)}
              className="p-1 text-slate-500 hover:text-indigo-600"
              title={currentThread.pinned ? 'Unpin chat' : 'Pin chat to top'}
            >
              <Pin className={`w-3.5 h-3.5 ${currentThread.pinned ? 'fill-indigo-600 text-indigo-600' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800">
              <span className="text-[11px] font-bold text-slate-600 hidden xs:inline">Auto Tools:</span>
              <button
                onClick={() => setAutoExecuteTools(!autoExecuteTools)}
                className={`font-mono text-[11px] font-bold cursor-pointer ${
                  autoExecuteTools ? 'text-emerald-700' : 'text-slate-600'
                }`}
              >
                {autoExecuteTools ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Not Configured Banner Alert */}
        {!isProviderConfigured && (
          <div className="bg-amber-50 border-b border-amber-300 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-950 font-bold shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="leading-snug">No AI Provider Configured. Select an AI Provider (Gemini, OpenAI, Claude, OpenRouter) to chat.</span>
            </div>
            <button
              onClick={onGoToProviders}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg font-bold text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer self-end sm:self-auto"
            >
              Configure AI Provider →
            </button>
          </div>
        )}

        {/* Message Stream Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
          {currentThread.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6">
              {/* Only ONE Banner on the Homepage: MCP Admin cloud banner */}
              <a
                href="https://mcpadmin.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-2xl bg-white border-2 border-indigo-200 hover:border-indigo-500 overflow-hidden shadow-md hover:shadow-lg transition-all group block text-left"
              >
                <div className="w-full h-32 sm:h-44 bg-slate-900 overflow-hidden relative">
                  <img
                    src="https://news.mcpadmin.cloud/wp-content/uploads/2026/10/Screenshot-2026-08-26-113140.png"
                    alt="Create MCP servers on mcpadmin.cloud"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 sm:p-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white font-extrabold text-xs sm:text-base drop-shadow-md">
                        Create & Host MCP Servers on mcpadmin.cloud
                      </span>
                      <span className="bg-indigo-600 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-sm shrink-0 ml-2">
                        <span>Deploy Now</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="line-clamp-1 sm:line-clamp-none">Serverless, isolated MCP containers ready in seconds. Connect directly to this chatbot.</span>
                  <span className="text-indigo-600 font-extrabold text-[11px] whitespace-nowrap ml-2">mcpadmin.cloud →</span>
                </div>
              </a>

              {/* Suggestions */}
              <div className="w-full text-left space-y-2">
                <div className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Quick Actions & Suggestions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {[
                    'List all connected MCP servers and inspect their tools',
                    'Query live tools for status check or health telemetry',
                    'Analyze attached code or documents with full context',
                    'Run actions across active SSE and HTTP MCP endpoints',
                  ].map((promptText) => (
                    <button
                      key={promptText}
                      onClick={() => handleSendMessage(promptText)}
                      className="p-2.5 sm:p-3 bg-white border border-slate-300 hover:border-indigo-400 rounded-xl text-xs text-slate-800 text-left font-semibold transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
                    >
                      "{promptText}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            currentThread.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-600 px-1 font-mono font-bold">
                    <span className="text-slate-800">{isUser ? 'You' : 'MCP Chatbot'}</span>
                    <span>·</span>
                    <span>{message.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-2xl rounded-2xl p-3 sm:p-4 text-xs sm:text-sm shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs font-medium'
                        : 'bg-white border-2 border-slate-300 text-slate-900 rounded-tl-xs'
                    }`}
                  >
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2 pb-2 border-b border-slate-200">
                        {message.attachments.map((att) => (
                          <div
                            key={att.id}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                              isUser ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[140px]">{att.fileName}</span>
                            {att.tokenEstimate && <span className="opacity-80">({att.tokenEstimate}t)</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Clean Markdown Formatting */}
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}

                    {/* Image Attachment or Generation */}
                    {message.imageUrl && (
                      <div className="mt-2.5 relative group rounded-xl overflow-hidden border border-slate-300">
                        <img
                          src={message.imageUrl}
                          alt="Visualization"
                          className="max-h-72 w-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setLightboxImage(message.imageUrl || null)}
                        />
                        <button
                          onClick={() => setLightboxImage(message.imageUrl || null)}
                          className="absolute bottom-2 right-2 p-1.5 bg-black/70 text-white rounded-lg"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Tool Calls Visual Clues with click-to-open modal */}
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 border-t border-slate-200 pt-2.5">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-indigo-600" />
                          <span>Tool Invocations (Click to inspect)</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {message.toolCalls.map((tc) => (
                            <button
                              key={tc.id}
                              onClick={() => setInspectToolCall(tc)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono font-bold shadow-xs transition-all cursor-pointer hover:scale-102 ${
                                tc.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                  : tc.status === 'running'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse'
                                  : 'bg-rose-50 text-rose-900 border-rose-300'
                              }`}
                            >
                              <Terminal className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{tc.toolName}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded uppercase bg-white/80">
                                {tc.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Text to Speech Button for assistant responses */}
                    {!isUser && message.content && (
                      <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <button
                          onClick={() => handlePlayTTS(message.id, message.content)}
                          className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors font-bold"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{playingAudioId === message.id ? 'Speaking...' : 'Listen'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Streaming Status Indicator */}
          {streamingStatusText && (
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 font-mono animate-pulse px-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{streamingStatusText}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selected Attachment Chips */}
        {attachments.length > 0 && (
          <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-300 flex flex-wrap gap-1.5 text-xs shrink-0">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-white border border-slate-300 rounded-lg shadow-xs font-mono font-semibold text-[11px]"
              >
                <FileText className="w-3 h-3 text-indigo-600" />
                <span className="truncate max-w-[130px]">{att.fileName}</span>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                  className="text-slate-500 hover:text-rose-700 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Keyboard Aware Composer Input Bar (Always stays above keyboard) */}
        <div className="p-2 sm:p-3.5 bg-white border-t border-slate-300 shrink-0 sticky bottom-0 z-20 shadow-md">
          <div className="flex items-end gap-1.5 sm:gap-2 bg-slate-50 border-2 border-slate-300 rounded-2xl p-1.5 sm:p-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-200 rounded-xl transition-colors shrink-0 cursor-pointer"
              title="Attach document or code"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <textarea
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={isProviderConfigured ? 'Chat with your MCP servers...' : 'Configure provider key first...'}
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none resize-none max-h-28 sm:max-h-32 py-1 font-medium"
            />

            <button
              onClick={toggleMicRecording}
              className={`p-1.5 sm:p-2 rounded-xl transition-all shrink-0 ${
                isRecordingMic
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
              }`}
              title="Record Voice"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => handleSendMessage()}
              disabled={(!inputPrompt.trim() && attachments.length === 0) || isStreaming}
              className="p-2 sm:p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tool Call Inspection Modal */}
      {inspectToolCall && (
        <ToolCallModal
          toolCall={inspectToolCall}
          onClose={() => setInspectToolCall(null)}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <img src={lightboxImage} alt="Visual" className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};
