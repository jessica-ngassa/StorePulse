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
    this.message.info(`Viewing details for: ${issue.title}`);
    // Implement view details logic
  }

  onSyncJira(issue: IssueSubmission): void {
    this.message.loading('Syncing to Jira...', { nzDuration: 0 });

    this.dashboardService.syncToJira(issue.id).subscribe({
      next: (jiraId) => {
        this.message.remove();
        this.message.success(`Successfully synced to Jira: ${jiraId}`);

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
    this.message.info(`Inspecting issue: ${issue.title}`);
  }
}
