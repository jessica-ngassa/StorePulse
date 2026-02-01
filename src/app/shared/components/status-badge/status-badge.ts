import { Component, Input } from '@angular/core';
import { IssueStatus } from '../../models/issue.models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  @Input({ required: true }) status!: IssueStatus;

  get label(): string {
    switch (this.status) {
      case 'NEW': return 'New';
      case 'IN_PROGRESS': return 'Progress';
      case 'RESOLVED': return 'Fixed';
    }
  }
}
