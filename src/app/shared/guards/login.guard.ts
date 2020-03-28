import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {CookieService} from 'ngx-cookie-service';



@Injectable()
export class LoginGuard implements CanActivate {

  constructor(private router: Router, private cookie: CookieService) {}

  getLoginCookie(){
    let loginState =this.cookie.get('loginState');
    if(loginState =="loggedIn"){
      return true
    }
    else{
      return false
    }
  }

  canActivate() {
    let loggedIn=this.getLoginCookie();

    if (!loggedIn) {
      alert("No user logged in!!  Redirecting to login page.");
      this.router.navigate(["/login"]);
    }



    return loggedIn;
  }


}
