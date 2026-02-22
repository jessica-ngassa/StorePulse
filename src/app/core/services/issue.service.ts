import { Injectable, computed, signal } from '@angular/core';
import { Attachment, Issue, IssueStatus } from '../../shared/models/issue.models';
import { ISSUE_FIXTURES } from '../../shared/models/issue.fixtures';
import { JiraService } from './jira.service';

const STORAGE_KEY = 'issue-tracker.issues.v1';

function nowIso() {
  return new Date().toISOString();
}

function loadInitial(): Issue[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return ISSUE_FIXTURES;
  try {
    return JSON.parse(raw) as Issue[];
  } catch {
    return ISSUE_FIXTURES;
  }
}

type CreateIssueInput = Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'jira'>;

export interface DraftIssueInput {
  reporterName: string;
  title?: string;
  categoryId?: string;
  description?: string;
  teamId?: string;
  attachments?: Attachment[];
}

@Injectable({ providedIn: 'root' })
export class IssueService {
  private readonly _issues = signal<Issue[]>(loadInitial());
  readonly issues = computed(() => this._issues());

  constructor(private readonly jira: JiraService) {}

  private persist(next: Issue[]) {
    this._issues.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private buildIssue(input: CreateIssueInput): Issue {
    return {
      ...input,
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      jira: { status: 'NOT_SENT' },
    };
  }

  createIssue(input: CreateIssueInput) {
    const issue = this.buildIssue(input);
    this.persist([issue, ...this._issues()]);
    return issue;
  }

  saveDraft(input: DraftIssueInput) {
    const issue: Issue = {
      reporterName: input.reporterName,
      title: input.title?.trim() || 'Untitled Draft',
      categoryId: input.categoryId || 'other',
      description: input.description?.trim() || '',
      status: 'DRAFT',
      teamId: input.teamId || 'hardware',
      attachments: input.attachments ?? [],
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      jira: { status: 'NOT_SENT' },
    };
    this.persist([issue, ...this._issues()]);
    return issue;
  }

  updateStatusTeam(issueId: string, patch: { status?: IssueStatus; teamId?: string }) {
    const next = this._issues().map(i =>
      i.id === issueId ? { ...i, ...patch, updatedAt: nowIso() } : i
    );
    this.persist(next);
  }

  async sendToJira(issueId: string) {
    const issue = this._issues().find(i => i.id === issueId);
    if (!issue) return;

    try {
      const key = await this.jira.createTicket(issue);
      const next = this._issues().map(i =>
        i.id === issueId ? { ...i, updatedAt: nowIso(), jira: { status: 'SENT' as const, key } } : i
      );
      this.persist(next);
    } catch {
      const next = this._issues().map(i =>
        i.id === issueId ? { ...i, updatedAt: nowIso(), jira: { status: 'FAILED' as const } } : i
      );
      this.persist(next);
    }
  }
}
