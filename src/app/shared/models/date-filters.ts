export type DateFilterId = 'ALL_TIME' | 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

export const DATE_FILTERS: { id: DateFilterId; label: string }[] = [
  { id: 'ALL_TIME', label: 'All Time' },
  { id: 'TODAY', label: 'Today' },
  { id: 'LAST_7_DAYS', label: 'Last 7 days' },
  { id: 'LAST_30_DAYS', label: 'Last 30 days' },
];
