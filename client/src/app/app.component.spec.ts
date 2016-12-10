/* tslint:disable:no-unused-variable */

import { Component } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { FlashMessageService } from './flash-message/flash-message.service';
import { CustomUserApi, LoopBackAuth } from './shared/sdk/services';
import { Observable } from "rxjs";

@Component({
  selector: 'app-flash-message',
  template: ''
})
export class FlashMessageComponent {}

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        FlashMessageComponent
      ],
      imports: [ RouterTestingModule.withRoutes([]) ],
      providers: [
        {provide: CustomUserApi, useValue: {
          logout: jasmine.createSpy('logout')
        }},
        {provide: LoopBackAuth, useValue: {
          getCurrentUserData: jasmine.createSpy('getCurrentUserData'),
          getCurrentUserId: jasmine.createSpy('getCurrentUserId')
        }},
        {provide: FlashMessageService, useValue: {
          showMessage: jasmine.createSpy('showMessage')
        }}
      ]
    });
  });

  it('should create the app', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'app works!'`, async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app works!');
  }));

  it('should render router-outlet and flash message', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    let compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('app-flash-message')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  }));

  it('should call CustomUserApi.logout', async(() => {
    let fixture = TestBed.createComponent(AppComponent);

    const userApi = fixture.debugElement.injector.get(CustomUserApi);
    const router = fixture.debugElement.injector.get(Router);
    const flashMessageService = fixture.debugElement.injector.get(FlashMessageService);

    spyOn(router, 'navigateByUrl');

    userApi.logout.and.returnValue(Observable.of({}));
    expect(userApi.logout).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    fixture.componentInstance.logout();
    expect(userApi.logout).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
	expect(flashMessageService.showMessage).toHaveBeenCalledWith({message: 'Logged out successfully', messageClass: 'success'});
  }));

  it('should call logout on click of logout link', async(() => {
    let fixture = TestBed.createComponent(AppComponent);

    spyOn(fixture.componentInstance, 'isLoggedIn').and.returnValue(true);

    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('a.logout-link'));
    spyOn(fixture.componentInstance, 'logout');


    expect(fixture.componentInstance.logout).not.toHaveBeenCalled();
    link.triggerEventHandler('click', null);
    expect(fixture.componentInstance.logout).toHaveBeenCalled();
  }));

  it('should show correct link', async(() => {
    let fixture = TestBed.createComponent(AppComponent);

    //set both logged in and admin
    let superUserSpy = spyOn(fixture.componentInstance, 'isSuperuser').and.returnValue(true);
    let loggedInSpy = spyOn(fixture.componentInstance, 'isLoggedIn').and.returnValue(true);

    fixture.detectChanges();
    let signOutLink = fixture.debugElement.query(By.css('a.logout-link'));
    let signInLink = fixture.debugElement.query(By.css('a.login-link'));
    let adminLink = fixture.debugElement.query(By.css('a.admin-link'));

    //expect links to exist
    expect(adminLink).toBeTruthy();
    expect(signInLink).toBeFalsy();
    expect(signOutLink).toBeTruthy();

    //set logged out
    loggedInSpy.and.returnValue(false);
    superUserSpy.and.returnValue(false);

    fixture.detectChanges();
    signOutLink = fixture.debugElement.query(By.css('a.logout-link'));
    signInLink = fixture.debugElement.query(By.css('a.login-link'));
    adminLink = fixture.debugElement.query(By.css('a.admin-link'));

    //expect links to exist
    expect(adminLink).toBeFalsy();
    expect(signInLink).toBeTruthy();
    expect(signOutLink).toBeFalsy();

    //set logged in, but not admin
    loggedInSpy.and.returnValue(true);
    superUserSpy.and.returnValue(false);

    fixture.detectChanges();
    signOutLink = fixture.debugElement.query(By.css('a.logout-link'));
    signInLink = fixture.debugElement.query(By.css('a.login-link'));
    adminLink = fixture.debugElement.query(By.css('a.admin-link'));

    //expect links to exist
    expect(adminLink).toBeFalsy();
    expect(signInLink).toBeFalsy();
    expect(signOutLink).toBeTruthy();
  }));

  it('should return the correct values for isSuperuser', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let component = fixture.componentInstance;
    const auth = fixture.debugElement.injector.get(LoopBackAuth);

    //test against logged out user
    const spy = auth.getCurrentUserData.and.returnValue(null);
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
    let fixture = TestBed.createComponent(AppComponent);
    let component = fixture.componentInstance;
    const auth = fixture.debugElement.injector.get(LoopBackAuth);

    //test against logged out user
    const spy = auth.getCurrentUserId.and.returnValue(null);
    expect(component.isLoggedIn()).toBe(false);

    //test against logged in user
    spy.and.returnValue(1);
    expect(component.isLoggedIn()).toBe(true);
  }));
});
