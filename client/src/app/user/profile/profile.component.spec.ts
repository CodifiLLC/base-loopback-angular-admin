/* tslint:disable:no-unused-variable */
import { Observable, empty, of, throwError } from 'rxjs';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { ProfileComponent } from './profile.component';
import { CustomUserApi, LoopBackAuth } from '../../shared/sdk/services';
import { CustomUser } from '../../shared/sdk/models';
import { FlashMessageService } from '../../flash-message/flash-message.service';

describe('ProfileComponent', () => {
	let component: ProfileComponent;
	let fixture: ComponentFixture<ProfileComponent>;
	const expectedUser = {id: 1, email: 'test@t.com', firstName: 'test', lastName: 'thing', password: 'test1234'} as CustomUser;

	let activatedRoute: any;
	let authApi: any;
	let flashService: any;
	let userApi: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ ProfileComponent ],
			providers: [
				{provide: CustomUserApi, useValue: {
					patchAttributes: jasmine.createSpy('patchAttributes'),
					login: jasmine.createSpy('login'),
					getCurrentId: jasmine.createSpy('getCurrentId'),
					findById: jasmine.createSpy('findById').and.returnValue(empty())
				}},
				{provide: LoopBackAuth, useValue: {
					setUser: jasmine.createSpy('setUser'),
					save: jasmine.createSpy('save'),
					getToken: jasmine.createSpy('getToken').and.returnValue({}),
					getCurrentUserData: jasmine.createSpy('getCurrentUserData').and.returnValue({})
				}},
				{provide: Router, useValue: {
					navigateByUrl: jasmine.createSpy('navigateByUrl')
				}},
				{provide: ActivatedRoute, useValue: {
					params: of({id: 1})
				}},
				{provide: Location, useValue: {
					back: jasmine.createSpy('back')
				}},
				{provide: FlashMessageService, useValue: {
					showMessage: jasmine.createSpy('showMessage')
				}}
			],
			imports: [FormsModule, RouterTestingModule.withRoutes([]), TabsModule.forRoot() ]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ProfileComponent);
		component = fixture.componentInstance;

		activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);
		authApi = fixture.debugElement.injector.get(LoopBackAuth);
		flashService = fixture.debugElement.injector.get(FlashMessageService);
		userApi = fixture.debugElement.injector.get(CustomUserApi);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});


	it('should call findById in ngOnInit (params)', () => {
		userApi.getCurrentId.and.returnValue(2);
		userApi.findById.and.returnValue(of(expectedUser));
		activatedRoute.params = of({id: 1});

		expect(component.user.id).toBeUndefined();
		fixture.detectChanges();
		expect(userApi.getCurrentId).not.toHaveBeenCalled();
		expect(userApi.findById).toHaveBeenCalledWith(1);
		expect(component.user.id).toBe(expectedUser.id);
		expect(component.user).toEqual(expectedUser);
	});

	it('should call findById in ngOnInit (no params)', () => {
		activatedRoute.params = of({});
		userApi.getCurrentId.and.returnValue(1);
		userApi.findById.and.returnValue(of(expectedUser));

		expect(component.user.id).toBeUndefined();
		fixture.detectChanges();
		expect(userApi.getCurrentId).toHaveBeenCalled();
		expect(userApi.findById).toHaveBeenCalledWith(1);
		expect(component.user.id).toBe(expectedUser.id);
		expect(component.user).toEqual(expectedUser);
	});

	it('should call saveUser when form is submitted', () => {
		fixture.detectChanges();
		const form = fixture.debugElement.query(By.css('form'));
		spyOn(component, 'saveUser');

		form.triggerEventHandler('submit', null);
		fixture.detectChanges();
		expect(component.saveUser).toHaveBeenCalled();
	});

	it('should update account information', () => {
		spyOn(component, 'ngOnInit');
		component.user = expectedUser;
		fixture.detectChanges();

		userApi.patchAttributes.and.returnValue(of(expectedUser));
		expect(userApi.patchAttributes).not.toHaveBeenCalled();
		expect(authApi.save).not.toHaveBeenCalled();

		userApi.getCurrentId.and.returnValue(expectedUser.id);

		component.saveUser();
		expect(userApi.patchAttributes).toHaveBeenCalled();
		expect(flashService.showMessage).toHaveBeenCalledWith({message: 'Profile Saved!', messageClass: 'success'});
		expect(authApi.save).toHaveBeenCalled();

		userApi.getCurrentId.and.returnValue(expectedUser.id + 1);
		component.saveUser();
		expect(userApi.patchAttributes.calls.count()).toBe(2);
		expect(flashService.showMessage.calls.count()).toBe(2);
		expect(authApi.save.calls.count()).toBe(1);
	});

	it('should not update account if close button is pushed', () => {
		fixture.detectChanges();
		const cancelButton = fixture.debugElement.query(By.css('.btn-outline-secondary'));
		spyOn(component, 'saveUser');
		spyOn(component, 'cancel');

		cancelButton.nativeElement.click();
		fixture.detectChanges();
		expect(component.saveUser).not.toHaveBeenCalled();
		expect(component.cancel).toHaveBeenCalled();
	});
	it('should not update account if close button is pushed', () => {
		const locat = fixture.debugElement.injector.get(Location);

		component.cancel();
		expect(locat.back).toHaveBeenCalled();
	});

	it('should update password on click', () => {
		component.user = expectedUser;
		component.loginInfo.email = expectedUser.email;
		component.loginInfo.password = 'test1234';
		component.user.password = 'bob222';
		component.confirmPassword = 'bob222';

		fixture.detectChanges();

		userApi.login.and.returnValue(
			of({user: {id: 1, email: 't@t.si', firstname: 'test', lastname: 'thing'}})
		);
		userApi.patchAttributes.and.returnValue(of(expectedUser));
		userApi.getCurrentId.and.returnValue(expectedUser.id);

		expect(userApi.login).not.toHaveBeenCalled();
		expect(userApi.patchAttributes).not.toHaveBeenCalled();
		expect(authApi.save).not.toHaveBeenCalled();

		component.savePassword();
		expect(userApi.login).toHaveBeenCalled();
		expect(userApi.patchAttributes).toHaveBeenCalled();
		expect(flashService.showMessage).toHaveBeenCalledWith({message: 'Password changed successfully.', messageClass: 'success'});
		expect(authApi.save).toHaveBeenCalled();
	});

	it('should not update password if password is incorrect', () => {
		component.user = expectedUser;
		component.loginInfo.email = expectedUser.email;
		component.loginInfo.password = 'wrong';
		component.user.password = 'bob222';
		component.confirmPassword = 'bob222';

		fixture.detectChanges();

		userApi.login.and.returnValue(throwError('test error'));
		userApi.patchAttributes.and.returnValue(throwError('test error'));
		userApi.getCurrentId.and.returnValue(expectedUser.id);

		expect(userApi.login).not.toHaveBeenCalled();
		expect(userApi.patchAttributes).not.toHaveBeenCalled();
		expect(authApi.save).not.toHaveBeenCalled();

		component.savePassword();
		expect(userApi.login).toHaveBeenCalled();
		expect(userApi.patchAttributes).not.toHaveBeenCalled();
		expect(flashService.showMessage).toHaveBeenCalledWith({message: 'Your current password is incorrect', messageClass: 'danger'});
		expect(authApi.save).not.toHaveBeenCalled();
	});

});
