import { Component, OnInit, TemplateRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  Employees:any;
  Tasks: any[]=[];

  

  //used to connect to node server to run api calls
  baseUri:string = 'http://localhost:3000/api';

  //sets header values for http request
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private cookie: CookieService,private router: Router,private http: HttpClient,public fb: FormBuilder) { }

  //function to find all employees
  FindAllEmployees(){
    this.FindAllEmployeesHttp().subscribe(
      (res) => {
      if(res){
        console.log(res);

        //sets local array to the response array
        this.Employees = res;
        res.forEach(emp => {
          emp.todo.forEach(task => {
            this.Tasks.push(task);
          });
          emp.doing.forEach(task => {
            this.Tasks.push(task);
          });
          emp.done.forEach(task => {
            this.Tasks.push(task);
          });
        });
        console.log(this.Tasks);

      }
      else{
        console.log(res);
      }

      }, (error) => {
        console.log('Error: '+error);
      }
    );
  }

  //HTTP request to get all employees
  FindAllEmployeesHttp(): Observable<any> {
    let url = `${this.baseUri}/employees/`;
    return this.http.get(url, {headers: this.headers});
  }

  //function to return true if date is today
  isToday(someDate){
    let today = new Date();
    let checkDate = new Date(someDate);
    if(checkDate.getDate() == today.getDate() &&
    checkDate.getMonth() == today.getMonth() &&
    checkDate.getFullYear() == today.getFullYear()){
      return true;
    }
    else{
      return false;
    }
      
  }

  //get touched today
  getTouchedToday(){
    let touchedToday = 0;
    this.Tasks.forEach(task => {
      if(this.isToday(task.dateLastModified)){
        touchedToday++;
      }
    });
    return touchedToday;
  }

  //get added today
  getAddedToday(){
    let addedToday = 0;
    this.Tasks.forEach(task => {
      if(this.isToday(task.dateAdded)){
        addedToday++;
      }
    });
    return addedToday;
  }

  //get due today
  getDueToday(){
    let dueToday = 0;
    this.Tasks.forEach(task => {
      if(this.isToday(task.dueDate)){
        dueToday++;
      }
    });
    return dueToday;
  }

  //get individual touched today
  getIndTouchedToday(empId){
    let touchedToday = 0;
    this.Tasks.forEach(task => {
      if(this.isToday(task.dateLastModified)&&(task.lastModifiedBy)==empId){
        touchedToday++;
      }
    });
    return touchedToday;
  }

  //get individual touched today
  getIndAddedToday(empId){
    let touchedToday = 0;
    this.Tasks.forEach(task => {
      if(this.isToday(task.dateAdded)&&(task.lastModifiedBy)==empId){
        touchedToday++;
      }
    });
    return touchedToday;
  }

  //get individual touched today
  getIndDueToday(empId){
  let touchedToday = 0;
  this.Tasks.forEach(task => {
    if(this.isToday(task.dueDate)&&(task.lastModifiedBy)==empId){
      touchedToday++;
    }
  });
  return touchedToday;
}



  ngOnInit() {
        //check if employee is admin or not.
        if(this.cookie.get('role') == "User"){
          alert(
            "You do not have sufficient permission to view this page! \nPlease contact your administrator for access request!");
          this.router.navigate([""]);
        }
    
        this.FindAllEmployees();
  }

}
