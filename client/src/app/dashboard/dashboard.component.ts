import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginAwareComponent } from "../shared/login-aware-component";
import { LoopBackAuth } from '../shared/sdk/services';
import { SocketService, SocketMessage } from '../shared/socket.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends LoginAwareComponent implements OnInit, OnDestroy {
	private socketSubscription: Subscription;

	constructor(auth: LoopBackAuth, socket: SocketService) {
		super(auth);

		this.socketSubscription = socket.watchEvent("stuff").subscribe((message: SocketMessage) => {
			console.log('got message from socket', message);
		});
	}

	ngOnInit() {
	}

	ngOnDestroy() {
		if (this.socketSubscription) {
			this.socketSubscription.unsubscribe();
		}
	}

}
