import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Compass,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-toastify';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I'm your AI Fashion Stylist. Ask me anything about clothing combinations, color matches, or dressing rules for specific occasions like college, interviews, or weddings!",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setLoading(true);

    // Prepare chat history context (excluding first assistant message if needed, or including all)
    const chatHistory = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: m.text,
    }));

    try {
      const response = await api.post('/assistant/ask', {
        message: userMessage,
        chatHistory
      });

      if (response.data.success) {
        const { reply, recommendedOutfitIds } = response.data.data;
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'assistant', 
            text: reply,
            recommendedOutfitIds
          }
        ]);
      }
    } catch (error) {
      toast.error('Failed to get styling suggestions');
      setMessages(prev => [
        ...prev, 
        { sender: 'assistant', text: "Sorry, I'm experiencing connectivity issues. Please try again in a moment." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What should I wear to a job interview?",
    "Suggest colors that pair well with Navy blue.",
    "Give me daily fashion tips for styling casual layers.",
    "Recommend a wedding outfit configuration."
  ];

  const selectQuickPrompt = (prompt) => {
    setInputValue(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto glass-card rounded-3xl overflow-hidden shadow-sm">
      {/* Bot Chat Header */}
      <div className="flex items-center gap-3 px-8 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/25">
          <Sparkles className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h2 className="font-bold">AI Stylist Consultant</h2>
          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Gemini AI Engine Online
          </span>
        </div>
      </div>

      {/* Messages Log area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={index} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                isUser 
                  ? 'bg-brand-500 text-white font-medium rounded-tr-none' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-tl-none'
              }`}>
                <p>{msg.text}</p>
              </div>

              {isUser && (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl rounded-tl-none max-w-[75%] flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Compass className="w-3.5 h-3.5" /> Suggested Questions
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => selectQuickPrompt(p)}
                className="text-left px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-between group transition-all"
              >
                <span>{p}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message panel */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about color matching or what to wear..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm outline-none focus:border-brand-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
