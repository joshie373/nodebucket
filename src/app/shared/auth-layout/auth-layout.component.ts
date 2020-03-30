import { Router } from '@angular/router';
import { Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { FormControl, Validators, FormGroup,FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent implements OnInit {

//used to connect to node server to run api calls
baseUri:string = '../api';

  //sets header values for http request
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(public fb: FormBuilder,private cookie: CookieService, private http: HttpClient) {}
  LoggedIn: boolean;
  LoginError: string;
  empForm: FormGroup;
  EmployeeId: string;
  LoginClicked:boolean=false;
  LoginName: string ;


  /*
  functions
  */

  //executes when login button clicked
  Login(){
    this.LoginClicked = true;
    let loginState = this.LoggedIn;
    if(!loginState){
      this.FindEmployeeById(this.EmployeeId).subscribe(
        (res) => {
        // handles request if FindEmployeeById returned an employee
        //res is returned json object
        //mongo returning empty object if not found
        if(res.length >0){
          this.LoginError = null;

          //sets cookie values
          this.cookie.set('loginState',"loggedIn");
          this.cookie.set('empLogin', res[0].empId);
          this.cookie.set('loginName',res[0].firstName);
          this.cookie.set('role',res[0].role);
          this.cookie.set('action','logout');

          //sets values of local variables
          this.LoginName = res[0].firstName;
          this.LoggedIn = true;
        }
        else{
          //sets LoginError to user not found if user not in DB
          this.LoginError = "Employee Not found!"
        }

        }, (error) => {
          console.log('Error: '+error);
        }
      );
    }
  }

  //logout function clears all cookies, and resets default values
  // adds action cookie for ability to login
  Logout(){
    this.cookie.deleteAll();
    this.LoggedIn = false;
    this.LoginName = null;
    this.LoginError = null;

    this.cookie.set('action','login');
  }

  //connects to database and gets employee
  FindEmployeeById(id): Observable<any> {
    let url = `${this.baseUri}/employees/${id}`;
    return this.http.get(url, {headers: this.headers});
  }


  // Getter to access form control
  get myForm(){
    return this.empForm.controls;
  }

  //Checks to see whether a user is logged in by checking for a loginState cookie
  LogCheck(){
    if (this.cookie.get('loginState')=='loggedIn'){
      this.LoggedIn = true;
      this.LoginName = this.cookie.get('loginName');
    }
    else{
      this.LoggedIn = false;
      this.cookie.set('action','login');
    }
  }



  ngOnInit() {
    this.empForm = this.fb.group({
      empId : ['', [Validators.required]]
    })
    this.LogCheck();

  }

}
