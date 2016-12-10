import {Observable} from "rxjs";
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginComponent } from './login.component';
import { CustomUserApi, LoopBackAuth } from '../shared/sdk/services';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      providers: [
        {provide: CustomUserApi, useValue: {
          login: jasmine.createSpy('login'),
          getRoles: jasmine.createSpy('getRoles')
        }},
        {provide: LoopBackAuth, useValue: {
          setUser: jasmine.createSpy('setUser'),
          save: jasmine.createSpy('save')
        }},
        {provide: Router, useValue: {
          navigateByUrl: jasmine.createSpy('navigateByUrl')
        }}
      ],
      imports: [FormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login when form is submitted', () => {
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('form'));
    spyOn(component, 'login');

    //button.nativeElement.click();
    form.triggerEventHandler('submit', null);
    fixture.detectChanges();
    expect(component.login).toHaveBeenCalled();
  });

  it('should call login on click', () => {
    const userApi = fixture.debugElement.injector.get(CustomUserApi);
    const router = fixture.debugElement.injector.get(Router);
    const authApi = fixture.debugElement.injector.get(LoopBackAuth);

    userApi.login.and.returnValue(Observable.of({user: {id: 1, email: 't@t.si', firstname: 'test', lastname: 'thing'}}));
    userApi.getRoles.and.returnValue(Observable.of({id: 1}));

    expect(userApi.login).not.toHaveBeenCalled();
    component.login();
    expect(userApi.login).toHaveBeenCalled();
    expect(userApi.getRoles).toHaveBeenCalledWith(1);
    expect(component.loginError).toBeFalsy();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    expect(authApi.setUser).toHaveBeenCalled();
    expect(authApi.save).toHaveBeenCalled();
  });

  it('should show error on failed login', () => {
    const userApi = fixture.debugElement.injector.get(CustomUserApi);
    const router = fixture.debugElement.injector.get(Router);

    userApi.login.and.returnValue(Observable.throw('test error'));

    expect(userApi.login).not.toHaveBeenCalled();
    component.login();
    expect(userApi.login).toHaveBeenCalled();
    expect(component.loginError).toBe('Invalid Login');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
