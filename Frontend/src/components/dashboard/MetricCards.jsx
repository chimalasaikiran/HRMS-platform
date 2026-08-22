import React from 'react';
import { Users, Check, Calendar, FileText, ArrowUpRight } from 'lucide-react';

export const MetricCards = () => {
  const metrics = [
    {
      id: 'total',
      label: 'Total employees',
      value: '4',
      subtext: '+3 this quarter',
      icon: Users,
      iconBg: 'bg-[#e2f1f4] text-[#1c6472]',
      borderColor: 'border-[#e8e2d5]'
    },
    {
      id: 'present',
      label: 'Present today',
      value: '3',
      subtext: '75% of team',
      icon: Check,
      iconBg: 'bg-[#e1f5ec] text-[#1e8557]',
      borderColor: 'border-[#e8e2d5]'
    },
    {
      id: 'leave',
      label: 'On leave',
      value: '1',
      subtext: 'Across 2 departments',
      icon: Calendar,
      iconBg: 'bg-[#fbebe7] text-[#c9593b]',
      borderColor: 'border-[#e8e2d5]'
    },
    {
      id: 'pending',
      label: 'Pending requests',
      value: '1',
      subtext: 'Needs your review',
      icon: FileText,
      iconBg: 'bg-[#faf0d9] text-[#9e701a]',
      borderColor: 'border-[#e8e2d5]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="bg-[#faf8f5] sm:bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-xs card-lift"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {m.label}
              </span>
              <div className={`p-2.5 rounded-xl ${m.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="font-serif-title text-3xl sm:text-4xl font-bold text-[#1c3541] mb-2">
              {m.value}
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              <span>{m.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
