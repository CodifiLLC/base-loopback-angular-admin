import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FlashMessageService} from '../../flash-message/flash-message.service';
import {CustomUser} from '../../shared/sdk/models/CustomUser';
import {CustomUserApi} from '../../shared/sdk/services/custom';


@Component({
	selector: 'app-create-account',
	templateUrl: './create-account.component.html',
	styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {

	userInfo = new CustomUser();
	emailError: string;

	constructor(private userApi: CustomUserApi, private router: Router, private flashMessageService: FlashMessageService) { }

	ngOnInit() {
	}

	createUser() {
		this.userApi.create(this.userInfo).subscribe(user => {
			this.flashMessageService.showMessage({message: 'Account created successfully', messageClass: 'success'});
			this.router.navigateByUrl('/');
		}, err => {
			//TODO this should probably actually check the error that comes back
			this.flashMessageService.showMessage({message: 'Email already in use', messageClass: 'danger'});
		});
	}

}
