import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { IssueSubmission, ActivityLog, Store } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-issue-tabs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzButtonModule
  ],
  templateUrl: './issue-tabs.component.html',
  styleUrl: './issue-tabs.component.scss'
})
export class IssueTabsComponent implements OnInit {
  @Input() issues: IssueSubmission[] = [];
  @Input() activities: ActivityLog[] = [];
  @Input() stores: Store[] = [];
  @Input() currentUserId: string = '';

  @Output() viewDetails = new EventEmitter<IssueSubmission>();
  @Output() syncJira = new EventEmitter<IssueSubmission>();
  @Output() inspect = new EventEmitter<IssueSubmission>();

  activeTabIndex = 0;
  searchTerm = '';
  statusFilter = 'all';
  storeFilter = 'all';

  filteredIssues: IssueSubmission[] = [];
  myReports: IssueSubmission[] = [];

  tabs = [
    { label: 'All Issues', icon: 'file-text' },
    { label: 'My Reports', icon: 'user' },
    { label: 'Recent Activity', icon: 'history' }
  ];

  ngOnInit(): void {
    this.updateFilters();
  }

  onTabChange(index: number): void {
    this.activeTabIndex = index;
  }

  onSearchChange(): void {
    this.updateFilters();
  }

  onFilterChange(): void {
    this.updateFilters();
  }

  updateFilters(): void {
    let filtered = [...this.issues];

    if (this.searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        issue.team.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        issue.subTeam.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === this.statusFilter);
    }

    if (this.storeFilter !== 'all') {
      filtered = filtered.filter(issue => issue.store.id === this.storeFilter);
    }

    this.filteredIssues = filtered;
    this.myReports = this.issues.filter(issue => issue.reporterId === this.currentUserId);
  }

  onViewDetails(issue: IssueSubmission): void {
    this.viewDetails.emit(issue);
  }

  onSyncJira(issue: IssueSubmission, event: Event): void {
    event.stopPropagation();
    this.syncJira.emit(issue);
  }

  onInspect(issue: IssueSubmission, event: Event): void {
    event.stopPropagation();
    this.inspect.emit(issue);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'new': return 'orange';
      case 'in-progress': return 'blue';
      case 'resolved': return 'green';
      default: return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'new': return 'NEW';
      case 'in-progress': return 'IN PROGRESS';
      case 'resolved': return 'RESOLVED';
      default: return status.toUpperCase();
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  getIssueForActivity(activity: ActivityLog): IssueSubmission | undefined {
    return this.issues.find(issue => issue.id === activity.issueId);
  }
}
