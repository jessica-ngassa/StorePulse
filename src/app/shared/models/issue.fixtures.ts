import { Issue } from './issue.models';

const now = () => new Date().toISOString();

export const ISSUE_FIXTURES: Issue[] = [
  {
    id: crypto.randomUUID(),
    reporterName: 'Sarah Johnson',
    title: 'App crashes when scanning barcodes',
    categoryId: 'scanning',
    description:
      'The inventory app crashes immediately after scanning a product barcode. Happens across multiple devices.',
    status: 'NEW',
    teamId: 'hardware',
    createdAt: now(),
    updatedAt: now(),
    attachments: [],
    jira: { status: 'NOT_SENT' },
  },
  {
    id: crypto.randomUUID(),
    reporterName: 'Mike Chen',
    title: 'Login times out repeatedly during peak hours',
    categoryId: 'auth',
    description:
      'Associates cannot log in during peak hours. Eventually times out with AUTH_TIMEOUT.',
    status: 'IN_PROGRESS',
    teamId: 'auth',
    createdAt: now(),
    updatedAt: now(),
    attachments: [],
    jira: { status: 'SENT', key: 'STORE-1234' },
  },
  {
    id: crypto.randomUUID(),
    reporterName: 'Lisa Martinez',
    title: 'Checkout screen freezes on credit card payment',
    categoryId: 'payments',
    description: 'When processing payments over $500, the checkout screen becomes unresponsive.',
    status: 'NEW',
    teamId: 'payments',
    createdAt: now(),
    updatedAt: now(),
    attachments: [],
    jira: { status: 'NOT_SENT' },
  },
];
