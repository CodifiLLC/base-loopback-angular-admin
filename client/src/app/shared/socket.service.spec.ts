/* tslint:disable:no-unused-variable */

import {Subject} from 'rxjs/Subject';
import * as io from 'socket.io-client';
import { SocketService } from './socket.service';

describe('SocketService', () => {
	let dummySocket: {
		emit: jasmine.Spy,
		on: jasmine.Spy,
		removeListener: jasmine.Spy
	};
	let ioConnectSpy: jasmine.Spy;

	beforeEach(() => {
		// TestBed.configureTestingModule({
		// 	providers: [SocketService]
		// });

		dummySocket = {
			emit: jasmine.createSpy('emit'),
			on: jasmine.createSpy('on'),
			removeListener: jasmine.createSpy('removeListener')
		} as any;
		ioConnectSpy = spyOn(io, 'connect').and.returnValue(dummySocket);
	});

	// it('should ...', inject([SocketService], (service: SocketService) => {
	// 	expect(service).toBeTruthy();
	// }));
	it('should call io constructor', () => {
		const service = new SocketService();
		expect(service).toBeTruthy();
		expect(ioConnectSpy).toHaveBeenCalled();
		//expect(dummySocket.on).toHaveBeenCalled();
	});

	it('should call emit on joinChannel', () => {
		const service = new SocketService();

		//expect(dummySocket.on).toHaveBeenCalled();
		expect(dummySocket.emit).not.toHaveBeenCalled();

		//check first channel (make sure it doesn't resubscribe)
		const channelName = 'face';
		service.joinChannel(channelName);
		expect(dummySocket.emit).toHaveBeenCalledWith('join-channel', channelName);
		service.joinChannel(channelName);
		expect(dummySocket.emit.calls.count()).toBe(1); //expect it to not have been called again

		//check second channel (make sure it doesn't resubscribe)
		const channel2 = 'thing';
		service.joinChannel(channel2);
		expect(dummySocket.emit).toHaveBeenCalledWith('join-channel', channel2);
		service.joinChannel(channel2);
		expect(dummySocket.emit.calls.count()).toBe(2);
	});

	it('should call emit on leaveChannel', () => {
		const service = new SocketService();

		//make sure nothing has been called yet
		expect(dummySocket.emit).not.toHaveBeenCalled();

		//check first channel (make sure it doesn't resubscribe)
		const channelName = 'face';
		service.leaveChannel(channelName);
		//since we haven't joined this channel, there will be no emit
		expect(dummySocket.emit).not.toHaveBeenCalled();

		service.joinChannel(channelName);
		service.leaveChannel(channelName);
		expect(dummySocket.emit).toHaveBeenCalledWith('leave-channel', channelName);
	});

	it('should return correct subject for getSubjectForEvent', () => {
		const service = new SocketService();
		//let getSubjectForEvent = spyOn(service, 'getSubjectForEvent').and.callThrough();

		const eventName = 'test';
		expect(dummySocket.on).not.toHaveBeenCalled();
		const subj1 = service['getSubjectForEvent'](eventName);
		expect(dummySocket.on).toHaveBeenCalledWith(eventName, jasmine.any(Function));

		dummySocket.on.calls.reset();

		const subj2 = service['getSubjectForEvent'](eventName);
		expect(dummySocket.on).not.toHaveBeenCalled();
		expect(subj1).toBe(subj2);

		dummySocket.on.calls.reset();

		const subj3 = service['getSubjectForEvent']('testing');
		expect(dummySocket.on).toHaveBeenCalled();
		expect(subj1).not.toBe(subj3);
	});

	it('should subscribe to socket.on in getSubjectForEvent', () => {
		const service = new SocketService();

		const eventName = 'test';
		expect(dummySocket.on).not.toHaveBeenCalled();
		const returnedSubject = service['getSubjectForEvent'](eventName);
		expect(dummySocket.on).toHaveBeenCalled();
		const callback = dummySocket.on.calls.mostRecent().args[1];

		spyOn(returnedSubject, 'next');

		const testValue = 'test value';
		callback(testValue);
		expect(returnedSubject.next).toHaveBeenCalledWith({
			event: eventName,
			item: testValue
		});
	});

	it ('should return personal observable from watchEvent', () => {
		const subj = new Subject<any>();

		const service = new SocketService();

		spyOn(service, 'getSubjectForEvent').and.returnValue(subj);

		const obs = service.watchEvent('test');
		const values = [];
		const subscr = obs.subscribe((item) => {
			values.push(item);
		});

		subj.next(1);
		subj.next('t');

		expect(values).toEqual([1, 't']);

		subscr.unsubscribe();
	});

	it ('should return personal observable from watchEvent', () => {
		const eventName = 'event';

		const service = new SocketService();

		expect(dummySocket.removeListener).not.toHaveBeenCalled();
		const obs1 = service.watchEvent(eventName);
		const subscr = obs1.subscribe((item) => {});
		subscr.unsubscribe();

		expect(dummySocket.removeListener).toHaveBeenCalledWith(eventName);
	});

	it ('should return personal observable from watchEvent (only delete after last unsub)', () => {
		const eventName = 'event';

		const service = new SocketService();

		//expect no listeners to have been unsubscribed
		expect(dummySocket.removeListener).not.toHaveBeenCalled();

		//get first subscription
		const obs1 = service.watchEvent(eventName);
		const subscr1 = obs1.subscribe((item) => {});

		//get second subscription
		const obs2 = service.watchEvent(eventName);
		const subscr2 = obs1.subscribe((item) => {});

		//unsubscribe from the first and validate that we haven't removed listeners yet
		subscr1.unsubscribe();
		expect(dummySocket.removeListener).not.toHaveBeenCalled();

		//unsubscribe from the second and validate that we have removed listeners (as this was the last)
		subscr2.unsubscribe();
		expect(dummySocket.removeListener).toHaveBeenCalledWith(eventName);
	});
});
