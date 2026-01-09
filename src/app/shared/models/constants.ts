import { IssueCategory, StatusCategory, Team } from './issue.models';

export const TEAMS: Team[] = [
  { id: 'hardware', name: 'Hardware Support' },
  { id: 'auth', name: 'Authentication Team' },
  { id: 'payments', name: 'Payment Systems' },
  { id: 'inventory', name: 'Inventory Management' },
  { id: 'perf', name: 'Performance Team' },
];

export const CATEGORIES: IssueCategory[] = [
  { id: 'scanning', label: 'Scanning / Hardware' },
  { id: 'auth', label: 'Authentication' },
  { id: 'payments', label: 'Payments' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'performance', label: 'Performance' },
  { id: 'other', label: 'Other' },
];


export const STATUSCATEGORY: StatusCategory[] = [
  { id: 'NEW', label: 'New' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'RESOLVED', label: 'Resolved' },
]