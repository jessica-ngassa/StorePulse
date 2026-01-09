import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { Issue } from '../../shared/models/issue.models';
import { TEAMS, CATEGORIES, STATUSCATEGORY } from '../../shared/models/constants';
import { MetricsCard } from '../../shared/components/metrics-card/metrics-card';
import { IssueCard } from '../../shared/components/issue-card/issue-card';
import { IssueService } from '../../core/services/issue.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, NzCardModule, NzSelectModule, NzTabsModule, MetricsCard, IssueCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  teams = TEAMS;
  categories = CATEGORIES;
  statusCategories = STATUSCATEGORY;

  tabIndex = 0;

  teamFilter = signal('');
  statusFilter = signal('');
  categoryFilter = signal('');

  private readonly issueService = inject(IssueService);
  private readonly issues = this.issueService.issues;

  filteredIssues = computed(() => {
    let list = this.issues();    
    if (this.teamFilter()) {
      list = list.filter((i: Issue) => i.teamId === this.teamFilter());
    }
    
    if (this.statusFilter()) {
      list = list.filter((i: Issue) => i.status === this.statusFilter());
    }
    
    if (this.categoryFilter()) {
      list = list.filter((i: Issue) => i.categoryId === this.categoryFilter());
    }
    return list;
  });

  totals = computed(() => {
    const all = this.issues();
    return {
      total: all.length,
      new: all.filter(i => i.status === 'NEW').length,
      inProgress: all.filter(i => i.status === 'IN_PROGRESS').length,
      resolved: all.filter(i => i.status === 'RESOLVED').length,
    };
  });

  groupedByTeam = computed(() => {
    const list = this.filteredIssues();
    const map = new Map<string, Issue[]>();
    for (const issue of list) {
      const arr = map.get(issue.teamId) ?? [];
      arr.push(issue);
      map.set(issue.teamId, arr);
    }
    return Array.from(map.entries()).map(([teamId, issues]) => ({
      teamId,
      teamName: this.teams.find(t => t.id === teamId)?.name ?? 'Unassigned',
      issues,
    }));
  });

  constructor() {
    console.log('Dashboard initialized with', this.issues().length, 'issues');
  }

  onStatusChange(issueId: string, status: any) {
    this.issueService.updateStatusTeam(issueId, { status });
  }

  onTeamChange(issueId: string, teamId: string) {
    this.issueService.updateStatusTeam(issueId, { teamId });
  }

  onSendToJira(issueId: string) {
    this.issueService.sendToJira(issueId);
  }

}
