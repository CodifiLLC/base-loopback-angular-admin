import { Router } from "@angular/router";
import { Component } from '@angular/core';
import { CustomUserApi } from './shared/sdk/services/custom';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(private userApi: CustomUserApi, private router: Router) { }

  ngOnInit() {}

  isSuperuser () {
    return false;
  }
}
