import { Injectable, signal } from '@angular/core';
import { CATEGORIES, TEAMS } from '../../shared/models/constants';
import { IssueCategory, Team } from '../../shared/models/issue.models';

export interface StoreOption {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ReportIssueDataService {
  readonly categories = signal<IssueCategory[]>([]);
  readonly teams = signal<Team[]>([]);
  readonly stores = signal<StoreOption[]>([]);
  readonly quarterOptions = signal<string[]>([]);
  readonly priorityOptions = signal<string[]>([]);
  readonly reproducibilityOptions = signal<string[]>([]);
  readonly subTeamOptions = signal<string[]>([]);

  constructor() {
    this.loadDefaults();
  }

  loadDefaults(): void {
    this.categories.set(CATEGORIES);
    this.teams.set(TEAMS);
    this.stores.set([
      { id: '0121', name: 'Store #0121 - Atlanta' },
      { id: '0122', name: 'Store #0122 - Marietta' },
      { id: '0123', name: 'Store #0123 - Decatur' },
      { id: '0124', name: 'Store #0124 - Buckhead' },
    ]);
    this.quarterOptions.set(['Q1 (Feb - Apr)', 'Q2 (May - Jul)', 'Q3 (Aug - Oct)', 'Q4 (Nov - Jan)']);
    this.priorityOptions.set(['low', 'medium', 'high', 'critical']);
    this.reproducibilityOptions.set(['always', 'intermittent', 'once', 'unable']);
    this.subTeamOptions.set(['Scanner Maintenance', 'Device Provisioning', 'SSO Team', 'POS Terminal']);
  }

  setCategories(categories: IssueCategory[]): void {
    this.categories.set(categories);
  }

  setTeams(teams: Team[]): void {
    this.teams.set(teams);
  }

  setStores(stores: StoreOption[]): void {
    this.stores.set(stores);
  }

  setQuarterOptions(options: string[]): void {
    this.quarterOptions.set(options);
  }

  setPriorityOptions(options: string[]): void {
    this.priorityOptions.set(options);
  }

  setReproducibilityOptions(options: string[]): void {
    this.reproducibilityOptions.set(options);
  }

  setSubTeamOptions(options: string[]): void {
    this.subTeamOptions.set(options);
  }
}
