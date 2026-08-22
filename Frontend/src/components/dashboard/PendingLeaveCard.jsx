import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

export const PendingLeaveCard = ({ onReviewAll }) => {
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      initials: 'RK',
      name: 'Rohan Kapoor',
      type: 'paid leave',
      dateRange: 'Aug 24 — Aug 26',
      duration: '3d',
      status: 'pending'
    }
  ]);

  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="bg-[#faf8f5] sm:bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header Tag & Title */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#a88243] font-mono">
            NEEDS A LOOK
          </span>
          <button
            type="button"
            onClick={onReviewAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b5832a] hover:text-[#1c3541] transition-colors cursor-pointer"
          >
            <span>Review all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3 className="font-serif-title text-xl font-bold text-[#1c3541] mb-6">
          Pending leave
        </h3>

        {/* Requests List */}
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-xl bg-[#faf6f0] border border-[#e8e2d5]/60 flex items-center justify-between gap-4 transition-all hover:border-[#dcd4c3]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#d6cfbe] text-[#4a4233] font-semibold text-xs flex items-center justify-center shrink-0">
                  {req.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#1c3541] truncate">
                    {req.name}
                  </div>
                  <div className="text-xs text-slate-500 font-medium truncate">
                    {req.type} • {req.dateRange}
                  </div>
                </div>
              </div>

              {req.status === 'pending' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 mr-1">
                    {req.duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAction(req.id, 'approved')}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                    title="Approve leave"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(req.id, 'rejected')}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                    title="Reject leave"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    req.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {req.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No pending leave requests at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
