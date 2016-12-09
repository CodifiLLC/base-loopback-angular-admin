import {FlashMessageService} from "../../flash-message/flash-message.service";
import { Component, OnInit } from '@angular/core';
import { CustomUserApi } from '../../shared/sdk/services';
import { CustomUser } from "../../shared/sdk/models";

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
	userList: CustomUser[];
	displayError: string = null;
	displaySuccess: string = null;
	searchString = "";

	constructor(private userApi: CustomUserApi, private flashMessageService: FlashMessageService) { }

	ngOnInit() {
		this.runSearch();
	}

	search() {
		const searchPattern = `%${this.searchString}%`;
		this.runSearch({where: {
			or: [
				{firstName: {like: searchPattern}},
				{lastName: {like: searchPattern}},
				{email: {like: searchPattern}}
			]
		}});
	}

	deleteUser(user: CustomUser){
		if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName} (${user.id})`)){
			this.userApi.deleteById(user.id).subscribe(() => {
				this.displayError = null;
				this.userList.splice(this.userList.findIndex(u => u.id == user.id), 1);
				this.flashMessageService.showMessage({message: 'Deleted User', messageClass: 'success'});
			}, err => {
				this.flashMessageService.showMessage({message: this.getErrorMessage(err), messageClass: 'danger'});
			});
		}
	}

	resetPassword(user: CustomUser){
		const newPassword = this.getRandomPassword(user);
		if (newPassword) {
			this.userApi.patchAttributes(user.id, {password: newPassword}).subscribe(() => {
				this.flashMessageService.showMessage({message: "Password reset successfully", messageClass: 'success'});
			}, err => {
				this.flashMessageService.showMessage({message: "Password reset failed", messageClass: 'danger'});
			})
		} else {
			this.flashMessageService.showMessage({message: "Password reset cancelled", messageClass: 'danger'});
		}
	}

	private getRandomPassword (user: CustomUser){
		//return Math.random().toString(36).slice(2);
		return prompt(`Enter a new password for ${user.firstName} ${user.lastName} (${user.id})`);
	}

	private runSearch(filter?) {
		this.userApi.find(filter).subscribe((list: CustomUser[]) => {
			this.userList = list;
		}, err => {
			console.log('there was an error during searching', err);
			this.flashMessageService.showMessage({message: this.getErrorMessage(err), messageClass: 'danger'});
		})
	}

	private getErrorMessage (err: any) {
		return (err instanceof Error || typeof err === "object" && err.message) ? err.message : err.toString();
	}

}
