/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SocketService } from './socket.service';

describe('FlashMessageService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [SocketService]
		});
	});

	it('should ...', inject([SocketService], (service: SocketService) => {
		expect(service).toBeTruthy();
	}));

});
