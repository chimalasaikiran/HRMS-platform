import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  X,
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useHrms } from '../../../context/HrmsContext';

export const LeaveView = () => {
  const { currentUser } = useAuth();
  const { leaveRequests, applyLeave, approveLeave, rejectLeave } = useHrms();

  const isEmployee = currentUser?.role === 'EMPLOYEE';
  const empId = currentUser?.employeeId || 'EMP-2025-88';
  const empName = currentUser?.fullName || 'Alex Morgan';

  // State for Apply Leave modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // State for Admin Comment modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminActionType, setAdminActionType] = useState(''); // 'approve' or 'reject'
  const [adminComment, setAdminComment] = useState('');

  const [notificationMsg, setNotificationMsg] = useState('');

  const [applyError, setApplyError] = useState('');

  // Submit leave application (Employee action)
  const handleApplySubmit = (e) => {
    e.preventDefault();
    setApplyError('');
    if (!startDate || !endDate) {
      setApplyError('Please select both Start Date and End Date.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setApplyError('End Date cannot be earlier than Start Date.');
      return;
    }

    // Calculate duration in days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    applyLeave({
      employeeId: empId,
      employeeName: empName,
      type: leaveType,
      startDate,
      endDate,
      duration: `${diffDays} Day${diffDays > 1 ? 's' : ''}`,
      reason: remarks
    });

    setShowApplyModal(false);
    setStartDate('');
    setEndDate('');
    setRemarks('');
    setApplyError('');
    setNotificationMsg('Leave application submitted successfully for HR review!');
    setTimeout(() => setNotificationMsg(''), 3000);
  };

  // Submit admin approval / rejection (Admin action)
  const handleConfirmAdminAction = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (adminActionType === 'approve') {
      approveLeave(selectedRequest.id, adminComment);
      setNotificationMsg(`Approved leave for ${selectedRequest.employeeName}`);
    } else {
      rejectLeave(selectedRequest.id, adminComment);
      setNotificationMsg(`Rejected leave for ${selectedRequest.employeeName}`);
    }

    setSelectedRequest(null);
    setAdminComment('');
    setTimeout(() => setNotificationMsg(''), 3000);
  };

  // Filter scoped requests
  const scopedRequests = isEmployee
    ? leaveRequests.filter((l) => l.employeeId === empId)
    : leaveRequests;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-3xl font-bold text-[#1c3541]">
            {isEmployee ? 'My Leave Applications' : 'Leave Approvals & Management'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {isEmployee
              ? 'Apply for Paid, Sick, or Unpaid leaves and track your approval status.'
              : 'Review time-off requests, approve or reject applications with comments.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#e5b869]" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Alert banner */}
      {notificationMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Leave Quota Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Paid Leave Quota</div>
          <div className="font-serif-title text-3xl font-bold text-[#1c3541]">18 Days / Year</div>
          <div className="text-xs text-slate-500 mt-1">Standard employee allowance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Sick Leave Quota</div>
          <div className="font-serif-title text-3xl font-bold text-emerald-600">10 Days / Year</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Full medical coverage</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Unpaid Leave Quota</div>
          <div className="font-serif-title text-3xl font-bold text-[#b5832a]">Flexible</div>
          <div className="text-xs text-slate-500 mt-1">Subject to HR approval</div>
        </div>
      </div>

      {/* 3.5.1 / 3.5.2 LEAVE APPLICATIONS TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-title text-xl font-bold text-[#1c3541]">
            {isEmployee ? 'My Leave Applications' : 'All Leave Requests Queue'}
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {scopedRequests.length} applications
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e8e2d5] text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <th className="py-3 px-4">EMPLOYEE</th>
                <th className="py-3 px-4">LEAVE TYPE</th>
                <th className="py-3 px-4">DATE RANGE</th>
                <th className="py-3 px-4">DURATION</th>
                <th className="py-3 px-4">REASON & REMARKS</th>
                <th className="py-3 px-4 text-right">ACTION / STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3efe6] text-xs">
              {scopedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#faf6f0] transition-colors">
                  <td className="py-4 px-4 font-bold text-[#1c3541]">
                    {req.employeeName}
                    <div className="text-[10px] font-mono text-slate-400">{req.employeeId}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#faf8f5] border border-[#e8e2d5]">
                      {req.type} Leave
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {req.startDate} {req.startDate !== req.endDate ? `— ${req.endDate}` : ''}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800">{req.duration}</td>
                  <td className="py-4 px-4 text-slate-500 max-w-xs">
                    <div>{req.reason}</div>
                    {req.adminComment && (
                      <div className="text-[10px] font-semibold text-[#b5832a] mt-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        <span>HR Comment: "{req.adminComment}"</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {!isEmployee && req.status === 'Pending' ? (
                      /* Admin Approval Controls */
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequest(req);
                            setAdminActionType('approve');
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequest(req);
                            setAdminActionType('reject');
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      /* Status Tag */
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                        {req.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        {req.status === 'Pending' && <Clock className="w-3 h-3" />}
                        <span>{req.status}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3.5.1 APPLY FOR LEAVE MODAL (EMPLOYEE) */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-[#e8e2d5] shadow-2xl p-6 sm:p-8 animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-[#f3efe6] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1c3541] text-[#e5b869] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-[#1c3541]">
                    Apply For Time-Off / Leave
                  </h3>
                  <p className="text-xs text-slate-500">Submit leave request for HR approval</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              {/* Leave Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Leave Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] bg-[#faf8f5] text-slate-800 text-xs font-semibold focus:border-[#1c3541]"
                >
                  <option value="Paid">Paid Leave ( quota: 18 Days )</option>
                  <option value="Sick">Sick Leave ( quota: 10 Days )</option>
                  <option value="Unpaid">Unpaid Leave ( flexible )</option>
                </select>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e8e2d5] bg-white text-xs font-medium focus:border-[#1c3541]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#e8e2d5] bg-white text-xs font-medium focus:border-[#1c3541]"
                    required
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason & Remarks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Explain reason for leave request..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] bg-white text-xs font-medium focus:border-[#1c3541]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f3efe6]">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4 text-[#e5b869]" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3.5.2 ADMIN APPROVAL / COMMENTS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-[#e8e2d5] shadow-2xl p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3efe6] pb-3">
              <h3 className="font-serif-title text-lg font-bold text-[#1c3541]">
                {adminActionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Employee: <strong>{selectedRequest.employeeName}</strong> ({selectedRequest.duration} {selectedRequest.type} leave)
            </p>

            <form onSubmit={handleConfirmAdminAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Add Admin Comment / Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder={
                    adminActionType === 'approve'
                      ? 'e.g. Approved! Enjoy your time off.'
                      : 'e.g. Rejected due to critical project deadline.'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs focus:border-[#1c3541]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-semibold text-xs shadow-xs ${
                    adminActionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {adminActionType === 'approve' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
