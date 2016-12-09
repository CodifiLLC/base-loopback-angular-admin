import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { CustomUserApi } from '../shared/sdk/services/custom';

@Injectable()
export class LoggedInGuard implements CanActivate {
	constructor(private userApi: CustomUserApi, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if(this.userApi.getCurrentId() != null) {
			return true;
		} else {
			this.router.navigateByUrl('/login')
			return false;
		}
	}
}
