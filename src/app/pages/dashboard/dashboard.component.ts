import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { NavigationComponent } from '../../shared/components/navigation/navigation.component';
import { CorporateFooterComponent } from '../../shared/components/corporate-footer/corporate-footer.component';
import { IssueTabsComponent } from '../../shared/components/issue-tabs/issue-tabs.component';
import { IssueSubmission } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzIconModule,
    NzModalModule,
    NavigationComponent,
    CorporateFooterComponent,
    IssueTabsComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  currentUser$ = this.authService.currentUser$;
  selectedIssue: IssueSubmission | null = null;
  isInspectModalOpen = false;

  dashboardData$ = combineLatest([
    this.dashboardService.getSubmissions(),
    this.dashboardService.getActivities(),
    this.dashboardService.getStores()
  ]).pipe(
    map(([issues, activities, stores]) => ({
      issues,
      activities,
      stores,
      totalReports: issues.length,
      activeIssues: issues.filter(i => i.status === 'new' || i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      sentToJira: issues.filter(i => i.jiraId).length
    }))
  );

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onReportIssue(): void {
    // Navigate to report issue page or open modal
    this.router.navigate(['/report']);
  }

  onViewDetails(issue: IssueSubmission): void {
    if (issue.status === 'draft') {
      this.router.navigate(['/report'], { queryParams: { resumeId: issue.id } });
      return;
    }
    this.openInspectModal(issue);
  }

  onSyncJira(issue: IssueSubmission): void {
    this.message.loading('Syncing to Jira...', { nzDuration: 0 });

    this.dashboardService.syncToJira(issue.id).subscribe({
      next: (jiraId) => {
        this.message.remove();
        this.message.success(`Successfully synced to Jira: ${jiraId}`);
        this.refreshSelectedIssue(issue.id);

        // Add activity log
        this.dashboardService.addActivity({
          issueId: issue.id,
          action: 'Sent to Jira',
          user: 'System',
          details: `Jira Ticket: ${jiraId}`
        }).subscribe();
      },
      error: () => {
        this.message.remove();
        this.message.error('Failed to sync to Jira');
      }
    });
  }

  onInspect(issue: IssueSubmission): void {
    if (issue.status === 'draft') {
      this.onViewDetails(issue);
      return;
    }
    this.openInspectModal(issue);
  }

  closeInspectModal(): void {
    this.isInspectModalOpen = false;
    this.selectedIssue = null;
  }

  onEditRecord(issue: IssueSubmission): void {
    this.closeInspectModal();
    this.router.navigate(['/report'], { queryParams: { resumeId: issue.id } });
  }

  getStatusText(status: IssueSubmission['status']): string {
    switch (status) {
      case 'new':
        return 'NEW';
      case 'in-progress':
        return 'IN PROGRESS';
      case 'resolved':
        return 'RESOLVED';
      case 'draft':
        return 'DRAFT';
      default:
        return String(status).toUpperCase();
    }
  }

  getStatusClass(status: IssueSubmission['status']): string {
    switch (status) {
      case 'new':
        return 'inspect-chip--status-new';
      case 'in-progress':
        return 'inspect-chip--status-progress';
      case 'resolved':
        return 'inspect-chip--status-resolved';
      case 'draft':
        return 'inspect-chip--status-draft';
      default:
        return 'inspect-chip--status-draft';
    }
  }

  getCaseCode(issueId: string): string {
    return issueId.slice(-6).toUpperCase();
  }

  getQuarterLabel(issue: IssueSubmission): string {
    return issue.quarter || 'Q1 Cycle';
  }

  getTargetTeam(issue: IssueSubmission): string {
    return issue.subTeam?.trim() || 'Pending Triage';
  }

  getReporterIdLabel(reporterId: string): string {
    return reporterId.slice(-6).toUpperCase();
  }

  formatDetailedDate(date?: Date): string {
    if (!date) {
      return '';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  }

  private openInspectModal(issue: IssueSubmission): void {
    const latestIssue = this.dashboardService.getSubmissionById(issue.id) || issue;
    this.selectedIssue = { ...latestIssue };
    this.isInspectModalOpen = true;
  }

  private refreshSelectedIssue(issueId: string): void {
    if (!this.selectedIssue || this.selectedIssue.id !== issueId) {
      return;
    }

    const updatedIssue = this.dashboardService.getSubmissionById(issueId);
    if (updatedIssue) {
      this.selectedIssue = { ...updatedIssue };
    }
  }
}
