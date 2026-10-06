import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  ArrowRight, 
  FileCheck, 
  ShieldAlert,
  Building,
  QrCode
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  toasts: AppNotification[];
  onDismiss: (id: string) => void;
  onNavigateAction?: (tab: string) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
  onNavigateAction
}) => {
  return (
    <div 
      aria-live="polite" 
      className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-2 sm:px-0"
    >
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onDismiss={() => onDismiss(toast.id)} 
          onAction={() => {
            if (toast.actionTab && onNavigateAction) {
              onNavigateAction(toast.actionTab);
            }
            onDismiss(toast.id);
          }}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: AppNotification;
  onDismiss: () => void;
  onAction: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, onAction }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // 6 second auto-dismiss
    const duration = 6000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onDismiss]);

  const isHighPriority = toast.priority === 'HIGH';

  return (
    <div 
      className={`pointer-events-auto rounded-xl border shadow-2xl p-4 transition-all duration-300 transform translate-y-0 opacity-100 backdrop-blur-md overflow-hidden ${
        isHighPriority
          ? 'bg-neutral-900/95 border-amber-500/80 shadow-amber-950/40 text-neutral-100'
          : 'bg-neutral-900/95 border-neutral-700/80 shadow-black/60 text-neutral-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {toast.eventType === 'COUNCIL_PERMIT_GRANTED' ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : toast.eventType === 'COUNCIL_SUBMITTED' ? (
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/60 flex items-center justify-center text-blue-400">
              <FileCheck className="w-4 h-4" />
            </div>
          ) : toast.eventType === 'REMEDIATION_REQUESTED' ? (
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : toast.eventType === 'IP_HOLD_FREEZE' ? (
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-400">
              <Info className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
              isHighPriority ? 'text-amber-400' : 'text-neutral-400'
            }`}>
              {isHighPriority && 'HIGH PRIORITY · '}
              {toast.targetRole === 'council' ? 'FOR COUNCIL REVIEWERS' :
               toast.targetRole === 'architect' ? 'FOR LEAD ARCHITECT' : 'NATIONAL WORKFLOW ALERT'}
            </span>
            <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
              {toast.timestamp.split(' ')[1] || 'Just now'}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
            {toast.title}
          </h4>

          <p className="text-[11px] text-neutral-300 leading-relaxed font-light">
            {toast.message}
          </p>

          {toast.actionLabel && (
            <div className="pt-1.5 flex items-center gap-2">
              <button
                onClick={onAction}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-neutral-700"
              >
                <span>{toast.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-neutral-400 hover:text-white p-1 rounded transition-colors shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="mt-3 -mx-4 -mb-4 bg-neutral-800/80 h-1 overflow-hidden">
        <div 
          className={`h-full transition-all duration-100 ${
            isHighPriority ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
