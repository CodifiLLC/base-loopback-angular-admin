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

	runSearch(filter?) {
		this.userApi.find(filter).subscribe((list: CustomUser[]) => {
			this.userList = list;
		}, err => {
			console.log('there was an error during searching', err);
			this.displayError = (err instanceof Error || typeof err === "object" && err.message) ? err.message : err.toString();
		})
	}

}
