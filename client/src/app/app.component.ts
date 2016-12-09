import { Router } from "@angular/router";
import { Component } from '@angular/core';
import { CustomUserApi } from './shared/sdk/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(private router: Router, private userApi: CustomUserApi) { }

  ngOnInit() {}

  isSuperuser () {
    return false;
  }

  logout() {
    this.userApi.logout().subscribe(val => {
      console.log('logged out', val);
      this.router.navigateByUrl('/');
    });
  }
}
