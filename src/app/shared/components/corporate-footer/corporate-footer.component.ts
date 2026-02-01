import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-corporate-footer',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './corporate-footer.component.html',
  styleUrl: './corporate-footer.component.scss'
})
export class CorporateFooterComponent {}
