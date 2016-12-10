import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from "@angular/router";

import { LoggedInGuard } from './guards/login';
import { SuperuserGuard } from './guards/superuser';
import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ProfileComponent } from './profile/profile.component';
import { SDKBrowserModule } from './shared/sdk/index';
import { UserListComponent } from './admin/user-list/user-list.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { FlashMessageComponent } from './flash-message/flash-message.component';
import { FlashMessageService } from './flash-message/flash-message.service';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CreateAccountComponent,
    ProfileComponent,
    UserListComponent,
    ResetPasswordComponent,
    FlashMessageComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    RouterModule,
    SDKBrowserModule.forRoot()
  ],
  providers: [
    LoggedInGuard,
    SuperuserGuard,
    FlashMessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
