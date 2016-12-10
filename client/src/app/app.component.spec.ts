/* tslint:disable:no-unused-variable */

import { Component } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
// import { FlashMessageComponent } from './flash-message/flash-message.component';
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

    spyOn(router, 'navigateByUrl');

    userApi.logout.and.returnValue(Observable.of({}));
    expect(userApi.logout).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalledWith('/');
    fixture.componentInstance.logout();
    expect(userApi.logout).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
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
});
