import { Component, OnInit, TemplateRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';





@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  constructor(private cookie: CookieService,private router: Router,private http: HttpClient,private modalService: BsModalService,public fb: FormBuilder) { }

  ngOnInit() {
    //check if employee is admin or not.
    if(this.cookie.get('role') == "User"){
      alert(
        "You do not have sufficient permission to view this page! \nPlease contact your administrator for access request!");
      this.router.navigate([""]);
    }

    this.FindAllEmployees();
  }


 //----modal elements-----
  modalRef: BsModalRef;

  newTaskForm: FormGroup;
  newTaskText: string;
  newTaskId: string;
  newTaskdueDateValue: string;

  editTaskForm: FormGroup;
  editTaskText: string;
  editTaskId: string;
  editTaskEmployeeId:string;
  oldEmpId: string;
  editDueDateValue: any;
  editDateAddedValue: any;
 


  //open modal function
  openModal(newTaskTemplate: TemplateRef<any>) {
    this.modalRef = this.modalService.show(newTaskTemplate);
    this.newTaskForm = this.fb.group({
      newTaskTextInput : ['', [Validators.required]],
      newTaskIdInput : ['', [Validators.required]], 
      newTaskdueDate: ['', [Validators.required]]
    })
  }

  //opens edit task modal
  openEditModal(editTaskTemplate: TemplateRef<any>) {

    this.editTaskForm = this.fb.group({
      editTaskTextInput : ['', [Validators.required]],
      editTaskIdInput : ['', [Validators.required]], 
      editDueDate: ['', [Validators.required]]
    })
    this.modalRef = this.modalService.show(editTaskTemplate);
    
  }

  //sets values of the edit task input form controls
  setValues(empId,taskId,reassignable){
    this.oldEmpId = empId;//sets current employee id for editing
    //sets local values
    this.editTaskEmployeeId = empId;
    this.editTaskId = taskId;
    //http request to get text for task
    this.getTaskHttp(empId,taskId).subscribe(
      (res) => {
      if(res){
        console.log(res['text']);
        this.editTaskText = res['text'];
        this.editDueDateValue = res['dueDate'];
        this.editDateAddedValue = res['dateAdded'];
        console.log(this.editDueDateValue);
        this.editDueDateValue=this.editDueDateValue.substring(0, 10);
        this.editDateAddedValue=this.editDateAddedValue.substring(0, 10);
        console.log(this.editDueDateValue);
      }
      else{
        console.log(res['text']);
        this.editTaskText = res['text'];
        this.editDueDateValue = res['dueDate'];
        this.editDateAddedValue = res['dateAdded'];
      }

      }, (error) => {
        console.log('Error: '+error);
      }
    );

    

    //sets values of form controls. 
    this.editTaskForm.patchValue({
      editTaskTextInput: this.editTaskText,
      editTaskIdInput: this.editTaskEmployeeId,
      editDueDate: this.editDueDateValue
    });
    if (!reassignable){
      this.editTaskForm.controls.editTaskIdInput.disable();
    }
    
  }

  // Getter to access form control
  get myNewTaskForm(){
    return this.newTaskForm.controls;
  }

  //---end modal elements---- 

  //used to connect to node server to run api calls
  baseUri:string = 'http://localhost:3000/api';

  //sets header values for http request
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  Employees:any;
  newTaskselected: string;

  //function to find all employees
  FindAllEmployees(){
    this.FindAllEmployeesHttp().subscribe(
      (res) => {
      if(res){
        console.log(res);

        //sets local array to the response array
        this.Employees = res;
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

  //newTask function
  newTask(){
    // let task = {"text":"please delete me"};

    let task = {"text": this.newTaskText,"dueDate":this.newTaskdueDateValue};
    let empId = this.newTaskselected;

    this.newTaskHttp(empId,task).subscribe(
      (res) => {
      if(res){
        console.log(res);

        //sets local array to the response array
        //closes modal  and clears form on successful insert
        
        this.modalRef.hide();
        this.newTaskForm.reset();


        this.FindAllEmployees();
      }
      else{
        console.log(res);
      }

      }, (error) => {
        console.log('Error: '+error);
      }
    );
  }

  //new task http request
  newTaskHttp(id,task): Observable<any> {
    let url = `${this.baseUri}/employees/${id}/tasks`;
    return this.http.post(url,task, {headers: this.headers});
  }

  //delete function
  delete(empId,taskId){
    //confirm window confirming deletion
    let confirmDelete = confirm("Are you sure you want to delete this task?");
    if (confirmDelete){
      //delete task
      this.deleteTaskHttp(empId,taskId).subscribe(
        (res) => {
        if(res){
          console.log(res);
          this.FindAllEmployees();//reloads task list after delete
        }
        else{
          console.log(res);
          this.FindAllEmployees();//reloads task list after delete
        }

        }, (error) => {
          console.log('Error: '+error);
        }
      );
    }else{
      //do nothing
    }
  }

  //delte task http request
  deleteTaskHttp(empId,taskId): Observable<any> {
    let url = `${this.baseUri}/employees/${empId}/tasks/${taskId}`;
    return this.http.delete(url, {headers: this.headers});
  }

  //get single task HTTP request
  getTaskHttp(id,taskId){
      let url = `${this.baseUri}/employees/${id}/tasks/${taskId}`;
      return this.http.get(url, {headers: this.headers});
  }

  //updateTask function
  updateTask(){
    //if user was changed, perfrom movetask
    if(this.oldEmpId != this.editTaskEmployeeId){
      this.moveTask();
    }
    //else will perfrom update task
    else{

      // converts date back to ISo string for addin to DB
      let convertedDueDate = new Date(this.editDueDateValue).toISOString();
      let convertedDateAdded = new Date(this.editDateAddedValue).toISOString();

      //makes task object
      let task = {"text": this.editTaskText,"dueDate":convertedDueDate,"lastModifiedBy":this.cookie.get('empLogin'),"dateAdded":convertedDateAdded};
      console.log("task");
      console.log(task);
      //update task
      this.updateTaskHttp(this.editTaskEmployeeId,this.editTaskId,task).subscribe(
        (res) => {
        if(res){
          console.log(res);

        //closes modal  and clears form on successful insert
        this.modalRef.hide();
        this.editTaskForm.reset();
        this.FindAllEmployees();//reloads task list after delete

        }
        else{
          console.log(res);
        //closes modal  and clears form on successful insert
        this.modalRef.hide();
        this.editTaskForm.reset();
        this.FindAllEmployees();//reloads task list after delete
        }

        }, (error) => {
          console.log('Error: '+error);
        }
      );
    }
  }

  //editor
  edit(){
    this.editTaskText = this.editTaskForm.controls.editTaskTextInput.value;
  }

  //update task http request
  updateTaskHttp(empId,taskId,task): Observable<any> {
    let url = `${this.baseUri}/employees/${empId}/tasks/${taskId}/update`;
    return this.http.put(url,task, {headers: this.headers});
  }

  //connects to database and gets employee
  FindEmployeeByIdHttp(id): Observable<any> {
    let url = `${this.baseUri}/employees/${id}`;
    return this.http.get(url, {headers: this.headers});
  }

  //move task between employees
  moveTask(){
    let curEmp = this.oldEmpId;
    let newEmp = this.editTaskEmployeeId;
    let task = {"text": this.editTaskText,"dueDate":this.editDueDateValue,"lastModifiedBy":this.cookie.get('empLogin')};
    let taskId = this.editTaskId;
    console.log('moving from '+ curEmp + ' to ' + newEmp);
    

    //delete task
    this.deleteTaskHttp(curEmp,taskId).subscribe(
      (res) => {
      if(res){
        console.log(res);
        // this.FindAllEmployees();//reloads task list after delete

        this.newTaskHttp(newEmp,task).subscribe(
          (res) => {
          if(res){
            console.log(res);
    
            //sets local array to the response array
            //closes modal  and clears form on successful insert
            
            this.modalRef.hide();
            // this.newTaskForm.reset();
    
    
            this.FindAllEmployees();
          }
          else{
            console.log(res);
          }
    
          }, (error) => {
            console.log('Error: '+error);
          }
        );


      }
      else{
        console.log(res);
        // this.FindAllEmployees();//reloads task list after delete
      }

      }, (error) => {
        console.log('Error: '+error);
      }
    );
  }

}

