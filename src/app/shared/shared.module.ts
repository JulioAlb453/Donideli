import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlaticonIconComponent } from './ui/flaticon-icon/flaticon-icon.component';

@NgModule({
  declarations: [FlaticonIconComponent],
  imports: [CommonModule],
  exports: [FlaticonIconComponent],
})
export class SharedModule {}
