import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { CustomUserApi } from '../shared/sdk/services/custom';
import {LoginPageService} from '../login-page-service/login-page.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
	constructor(private userApi: CustomUserApi, private router: Router, private pageService: LoginPageService) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if (this.userApi.getCurrentId() != null) {
			return true;
		} else {
			this.pageService.setPage('/' + route.url.join('/'));
			this.router.navigateByUrl('/login');
			return false;
		}
	}
}
