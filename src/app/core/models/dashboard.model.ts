export interface Store {
  id: string;
  name: string;
  address: string;
  number: string;
}

export interface IssueSubmission {
  id: string;
  title: string;
  description: string;
  category: string;
  team: string;
  subTeam: string;
  reportedBy: string;
  reporterId: string;
  photos: string[];
  videos: string[];
  timestamp: Date;
  status: 'new' | 'in-progress' | 'resolved';
  store: Store;
  jiraId?: string;
  jiraSyncCount: number;
  lastJiraSync?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  deviceModel: string;
  referenceAssociate?: string;
}

export interface ActivityLog {
  id: string;
  issueId: string;
  action: string;
  user: string;
  timestamp: Date;
  details?: string;
}