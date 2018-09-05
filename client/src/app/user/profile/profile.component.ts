import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomUserApi, LoopBackAuth } from '../../shared/sdk/services';
import {FlashMessageService} from '../../flash-message/flash-message.service';
import {CustomUser} from '../../shared/sdk/models';
import {LoginModel} from '../login/login.model';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

	private paramSubscription: Subscription;
	loginInfo = new LoginModel();
	user = new CustomUser();
	confirmPassword: string;

	constructor(private router: Router, private activatedRoute: ActivatedRoute, private location: Location,
				private userApi: CustomUserApi, private auth: LoopBackAuth,
				private flashMessageService: FlashMessageService) {}

	ngOnInit() {
		this.paramSubscription = this.activatedRoute.params.subscribe(p => {
			this.user.id = p['id'] || this.userApi.getCurrentId();
			this.userApi.findById(this.user.id).subscribe((user: CustomUser) => {
				this.user = user;
				this.loginInfo.email = this.user.email;
			});
		});
	}

	ngOnDestroy() {
		if (this.paramSubscription) {
			this.paramSubscription.unsubscribe();
		}
	}

	saveUser() {
		this.userApi.patchAttributes(this.user.id, this.user).subscribe(user => {
			this.flashMessageService.showMessage({message: 'Profile Saved!', messageClass: 'success'});

			//if this is being used by the actual user, save the new token and redirect
			if (this.user.id === this.userApi.getCurrentId()) {
				const roles = this.auth.getCurrentUserData().roles;
				user.roles = roles
				this.auth.setUser(user);
				this.auth.save();
			}
		});
	}

	cancel() {
		this.location.back();
	}

	savePassword() {
		this.userApi.login(this.loginInfo, 'user').subscribe(() => {
			if (this.user.password !== this.confirmPassword) {
				this.flashMessageService.showMessage({message: 'New password and Confirm password fields must be the same.', messageClass: 'danger'});
			} else {
				this.flashMessageService.showMessage({message: 'Password changed successfully.', messageClass: 'success'});
				this.userApi.patchAttributes(this.user.id, this.user).subscribe(user => {
					this.user = user;
					//if this is being used by the actual user, save the new token and redirect
					if (this.user.id === this.userApi.getCurrentId()) {
						const roles = this.auth.getCurrentUserData().roles;
						user.roles = roles;
						this.auth.setUser(user);
						this.auth.save();
					}
				});
			}
		}, err => {
			this.flashMessageService.showMessage({message: 'Your current password is incorrect', messageClass: 'danger'});
		});
	}

}
