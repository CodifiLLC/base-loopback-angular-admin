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
					find: jasmine.createSpy('find')
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
});
