import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Issue, IssueCategory, IssueStatus, Team } from '../../models/issue.models';
import { StatusBadge } from '../status-badge/status-badge';
import { STATUSCATEGORY } from '../../models/constants';

@Component({
  selector: 'app-issue-card',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzSpaceModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    StatusBadge,
  ],
  templateUrl: './issue-card.html',
  styleUrl: './issue-card.scss',
})
export class IssueCard {

  @Input({ required: true }) issue!: Issue;
  @Input({ required: true }) teams!: Team[];
  @Input({ required: true }) categories!: IssueCategory[];

  @Output() statusChanged = new EventEmitter<{ issueId: string; status: IssueStatus }>();
  @Output() teamChanged = new EventEmitter<{ issueId: string; teamId: string }>();
  @Output() sendToJira = new EventEmitter<string>();

  expanded = false;
  editVisible = false;
  editForm;
  statusCategories = STATUSCATEGORY;
  

  constructor(private readonly fb: FormBuilder) {
    this.editForm = this.fb.group({
      status: ['NEW' as IssueStatus, [Validators.required]],
      teamId: ['', [Validators.required]],
    });
        console.log('Status categories:', this.issue);

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['issue']?.currentValue) {
      this.editForm.patchValue({ status: this.issue.status, teamId: this.issue.teamId }, { emitEvent: false });
    }
  }

  toggleExpanded() { this.expanded = !this.expanded; }
  openEdit() { this.editVisible = true; }
  closeEdit() { this.editVisible = false; }

  saveEdit() {
    const { status, teamId } = this.editForm.getRawValue();
    this.statusChanged.emit({ issueId: this.issue.id, status: status! });
    this.teamChanged.emit({ issueId: this.issue.id, teamId: teamId! });
    this.editVisible = false;
  }

  get teamName(): string {
    return this.teams.find(t => t.id === this.issue.teamId)?.name ?? 'Unassigned';
  }

  get categoryLabel(): string {
    return this.categories.find(c => c.id === this.issue.categoryId)?.label ?? 'Unknown';
  }

  get jiraButtonLabel(): string {
    if (this.issue.jira.status === 'SENT') return 'Sent to Jira';
    if (this.issue.jira.status === 'FAILED') return 'Retry Jira';
    return 'Send to Jira';
  }

}
