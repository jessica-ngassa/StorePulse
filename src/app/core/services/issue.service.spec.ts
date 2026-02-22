import { TestBed } from '@angular/core/testing';
import { IssueService } from './issue.service';

describe('IssueService', () => {
  const STORAGE_KEY = 'issue-tracker.issues.v1';
  let service: IssueService;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssueService);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should persist a submitted issue', () => {
    const initialCount = service.issues().length;

    const created = service.createIssue({
      reporterName: 'Test User',
      title: 'Scanner not pairing',
      categoryId: 'scanning',
      description: 'Unable to pair scanner after reboot.',
      status: 'NEW',
      teamId: 'hardware',
      attachments: [],
    });

    expect(created.status).toBe('NEW');
    expect(service.issues().length).toBe(initialCount + 1);

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Array<{ id: string }>;
    expect(persisted[0].id).toBe(created.id);
  });

  it('should save a draft with defaults for optional fields', () => {
    const draft = service.saveDraft({
      reporterName: 'Test User',
      description: 'Draft details only',
    });

    expect(draft.status).toBe('DRAFT');
    expect(draft.title).toBe('Untitled Draft');
    expect(draft.categoryId).toBe('other');
    expect(draft.teamId).toBe('hardware');
  });
});
