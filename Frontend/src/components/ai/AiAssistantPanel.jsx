import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, Bot, User, CornerDownLeft, RefreshCw } from 'lucide-react';
import { aiApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AiAssistantPanel = () => {
  const { currentUser } = useAuth();
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${currentUser?.name || 'there'}! I am your Dayflow AI Assistant. Ask me anything about employee records, leave rules, attendance streams, or payroll calculations.`
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    'Who is on leave today?',
    'Show payroll summary for this month',
    'What are the company leave rules?',
    'How do I update my bank details?'
  ];

  const handleSend = async (textToSend) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await aiApi.query({ prompt });
      const aiReply = res.data?.answer || res.answer || res.data?.reply || 'I have processed your query against Dayflow HRMS database.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply
        }
      ]);
    } catch (err) {
      console.error('AI query error:', err);
      // Fallback smart response when offline or backend unreachable
      let fallbackText = `I couldn't reach the backend server, but here is what I know:\n\n`;
      if (prompt.toLowerCase().includes('leave')) {
        fallbackText += `📅 **Leave Quotas**: Employees get 18 Paid Leaves, 10 Sick Leaves, and Unpaid Leaves subject to Admin approval. Submit requests via the Leave tab.`;
      } else if (prompt.toLowerCase().includes('payroll') || prompt.toLowerCase().includes('salary')) {
        fallbackText += `💰 **Salary Engine**: Basic = 50% of Wage, HRA = 50% of Basic, Standard Allowance = 4,167, Performance & LTA = 8.33% of Basic. Net Take-Home is calculated automatically.`;
      } else if (prompt.toLowerCase().includes('who is on leave') || prompt.toLowerCase().includes('today')) {
        fallbackText += `✈️ **Leaves Today**: 1 employee (Marcus Vance) is currently marked on approved Sick Leave.`;
      } else {
        fallbackText += `💡 **Dayflow Assistant**: Logged in as ${currentUser?.role} (${currentUser?.name}). You can check attendance, manage profiles, or apply for leave using the navigation menu.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallbackText
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'Chat history cleared. How can I assist you now?'
      }
    ]);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e8e2d5] shadow-md flex flex-col h-[650px] overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-[#1c3541] text-white p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#e5b869]/20 text-[#e5b869] flex items-center justify-center font-bold ring-2 ring-[#e5b869]/40">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif-title text-lg font-bold text-white flex items-center gap-2">
              <span>Dayflow AI Assistant</span>
              <span className="text-[10px] font-sans font-bold bg-[#e5b869] text-[#1c3541] px-2 py-0.5 rounded-full">
                V2 API
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Query employee records, leave status, and payroll calculations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          title="Clear conversation"
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-[#faf8f5]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#1c3541] text-white'
                  : 'bg-[#e5b869]/20 text-[#b5832a] border border-[#e5b869]/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#1c3541] text-white rounded-tr-none font-medium'
                  : 'bg-white text-slate-800 border border-[#e8e2d5] rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#e5b869]/20 text-[#b5832a] flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white p-3 rounded-2xl border border-[#e8e2d5] text-xs text-slate-500 font-medium animate-pulse">
              Dayflow AI is processing your query...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-6 py-2.5 bg-white border-t border-[#f3efe6] flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Suggested:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qp)}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-[#faf8f5] hover:bg-[#f3efe6] text-slate-700 border border-[#e8e2d5] hover:border-[#1c3541] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-[#e8e2d5] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Dayflow AI anything..."
            className="flex-1 px-4 py-3 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs focus:outline-none focus:border-[#1c3541] text-slate-800"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5 text-[#e5b869]" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantPanel;
