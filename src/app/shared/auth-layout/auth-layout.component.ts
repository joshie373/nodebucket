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
  baseUri:string = 'http://localhost:3000/api';

  //sets header values for http request
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(public fb: FormBuilder,private cookie: CookieService, private http: HttpClient) {}

  LoginError: string;
  empForm: FormGroup;
  EmployeeId: string;
  LoginClicked:boolean=false;

  /*
  functions
  */

  //executes when login button clicked
  Login(){
    this.LoginClicked = true;
    this.FindEmployeeById(this.EmployeeId).subscribe(
      (res) => {
      // handles request if FindEmployeeById returned an employee
      if(res.length >0){
        //sets cookie values
        this.cookie.set('loginState',"loggedIn");
        this.cookie.set('empLogin', res[0].empId);
        this.cookie.set('loginName',res[0].firstName);
      }
      else{
        //sets LoginError to user not fomund if user not in DB
        this.LoginError = "Employee Not found!"
      }
      //   console.log(' FindEmpRan: ');
      //   console.log(res);
      //   console.log(res.length);
      // console.log(res[0].empId);

      }, (error) => {
        console.log('Error: '+error);
      }
    );
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






  ngOnInit() {
    this.empForm = this.fb.group({
      empId : ['', [Validators.required]]
    })
  }

}
