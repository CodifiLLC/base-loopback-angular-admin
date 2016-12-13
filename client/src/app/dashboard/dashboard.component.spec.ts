/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DashboardComponent } from './dashboard.component';
import { LoopBackAuth } from '../shared/sdk/services';

describe('DashboardComponent', () => {
	let component: DashboardComponent;
	let fixture: ComponentFixture<DashboardComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ DashboardComponent ],
			providers: [
				{provide: LoopBackAuth, useValue: {}},
			]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DashboardComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		spyOn(component, 'isLoggedIn').and.returnValue(false);
		fixture.detectChanges();
		expect(component).toBeTruthy();
	});

	it('should show one message when logged in', () => {
		const expectedName = 'John Test';
		spyOn(component, 'isLoggedIn').and.returnValue(true);
		spyOn(component, 'getUserDisplayName').and.returnValue(expectedName);
		fixture.detectChanges();
		let message = fixture.debugElement.query(By.css('p'));
		expect(message).toBeTruthy();
		expect(message.nativeElement.textContent.trim()).toBe('You are logged in as ' + expectedName);
		expect(component.isLoggedIn).toHaveBeenCalled();
		expect(component.getUserDisplayName).toHaveBeenCalled();
	});

	it('should show other message when logged out', () => {
		spyOn(component, 'isLoggedIn').and.returnValue(false);
		spyOn(component, 'getUserDisplayName');
		fixture.detectChanges();
		let message = fixture.debugElement.query(By.css('p'));
		expect(message).toBeTruthy();
		expect(message.nativeElement.textContent.trim()).toBe('You are not logged in');
		expect(component.isLoggedIn).toHaveBeenCalled();
		expect(component.getUserDisplayName).not.toHaveBeenCalled();
	});
});