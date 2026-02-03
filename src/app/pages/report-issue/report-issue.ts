import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { IssueService } from '../../core/services/issue.service';
import { AuthService } from '../../core/services/auth.service';
import { ReportIssueDataService } from '../../core/services/report-issue-data.service';
import { Attachment } from '../../shared/models/issue.models';

@Component({
  selector: 'app-report-issue',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzUploadModule,
    NzIconModule,
    NzModalModule
  ],
  templateUrl: './report-issue.html',
  styleUrl: './report-issue.scss',
})
export class ReportIssue implements OnInit {
  categories!: typeof this.data.categories;
  teams!: typeof this.data.teams;
  quarterOptions!: typeof this.data.quarterOptions;
  priorityOptions!: typeof this.data.priorityOptions;
  reproducibilityOptions!: typeof this.data.reproducibilityOptions;
  storeOptions!: typeof this.data.stores;
  subTeamOptions!: typeof this.data.subTeamOptions;

  get storeOptionsValue() { return this.storeOptions?.() || []; }
  get categoriesValue() { return this.categories?.() || []; }
  get quarterOptionsValue() { return this.quarterOptions?.() || []; }
  get priorityOptionsValue() { return this.priorityOptions?.() || []; }
  get reproducibilityOptionsValue() { return this.reproducibilityOptions?.() || []; }
  get subTeamOptionsValue() { return this.subTeamOptions?.() || []; }

  private attachments: Attachment[] = [];
  form;
  isDialogOpen = true;
  currentUserName = 'Associate';
  private readonly selectedCategoryId = signal<string>('');

  readonly selectedCategoryLabel = computed(() => {
    const id = this.selectedCategoryId();
    const categories = this.categories?.() || [];
    return categories.find(c => c.id === id)?.label ?? 'General Support';
  });
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly data = inject(ReportIssueDataService);

  constructor(
    private readonly fb: FormBuilder,
    private readonly issues: IssueService,
    private readonly msg: NzMessageService
  ) {
    this.form = this.fb.group({
      storeNumber: ['', [Validators.required]],
      department: [''],
      referenceAssociate: [''],
      quarter: ['', [Validators.required]],
      deviceModel: [''],
      categoryId: ['', [Validators.required]],
      subTeam: [''],
      priority: ['medium', [Validators.required]],
      reproducibility: ['always'],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.categories = this.data.categories;
    this.teams = this.data.teams;
    this.quarterOptions = this.data.quarterOptions;
    this.priorityOptions = this.data.priorityOptions;
    this.reproducibilityOptions = this.data.reproducibilityOptions;
    this.storeOptions = this.data.stores;
    this.subTeamOptions = this.data.subTeamOptions;

    this.authService.currentUser$
      .pipe(filter((user) => !!user), take(1))
      .subscribe((user) => {
        this.currentUserName = user!.name;
      });

    const categoryControl = this.form.get('categoryId');
    this.selectedCategoryId.set(categoryControl?.value ?? '');
    categoryControl?.valueChanges.subscribe((value) => {
      this.selectedCategoryId.set(value ?? '');
    });
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.router.navigate(['/dashboard']);
  }

  beforeUploadImage = (file: NzUploadFile) => {
    const nativeFile = file as any as File;
    if (!nativeFile.type.startsWith('image/')) {
      this.msg.error('Only images are allowed.');
      return false;
    }
    this.attachments.push({
      id: crypto.randomUUID(),
      type: 'IMAGE',
      name: nativeFile.name,
      url: URL.createObjectURL(nativeFile),
    });
    return false; // prevent auto upload (backend later)
  };

  beforeUploadVideo = (file: NzUploadFile) => {
    const nativeFile = file as any as File;
    if (!nativeFile.type.startsWith('video/')) {
      this.msg.error('Only videos are allowed.');
      return false;
    }
    this.attachments.push({
      id: crypto.randomUUID(),
      type: 'VIDEO',
      name: nativeFile.name,
      url: URL.createObjectURL(nativeFile),
    });
    return false;
  };

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const teamId =
      this.form.value.categoryId === 'auth' ? 'auth'
      : this.form.value.categoryId === 'payments' ? 'payments'
      : this.form.value.categoryId === 'inventory' ? 'inventory'
      : this.form.value.categoryId === 'performance' ? 'perf'
      : 'hardware';

    this.issues.createIssue({
      reporterName: this.currentUserName,
      title: this.form.value.title!,
      categoryId: this.form.value.categoryId!,
      description: this.form.value.description!,
      status: 'NEW',
      teamId,
      attachments: this.attachments,
    });

    this.msg.success('Issue submitted.');
    this.form.reset();
    this.attachments = [];
    this.closeDialog();
  }

}
