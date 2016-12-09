import {Router} from "@angular/router";
import { Component, OnInit } from '@angular/core';
import { LoginModel } from './login.model';
import { CustomUserApi } from '../shared/sdk/services';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	loginError: string;
	loginInfo = new LoginModel();

	constructor(private userApi: CustomUserApi, private router: Router) { }

	ngOnInit() {
	}

	login() {
		this.userApi.login(this.loginInfo, 'user', this.loginInfo.rememberMe).subscribe(user => {
			console.log('logged in', user);
			this.router.navigateByUrl('/');
		}, err => {
			console.log('err', err);
			this.loginError = "Invalid Login";
		});
	}
}
