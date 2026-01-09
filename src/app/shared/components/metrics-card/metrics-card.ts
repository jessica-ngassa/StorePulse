import { Component, Input } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';


@Component({
  selector: 'app-metrics-card',
  imports: [NzCardModule, NzTypographyModule],
  templateUrl: './metrics-card.html',
  styleUrl: './metrics-card.scss',
})
export class MetricsCard {
   @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number;

}
