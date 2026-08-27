import React from 'react';
import { Check, Clock, AlertCircle, FileCode, CheckCircle2 } from 'lucide-react';

export function ProjectProgress({ status = 'in_progress', currentStage = 2 }) {
  const stages = [
    { id: 'open', label: '1. Project Posted', desc: 'Receiving proposals' },
    { id: 'hired', label: '2. Freelancer Hired', desc: 'Escrow funded' },
    { id: 'in_progress', label: '3. In Progress', desc: 'Development underway' },
    { id: 'submitted', label: '4. Work Submitted', desc: 'Reviewing deliverable' },
    { id: 'completed', label: '5. Completed', desc: 'Escrow released & reviewed' },
  ];

  const getStageIndex = (s) => {
    switch (s) {
      case 'open': return 0;
      case 'hired': return 1;
      case 'in_progress': return 2;
      case 'submitted':
      case 'revision_requested': return 3;
      case 'completed': return 4;
      default: return 2;
    }
  };

  const activeIdx = getStageIndex(status);

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 dark:bg-primary-500 transition-all duration-500 -z-0"
          style={{ width: `${(activeIdx / (stages.length - 1)) * 100}%` }}
        />

        {stages.map((stage, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isDone
                    ? 'bg-primary-600 text-white shadow-md'
                    : isCurrent
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-950/80 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <div className="hidden sm:block text-center mt-2">
                <span className={`text-xs font-bold block ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {stage.label.split('. ')[1]}
                </span>
                <span className="text-[10px] text-slate-400 block">{stage.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
