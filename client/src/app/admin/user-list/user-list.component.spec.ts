/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from "rxjs";

import { CustomUser } from "../../shared/sdk/models";
import { CustomUserApi } from '../../shared/sdk/services';
import { UserListComponent } from './user-list.component';
import { FlashMessageService } from '../../flash-message/flash-message.service';

describe('UserListComponent', () => {

	const expectedUsers = [
		new CustomUser({id: 1, email: 'a@t.si', firstName: 'test', lastName: 'thing', password: ''}),
		new CustomUser({id: 2, email: 'b@t.si', firstName: 'thing', lastName: 'test', password: ''})
	]

	let component: UserListComponent;
	let fixture: ComponentFixture<UserListComponent>;
	let userApi: any;
	let flashMessageService: any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ UserListComponent ],
			providers: [
				{provide: CustomUserApi, useValue: {
					find: jasmine.createSpy('find'),
					deleteById: jasmine.createSpy('deleteById'),
					patchAttributes: jasmine.createSpy('patchAttributes'),
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
		fixture = TestBed.createComponent(UserListComponent);
		component = fixture.componentInstance;
		// fixture.detectChanges();
		userApi = fixture.debugElement.injector.get(CustomUserApi);
		flashMessageService = fixture.debugElement.injector.get(FlashMessageService);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should lookup users on load', () => {
		expect(userApi.find).not.toHaveBeenCalled();

		userApi.find.and.returnValue(Observable.of(expectedUsers));

		fixture.detectChanges();
		expect(userApi.find).toHaveBeenCalled();
		expect(component.userList).toEqual(expectedUsers);
	});

	it('should show error when user lookup fails', () => {
		expect(userApi.find).not.toHaveBeenCalled();
		const expectedErr = "Test error"

		userApi.find.and.returnValue(Observable.throw(new Error(expectedErr)));

		fixture.detectChanges();
		expect(userApi.find).toHaveBeenCalled();
		expect(component.userList).toBeUndefined();
		expect(flashMessageService.showMessage).toHaveBeenCalledWith({message: expectedErr, messageClass: 'danger'});
	});

	it('should bind users to the frontend', () => {
		userApi.find.and.returnValue(Observable.of(expectedUsers));

		fixture.detectChanges();
		expect(userApi.find).toHaveBeenCalled();

		const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));
		expect(rows.length).toBe(2);
		const cols = rows[0].queryAll(By.css('td'))
		expect(cols.length).toBe(5);
		expect(cols[0].nativeElement.textContent).toBe(expectedUsers[0].id.toString())
		expect(cols[1].nativeElement.textContent).toBe(expectedUsers[0].firstName)
		expect(cols[2].nativeElement.textContent).toBe(expectedUsers[0].lastName)
		expect(cols[3].nativeElement.textContent).toBe(expectedUsers[0].email)
	});

	it('should call search when form is submitted', () => {
		spyOn(component, 'ngOnInit'); //skip init search

		fixture.detectChanges();
		const form = fixture.debugElement.query(By.css('form'));
		spyOn(component, 'search');

		//button.nativeElement.click();
		form.triggerEventHandler('submit', null);
		fixture.detectChanges();
		expect(component.search).toHaveBeenCalled();
	});

	it('should search API for users on search', () => {
		expect(userApi.find).not.toHaveBeenCalled();

		userApi.find.and.returnValue(Observable.of(expectedUsers));

		component.searchString = "test";
		component.search();

		const searchPattern = `%${component.searchString}%`;
		expect(userApi.find).toHaveBeenCalledWith({where: {
			or: [
				{firstName: {like: searchPattern}},
				{lastName: {like: searchPattern}},
				{email: {like: searchPattern}}
			]
		}});
		expect(component.userList).toEqual(expectedUsers);
		expect(component.displayError).toBeNull();
	});

	it('should call deleteUser on delete', () => {
		spyOn(component, 'ngOnInit'); //skip init search

		component.userList = expectedUsers;
		fixture.detectChanges();
		spyOn(component, 'deleteUser');

		expect(component.deleteUser).not.toHaveBeenCalled();
		const firstDelete = fixture.debugElement.query(By.css('table tbody tr td a[title="Delete"]'));
		firstDelete.triggerEventHandler('click', null);
		expect(component.deleteUser).toHaveBeenCalledWith(expectedUsers[0]);
	});

	it('should call CustomUserApi.deleteById on delete (confirm)', () => {
		spyOn(window, 'confirm').and.returnValue(true);
		component.userList = expectedUsers.slice();

		expect(userApi.deleteById).not.toHaveBeenCalled();

		userApi.deleteById.and.returnValue(Observable.of({}));

		component.deleteUser(expectedUsers[0]);

		expect(userApi.deleteById).toHaveBeenCalledWith(expectedUsers[0].id);
		expect(component.userList.length).toEqual(1);
		expect(component.userList[0].id).toBe(expectedUsers[1].id);
		expect(component.displayError).toBeNull();
		expect(flashMessageService.showMessage).toHaveBeenCalledWith({message: 'Deleted User', messageClass: 'success'});
	});

	it('should call CustomUserApi.deleteById on delete and show message on error', () => {
		spyOn(window, 'confirm').and.returnValue(true);
		component.userList = expectedUsers.slice();

		expect(userApi.deleteById).not.toHaveBeenCalled();

		const expectedError = {message: 'failure'};
		userApi.deleteById.and.returnValue(Observable.throw(expectedError));

		component.deleteUser(expectedUsers[0]);

		expect(userApi.deleteById).toHaveBeenCalledWith(expectedUsers[0].id);
		expect(component.userList.length).toEqual(2);
		expect(flashMessageService.showMessage).toHaveBeenCalledWith({message: expectedError.message, messageClass: 'danger'})
	});

	it('should not call CustomUserApi.deleteById on delete (cancelled)', () => {
		spyOn(window, 'confirm').and.returnValue(false);
		component.userList = expectedUsers.slice();

		expect(userApi.deleteById).not.toHaveBeenCalled();

		userApi.deleteById.and.returnValue(Observable.of({}));

		component.deleteUser(expectedUsers[0]);

		expect(userApi.deleteById).not.toHaveBeenCalled();
		expect(component.userList.length).toEqual(2);
	});


	it('should call resetPassword on reset', () => {
		spyOn(component, 'ngOnInit'); //skip init search

		component.userList = expectedUsers;
		fixture.detectChanges();
		spyOn(component, 'resetPassword');

		expect(component.resetPassword).not.toHaveBeenCalled();
		const firstDelete = fixture.debugElement.query(By.css('table tbody tr td a[title="Reset Password"]'));
		firstDelete.triggerEventHandler('click', null);
		expect(component.resetPassword).toHaveBeenCalledWith(expectedUsers[0]);
	});

	it('should call CustomUserApi.patchAttributes on resetPassword (good password)', () => {
		const expectedPassword = "val";
		spyOn(component, 'getRandomPassword').and.returnValue(expectedPassword);

		expect(userApi.patchAttributes).not.toHaveBeenCalled();

		userApi.patchAttributes.and.returnValue(Observable.of({}));

		component.resetPassword(expectedUsers[0]);

		expect(userApi.patchAttributes).toHaveBeenCalledWith(expectedUsers[0].id, {password: expectedPassword});
		expect(flashMessageService.showMessage).toHaveBeenCalledWith({message: "Password reset successfully", messageClass: 'success'})
	});

	it('should call CustomUserApi.deleteById on delete and show message on error', () => {
		spyOn(component, 'getRandomPassword').and.returnValue('sdf')

		expect(userApi.patchAttributes).not.toHaveBeenCalled();

		userApi.patchAttributes.and.returnValue(Observable.throw({message: 'failure'}));

		component.resetPassword(expectedUsers[0]);

		expect(userApi.patchAttributes).toHaveBeenCalled();
		expect(flashMessageService.showMessage).toHaveBeenCalledWith({message: "Password reset failed", messageClass: 'danger'})
	});
});
