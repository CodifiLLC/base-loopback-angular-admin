import { Component, OnInit } from '@angular/core';
import { LoginAwareComponent } from "../shared/login-aware-component";
import { LoopBackAuth } from '../shared/sdk/services';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends LoginAwareComponent implements OnInit {

	constructor(auth: LoopBackAuth) {
		super(auth);
	}

	ngOnInit() {
	}

}
