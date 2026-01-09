import { Component, Input } from '@angular/core';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { IssueStatus } from '../../models/issue.models';

@Component({
  selector: 'app-status-badge',
   standalone: true,
  imports: [NzTagModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
   @Input({ required: true }) status!: IssueStatus;

  get label(): string {
    switch (this.status) {
      case 'NEW': return 'NEW';
      case 'IN_PROGRESS': return 'IN PROGRESS';
      case 'RESOLVED': return 'RESOLVED';
    }
  }

  get color(): string {
    switch (this.status) {
      case 'NEW': return 'blue';
      case 'IN_PROGRESS': return 'gold';
      case 'RESOLVED': return 'green';
    }
  }

}
