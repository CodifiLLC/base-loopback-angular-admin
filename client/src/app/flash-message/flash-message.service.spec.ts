/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FlashMessageService } from './flash-message.service';

describe('FlashMessageService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [FlashMessageService]
		});
	});

	it('should ...', inject([FlashMessageService], (service: FlashMessageService) => {
		expect(service).toBeTruthy();
	}));
	it('should pass messages to event stream', inject([FlashMessageService], (service: FlashMessageService) => {
		const receivedMessages = [];
		const expectedMessages = [{message: "test", messageClass: 'a'}, {message: "test2", messageClass: 'b'}]
		let subscr = service.messagesToShow$.subscribe(message => {
			receivedMessages.push(message);
		});
		service.showMessage(expectedMessages[0]);
		expect(receivedMessages.length).toBe(1);
		expect(receivedMessages[0]).toEqual(expectedMessages[0]);

		service.showMessage(expectedMessages[1]);
		expect(receivedMessages.length).toBe(2);
		expect(receivedMessages[1]).toEqual(expectedMessages[1]);

		subscr.unsubscribe();
	}));
});
