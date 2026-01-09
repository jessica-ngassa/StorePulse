// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class Issue {
  
// }

import { Injectable, computed, signal } from '@angular/core';
import { Issue, IssueStatus } from '../../shared/models/issue.models';
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

@Injectable({ providedIn: 'root' })
export class IssueService {
  private readonly _issues = signal<Issue[]>(loadInitial());
  readonly issues = computed(() => this._issues());

  constructor(private readonly jira: JiraService) {}

  private persist(next: Issue[]) {
    this._issues.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  createIssue(input: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'jira'>) {
    const issue: Issue = {
      ...input,
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
