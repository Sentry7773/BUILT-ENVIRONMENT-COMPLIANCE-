import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  ShieldAlert, 
  Info,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { AppNotification } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateAction: (tab: string) => void;
  onSimulateEvent: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateAction,
  onSimulateEvent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'architect' | 'council' | 'high_priority'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filterRole === 'all') return true;
    if (filterRole === 'high_priority') return n.priority === 'HIGH';
    return n.targetRole === filterRole || n.targetRole === 'all';
  });

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
        aria-label="Workflow Notifications"
        title="View Workflow Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold font-mono text-[10px] flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] z-50 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden text-neutral-100 backdrop-blur-md">
            {/* Header */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Workflow Notification Hub</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800/80 px-1.5 py-0.2 rounded font-bold">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Real-time alerts for Architects &amp; Municipal Council Reviewers
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded font-mono text-xs"
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs & Quick Actions */}
            <div className="px-4 py-2 bg-neutral-950/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <button
                  onClick={() => setFilterRole('all')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    filterRole === 'all' ? 'bg-neutral-800 text-emerald-300 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilterRole('architect')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    filterRole === 'architect' ? 'bg-neutral-800 text-emerald-300 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Architects
                </button>
                <button
                  onClick={() => setFilterRole('council')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    filterRole === 'council' ? 'bg-neutral-800 text-emerald-300 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Council
                </button>
                <button
                  onClick={() => setFilterRole('high_priority')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    filterRole === 'high_priority' ? 'bg-amber-950 text-amber-300 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  High
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-[11px] text-neutral-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>

            {/* Notification List Stream */}
            <div className="max-h-96 overflow-y-auto divide-y divide-neutral-800/80">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No notifications matching this filter.
                </div>
              ) : (
                filteredNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors flex items-start gap-3 ${
                      notif.read ? 'bg-neutral-900/40 hover:bg-neutral-900/80' : 'bg-neutral-850 hover:bg-neutral-800/90'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.eventType === 'COUNCIL_PERMIT_GRANTED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : notif.eventType === 'COUNCIL_SUBMITTED' ? (
                        <FileCheck className="w-4 h-4 text-blue-400" />
                      ) : notif.eventType === 'REMEDIATION_REQUESTED' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : notif.eventType === 'IP_HOLD_FREEZE' ? (
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                      ) : (
                        <Info className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                          notif.priority === 'HIGH' ? 'text-amber-400' : 'text-neutral-400'
                        }`}>
                          {notif.targetRole === 'council' ? 'COUNCIL ACTION' :
                           notif.targetRole === 'architect' ? 'ARCHITECT ALERT' : 'PLATFORM NOTICE'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                          {notif.timestamp}
                        </span>
                      </div>

                      <h4 className={`text-xs font-semibold leading-tight ${
                        notif.read ? 'text-neutral-200' : 'text-white'
                      }`}>
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-neutral-400 leading-snug">
                        {notif.message}
                      </p>

                      <div className="pt-1 flex items-center justify-between gap-2">
                        {notif.actionLabel && (
                          <button
                            onClick={() => {
                              if (notif.actionTab) {
                                onNavigateAction(notif.actionTab);
                              }
                              onMarkAsRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                          >
                            <span>{notif.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {!notif.read && (
                          <button
                            onClick={() => onMarkAsRead(notif.id)}
                            className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300 ml-auto"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Live Testing Simulation Footer */}
            <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-400 font-mono">
                Test Event Dispatcher:
              </span>
              <button
                onClick={() => {
                  onSimulateEvent();
                }}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Dispatch a high-priority workflow status update event"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Simulate High-Priority Alert</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
