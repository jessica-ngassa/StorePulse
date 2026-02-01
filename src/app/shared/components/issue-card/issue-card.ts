import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Issue, IssueCategory, IssueStatus, Team } from '../../models/issue.models';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-issue-card',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NzButtonModule,
    NzIconModule,
    StatusBadge,
  ],
  templateUrl: './issue-card.html',
  styleUrl: './issue-card.scss',
})
export class IssueCard {

  @Input({ required: true }) issue!: Issue;
  @Input({ required: true }) teams!: Team[];
  @Input({ required: true }) categories!: IssueCategory[];
  @Input() storeName = 'Store #0121 - Atlanta';
  @Input() subTeamName?: string;

  @Output() statusChanged = new EventEmitter<{ issueId: string; status: IssueStatus }>();
  @Output() teamChanged = new EventEmitter<{ issueId: string; teamId: string }>();
  @Output() sendToJira = new EventEmitter<string>();
  @Output() inspect = new EventEmitter<string>();
  @Output() cardClick = new EventEmitter<string>();

  constructor(private readonly fb: FormBuilder) {}

  onCardClick() {
    this.cardClick.emit(this.issue.id);
  }

  onInspect() {
    this.inspect.emit(this.issue.id);
  }

  get teamName(): string {
    return this.teams.find(t => t.id === this.issue.teamId)?.name ?? 'Hardware Support';
  }

  get categoryLabel(): string {
    return this.categories.find(c => c.id === this.issue.categoryId)?.label ?? 'Unknown';
  }

  get jiraButtonLabel(): string {
    if (this.issue.jira.key || this.issue.jira.status === 'SENT') return 'Push Update';
    if (this.issue.jira.status === 'FAILED') return 'Retry Jira';
    return 'Sync Jira';
  }

}
