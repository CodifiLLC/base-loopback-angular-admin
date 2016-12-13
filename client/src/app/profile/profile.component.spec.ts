/* tslint:disable:no-unused-variable */
import { Observable } from "rxjs";
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ProfileComponent } from './profile.component';
import { CustomUserApi, LoopBackAuth } from '../shared/sdk/services';
import { CustomUser } from '../shared/sdk/models';
import { FlashMessageService } from "../flash-message/flash-message.service";

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  const expectedUser = {id: 1, email: 'test@t.com', firstName: 'test', lastName: 'thing', password: 'test1234'} as CustomUser;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileComponent ],
      providers: [
        {provide: CustomUserApi, useValue: {
          patchAttributes: jasmine.createSpy('patchAttributes'),
          getCurrentId: jasmine.createSpy('getCurrentId'),
          findById: jasmine.createSpy('findById').and.returnValue(Observable.empty())
        }},
        {provide: LoopBackAuth, useValue: {
                setUser: jasmine.createSpy('setUser'),
                save: jasmine.createSpy('save'),
                getToken: jasmine.createSpy('getToken').and.returnValue({}),
                getCurrentUserData: jasmine.createSpy('getCurrentUserData').and.returnValue({})
        }},
        {provide: Router, useValue: {
          navigateByUrl: jasmine.createSpy('navigateByUrl')
        }},
        {provide: FlashMessageService, useValue: {
          showMessage: jasmine.createSpy('showMessage')
        }}
      ],
      imports: [FormsModule, RouterTestingModule.withRoutes([]) ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call findById in ngOnInit', () => {
    const userApi = fixture.debugElement.injector.get(CustomUserApi);
    userApi.getCurrentId.and.returnValue(1);
    userApi.findById.and.returnValue(Observable.of(expectedUser));

    expect(component.user.id).toBeUndefined();
    fixture.detectChanges();
    expect(userApi.getCurrentId).toHaveBeenCalled();
    expect(userApi.findById).toHaveBeenCalled();
    expect(component.user.id).toBe(expectedUser.id);
    expect(component.user).toEqual(expectedUser);
  });

  it('should call saveUser when form is submitted', () => {
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('form'));
    spyOn(component, 'saveUser');

    form.triggerEventHandler('submit', null);
    fixture.detectChanges();
    expect(component.saveUser).toHaveBeenCalled();
  });

  it('should update account information', () => {
    spyOn(component, 'ngOnInit');
    component.user = expectedUser;
    fixture.detectChanges();

    const userApi = fixture.debugElement.injector.get(CustomUserApi);
    const authApi = fixture.debugElement.injector.get(LoopBackAuth);
    const router = fixture.debugElement.injector.get(Router);
    const flashService = fixture.debugElement.injector.get(FlashMessageService);

    userApi.patchAttributes.and.returnValue(Observable.of(expectedUser));
    expect(userApi.patchAttributes).not.toHaveBeenCalled();
    component.saveUser();
    expect(userApi.patchAttributes).toHaveBeenCalled();
    expect(flashService.showMessage).toHaveBeenCalledWith({message: 'Profile Saved!', messageClass: 'success'});
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should not update account if cancel button is pushed', () => {
    fixture.detectChanges();
    const cancelButton = fixture.debugElement.query(By.css('.btn-default'));
    const router = fixture.debugElement.injector.get(Router);
    spyOn(component, 'saveUser');

    cancelButton.nativeElement.click();
    fixture.detectChanges();
    expect(component.saveUser).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

});
