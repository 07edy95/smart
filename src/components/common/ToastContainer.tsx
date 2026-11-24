import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let colorClasses = 'border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200';
        let iconColor = 'text-emerald-500';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClasses = 'border-rose-500/30 bg-rose-50 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200';
          iconColor = 'text-rose-500';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClasses = 'border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200';
          iconColor = 'text-amber-500';
        } else if (toast.type === 'info') {
          Icon = Info;
          colorClasses = 'border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200';
          iconColor = 'text-blue-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${colorClasses}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
              <p className="text-xs mt-1 opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
