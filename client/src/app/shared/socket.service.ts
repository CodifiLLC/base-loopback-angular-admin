import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { LoopBackConfig } from './sdk/lb.config';

import * as io from 'socket.io-client';

export class SocketMessage {
	event: string;
	item: any;
};

export class SocketService {
	//set up an array to keep track of what channels are being listened to
	private channelList: string[] = [];

	//set up a map to hold references to listeners for given events
	private eventMap = new Map<string, {
		count: number,
		subject: Subject<SocketMessage>
	}>();


	private socket: SocketIOClient.Socket;

	constructor() {
		//this.socket = io(LoopBackConfig.getPath());
		this.socket = io.connect(LoopBackConfig.getPath());
		// this.socket.on('connect', (socket: SocketIOClient.Emitter) => {
		// 	console.log('connected!!!');
		// });
	}

	watchEvent (eventName: string): Observable<SocketMessage> {
		//console.log('request to watch', eventName, this.eventMap.get(eventName));
		const subject = this.getSubjectForEvent(eventName);

		// Return observable which follows the events on our subject (and updates reference counts on close)
		return Observable.create((observer: any) => {
			//pass through any information from the source subject
			subject.subscribe(item => observer.next(item));

			//return the function that will be called if this observable is closed
			return () => {
				if (this.eventMap.has(eventName)) {
					const eventSubscription = this.eventMap.get(eventName);
					eventSubscription.count--;

					//if all listeners for this event have been closed, get rid of the listener
					if (eventSubscription.count === 0) {
						this.eventMap.delete(eventName);
						this.socket.removeListener(eventName);
					} else {
						//if there are still valid references, then just update the reference count
						this.eventMap.set(eventName, eventSubscription);
					}
				}
			};
		});
	}

	private getSubjectForEvent(eventName: string): Subject<SocketMessage> {

		let subject: Subject<SocketMessage>;

		if (this.eventMap.has(eventName)) {
			//if this event exists in our listener cache, grab it and update the reference count
			const subscr = this.eventMap.get(eventName);
			subscr.count++;
			this.eventMap.set(eventName, subscr);

			subject = subscr.subject;
		} else {
			//if we don't have a listener cached, create a new subject and push it in cache
			subject = new Subject<SocketMessage>();
			this.eventMap.set(eventName, {count: 1, subject: subject});

			//tell socket listen for this event and publish on our new subject
			this.socket.on(eventName, (item: any) => {
				subject.next({ event: eventName, item: item });
			});
		}

		return subject;
	}

	joinChannel (channelName: string) {
		//if we are already listening to this channel, ignore this request
		if (this.channelList.indexOf(channelName) > -1) return;

		this.channelList.push(channelName);
		this.socket.emit('join-channel', channelName);
	}

	leaveChannel (channelName: string) {
		//if we aren't listening to this channel, ignore this request
		if (this.channelList.indexOf(channelName) === -1) return;

		this.channelList.splice(this.channelList.indexOf(channelName), 1);
		this.socket.emit('leave-channel', channelName);
	}
}
