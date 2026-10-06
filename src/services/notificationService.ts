import { AppNotification, NotificationEventType, NotificationPriority } from '../types';

type NotificationListener = (notification: AppNotification) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private notifications: AppNotification[] = [
    {
      id: 'NOTIF-001',
      timestamp: '2026-10-05 07:15',
      eventType: 'COUNCIL_PERMIT_GRANTED',
      priority: 'HIGH',
      targetRole: 'architect',
      title: 'Building Permit Granted & Site Plaque Issued',
      message: 'Lusaka City Council has granted final dual sign-off for Lusaka Clean Energy Innovation Hub. Permit #LCC/BP/2026/0419 is active.',
      projectId: 'PRJ-LCC-2026-001',
      projectName: 'Lusaka Clean Energy Innovation Hub',
      councilId: 'LCC',
      permitNumber: 'LCC/BP/2026/0419',
      read: false,
      actionTab: 'site_plaque',
      actionLabel: 'View Site QR Plaque'
    },
    {
      id: 'NOTIF-002',
      timestamp: '2026-10-05 07:05',
      eventType: 'COUNCIL_SUBMITTED',
      priority: 'HIGH',
      targetRole: 'council',
      title: 'New Statutory Submission for Review',
      message: 'Arc. Thandiwe Zulu (Apex Studio) has sealed and submitted Kafue Basin Secondary School & STEM Labs to LCC Planning Queue.',
      projectId: 'PRJ-NCC-2026-002',
      projectName: 'Kafue Basin Secondary School & STEM Labs',
      councilId: 'LCC',
      read: false,
      actionTab: 'council',
      actionLabel: 'Open Review Docket'
    },
    {
      id: 'NOTIF-003',
      timestamp: '2026-10-04 16:40',
      eventType: 'REMEDIATION_REQUESTED',
      priority: 'HIGH',
      targetRole: 'architect',
      title: 'Council Planning Remediation Required',
      message: 'Ndola City Council requested Health Professions Council (HPCZ) clearance certificate for Ndola Metropolitan Healthcare Clinic.',
      projectId: 'PRJ-KCC-2026-003',
      projectName: 'Ndola Metropolitan Healthcare Clinic Wing',
      councilId: 'NCC',
      read: false,
      actionTab: 'architect',
      actionLabel: 'Upload HPCZ Clearance'
    },
    {
      id: 'NOTIF-004',
      timestamp: '2026-10-04 11:20',
      eventType: 'CITIZEN_REPORT_ALERT',
      priority: 'MEDIUM',
      targetRole: 'council',
      title: 'Citizen Safety Whistleblower Report',
      message: 'Public report logged regarding unsafe pedestrian scaffolding along Church Road on site ZAPE-2026-LCC-0891.',
      projectId: 'PRJ-LCC-2026-001',
      projectName: 'Lusaka Clean Energy Innovation Hub',
      councilId: 'LCC',
      read: true,
      actionTab: 'site_plaque',
      actionLabel: 'Inspect Incident'
    },
    {
      id: 'NOTIF-005',
      timestamp: '2026-10-03 09:00',
      eventType: 'IP_HOLD_FREEZE',
      priority: 'HIGH',
      targetRole: 'all',
      title: 'IP_HOLD Freeze Alert: Chongwe Submission',
      message: 'Unlicensed template duplication detected by AI Similarity Engine. Disputed submission placed on statutory IP_HOLD.',
      projectId: 'DISP-2026-08',
      projectName: 'Kabwata Commercial Strips',
      read: true,
      actionTab: 'ip_bridge',
      actionLabel: 'View IP Dispute Docket'
    }
  ];

  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public dispatch(event: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const newNotif: AppNotification = {
      ...event,
      id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false
    };

    this.notifications = [newNotif, ...this.notifications];

    // Notify all active subscribers
    this.listeners.forEach(listener => {
      try {
        listener(newNotif);
      } catch (err) {
        console.error('Notification listener error:', err);
      }
    });

    return newNotif;
  }

  public markAsRead(id: string): void {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
  }

  public markAllAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
  }

  public clearAll(): void {
    this.notifications = [];
  }
}

export const notificationService = new NotificationService();
