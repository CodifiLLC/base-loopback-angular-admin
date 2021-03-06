import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import {BsDropdownModule, CollapseModule, TabsModule} from 'ngx-bootstrap';

import { LoggedInGuard } from './guards/login';
import { SuperuserGuard } from './guards/superuser';
import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { LoginComponent } from './user/login/login.component';
import { CreateAccountComponent } from './user/create-account/create-account.component';
import { ProfileComponent } from './user/profile/profile.component';
import { SDKBrowserModule } from './shared/sdk/index';
import { AdminComponent } from './admin/admin.component';
import { UserListComponent } from './admin/user-list/user-list.component';
//import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { FlashMessageComponent } from './flash-message/flash-message.component';
import { FlashMessageService } from './flash-message/flash-message.service';
import { SocketService } from './shared/socket.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import {LoginPageService} from './login-page-service/login-page.service'

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		CreateAccountComponent,
		ProfileComponent,
		AdminComponent,
		UserListComponent,
		//ResetPasswordComponent,
		FlashMessageComponent,
		DashboardComponent
	],
	imports: [
		BrowserModule,
		BsDropdownModule.forRoot(),
		CollapseModule.forRoot(),
		TabsModule.forRoot(),
		FormsModule,
		HttpModule,
		routing,
		RouterModule,
		SDKBrowserModule.forRoot()
	],
	providers: [
		LoggedInGuard,
		SuperuserGuard,
		FlashMessageService,
		SocketService,
		LoginPageService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
