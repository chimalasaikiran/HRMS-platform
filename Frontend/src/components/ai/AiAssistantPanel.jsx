import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, Trash2, Bot, User, CornerDownLeft, RefreshCw,
  Lock, Check, FileText, ChevronRight, CalendarDays
} from 'lucide-react';
import { aiApi, timeoffApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';


const INR = (n) =>
  typeof n === 'number'
    ? `INR ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : n;

/** Tool calls the agent made, shown as chips so it reads as an agent, not a chatbot. */
const StepChips = ({ steps }) => {
  if (!steps?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {steps.map((s, i) => (
        <span
          key={i}
          title={`${s.tool}()`}
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            s.ok
              ? 'bg-[#e5b869]/10 text-[#8a6318] border-[#e5b869]/40'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}
        >
          {s.ok ? <Check className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
          {s.label || s.tool}
        </span>
      ))}
    </div>
  );
};

/** Refused by role policy. Rendered as a designed guardrail, not an error. */
const BlockedCard = ({ blocked }) => (
  <div className="mt-2 rounded-xl border border-red-200 bg-red-50/70 p-3">
    <div className="flex items-start gap-2">
      <Lock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-red-700">{blocked.reason}</p>
        <p className="text-[10px] text-red-400 mt-1 font-mono">
          Blocked by role policy - {blocked.policy}
        </p>
      </div>
    </div>
  </div>
);

const SourceChips = ({ sources }) => {
  if (!sources?.length) return null;
  const seen = new Set();
  const unique = sources.filter((s) => {
    const k = `${s.doc}|${s.section}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return (
    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#f3efe6]">
      {unique.map((s, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-[#faf8f5] border border-[#e8e2d5] px-2 py-0.5 rounded-full"
        >
          <FileText className="w-2.5 h-2.5" />
          {s.doc} · {s.section}
        </span>
      ))}
    </div>
  );
};

/** Structured payloads the agent returned — rendered instead of buried in prose. */
const Block = ({ block }) => {
  const d = block.data || {};
  if (block.type === 'leave_balance') {
    const items = [
      ['Paid', d.PAID], ['Sick', d.SICK], ['Unpaid', d.UNPAID]
    ].filter(([, v]) => v !== undefined);
    return (
      <div className="mt-2 grid grid-cols-3 gap-2">
        {items.map(([label, val]) => (
          <div key={label} className="rounded-xl border border-[#e8e2d5] bg-[#faf8f5] px-3 py-2 text-center">
            <div className="text-lg font-bold text-[#1c3541] tabular-nums">{val ?? '—'}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
          </div>
        ))}
      </div>
    );
  }
  if (block.type === 'salary_breakdown') {
    return (
      <div className="mt-2 rounded-xl border border-[#e8e2d5] bg-[#faf8f5] p-3">
        <div className="flex justify-between text-xs font-semibold text-[#1c3541]">
          <span>Net pay</span>
          <span className="tabular-nums">{INR(d.netPay)}</span>
        </div>
        {d.gross !== undefined && (
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>Gross</span>
            <span className="tabular-nums">{INR(d.gross)}</span>
          </div>
        )}
      </div>
    );
  }
  if (block.type === 'attendance_table') {
    const s = d.summary || {};
    return (
      <div className="mt-2 grid grid-cols-4 gap-2">
        {[['Present', s.daysPresent], ['Leaves', s.leavesCount], ['Working', s.totalWorkingDays], ['Payable', s.payableDays]]
          .map(([label, val]) => (
            <div key={label} className="rounded-xl border border-[#e8e2d5] bg-[#faf8f5] px-2 py-2 text-center">
              <div className="text-base font-bold text-[#1c3541] tabular-nums">{val ?? '—'}</div>
              <div className="text-[9px] uppercase tracking-wide text-slate-500">{label}</div>
            </div>
          ))}
      </div>
    );
  }
  return null;
};


/** The agent drafts; the user commits. Nothing is written without this confirmation. */
const DraftCard = ({ action, onConfirm }) => {
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');
  const p = action.payload || {};

  const confirm = async () => {
    setState('sending');
    try {
      await onConfirm(action);
      setState('done');
    } catch (e) {
      setError(e?.message || 'Could not submit. Please try again.');
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2">
        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-xs font-semibold text-emerald-700">
          Submitted. It is now pending HR review.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl border-2 border-[#e5b869]/50 bg-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="w-3.5 h-3.5 text-[#b5832a]" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#b5832a]">
          Draft — not submitted
        </span>
      </div>

      <dl className="space-y-1 text-[11px]">
        {p.type && (
          <div className="flex justify-between"><dt className="text-slate-500">Type</dt>
            <dd className="font-semibold text-[#1c3541]">{p.type}</dd></div>
        )}
        {p.startDate && (
          <div className="flex justify-between"><dt className="text-slate-500">Dates</dt>
            <dd className="font-semibold text-[#1c3541] tabular-nums">{p.startDate} to {p.endDate}</dd></div>
        )}
        {p.days !== undefined && (
          <div className="flex justify-between"><dt className="text-slate-500">Working days</dt>
            <dd className="font-semibold text-[#1c3541] tabular-nums">{p.days}</dd></div>
        )}
        {p.reason && (
          <div className="flex justify-between gap-3"><dt className="text-slate-500">Reason</dt>
            <dd className="font-medium text-slate-700 text-right">{p.reason}</dd></div>
        )}
      </dl>

      {state === 'error' && <p className="mt-2 text-[11px] text-red-600">{error}</p>}

      <button
        type="button"
        onClick={confirm}
        disabled={state === 'sending'}
        className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#1c3541] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#14262f] disabled:opacity-60 transition-colors cursor-pointer"
      >
        {state === 'sending' ? 'Submitting…' : 'Confirm & submit'}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
      <p className="text-[10px] text-slate-400 text-center mt-1.5">
        Nothing is submitted until you confirm.
      </p>
    </div>
  );
};

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
      const aiReply =
        res?.reply ||
        res?.data?.reply ||
        res?.answer ||
        res?.data?.answer ||
        'I could not find an answer to that.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          steps: res?.steps || [],
          blocks: res?.blocks || [],
          sources: res?.sources || [],
          pendingAction: res?.pendingAction || null,
          blocked: res?.blocked || null
        }
      ]);
    } catch (err) {
      console.error('AI query error:', err);
      const fallbackText =
        "I couldn't reach the Dayflow server, so I can't look that up right now. " +
        'Please try again in a moment, or check with HR.';

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

  const handleConfirmAction = async (action) => {
    if (action.action === 'apply_time_off') {
      return timeoffApi.create(action.payload);
    }
    if (action.action === 'approve_timeoff') {
      return timeoffApi.approve(action.payload.requestId, action.payload.comment);
    }
    throw new Error('This action cannot be confirmed from here.');
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
                  : 'bg-white text-slate-800 border border-[#e8e2d5] rounded-tl-none'
              }`}
            >
              {msg.sender === 'ai' && <StepChips steps={msg.steps} />}

              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.sender === 'ai' && (
                <>
                  {msg.blocks?.map((b, i) => <Block key={i} block={b} />)}
                  {msg.blocked && <BlockedCard blocked={msg.blocked} />}
                  {msg.pendingAction && (
                    <DraftCard action={msg.pendingAction} onConfirm={handleConfirmAction} />
                  )}
                  <SourceChips sources={msg.sources} />
                </>
              )}
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
