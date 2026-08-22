import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, Bot, User, RefreshCw, ShieldAlert, BookOpen, CheckCircle2 } from 'lucide-react';
import { aiApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useHrms } from '../../context/HrmsContext';

export const AiAssistantPanel = () => {
  const { currentUser } = useAuth();
  const { employees, leaveRequests, attendanceLogs } = useHrms();
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${currentUser?.fullName || currentUser?.name || 'there'}! I am your Dayflow AI Assistant. Ask me anything about employee records, leave rules, attendance streams, or payroll calculations.`,
      sources: ['Dayflow Assistant v2'],
      mode: 'ACTIVE'
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
    'How many active employees are in the system?'
  ];

  const handleSend = async (textToSend) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    // Build payload array formatted for backend AI agent
    const apiPayload = newMessages
      .filter((m) => m.sender === 'user' || m.sender === 'ai')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
      .slice(-10);

    try {
      const res = await aiApi.chat(apiPayload);
      const data = res.data || res;
      const aiReply = data?.reply || data?.answer || data?.message || 'Query processed against Dayflow HRMS engine.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          blocked: data?.blocked || null,
          sources: data?.sources || null,
          mode: data?.mode || 'RAG'
        }
      ]);
    } catch (err) {
      console.warn('AI query API fallback engaged:', err.message);

      // Smart contextual local fallback using real HrmsContext
      let fallbackText = '';
      let blockedInfo = null;
      const q = prompt.toLowerCase();

      if (q.includes('leave') || q.includes('vacation') || q.includes('sick')) {
        const pendingCount = leaveRequests.filter((l) => l.status === 'PENDING').length;
        const approvedCount = leaveRequests.filter((l) => l.status === 'APPROVED').length;
        fallbackText = `📅 **Dayflow Leave Status & Quotas**:\n\n` +
          `• **Paid Leaves**: 18 days per year | **Sick Leaves**: 10 days per year.\n` +
          `• **Current Pending Requests**: ${pendingCount} request(s) awaiting approval.\n` +
          `• **Approved Leaves**: ${approvedCount} request(s) logged.\n\n` +
          `Submit or approve requests directly from the **Time-Off** menu.`;
      } else if (q.includes('payroll') || q.includes('salary') || q.includes('wage')) {
        if (currentUser?.role !== 'ADMIN' && (q.includes('other') || q.includes('john') || q.includes('priya') || q.includes('all'))) {
          fallbackText = `🔒 I cannot reveal individual salary records of other team members under policy compliance rules.`;
          blockedInfo = { reason: 'Access restricted: Salary details of other employees can only be viewed by Admin role.', policy: currentUser?.role };
        } else {
          fallbackText = `💰 **Dayflow Payroll Structure Engine**:\n\n` +
            `• **Basic Salary**: 50.00% of Gross Wage\n` +
            `• **HRA**: 50.00% of Basic Salary\n` +
            `• **Standard Allowance**: ₹4,167\n` +
            `• **Performance Bonus & LTA**: 8.33% of Basic each\n` +
            `• **Deductions**: PF (12% of Basic) + Professional Tax (₹200)\n\n` +
            `Check your monthly breakdown under the **Payroll** tab.`;
        }
      } else if (q.includes('who is on leave') || q.includes('today') || q.includes('attendance')) {
        const todayLeaves = leaveRequests.filter((l) => l.status === 'APPROVED');
        if (todayLeaves.length > 0) {
          const names = todayLeaves.map((l) => l.employeeName).join(', ');
          fallbackText = `✈️ **Leaves Today**: ${todayLeaves.length} employee(s) on approved leave (${names}).`;
        } else {
          fallbackText = `✅ **Presence Today**: All active team members are marked present or on scheduled shifts today.`;
        }
      } else if (q.includes('employee') || q.includes('who') || q.includes('count') || q.includes('staff')) {
        fallbackText = `👥 **Team Roster Overview**:\n\n` +
          `• **Total Registered Staff**: ${employees.length} employees.\n` +
          `• **LoggedIn User**: ${currentUser?.fullName} (${currentUser?.role}).\n` +
          `• **Primary Base**: Gandhinagar, Gujarat.`;
      } else {
        fallbackText = `💡 **Dayflow Assistant**: Logged in as ${currentUser?.role || 'User'} (${currentUser?.fullName || currentUser?.name}). ` +
          `You can manage team profiles, submit leave applications, check attendance streams, or compute payroll structures using the navigation dashboard.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallbackText,
          blocked: blockedInfo,
          sources: ['Local HR Engine'],
          mode: 'LOCAL'
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
        text: 'Chat history cleared. How can I assist you now?',
        mode: 'ACTIVE'
      }
    ]);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e8e2d5] shadow-lg flex flex-col h-[650px] overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-[#1c3541] text-white p-5 flex items-center justify-between shrink-0 border-b border-[#28495a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#e5b869]/20 text-[#e5b869] flex items-center justify-center font-bold ring-2 ring-[#e5b869]/40 relative">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1c3541]" />
          </div>
          <div>
            <h3 className="font-serif-title text-lg font-bold text-white flex items-center gap-2">
              <span>Dayflow AI Assistant</span>
              <span className="text-[10px] font-sans font-bold bg-[#e5b869] text-[#1c3541] px-2 py-0.5 rounded-full uppercase tracking-wider">
                HR Agent
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Instant HR policy lookup, leave verification, and salary calculation support.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          title="Clear conversation"
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
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
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#1c3541] text-white ring-2 ring-[#1c3541]/20'
                  : 'bg-[#e5b869]/20 text-[#b5832a] border border-[#e5b869]/40'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="max-w-xl space-y-2">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#1c3541] text-white rounded-tr-none font-medium'
                    : 'bg-white text-slate-800 border border-[#e8e2d5] rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}
              </div>

              {/* Blocked Policy Banner */}
              {msg.blocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5 animate-fade-in">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">Policy Enforcement Active</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">{msg.blocked.reason}</p>
                  </div>
                </div>
              )}

              {/* Citations / Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap px-1">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Source:</span>
                  {msg.sources.map((src, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#e8e2d5]/50 text-slate-600 font-medium"
                    >
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#e5b869]/20 text-[#b5832a] flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-[#e8e2d5] text-xs text-slate-600 font-medium animate-pulse flex items-center gap-2">
              <span>Dayflow AI is analyzing records...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-6 py-2.5 bg-white border-t border-[#f3efe6] flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#e5b869]" /> Prompt:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qp)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#faf8f5] hover:bg-[#1c3541] hover:text-white text-slate-700 border border-[#e8e2d5] transition-all cursor-pointer whitespace-nowrap shrink-0"
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
            placeholder="Ask Dayflow AI about leaves, salary breakdown, or team roster..."
            className="flex-1 px-4 py-3 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs focus:outline-none focus:border-[#1c3541] focus:bg-white text-slate-800 transition-all"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5 text-[#e5b869]" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantPanel;
