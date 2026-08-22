import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const AttendanceStreamTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [streamData] = useState([
    {
      id: 'emp-301',
      initials: 'AM',
      name: 'Aarav Mehta',
      empCode: 'emp-301',
      checkIn: '09:00',
      checkOut: '18:10',
      hours: '8.5h',
      status: 'Present'
    },
    {
      id: 'emp-302',
      initials: 'MI',
      name: 'Maya Iyer',
      empCode: 'emp-302',
      checkIn: '09:01',
      checkOut: 'In progress',
      hours: '7.5h',
      status: 'Present'
    },
    {
      id: 'emp-303',
      initials: 'RK',
      name: 'Rohan Kapoor',
      empCode: 'emp-303',
      checkIn: '—',
      checkOut: '18:12',
      hours: '—',
      status: 'Leave'
    },
    {
      id: 'emp-304',
      initials: 'IR',
      name: 'Ishita Rao',
      empCode: 'emp-304',
      checkIn: '09:03',
      checkOut: '18:13',
      hours: '8.5h',
      status: 'Present'
    }
  ]);

  const filteredData = streamData.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.empCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || row.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-[#faf8f5] sm:bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs">
      {/* Table Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#a88243] font-mono mb-1">
            REAL-TIME
          </div>
          <h3 className="font-serif-title text-2xl font-bold text-[#1c3541]">
            Attendance stream
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-soft" />
            <span>Updated just now</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#faf8f5] border border-[#e8e2d5] focus:outline-none focus:border-[#1c3541] w-36 sm:w-48 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e8e2d5] text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              <th className="py-3 px-4">PERSON</th>
              <th className="py-3 px-4">CHECK IN</th>
              <th className="py-3 px-4">CHECK OUT</th>
              <th className="py-3 px-4">HOURS</th>
              <th className="py-3 px-4 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3efe6] text-xs">
            {filteredData.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-[#faf6f0] transition-colors group cursor-pointer"
              >
                {/* Person Column */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#ebdcb9] text-[#705220] font-semibold text-xs flex items-center justify-center shrink-0">
                      {row.initials}
                    </div>
                    <div>
                      <div className="font-bold text-[#1c3541] group-hover:text-[#b5832a] transition-colors">
                        {row.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {row.empCode}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Check In Column */}
                <td className="py-4 px-4 font-mono text-slate-700 font-semibold">
                  {row.checkIn}
                </td>

                {/* Check Out Column */}
                <td className="py-4 px-4 font-mono">
                  {row.checkOut === 'In progress' ? (
                    <span className="italic text-slate-400 font-normal font-sans">
                      In progress
                    </span>
                  ) : (
                    <span className="text-slate-700 font-semibold">{row.checkOut}</span>
                  )}
                </td>

                {/* Hours Column */}
                <td className="py-4 px-4 text-slate-700 font-semibold">
                  {row.hours}
                </td>

                {/* Status Column */}
                <td className="py-4 px-4 text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      row.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                  No attendance records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
