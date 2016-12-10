import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { LoopBackAuth } from '../shared/sdk/services';
import { CustomUser } from '../shared/sdk/models';

@Injectable()
export class SuperuserGuard implements CanActivate {
	constructor(private auth: LoopBackAuth, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const curUser: CustomUser = this.auth.getCurrentUserData();
		if (curUser && curUser.roles && curUser.roles.find(r => r.name == "admin")){
			return true;
		} else {
			this.router.navigateByUrl('/');
			return false;
		}
	}
}
