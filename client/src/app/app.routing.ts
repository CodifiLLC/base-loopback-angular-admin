import {ProfileComponent} from "./user/profile/profile.component";
import {LoginComponent} from "./user/login/login.component";
import {AdminComponent} from "./admin/admin.component";
import {UserListComponent} from "./admin/user-list/user-list.component";
import {CreateAccountComponent} from "./user/create-account/create-account.component"
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ModuleWithProviders, Component} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
import { LoggedInGuard } from './guards/login';
import { SuperuserGuard } from './guards/superuser';

export const appRoutes: Routes = [
	{
		path: '',
		component: DashboardComponent
	},
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
		component: AdminComponent,
		canActivate: [LoggedInGuard, SuperuserGuard],
		children: [
			{
				path: 'users',
				component: UserListComponent
			},
			{
				path: 'users/:id',
				component: ProfileComponent,
				canActivate: [LoggedInGuard]
			},
		]
	},
	{
		path: 'create',
		component: CreateAccountComponent
	},
];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
