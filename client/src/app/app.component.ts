import { Router } from "@angular/router";
import { Component } from '@angular/core';
import {LoginAwareComponent} from "./shared/login-aware-component";
import {FlashMessageService} from "./flash-message/flash-message.service";
import { CustomUserApi, LoopBackAuth } from './shared/sdk/services';
import { CustomUser } from './shared/sdk/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends LoginAwareComponent {
  title = 'app works!';

  constructor(private router: Router, private userApi: CustomUserApi, auth: LoopBackAuth, private flashMessageService: FlashMessageService) {
    super(auth);
  }

  ngOnInit() {}

  logout() {
    this.userApi.logout().subscribe(val => {
      this.flashMessageService.showMessage({message: 'Logged out successfully', messageClass: 'success'});
      this.router.navigateByUrl('/');
    });
  }
}
