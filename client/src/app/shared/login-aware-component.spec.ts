/* tslint:disable:no-unused-variable */

import { Component } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { LoginAwareComponent } from "./login-aware-component";

describe('LoginAwareComponent', () => {
	let component: LoginAwareComponent;
	let authModule = {
		getCurrentUserId: jasmine.createSpy('getCurrentUserId'),
		getCurrentUserData: jasmine.createSpy('getCurrentUserData')
	};
	beforeEach(() => {
		component = new LoginAwareComponent(authModule as any);
	});

	it('should return the correct values for isSuperuser', async(() => {
		//test against logged out user
		const spy = authModule.getCurrentUserData.and.returnValue(null);
		expect(component.isSuperuser()).toBeFalsy();

		//test against normal user (without roles)
		spy.and.returnValue({id: 1});
		expect(component.isSuperuser()).toBeFalsy();

		//test against normal user (with no role)
		spy.and.returnValue({id: 1, roles: []});
		expect(component.isSuperuser()).toBeFalsy();;

		//test against normal user (with 'normal' role)
		spy.and.returnValue({id: 1, roles: [{id: 2, name: 'normal'}]});
		expect(component.isSuperuser()).toBeFalsy();

		//test against admin user (with 'admin' role)
		spy.and.returnValue({id: 1, roles: [{id: 1, name: 'admin'}]});
		expect(component.isSuperuser()).toBeTruthy();
		}));

		it('should return the correct values for isLoggedIn', async(() => {
		//test against logged out user
		const spy = authModule.getCurrentUserId.and.returnValue(null);
		expect(component.isLoggedIn()).toBe(false);

		//test against logged in user
		spy.and.returnValue(1);
		expect(component.isLoggedIn()).toBe(true);
	}));

	it('should return the correct values for isLoggedIn', async(() => {
		//test against logged out user
		const spy = authModule.getCurrentUserId.and.returnValue(null);
		expect(component.isLoggedIn()).toBe(false);

		//test against logged in user
		spy.and.returnValue(1);
		expect(component.isLoggedIn()).toBe(true);
	}));

	it('should return the correct values for getUserDisplayName', async(() => {
		//test against logged out user
		const spy = authModule.getCurrentUserData.and.returnValue(null);
		expect(component.getUserDisplayName()).toBe('');

		//test against logged in user (with both names)
		spy.and.returnValue({id: 1, firstName: 'a', lastName: 'b'});
		expect(component.getUserDisplayName()).toBe('a b');

		//with only first name
		spy.and.returnValue({id: 1, firstName: 'a'});
		expect(component.getUserDisplayName()).toBe('a ');
	}));
});
