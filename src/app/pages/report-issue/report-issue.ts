import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';

import { IssueService } from '../../core/services/issue.service';
import { CATEGORIES, TEAMS } from '../../shared/models/constants';
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
  ],
  templateUrl: './report-issue.html',
  styleUrl: './report-issue.scss',
})
export class ReportIssue {
  categories = CATEGORIES;

  private attachments: Attachment[] = [];
  form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly issues: IssueService,
    private readonly msg: NzMessageService
  ) {
    this.form = this.fb.group({
      storeNumber: ['', [Validators.required]],
      reporterName: ['', [Validators.required]],
      title: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
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
      reporterName: this.form.value.reporterName!,
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
  }

}
