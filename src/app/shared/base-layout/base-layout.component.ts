import { Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-base-layout',
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.css']
})
export class BaseLayoutComponent implements OnInit {
  year: number = Date.now();
  loginState:string;
  LoggedIn:boolean;


  constructor(private cookie: CookieService,private router: Router) {
    if (this.cookie.get('loginState')!='loggedIn'){
      this.LoggedIn = false;
    }
    else{
      this.LoggedIn= true;
    }
  }


  //role router for nodebucket.
  roleRoute(){
    switch (this.cookie.get('role')) {
      case "User":
        this.router.navigate(["/nodebucket"]);
        break;
      case "Admin":
        this.router.navigate(["/admin"]);
        break;
      case "Manager":
        this.router.navigate(["/admin"]);
        break;
    }
  }



  //on click of button returns user to login page, regardless of status.
  Login(){
    this.router.navigate(["/login"]);
  }



  ngOnInit() {
  }

}
