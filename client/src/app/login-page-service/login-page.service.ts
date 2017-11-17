import { Injectable } from '@angular/core';

@Injectable()
export class LoginPageService {
	lastPage: string = null;

	public getPage() {
		return this.lastPage;
	}

	public setPage(newPage: string) {
		console.log('setting new return page', newPage);
		this.lastPage = newPage;
	}
}

