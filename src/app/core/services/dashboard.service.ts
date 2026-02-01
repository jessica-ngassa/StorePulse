import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { IssueSubmission, ActivityLog, Store } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private mockStores: Store[] = [
    { id: 's1', name: 'Store #0121 - Atlanta', address: '2525 Piedmont Rd NE, Atlanta, GA 30324', number: '0121' },
    { id: 's2', name: 'Store #0122 - Marietta', address: '440 Commerce Park Dr SE, Marietta, GA 30060', number: '0122' },
    { id: 's3', name: 'Store #0123 - Decatur', address: '1000 Commerce Dr, Decatur, GA 30030', number: '0123' },
  ];

  private mockSubmissions: IssueSubmission[] = [
    {
      id: '1',
      title: 'App crashes when scanning barcodes',
      description: 'The inventory app crashes immediately after scanning a product barcode. This happens consistently across multiple devices in the lumber department.',
      category: 'scanning-hardware',
      team: 'Hardware Support',
      subTeam: 'Scanner Maintenance',
      reportedBy: 'Sarah Johnson',
      reporterId: 'user-001',
      photos: [],
      videos: [],
      timestamp: new Date('2026-01-28T10:00:00'),
      status: 'new',
      store: this.mockStores[0],
      jiraId: 'HD-1024',
      jiraSyncCount: 1,
      lastJiraSync: new Date('2026-01-28T11:30:00'),
      priority: 'high',
      department: 'Lumber',
      deviceModel: 'Zebra TC52'
    },
    {
      id: '2',
      title: 'Login times out repeatedly during peak hours',
      description: 'Store associates are unable to login during peak hours (6-9 AM). The authentication takes forever and eventually times out.',
      category: 'authentication',
      team: 'Mobile Engineering',
      subTeam: 'SSO Team',
      reportedBy: 'John Associate',
      reporterId: 'user-123',
      photos: [],
      videos: [],
      timestamp: new Date('2026-01-29T08:30:00'),
      status: 'in-progress',
      store: this.mockStores[1],
      jiraId: 'HD-1025',
      jiraSyncCount: 1,
      lastJiraSync: new Date('2026-01-29T09:00:00'),
      priority: 'critical',
      department: 'Front End',
      deviceModel: 'FIRST Phone'
    },
    {
      id: '3',
      title: 'Payment terminal showing "Error 404" on startup',
      description: 'When powering on the terminal at Lane 4, it shows a 404 error instead of the checkout screen. Power cycling doesn\'t help. This is blocking sales at this register.',
      category: 'payments',
      team: 'Payment Systems',
      subTeam: 'POS Terminal',
      reportedBy: 'Michael Cashier',
      reporterId: 'user-456',
      photos: [],
      videos: [],
      timestamp: new Date('2026-01-31T14:15:00'),
      status: 'new',
      store: this.mockStores[2],
      jiraSyncCount: 0,
      priority: 'critical',
      department: 'Front End',
      deviceModel: 'Ingenico Lane 7000',
      referenceAssociate: 'David Manager'
    }
  ];

  private mockActivities: ActivityLog[] = [
    {
      id: 'a1',
      issueId: '1',
      action: 'Reported Issue',
      user: 'Sarah Johnson',
      timestamp: new Date('2026-01-28T10:00:00')
    },
    {
      id: 'a2',
      issueId: '1',
      action: 'Sent to Jira',
      user: 'Sarah Johnson',
      timestamp: new Date('2026-01-28T11:30:00'),
      details: 'Jira Ticket: HD-1024'
    }
  ];

  private submissionsSubject = new BehaviorSubject<IssueSubmission[]>(this.mockSubmissions);
  private activitiesSubject = new BehaviorSubject<ActivityLog[]>(this.mockActivities);

  public submissions$ = this.submissionsSubject.asObservable();
  public activities$ = this.activitiesSubject.asObservable();

  getStores(): Observable<Store[]> {
    return of(this.mockStores);
  }

  getSubmissions(): Observable<IssueSubmission[]> {
    return this.submissions$;
  }

  getActivities(): Observable<ActivityLog[]> {
    return this.activities$;
  }

  addSubmission(submission: Omit<IssueSubmission, 'id' | 'timestamp' | 'status' | 'jiraSyncCount'>): Observable<IssueSubmission> {
    const newSubmission: IssueSubmission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      status: 'new',
      jiraSyncCount: 0
    };

    const currentSubmissions = this.submissionsSubject.value;
    this.submissionsSubject.next([newSubmission, ...currentSubmissions]);

    return of(newSubmission).pipe(delay(500));
  }

  updateSubmission(id: string, updates: Partial<IssueSubmission>): Observable<IssueSubmission> {
    const currentSubmissions = this.submissionsSubject.value;
    const updatedSubmissions = currentSubmissions.map(sub => 
      sub.id === id ? { ...sub, ...updates } : sub
    );
    this.submissionsSubject.next(updatedSubmissions);

    const updatedSubmission = updatedSubmissions.find(sub => sub.id === id)!;
    return of(updatedSubmission).pipe(delay(300));
  }

  addActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Observable<ActivityLog> {
    const newActivity: ActivityLog = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    const currentActivities = this.activitiesSubject.value;
    this.activitiesSubject.next([newActivity, ...currentActivities]);

    return of(newActivity).pipe(delay(200));
  }

  syncToJira(issueId: string): Observable<string> {
    const jiraId = `HD-${Math.floor(Math.random() * 9000) + 1000}`;
    
    this.updateSubmission(issueId, {
      jiraId,
      jiraSyncCount: 1,
      lastJiraSync: new Date()
    }).subscribe();

    return of(jiraId).pipe(delay(1500));
  }
}