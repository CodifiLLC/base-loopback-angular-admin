/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { CustomUserApi } from './shared/sdk/services';
import { Observable } from "rxjs";

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [ RouterTestingModule.withRoutes([]) ],
      providers: [
        {provide: CustomUserApi, useValue: {
          logout: jasmine.createSpy('logout')
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

  it('should render router-outlet', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    let compiled = fixture.debugElement.nativeElement;
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

    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('a.logout-link'));
    spyOn(fixture.componentInstance, 'logout');


    expect(fixture.componentInstance.logout).not.toHaveBeenCalled();
    link.triggerEventHandler('click', null);
    expect(fixture.componentInstance.logout).toHaveBeenCalled();
  }));
});
