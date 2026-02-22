import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { CATEGORIES } from '../../models/constants';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzAvatarModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzInputModule,
    NzSelectModule
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnChanges {
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);

  categories = CATEGORIES;
  @Input() user: User | null = null;
  @Input() totalReports: number = 0;
  @Input() sentToJira: number = 0;
  @Output() logout = new EventEmitter<void>();
  @Output() reportIssue = new EventEmitter<void>();
  isSettingsOpen = false;
  isSavingSettings = false;

  settingsForm;

  constructor(private readonly fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      name: ['', [Validators.required]],
      preferredCategory: ['other'],
      preferredSubTeam: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      this.patchSettingsForm();
    }
  }

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

  openSettings(): void {
    if (!this.user) {
      return;
    }
    this.patchSettingsForm();
    this.isSettingsOpen = true;
  }

  closeSettings(): void {
    this.isSettingsOpen = false;
  }

  saveSettings(): void {
    if (!this.user) {
      return;
    }
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSavingSettings = true;
    const formValue = this.settingsForm.getRawValue();

    this.authService.updateCurrentUser({
      name: formValue.name?.trim(),
      preferredCategory: formValue.preferredCategory || 'other',
      preferredSubTeam: formValue.preferredSubTeam?.trim() || ''
    })
      .pipe(
        take(1),
        finalize(() => {
          this.isSavingSettings = false;
        })
      )
      .subscribe({
        next: () => {
          this.message.success('User settings updated.');
          this.isSettingsOpen = false;
        },
        error: () => {
          this.message.error('Unable to update settings right now.');
        }
      });
  }

  private patchSettingsForm(): void {
    this.settingsForm.patchValue({
      name: this.user?.name || '',
      preferredCategory: this.user?.preferredCategory || 'other',
      preferredSubTeam: this.user?.preferredSubTeam || ''
    });
  }
}
