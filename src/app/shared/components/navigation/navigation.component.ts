import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, NzAvatarModule, NzButtonModule, NzIconModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  @Input() user: User | null = null;
  @Input() totalReports: number = 0;
  @Input() sentToJira: number = 0;
  @Output() logout = new EventEmitter<void>();
  @Output() reportIssue = new EventEmitter<void>();

  getInitials(): string {
    if (!this.user?.name) return '';
    return this.user.name.split(' ').map((n: string) => n[0]).join('');
  }

  onLogout(): void {
    this.logout.emit();
  }

  onReportIssue(): void {
    this.reportIssue.emit();
  }
}
