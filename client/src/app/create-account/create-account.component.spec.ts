/* tslint:disable:no-unused-variable */
import { Observable } from "rxjs";
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { CustomUserApi } from '../shared/sdk/services/custom';
import { CreateAccountComponent } from './create-account.component';

describe('CreateAccountComponent', () => {
  let component: CreateAccountComponent;
  let fixture: ComponentFixture<CreateAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAccountComponent ],
      providers: [
        {provide: CustomUserApi, useValue: {
          create: jasmine.createSpy('create')
        }},
        {provide: Router, useValue: {
          navigateByUrl: jasmine.createSpy('navigateByUrl')
        }}
      ],
      imports: [FormsModule, RouterTestingModule.withRoutes([]) ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createUser when form is submitted', () => {
     fixture.detectChanges();
     const form = fixture.debugElement.query(By.css('form'));
     spyOn(component, 'createUser');

     form.triggerEventHandler('submit', null);
     fixture.detectChanges();
     expect(component.createUser).toHaveBeenCalled();
   });

  it('should create a new account', () => {
     const userApi = fixture.debugElement.injector.get(CustomUserApi);
     const router = fixture.debugElement.injector.get(Router);

     userApi.create.and.returnValue(Observable.of(
       {id: 1, email: 'test@t.com', firstname: 'test', lastname: 'thing', password: 'test1234'}
     ));

     expect(userApi.create).not.toHaveBeenCalled();
     component.createUser();
     expect(userApi.create).toHaveBeenCalled();
     expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should show error when email already in use', () => {
     const userApi = fixture.debugElement.injector.get(CustomUserApi);
     const router = fixture.debugElement.injector.get(Router);

     userApi.create.and.returnValue(Observable.throw('test error'));

     expect(userApi.create).not.toHaveBeenCalled();
     component.createUser();
     expect(userApi.create).toHaveBeenCalled();
     expect(component.emailError).toBe('Email Already in Use');
     expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
