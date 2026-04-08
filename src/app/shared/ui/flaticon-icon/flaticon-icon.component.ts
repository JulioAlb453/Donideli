import { Component, Input } from '@angular/core';
import {
  FLATICON_ICON_SRC,
  type FlaticonIconName,
} from './flaticon-icons.config';

export type { FlaticonIconName };

@Component({
  selector: 'app-flaticon-icon',
  standalone: false,
  templateUrl: './flaticon-icon.component.html',
  styleUrl: './flaticon-icon.component.css',
})
export class FlaticonIconComponent {
  @Input({ required: true }) name!: FlaticonIconName;
  @Input() alt = '';

  protected get src(): string {
    return FLATICON_ICON_SRC[this.name];
  }
}
