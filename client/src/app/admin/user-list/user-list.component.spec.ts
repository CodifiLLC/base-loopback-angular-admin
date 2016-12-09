/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from "rxjs";

import { CustomUser } from "../../shared/sdk/models";
import { CustomUserApi } from '../../shared/sdk/services';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {

	const expectedUsers = [
		new CustomUser({id: 1, email: 'a@t.si', firstName: 'test', lastName: 'thing', password: ''}),
		new CustomUser({id: 2, email: 'b@t.si', firstName: 'thing', lastName: 'test', password: ''})
	]

	let component: UserListComponent;
	let fixture: ComponentFixture<UserListComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ UserListComponent ],
			providers: [
				{provide: CustomUserApi, useValue: {
					find: jasmine.createSpy('find'),
					deleteById: jasmine.createSpy('deleteById'),
					patchAttributes: jasmine.createSpy('patchAttributes'),
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
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('show show success message for 5 seconds on showSuccessMessage("")', () => {
		jasmine.clock().uninstall();
		jasmine.clock().install();
		expect(component.displaySuccess).toBeNull();
		const message = "message";
		component.showSuccessMessage(message);
		expect(component.displaySuccess).toBe(message);
		jasmine.clock().tick(4500);
		expect(component.displaySuccess).toBe(message);
		jasmine.clock().tick(501);
		expect(component.displaySuccess).toBeNull();
		jasmine.clock().uninstall();
	});

	it('should show success message when displaySuccess property is filled', () => {
		spyOn(component, 'ngOnInit'); //skip init search
		const message = "message";
		component.displaySuccess = message;
		fixture.detectChanges();

		let messageDiv = fixture.debugElement.query(By.css('div.alert-success'));
		expect(messageDiv).toBeTruthy();
		expect(messageDiv.nativeElement.textContent.trim()).toBe(message);

		component.displaySuccess = null;
		fixture.detectChanges();
		messageDiv = fixture.debugElement.query(By.css('div.alert-success'));
		expect(messageDiv).toBeFalsy();
	});

	it('should lookup users on load', () => {
		const userApi = fixture.debugElement.injector.get(CustomUserApi);

		expect(userApi.find).not.toHaveBeenCalled();

		userApi.find.and.returnValue(Observable.of(expectedUsers));

		fixture.detectChanges();
		expect(userApi.find).toHaveBeenCalled();
		expect(component.userList).toEqual(expectedUsers);
		expect(component.displayError).toBeNull();
	});

	it('should show error when user lookup fails', () => {
		const userApi = fixture.debugElement.injector.get(CustomUserApi);

		expect(userApi.find).not.toHaveBeenCalled();
		const expectedErr = "Test error"

		userApi.find.and.returnValue(Observable.throw(new Error(expectedErr)));

		fixture.detectChanges();
		expect(userApi.find).toHaveBeenCalled();
		expect(component.userList).toBeUndefined();
		expect(component.displayError).toBe(expectedErr);
	});

	it('should bind users to the frontend', () => {
		const userApi = fixture.debugElement.injector.get(CustomUserApi);

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
		const userApi = fixture.debugElement.injector.get(CustomUserApi);

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
		const userApi = fixture.debugElement.injector.get(CustomUserApi);

		expect(userApi.deleteById).not.toHaveBeenCalled();

		userApi.deleteById.and.returnValue(Observable.of({}));

		component.deleteUser(expectedUsers[0]);

		expect(userApi.deleteById).toHaveBeenCalledWith(expectedUsers[0].id);
		expect(component.userList.length).toEqual(1);
		expect(component.userList[0].id).toBe(expectedUsers[1].id);
		expect(component.displayError).toBeNull();
	});

	it('should call CustomUserApi.deleteById on delete and show message on error', () => {
		spyOn(window, 'confirm').and.returnValue(true);
		component.userList = expectedUsers.slice();
		const userApi = fixture.debugElement.injector.get(CustomUserApi);

		expect(userApi.deleteById).not.toHaveBeenCalled();

		const expectedError = {message: 'failure'};
		userApi.deleteById.and.returnValue(Observable.throw(expectedError));

		component.deleteUser(expectedUsers[0]);

		expect(userApi.deleteById).toHaveBeenCalledWith(expectedUsers[0].id);
		expect(component.userList.length).toEqual(2);
		expect(component.displayError).toBe(expectedError.message);
	});

	it('should not call CustomUserApi.deleteById on delete (cancelled)', () => {
		spyOn(window, 'confirm').and.returnValue(false);
		component.userList = expectedUsers.slice();
		const userApi = fixture.debugElement.injector.get(CustomUserApi);

		expect(userApi.deleteById).not.toHaveBeenCalled();

		userApi.deleteById.and.returnValue(Observable.of({}));

		component.deleteUser(expectedUsers[0]);

		expect(userApi.deleteById).not.toHaveBeenCalled();
		expect(component.userList.length).toEqual(2);
		expect(component.displayError).toBeNull();
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
		let successMessageFunc = spyOn(component, 'showSuccessMessage');
		const expectedPassword = "val";
		spyOn(component, 'getRandomPassword').and.returnValue(expectedPassword);

		const userApi = fixture.debugElement.injector.get(CustomUserApi);

		expect(userApi.patchAttributes).not.toHaveBeenCalled();

		userApi.patchAttributes.and.returnValue(Observable.of({}));

		component.resetPassword(expectedUsers[0]);

		expect(userApi.patchAttributes).toHaveBeenCalledWith(expectedUsers[0].id, {password: expectedPassword});
		expect(successMessageFunc).toHaveBeenCalledWith("Password reset successfully");
		expect(component.displayError).toBeNull();
	});

	it('should call CustomUserApi.deleteById on delete and show message on error', () => {
		spyOn(component, 'getRandomPassword').and.returnValue('sdf')

		const userApi = fixture.debugElement.injector.get(CustomUserApi);

		expect(userApi.patchAttributes).not.toHaveBeenCalled();

		userApi.patchAttributes.and.returnValue(Observable.throw({message: 'failure'}));

		component.resetPassword(expectedUsers[0]);

		expect(userApi.patchAttributes).toHaveBeenCalled();
		expect(component.displayError).toBe("Password reset failed");
	});
});
