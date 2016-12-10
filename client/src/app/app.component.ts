import { Router } from "@angular/router";
import { Component } from '@angular/core';
import {FlashMessageService} from "./flash-message/flash-message.service";
import { CustomUserApi, LoopBackAuth } from './shared/sdk/services';
import { CustomUser } from './shared/sdk/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(private router: Router, private userApi: CustomUserApi, private auth: LoopBackAuth, private flashMessageService: FlashMessageService) { }

  ngOnInit() {}

  isLoggedIn () {
    return this.auth.getCurrentUserId() != null;
  }

  isSuperuser () {
    const curUser: CustomUser = this.auth.getCurrentUserData();
    return curUser && curUser.roles && curUser.roles.find(r => r.name == "admin");
  }

  logout() {
    this.userApi.logout().subscribe(val => {
      this.flashMessageService.showMessage({message: 'Logged out successfully', messageClass: 'success'});
      this.router.navigateByUrl('/');
    });
  }
}
