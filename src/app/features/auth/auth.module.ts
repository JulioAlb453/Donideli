import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginPageComponent } from './pages/login/login-page.component';

@NgModule({
  declarations: [LoginPageComponent],
  imports: [CommonModule, FormsModule, AuthRoutingModule],
})
export class AuthModule {}
