import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class FlashMessageService {

	private messagesToShowSource = new Subject<FlashMessageInterface>();

	// Observable string streams
	messagesToShow$ = this.messagesToShowSource.asObservable();

	constructor() { }

	// Service message commands
	showMessage(message: FlashMessageInterface) {
		this.messagesToShowSource.next(message);
	}

}
export interface FlashMessageInterface {
	message: string;
	messageClass: string;
}
