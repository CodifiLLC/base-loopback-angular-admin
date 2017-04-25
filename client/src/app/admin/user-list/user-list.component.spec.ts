/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { CustomUser, Role } from '../../shared/sdk/models';
import { CustomUserApi, RoleMappingApi, RoleApi } from '../../shared/sdk/services';
import { UserListComponent } from './user-list.component';
import { FlashMessageService } from '../../flash-message/flash-message.service';
import { FlashMessageHelper } from '../../flash-message/flash-message.helper';

describe('UserListComponent', () => {

	const expectedUsers = [
		new CustomUser({id: 1, email: 'a@t.si', firstName: 'test', lastName: 'thing', password: ''}),
		new CustomUser({id: 2, email: 'b@t.si', firstName: 'thing', lastName: 'test', password: ''})
	];

	let component: UserListComponent;
	let fixture: ComponentFixture<UserListComponent>;
	let flashHelper: FlashMessageHelper;
	let userApi: any;
	let roleApi: any;
	let roleMappingApi: any;
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
				{provide: RoleApi, useValue: {
					findOne: jasmine.createSpy('findOne').and.returnValue(Observable.of({}))
				}},
				{provide: RoleMappingApi, useValue: {
					create: jasmine.createSpy('create').and.returnValue(Observable.empty()),
					deleteById: jasmine.createSpy('deleteById').and.returnValue(Observable.empty()),
					findOne: jasmine.createSpy('findOne').and.returnValue(Observable.of({}))
				}},
				{provide: FlashMessageService, useValue: {
					showMessage: jasmine.createSpy('showMessage')
				}}
			],
			imports: [FormsModule, RouterTestingModule.withRoutes([])]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UserListComponent);
		component = fixture.componentInstance;
		// fixture.detectChanges();
		userApi = fixture.debugElement.injector.get(CustomUserApi);
		roleMappingApi = fixture.debugElement.injector.get(RoleMappingApi);
		roleApi = fixture.debugElement.injector.get(RoleApi);
		flashMessageService = fixture.debugElement.injector.get(FlashMessageService);
		flashHelper = new FlashMessageHelper(flashMessageService);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should lookup users on load', () => {
		expect(userApi.find).not.toHaveBeenCalled();
		expect(roleApi.findOne).not.toHaveBeenCalled();

		userApi.find.and.returnValue(Observable.of(expectedUsers));

		fixture.detectChanges();
		expect(userApi.find).toHaveBeenCalled();
		expect(component.userList).toEqual(expectedUsers);
		expect(roleApi.findOne).toHaveBeenCalled();
	});

	it('should show error when user lookup fails', () => {
		expect(userApi.find).not.toHaveBeenCalled();
		expect(roleApi.findOne).not.toHaveBeenCalled();
		const expectedErr = 'Test error';

		userApi.find.and.returnValue(Observable.throw(new Error(expectedErr)));

		fixture.detectChanges();
		expect(userApi.find).toHaveBeenCalled();
		expect(component.userList).toBeUndefined();
		flashHelper.expectFailure(expectedErr);
		expect(roleApi.findOne).toHaveBeenCalled();
	});

	it('should bind users to the frontend', () => {
		userApi.find.and.returnValue(Observable.of(expectedUsers));

		fixture.detectChanges();
		expect(userApi.find).toHaveBeenCalled();

		const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));
		expect(rows.length).toBe(2);
		const cols = rows[0].queryAll(By.css('td'));
		expect(cols.length).toBe(5);
		expect(cols[0].nativeElement.textContent).toBe(expectedUsers[0].id.toString());
		expect(cols[1].nativeElement.textContent).toBe(expectedUsers[0].firstName);
		expect(cols[2].nativeElement.textContent).toBe(expectedUsers[0].lastName);
		expect(cols[3].nativeElement.textContent).toBe(expectedUsers[0].email);
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

		component.searchString = 'test';
		component.search();

		const searchPattern = `%${component.searchString}%`;
		expect(userApi.find).toHaveBeenCalledWith({where: {
			or: [
				{firstName: {like: searchPattern}},
				{lastName: {like: searchPattern}},
				{email: {like: searchPattern}}
			]
		}, include: 'roles'});
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
		flashHelper.expectSuccess('Deleted User');
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
		flashHelper.expectFailure(expectedError.message);
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
		const expectedPassword = 'val';
		spyOn(component, 'getRandomPassword').and.returnValue(expectedPassword);

		expect(userApi.patchAttributes).not.toHaveBeenCalled();

		userApi.patchAttributes.and.returnValue(Observable.of({}));

		component.resetPassword(expectedUsers[0]);

		expect(userApi.patchAttributes).toHaveBeenCalledWith(expectedUsers[0].id, {password: expectedPassword});
		flashHelper.expectSuccess('Password reset successfully');
	});

	it('should call CustomUserApi.deleteById on delete and show message on error', () => {
		spyOn(component, 'getRandomPassword').and.returnValue('sdf');

		expect(userApi.patchAttributes).not.toHaveBeenCalled();

		userApi.patchAttributes.and.returnValue(Observable.throw({message: 'failure'}));

		component.resetPassword(expectedUsers[0]);

		expect(userApi.patchAttributes).toHaveBeenCalled();
		flashHelper.expectFailure('Password reset failed');
	});

	it('should check roles for userIsAdmin', () => {
		component.adminRole = new Role({id: 99, name: 'adminTest'});

		const user = new CustomUser({id: 1, firstName: '1', lastName: '2', email: 'a', password: 'b'});

		//expect no roles to be false
		expect(component.userIsAdmin(user)).toBeFalsy();

		//expect empty roles to be false
		user.roles = [];
		expect(component.userIsAdmin(user)).toBeFalsy();

		//expect wrong roles to be false
		user.roles = [new Role({id: 2, name: 'face'})];
		expect(component.userIsAdmin(user)).toBeFalsy();

		user.roles.push(new Role({id: 99, name: 'admin'}));
		expect(component.userIsAdmin(user)).toBeTruthy();
	});

	it('should properly remove admin in toggleAdminStatus', () => {
		spyOn(component, 'userIsAdmin').and.returnValue(true);

		component.adminRole = new Role({id: 99, name: 'adminTest'});

		const matchingRoleMap = {id: 42};
		roleMappingApi.findOne.and.returnValue(Observable.of(matchingRoleMap));
		roleMappingApi.deleteById.and.returnValue(Observable.of({id: 1}));

		const user = new CustomUser({
			id: 1, firstName: '1', lastName: '2', email: 'a', password: 'b',
			roles: [new Role({id: 99, name: 'admin'})]
		});

		component.toggleAdminStatus(user);

		expect(roleMappingApi.findOne).toHaveBeenCalledWith({
			where: {principalId: user.id, principalType: 'USER', roleId: component.adminRole.id}
		});
		expect(roleMappingApi.deleteById).toHaveBeenCalledWith(matchingRoleMap.id);
		flashHelper.expectSuccess(`${user.firstName} ${user.lastName} (${user.id}) is no longer admin`);
		expect(user.roles.length).toBe(0);
	});

	it('should handle failure on toggleAdminStatus error (find)', () => {
		spyOn(component, 'userIsAdmin').and.returnValue(true);

		component.adminRole = new Role({id: 99, name: 'adminTest'});

		roleMappingApi.findOne.and.returnValue(Observable.throw('error!!!'));
		roleMappingApi.deleteById.and.returnValue(Observable.of({id: 1}));

		const user = new CustomUser({
			id: 1, firstName: '1', lastName: '2', email: 'a', password: 'b',
			roles: [new Role({id: 99, name: 'admin'})]
		});

		component.toggleAdminStatus(user);

		expect(roleMappingApi.findOne).toHaveBeenCalled();
		expect(roleMappingApi.deleteById).not.toHaveBeenCalled();
		flashHelper.expectFailure('Unable to remove admin');
		expect(user.roles.length).toBe(1);
	});

	it('should handle failure on toggleAdminStatus error (delete)', () => {
		spyOn(component, 'userIsAdmin').and.returnValue(true);

		component.adminRole = new Role({id: 99, name: 'adminTest'});

		const matchingRoleMap = {id: 42};
		roleMappingApi.findOne.and.returnValue(Observable.of(matchingRoleMap));
		roleMappingApi.deleteById.and.returnValue(Observable.throw('error!!!!'));

		const user = new CustomUser({
			id: 1, firstName: '1', lastName: '2', email: 'a', password: 'b',
			roles: [new Role({id: 99, name: 'admin'})]
		});

		component.toggleAdminStatus(user);

		expect(roleMappingApi.findOne).toHaveBeenCalled();
		expect(roleMappingApi.deleteById).toHaveBeenCalled();
		flashHelper.expectFailure('Unable to remove admin');
		expect(user.roles.length).toBe(1);
	});

	it('should properly add an admin in toggleAdminStatus', () => {
		spyOn(component, 'userIsAdmin').and.returnValue(false);

		component.adminRole = new Role({id: 99, name: 'adminTest'});
		const user = new CustomUser({ id: 1, firstName: '1', lastName: '2', email: 'a', password: 'b' });

		roleMappingApi.create.and.returnValue(Observable.of(component.adminRole));

		component.toggleAdminStatus(user);

		expect(roleMappingApi.create).toHaveBeenCalledWith({
			principalId: user.id, principalType: 'USER', roleId: component.adminRole.id
		});
		expect(user.roles).toEqual([component.adminRole]);
		flashHelper.expectSuccess(`${user.firstName} ${user.lastName} (${user.id}) is now admin`);
	});

	it('should properly add an admin in toggleAdminStatus', () => {
		spyOn(component, 'userIsAdmin').and.returnValue(false);

		component.adminRole = new Role({id: 99, name: 'adminTest'});
		const user = new CustomUser({ id: 1, firstName: '1', lastName: '2', email: 'a', password: 'b' });

		roleMappingApi.create.and.returnValue(Observable.throw('error'));

		component.toggleAdminStatus(user);

		expect(roleMappingApi.create).toHaveBeenCalled();
		expect(user.roles).toBeUndefined();
		flashHelper.expectFailure('Unable to create admin');
	});
});
