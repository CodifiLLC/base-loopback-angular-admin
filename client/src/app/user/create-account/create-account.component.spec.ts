/* tslint:disable:no-unused-variable */
import { Observable, of, throwError } from 'rxjs';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { CustomUserApi } from '../../shared/sdk/services';
import { CreateAccountComponent } from './create-account.component';
import { FlashMessageService } from '../../flash-message/flash-message.service';

describe('CreateAccountComponent', () => {
	let component: CreateAccountComponent;
	let fixture: ComponentFixture<CreateAccountComponent>;

	let flashService: any;
	let router: any;
	let userApi: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ CreateAccountComponent ],
			providers: [
				{provide: CustomUserApi, useValue: {
					create: jasmine.createSpy('create')
				}},
				{provide: Router, useValue: {
					navigateByUrl: jasmine.createSpy('navigateByUrl')
				}},
				{provide: FlashMessageService, useValue: {
					showMessage: jasmine.createSpy('showMessage')
				}}
			],
			imports: [FormsModule, RouterTestingModule.withRoutes([]) ]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateAccountComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		flashService = fixture.debugElement.injector.get(FlashMessageService);
		router = fixture.debugElement.injector.get(Router);
		userApi = fixture.debugElement.injector.get(CustomUserApi);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call createUser when form is submitted', () => {
		fixture.detectChanges();
		const form = fixture.debugElement.query(By.css('form'));
		spyOn(component, 'createUser');

		form.triggerEventHandler('submit', null);
		fixture.detectChanges();
		expect(component.createUser).toHaveBeenCalled();
	});

	it('should create a new account', () => {
		userApi.create.and.returnValue(of(
			{id: 1, email: 'test@t.com', firstname: 'test', lastname: 'thing', password: 'test1234'}
		));

		expect(userApi.create).not.toHaveBeenCalled();
		component.createUser();
		expect(userApi.create).toHaveBeenCalled();
		expect(flashService.showMessage).toHaveBeenCalledWith(
			{message: 'Account created successfully', messageClass: 'success'}
		);
		expect(router.navigateByUrl).toHaveBeenCalledWith('/');
	});

	it('should show error when email already in use', () => {
		userApi.create.and.returnValue(throwError('test error'));

		expect(userApi.create).not.toHaveBeenCalled();
		component.createUser();
		expect(userApi.create).toHaveBeenCalled();
		expect(flashService.showMessage).toHaveBeenCalledWith({message: 'Email already in use', messageClass: 'danger'});
		expect(router.navigateByUrl).not.toHaveBeenCalled();
	});
});
