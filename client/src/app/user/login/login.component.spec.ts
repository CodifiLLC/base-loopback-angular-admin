import {Observable} from 'rxjs/Rx';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FlashMessageService } from '../../flash-message/flash-message.service';
import { LoginComponent } from './login.component';
import { CustomUserApi, LoopBackAuth } from '../../shared/sdk/services';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;

	let authApi: any;
	let flashService: any;
	let userApi: any;
	let router: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ LoginComponent ],
			providers: [
				{provide: CustomUserApi, useValue: {
					login: jasmine.createSpy('login'),
					getRoles: jasmine.createSpy('getRoles')
				}},
				{provide: LoopBackAuth, useValue: {
					setUser: jasmine.createSpy('setUser'),
					save: jasmine.createSpy('save')
				}},
				{provide: Router, useValue: {
					navigateByUrl: jasmine.createSpy('navigateByUrl')
				}},
				{provide: FlashMessageService, useValue: {
					showMessage: jasmine.createSpy('showMessage')
				}}
			],
			imports: [FormsModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		authApi = fixture.debugElement.injector.get(LoopBackAuth);
		flashService = fixture.debugElement.injector.get(FlashMessageService);
		userApi = fixture.debugElement.injector.get(CustomUserApi);
		router = fixture.debugElement.injector.get(Router);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call login when form is submitted', () => {
		fixture.detectChanges();
		const form = fixture.debugElement.query(By.css('form'));
		spyOn(component, 'login');

		//button.nativeElement.click();
		form.triggerEventHandler('submit', null);
		fixture.detectChanges();
		expect(component.login).toHaveBeenCalled();
	});

	it('should call login on click', () => {

		userApi.login.and.returnValue(Observable.of({user: {id: 1, email: 't@t.si', firstname: 'test', lastname: 'thing'}}));
		userApi.getRoles.and.returnValue(Observable.of({id: 1}));

		expect(userApi.login).not.toHaveBeenCalled();
		component.login();
		expect(userApi.login).toHaveBeenCalled();
		expect(userApi.getRoles).toHaveBeenCalledWith(1);
		expect(flashService.showMessage).toHaveBeenCalledWith({message: 'Logged in successfully', messageClass: 'success'});
		expect(router.navigateByUrl).toHaveBeenCalledWith('/');
		expect(authApi.setUser).toHaveBeenCalled();
		expect(authApi.save).toHaveBeenCalled();
	});

	it('should show error on failed login', () => {

		userApi.login.and.returnValue(Observable.throw('test error'));

		expect(userApi.login).not.toHaveBeenCalled();
		component.login();
		expect(userApi.login).toHaveBeenCalled();
		expect(flashService.showMessage).toHaveBeenCalledWith({message: 'Invalid Login', messageClass: 'danger'});
		expect(router.navigateByUrl).not.toHaveBeenCalled();
	});
});
