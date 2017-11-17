import {Router} from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FlashMessageService } from '../../flash-message/flash-message.service';
import { LoginModel } from './login.model';
import { CustomUserApi, LoopBackAuth } from '../../shared/sdk/services';
import { Role, SDKToken } from '../../shared/sdk/models';
import {LoginPageService} from '../../login-page-service/login-page.service';


@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	loginInfo = new LoginModel();

	constructor(private userApi: CustomUserApi, private auth: LoopBackAuth, private router: Router,
				private flashMessageService: FlashMessageService, private pageService: LoginPageService) {
		this.loginInfo.rememberMe = true;
	}

	ngOnInit() {
	}

	login() {
		this.userApi.login(this.loginInfo, 'user', this.loginInfo.rememberMe).subscribe((token: SDKToken) => {
			//once the user has been logged in, look up their roles and save them to the user
			this.userApi.getRoles(token.user.id).subscribe((roles: Role[]) => {
				token.user.roles = roles;
				this.auth.setUser(token.user);
				this.auth.save();
			}, err => {
				console.log('unable to lookup roles', err);
			});
			this.flashMessageService.showMessage({message: 'Logged in successfully', messageClass: 'success'});
			this.router.navigateByUrl(this.pageService.getPage() || '/');
		}, err => {
			this.flashMessageService.showMessage({message: 'Invalid Login', messageClass: 'danger'});
		});
	}
}
