import {FlashMessageService} from "../../flash-message/flash-message.service";
import { Component, OnInit } from '@angular/core';
import { CustomUserApi, RoleMappingApi, RoleApi } from '../../shared/sdk/services';
import { CustomUser, LoopBackFilter, Role, RoleMapping } from "../../shared/sdk/models";

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
	adminRole: Role;
	userList: CustomUser[];
	displayError: string = null;
	displaySuccess: string = null;
	searchString = "";

	constructor(private userApi: CustomUserApi, private roleMappingApi: RoleMappingApi, private roleApi: RoleApi, private flashMessageService: FlashMessageService) { }

	ngOnInit() {
		this.runSearch();

		this.roleApi.findOne({where: {name: 'admin'}}).subscribe((r: Role) => this.adminRole = r);
	}

	search() {
		const searchPattern = `%${this.searchString}%`;
		this.runSearch({
			or: [
				{firstName: {like: searchPattern}},
				{lastName: {like: searchPattern}},
				{email: {like: searchPattern}}
			]
		});
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

	userIsAdmin(user: CustomUser){
		return user.roles && user.roles.find(r => r.id == this.adminRole.id) != null;
	}

	toggleAdminStatus(user: CustomUser) {
		//if this user is already an admin, create the role mapping
		if (this.userIsAdmin(user)){
			//find which rolemapping is attached to this user and role
			this.roleMappingApi.findOne({
				where: {principalId: user.id, principalType: 'USER', roleId: this.adminRole.id}
			}).flatMap((rm: RoleMapping) => {
				//if we round the matching role, remove it
				return this.roleMappingApi.deleteById(rm.id);
			}).subscribe(res => {
				//once removed, remove it from the user object
				const roleToRemoveIdx = user.roles.findIndex(r => r.id == this.adminRole.id);
				user.roles.splice(roleToRemoveIdx, 1);
				this.flashMessageService.showMessage({
					message: `${user.firstName} ${user.lastName} (${user.id}) is no longer admin`,
					messageClass: 'success'
				});
			}, err => {
				this.flashMessageService.showMessage({message: "Unable to remove admin", messageClass: 'danger'});
			});
		} else { //if the user is not currently an admin
			//create the new role mapping
			this.roleMappingApi.create({
				principalId: user.id, principalType: 'USER', roleId: this.adminRole.id
			}).subscribe(rm => {
				//when the map finishes, add it to the user list
				if (!user.roles) user.roles = [];
				user.roles.push(this.adminRole);
				this.flashMessageService.showMessage({
					message: `${user.firstName} ${user.lastName} (${user.id}) is now admin`,
					messageClass: 'success'
				});
			}, err => {
				this.flashMessageService.showMessage({message: "Unable to create admin", messageClass: 'danger'});
			})
		}
	}

	private getRandomPassword (user: CustomUser){
		//return Math.random().toString(36).slice(2);
		return prompt(`Enter a new password for ${user.firstName} ${user.lastName} (${user.id})`);
	}

	private runSearch(whereClause?) {
		const filter: LoopBackFilter = {include: 'roles'};
		if (whereClause) {
			filter.where = whereClause;
		}
		this.userApi.find(filter).subscribe((list: CustomUser[]) => {
			this.userList = list;
		}, err => {
			this.flashMessageService.showMessage({message: this.getErrorMessage(err), messageClass: 'danger'});
		})
	}

	private getErrorMessage (err: any) {
		return (err instanceof Error || typeof err === "object" && err.message) ? err.message : err.toString();
	}

}
