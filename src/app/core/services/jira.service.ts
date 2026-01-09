import { Injectable } from '@angular/core';
import { Issue } from '../../shared/models/issue.models';

@Injectable({
  providedIn: 'root',
})
export class JiraService {
   async createTicket(_issue: Issue): Promise<string> {
    // v1 stub (backend later)
    await new Promise(r => setTimeout(r, 350));
    return `STORE-${Math.floor(Math.random() * 9000) + 1000}`;
  } 
  
}
