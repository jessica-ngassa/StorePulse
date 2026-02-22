import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, finalize, take } from 'rxjs';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { IssueSubmission } from '../../core/models/dashboard.model';
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
  isSubmitting = false;
  isSavingDraft = false;
  isEditingMode = false;
  editingIssueId: string | null = null;
  editingReporterName: string | null = null;
  editingReporterId: string | null = null;
  currentUserName = 'Associate';
  currentUserId = 'user-000';
  private isHydratingForm = false;
  private readonly selectedCategoryId = signal<string>('');

  readonly selectedCategoryLabel = computed(() => {
    const id = this.selectedCategoryId();
    const categories = this.categories?.() || [];
    return categories.find(c => c.id === id)?.label ?? 'General Support';
  });
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(ReportIssueDataService);
  private readonly dashboard = inject(DashboardService);
  private readonly defaultStore = {
    id: 's1',
    name: 'Store #0121 - Atlanta',
    address: '2525 Piedmont Rd NE, Atlanta, GA 30324',
    number: '0121',
  };

  constructor(
    private readonly fb: FormBuilder,
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
      status: ['new'],
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
        this.currentUserId = user!.id;

        // Apply user settings as defaults for new reports.
        if (!this.form.value.categoryId && user?.preferredCategory) {
          this.form.patchValue({ categoryId: user.preferredCategory }, { emitEvent: true });
        }
        if (!this.form.value.subTeam && user?.preferredSubTeam) {
          this.form.patchValue({ subTeam: user.preferredSubTeam }, { emitEvent: false });
        }
      });

    const categoryControl = this.form.get('categoryId');
    this.selectedCategoryId.set(categoryControl?.value ?? '');
    categoryControl?.valueChanges.subscribe((value) => {
      this.selectedCategoryId.set(value ?? '');
      if (!this.isHydratingForm) {
        this.form.patchValue({ subTeam: '' }, { emitEvent: false });
      }
    });

    this.loadResumeContext();
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

  get isProcessing(): boolean {
    return this.isSubmitting || this.isSavingDraft;
  }

  get canSaveDraft(): boolean {
    return this.hasDraftContent() && !this.isProcessing;
  }

  get showSaveForLater(): boolean {
    return !this.isEditingMode || this.form.value.status === 'draft';
  }

  get resumeStoreInfo() {
    return this.getSelectedStore();
  }

  get resumeCaseCode(): string {
    return this.editingIssueId?.slice(-6).toUpperCase() || 'DRAFT';
  }

  get resumeQuarterTag(): string {
    const quarter = this.form.value.quarter as string | undefined;
    if (!quarter) return 'Q1';
    return quarter.split(' ')[0];
  }

  private mapCategoryToTeamName(categoryId?: string | null): string {
    switch (categoryId) {
      case 'scanning':
        return 'Hardware Support';
      case 'auth':
        return 'Authentication Team';
      case 'payments':
        return 'Payment Systems';
      case 'inventory':
        return 'Inventory Management';
      case 'performance':
        return 'Performance Team';
      default:
        return 'General Support';
    }
  }

  private hasDraftContent(): boolean {
    return !!this.form.value.title?.trim() || !!this.form.value.description?.trim();
  }

  private mapLegacyCategoryToId(category: string): string {
    const normalized = (category || '').trim().toLowerCase();
    if (this.categories()?.some((item) => item.id === normalized)) {
      return normalized;
    }

    switch (normalized) {
      case 'scanning-hardware':
      case 'scanning':
        return 'scanning';
      case 'authentication':
      case 'auth':
        return 'auth';
      case 'payment':
      case 'payments':
        return 'payments';
      case 'inventory':
        return 'inventory';
      case 'performance':
        return 'performance';
      default:
        return 'other';
    }
  }

  private hydrateAttachments(issue: IssueSubmission): void {
    const imageAttachments = (issue.photos || []).map((url, index) => ({
      id: crypto.randomUUID(),
      type: 'IMAGE' as const,
      name: `photo-${index + 1}`,
      url,
    }));
    const videoAttachments = (issue.videos || []).map((url, index) => ({
      id: crypto.randomUUID(),
      type: 'VIDEO' as const,
      name: `video-${index + 1}`,
      url,
    }));
    this.attachments = [...imageAttachments, ...videoAttachments];
  }

  private loadResumeContext(): void {
    const resumeId = this.route.snapshot.queryParamMap.get('resumeId');
    if (!resumeId) {
      return;
    }

    const issue = this.dashboard.getSubmissionById(resumeId);
    if (!issue) {
      this.msg.error('Draft could not be loaded.');
      this.closeDialog();
      return;
    }

    const mappedCategoryId = this.mapLegacyCategoryToId(issue.category);
    this.isEditingMode = true;
    this.editingIssueId = issue.id;
    this.editingReporterName = issue.reportedBy;
    this.editingReporterId = issue.reporterId;
    this.isHydratingForm = true;
    this.form.patchValue(
      {
        storeNumber: issue.store.id || '',
        department: issue.department || '',
        referenceAssociate: issue.referenceAssociate || '',
        quarter: issue.quarter || '',
        deviceModel: issue.deviceModel || '',
        categoryId: mappedCategoryId,
        subTeam: issue.subTeam || '',
        priority: issue.priority || 'medium',
        reproducibility: issue.reproducibility || 'always',
        status: issue.status || 'draft',
        title: issue.title || '',
        description: issue.description || '',
      },
      { emitEvent: false }
    );
    this.isHydratingForm = false;
    this.selectedCategoryId.set(mappedCategoryId);
    this.hydrateAttachments(issue);
  }

  private getSelectedStore() {
    const stores = this.storeOptions?.() || [];
    return stores.find(store => store.id === this.form.value.storeNumber) ?? stores[0] ?? this.defaultStore;
  }

  private toMediaUrls(type: Attachment['type']): string[] {
    return this.attachments.filter((item) => item.type === type).map((item) => item.url);
  }

  private buildSubmissionPayload(): Omit<IssueSubmission, 'id' | 'timestamp' | 'status' | 'jiraSyncCount'> {
    const selectedStore = this.getSelectedStore();
    const categoryId = this.form.value.categoryId?.trim() || 'other';
    const team = this.mapCategoryToTeamName(this.form.value.categoryId);
    const subTeam = this.form.value.subTeam?.trim() || '';
    const priority = (this.form.value.priority || 'medium') as IssueSubmission['priority'];
    const reproducibility =
      (this.form.value.reproducibility as IssueSubmission['reproducibility']) || undefined;
    const reporterName = this.editingReporterName || this.currentUserName;
    const reporterId = this.editingReporterId || this.currentUserId;

    return {
      title: this.form.value.title?.trim() || 'Untitled Draft',
      description: this.form.value.description?.trim() || '',
      category: categoryId,
      team,
      subTeam,
      reportedBy: reporterName,
      reporterId,
      photos: this.toMediaUrls('IMAGE'),
      videos: this.toMediaUrls('VIDEO'),
      store: selectedStore,
      priority,
      department: this.form.value.department?.trim() || '',
      deviceModel: this.form.value.deviceModel?.trim() || '',
      quarter: this.form.value.quarter || undefined,
      reproducibility,
      referenceAssociate: this.form.value.referenceAssociate?.trim() || undefined,
    };
  }

  private handleFormSubmit(forceStatus?: IssueSubmission['status']): void {
    if (this.isProcessing) {
      return;
    }

    const currentStatus = (this.form.value.status as IssueSubmission['status']) || 'new';
    const finalStatus = forceStatus || (this.isEditingMode ? currentStatus : 'new');
    const isDraft = finalStatus === 'draft';

    if (!isDraft && this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.error('Please fill in all required fields to submit.');
      return;
    }

    if (isDraft && !this.hasDraftContent()) {
      this.msg.error('Please provide at least a title or description to save a draft.');
      return;
    }

    if (isDraft) {
      this.isSavingDraft = true;
    } else {
      this.isSubmitting = true;
    }

    const payload = this.buildSubmissionPayload();
    const request$ = this.editingIssueId
      ? this.dashboard.updateSubmission(this.editingIssueId, { ...payload, status: finalStatus })
      : isDraft
        ? this.dashboard.saveDraft(payload)
        : this.dashboard.createSubmission(payload, finalStatus);

    const isDraftSubmission = this.editingIssueId && currentStatus === 'draft' && finalStatus === 'new';

    request$
      .pipe(
        take(1),
        finalize(() => {
          if (isDraft) {
            this.isSavingDraft = false;
          } else {
            this.isSubmitting = false;
          }
        })
      )
      .subscribe({
        next: () => {
          if (isDraft) {
            this.msg.success('Draft saved for later.');
          } else if (isDraftSubmission) {
            this.msg.success('Draft submitted successfully.');
          } else if (this.editingIssueId) {
            this.msg.success('Issue updated.');
          } else {
            this.msg.success('Issue submitted.');
          }
          this.resetForm();
          this.closeDialog();
        },
        error: () => {
          this.msg.error('Unable to save right now. Please try again.');
        },
      });
  }

  private resetForm(): void {
    this.form.reset({
      storeNumber: '',
      department: '',
      referenceAssociate: '',
      quarter: '',
      deviceModel: '',
      categoryId: '',
      subTeam: '',
      priority: 'medium',
      reproducibility: 'always',
      status: 'new',
      title: '',
      description: '',
    });
    this.selectedCategoryId.set('');
    this.attachments = [];
    this.isEditingMode = false;
    this.editingIssueId = null;
    this.editingReporterName = null;
    this.editingReporterId = null;
  }

  saveForLater(): void {
    this.handleFormSubmit('draft');
  }

  submit(): void {
    if (this.isEditingMode && this.form.value.status === 'draft') {
      this.handleFormSubmit('new');
      return;
    }
    this.handleFormSubmit();
  }

}
