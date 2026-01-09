export type IssueStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
export type AttachmentType = 'IMAGE' | 'VIDEO';

export interface Team {
  id: string;
  name: string;
}

export interface IssueCategory {
  id: string;
  label: string;
}

export interface StatusCategory {
  id: string;
  label: string;
}

export interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  url: string; // object URL for now
}

export interface JiraLink {
  key?: string;
  status: 'NOT_SENT' | 'SENT' | 'FAILED';
}

export interface Issue {
  id: string;
  reporterName: string;
  title: string;
  categoryId: string;
  description: string;

  status: IssueStatus;
  teamId: string;

  createdAt: string;
  updatedAt: string;

  attachments: Attachment[];
  jira: JiraLink;
}
