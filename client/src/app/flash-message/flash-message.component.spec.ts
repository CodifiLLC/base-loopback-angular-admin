/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, empty } from 'rxjs';

import { FlashMessageComponent } from './flash-message.component';
import { FlashMessageService } from './flash-message.service';

describe('FlashMessageComponent', () => {
	let component: FlashMessageComponent;
	let fixture: ComponentFixture<FlashMessageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ FlashMessageComponent ],
			providers: [
				{provide: FlashMessageService, useValue: {
					messagesToShow$: empty(),
					showMessage: jasmine.createSpy('showMessage')
				}}
			]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FlashMessageComponent);
		component = fixture.componentInstance;

	});

	it('should create', () => {
		fixture.detectChanges();
		expect(component).toBeTruthy();
	});

	it('should subscribe to messagesToShow$ on init', () => {
		const flashMesageService = fixture.debugElement.injector.get(FlashMessageService);

		const knownMessage = {message: 'a', messageClass: '1'};
		//replace message stream with a known stream
		flashMesageService.messagesToShow$ = of(knownMessage);
		spyOn(flashMesageService.messagesToShow$, 'subscribe').and.callThrough();
		expect(flashMesageService.messagesToShow$.subscribe).not.toHaveBeenCalled();

		//stub the private message to make sure it was called
		const showMessageSpy = spyOn(component, 'showMessage');
		fixture.detectChanges();
		expect(flashMesageService.messagesToShow$.subscribe).toHaveBeenCalled();
		expect(showMessageSpy).toHaveBeenCalledWith(knownMessage);
	});

	it('should cycle through messages every 5 seconds', (done) => {
		//spyOn(component, 'ngOnInit'); //skip initialization
		jasmine.clock().uninstall();
		jasmine.clock().install();

		expect(component.currentMessage).toBeUndefined();

		const expectedMessages = [{message: 'test', messageClass: 'a'}, {message: 'test2', messageClass: 'b'}];

		//throw this in a try in case something goes wrong (I don't want the clock to crash the rest of the tests)
		try {
			component.showMessage(expectedMessages[0]);
			component.showMessage(expectedMessages[1]);
			expect(component.currentMessage).toEqual(expectedMessages[0]);

			jasmine.clock().tick(4500);
			expect(component.currentMessage).toEqual(expectedMessages[0]);

			jasmine.clock().tick(501);
			expect(component.currentMessage).toEqual(expectedMessages[1]);

			jasmine.clock().tick(5000);
			expect(component.currentMessage).toBeNull();
		} catch (err) {
			return fail('Something went wrong!!!');
		}
		jasmine.clock().uninstall();
		done();
	});

	it('should bind to div when has currentMessage', () => {
		let messageDiv;

		const knownMessage = {message: 'a', messageClass: '1'};

		fixture.detectChanges();
		messageDiv = fixture.debugElement.query(By.css('#flash-messenger'));
		expect(messageDiv).toBeFalsy();

		component.currentMessage = knownMessage;
		fixture.detectChanges();
		messageDiv = fixture.debugElement.query(By.css('#flash-messenger'));
		expect(messageDiv).toBeTruthy();
		expect(messageDiv.nativeElement.textContent.trim()).toBe(knownMessage.message);
		expect(messageDiv.nativeElement.className.split(' ')).toContain(knownMessage.messageClass);
	});
});
