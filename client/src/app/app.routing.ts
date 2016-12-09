import {ProfileComponent} from "./profile/profile.component";
import {LoginComponent} from "./login/login.component";
import {UserListComponent} from "./admin/user-list/user-list.component";
import {ModuleWithProviders} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import { LoggedInGuard } from './guards/login';

export const appRoutes: Routes = [
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'profile',
		component: ProfileComponent,
		canActivate: [LoggedInGuard]
	},
	{
		path: 'admin',
		component: UserListComponent,
		canActivate: [LoggedInGuard]
	},
];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
