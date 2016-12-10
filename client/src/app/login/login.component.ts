import {Router} from "@angular/router";
import { Component, OnInit } from '@angular/core';
import { LoginModel } from './login.model';
import { CustomUserApi, LoopBackAuth } from '../shared/sdk/services';
import { Role, SDKToken } from '../shared/sdk/models';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	loginError: string;
	loginInfo = new LoginModel();

	constructor(private userApi: CustomUserApi, private auth: LoopBackAuth, private router: Router) { }

	ngOnInit() {
	}

	login() {
		this.userApi.login(this.loginInfo, 'user', this.loginInfo.rememberMe).subscribe((token: SDKToken) => {
			//once the user has been logged in, look up their roles and save them to the user
			this.userApi.getRoles(token.user.id).subscribe((roles: Role[]) => {
				token.user.roles = roles;
				this.auth.setUser(token);
				this.auth.save();
			});
			this.router.navigateByUrl('/');
		}, err => {
			this.loginError = "Invalid Login";
		});
	}
}
