import { Component, OnInit, Input } from '@angular/core';
import { CustomUserApi, LoopBackAuth } from '../shared/sdk/services';
import {FlashMessageService} from "../flash-message/flash-message.service";
import {CustomUser} from '../shared/sdk/models/CustomUser';
import {Router} from "@angular/router";

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  	user = new CustomUser();

  	constructor(private router: Router, private userApi: CustomUserApi, private auth: LoopBackAuth,
	    private flashMessageService: FlashMessageService) {}

  	ngOnInit() {
    		this.user.id = this.userApi.getCurrentId();
		this.userApi.findById(this.user.id).subscribe((user: CustomUser) => {
			this.user = user;
		});
  }

  	saveUser() {
		this.userApi.patchAttributes(this.user.id, this.user).subscribe(user => {
	      		this.flashMessageService.showMessage({message: "Profile Saved!", messageClass: "success"});
	      		const token = this.auth.getToken();
	      		const roles = this.auth.getCurrentUserData().roles;
	      		token.user = this.user;
	      		token.user.roles = roles;
	      		this.auth.setUser(token);
	      		this.auth.save();
	      		this.router.navigateByUrl('/');
	    	});
  	}

}
