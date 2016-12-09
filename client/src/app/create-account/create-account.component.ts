import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CustomUser} from '../shared/sdk/models/CustomUser';
import {CustomUserApi} from '../shared/sdk/services/custom';


@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {

      userInfo = new CustomUser();
      emailError: string;

      constructor(private userApi: CustomUserApi, private router: Router) { }

      ngOnInit() {
      }

      createUser() {
            this.userApi.create(this.userInfo).subscribe(user => {
                  console.log('Got \'em', user);
                  this.router.navigateByUrl('/');
            }, err => {
                  console.log('err', err);
                  this.emailError = "Email Already in Use";
        		});
      }

}
