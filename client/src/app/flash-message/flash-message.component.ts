import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FlashMessageInterface, FlashMessageService } from './flash-message.service';

@Component({
	selector: 'app-flash-message',
	template: `<div *ngIf="currentMessage" [ngClass]="currentMessage.messageClass" class="cssFade" id="flash-messenger">
		{{currentMessage.message}}
	</div>`,
	styleUrls: ['./flash-message.component.less']
})
export class FlashMessageComponent implements OnInit, OnDestroy {
	currentMessage: FlashMessageInterface;

	private messages: FlashMessageInterface[] = [];  // message queue

	private timeout: number = null;
	private eventSubscription: Subscription;

	constructor(private flashMessageService: FlashMessageService) { }

	ngOnInit() {
		this.eventSubscription = this.flashMessageService.messagesToShow$.subscribe(message => {
			this.showMessage(message);
		});
	}

	ngOnDestroy() {
		if (this.eventSubscription) {
			this.eventSubscription.unsubscribe();
		}
	}

	showMessage(message: FlashMessageInterface) {
		// If there are messages on the queue, check to make sure that
		//  the last message on the queue isn't the same as the current message.
		//  If they are the same, do not push the current message. This is
		//  to prevent the same message from being added to the stack boundlessly
		//
		if (this.messages.length > 0) {
			const lastMessage = this.messages[this.messages.length - 1];

			if (lastMessage.message !== message.message || lastMessage.messageClass !== message.messageClass) {
				this.messages.push(message);
			}
		} else {
			// There are no messages on queue, so just queue it immediately
			this.messages.push(message);

			if (!this.timeout) {
				this.getNextMessage();
			}
		}
	}

	private getNextMessage() {
		// Base case: If there are no more messages on the queue, flush values, end recursion
		if (this.messages.length === 0) {
			this.currentMessage = null;
			this.timeout = null;
		} else {
			// There are still messages on the queue.
			//  Display the next message, remove it from the queue,
			//  and call function again after 5 seconds
			this.currentMessage = this.messages.splice(0, 1)[0];

			this.timeout = window.setTimeout(() => {
				this.getNextMessage();
			}, 5000);
		}
	}
}
