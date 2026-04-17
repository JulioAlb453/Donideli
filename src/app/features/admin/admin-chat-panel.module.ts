import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminChatPanelComponent } from './components/admin-chat-panel/admin-chat-panel.component';

@NgModule({
  declarations: [AdminChatPanelComponent],
  imports: [CommonModule, SharedModule],
  exports: [AdminChatPanelComponent],
})
export class AdminChatPanelModule {}
