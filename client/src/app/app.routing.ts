import {LoginComponent} from "./login/login.component";
import {ModuleWithProviders} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";
export const appRoutes: Routes = [
	{
		path: 'login',
		component: LoginComponent
	},
];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
