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

	constructor(private userApi: CustomUserApi) { }

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
			}, err => {
				this.displayError = this.getErrorMessage(err);
			});
		}
	}

	resetPassword(user: CustomUser){
		const newPassword = this.getRandomPassword(user);
		if (newPassword) {
			this.userApi.patchAttributes(user.id, {password: newPassword}).subscribe(() => {
				this.showSuccessMessage("Password reset successfully");
			}, err => {
				this.displayError = "Password reset failed";
			})
		} else {
			this.displayError = "Password reset cancelled";
		}
	}

	showSuccessMessage(message: string){
		this.displaySuccess = message;
		setTimeout(() => {
			this.displaySuccess = null;
		}, 5000);
	}

	private getRandomPassword (user: CustomUser){
		//return Math.random().toString(36).slice(2);
		return prompt(`Enter a new password for ${user.firstName} ${user.lastName} (${user.id})`);
	}

	private runSearch(filter?) {
		this.userApi.find(filter).subscribe((list: CustomUser[]) => {
			this.userList = list;
			this.displayError = null;
		}, err => {
			console.log('there was an error during searching', err);
			this.displayError = this.getErrorMessage(err);
		})
	}

	private getErrorMessage (err: any) {
		return (err instanceof Error || typeof err === "object" && err.message) ? err.message : err.toString();
	}

}
