import { Component, computed, inject } from '@angular/core';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from './core/services/auth.service';

type NavValue = '/report' | '/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    NzLayoutModule, 
    NzMenuModule, 
    RouterLink, 
    NzSegmentedModule, 
    NzTypographyModule, 
    FormsModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly navOptions = [
    { label: 'Report Issue', value: '/report' },
    { label: 'Dashboard', value: '/dashboard' },
  ];

  private current: any = '/report';
  navValue = () => this.current;

  isAuthenticated = () => this.authService.isAuthenticated();

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url.startsWith('/dashboard') ? '/dashboard' : '/report';
        this.current = url as NavValue;
      });
  }

  onNavChange(value: any) {
    const v = (value === '/dashboard' ? '/dashboard' : '/report') as NavValue;
    this.router.navigateByUrl(v);
  }
}
