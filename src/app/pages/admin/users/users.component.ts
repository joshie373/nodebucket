import { Component, OnInit, TemplateRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, Validators, FormBuilder, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { empExistsValidator } from './isUnique.directive';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  constructor(private cookie: CookieService,private router: Router,private http: HttpClient,private modalService: BsModalService,public fb: FormBuilder) { }

  ngOnInit() {
    //check if employee is admin or not.
    if(this.cookie.get('role') != "Admin"){
      alert(
        "You do not have sufficient permission to view this page! \nPlease contact your administrator for access request!");
      this.router.navigate([""]);
    }

    this.FindAllEmployees();
  }

  //used to connect to node server to run api calls
  baseUri:string = '../api';

 //sets header values for http request
 headers = new HttpHeaders().set('Content-Type', 'application/json');

 //holding object for employees
 Employees:any;
 CoreEmployees:any=["1007","1008","1009","1010","1011","1012"];

  //----modal elements-----
  modalRef: BsModalRef;

  //employee new form constants
  newEmpForm: FormGroup;
  newEmpId: string;
  newEmpFName: string;
  newEmpLName:string;
  newEmpRole: string;

  //employee edit form constants
  editEmployeeForm: FormGroup;
  editEmpId: string;
  editEmpFName: string;
  editEmpLName:string;
  editEmpRole: string;

  //Array of employee ids(for validator)
  empIds:any[]=[];

  // Getter to access form control
  get myNewEmpForm(){
    return this.newEmpForm.controls;
  }

  //open modal function
  openModal(newEmpTemplate: TemplateRef<any>) {
    this.modalRef = this.modalService.show(newEmpTemplate);
    this.getEmpIds();
    this.newEmpForm = this.fb.group({
      empId: ['', [Validators.required,empExistsValidator(this.empIds)]],
      firstName : ['', [Validators.required]],
      lastName : ['', [Validators.required]],
      role: ['', [Validators.required]],
    })


  }
  
  //function to set and get employee id array
  //used for custom validator
  getEmpIds() {
    this.empIds = [];
    this.Employees.forEach(e =>{
      let temp = e.empId;
      this.empIds.push(temp);
    });
    // console.log(this.empIds);
  }

  //opens edit task modal
  openEditModal(editEmpTemplate: TemplateRef<any>) {

    this.editEmployeeForm = this.fb.group({
      empId: ['', [Validators.required]],
      firstName : ['', [Validators.required]],
      lastName : ['', [Validators.required]],
      role: ['', [Validators.required]],
    })

    this.modalRef = this.modalService.show(editEmpTemplate);
  }

  //sets values of the edit task input form controls
  setValues(empId){

    let employeeID,firstName,lastName,role;
    this.FindEmployeeByIdHttp(empId).subscribe(
      (res) => {
      if(res){
        console.log(res);

        //sets local array to the response array
        this.editEmpId = res[0].empId;
        this.editEmpFName = res[0].firstName;
        this.editEmpLName = res[0].lastName;
        this.editEmpRole = res[0].role;

      }
      else{
        console.log(res);
      }

      }, (error) => {
        console.log('Error: '+error);
      }
    );
    
    //sets local values

    //sets values of form controls. 
    this.editEmployeeForm.patchValue({
      empId : this.editEmpId,
      firstName : this.editEmpFName,
      lastName : this.editEmpLName,
      role : this.editEmpRole,
    });
    
  }
  //---end modal elements---- 

  //connects to database and gets single employee
  FindEmployeeByIdHttp(id): Observable<any> {
    let url = `${this.baseUri}/employees/${id}`;
    return this.http.get(url, {headers: this.headers});
  }

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

  //new Employee function
  newEmp(){
      let emp = this.newEmpForm.value;
      this.NewEmpHttp(emp).subscribe(
        (res) => {
        if(res){
          console.log(res);
  
          this.modalRef.hide();
          this.newEmpForm.reset();
          this.FindAllEmployees();
        }
        else{
          console.log(res);
          this.FindAllEmployees();
        }
  
        }, (error) => {
          console.log('Error: '+error);
        }
      );
  }

  //connects to database and gets single employee
  NewEmpHttp(emp): Observable<any> {
    let url = `${this.baseUri}/employees/`;
    return this.http.post(url,emp, {headers: this.headers});
  }

  //checks for core User
  coreCheck(empId){
    let isCoreUser = this.CoreEmployees.includes(empId);
    return isCoreUser;
  }

  //delete function
  delete(empId){
    //checks if employee is core user
    if(this.coreCheck(empId)){
      alert("Warning!!\n Core users cannot be deleted!!");
    }
    else{
      //confirm window confirming deletion
      let confirmDelete = confirm("Are you sure you want to delete this User?");
      if (confirmDelete){
        //delete employee
        this.deleteEmpHttp(empId).subscribe(
          (res) => {
          if(res){
            console.log(res);
            this.FindAllEmployees();//reloads emp list after delete
          }
          else{
            console.log(res);
            this.FindAllEmployees();//reloads emp list after delete
          }

          }, (error) => {
            console.log('Error: '+error);
          }
        );
      }else{
        //do nothing
      }
    }

    
  }

  //delete task http request
  deleteEmpHttp(empId): Observable<any> {
    let url = `${this.baseUri}/employees/${empId}`;
    return this.http.delete(url, {headers: this.headers});
  }

  //update employee function
  updateEmp(){
    let empId = this.editEmployeeForm.controls.empId.value;
    let empDetails = this.editEmployeeForm.value;
    this.updateEmpHttp(empId,empDetails).subscribe(
      (res) => {
      if(res){
        console.log(res);
        
        //closes modal and clears form
        this.modalRef.hide();
        this.editEmployeeForm.reset();

        this.FindAllEmployees();//reloads emp list after delete
      }
      else{
        console.log(res);
        //closes modal and clears form
        this.modalRef.hide();
        this.editEmployeeForm.reset();
        this.FindAllEmployees();//reloads emp list after delete
      }

      }, (error) => {
        console.log('Error: '+error);
      }
    );
  }

  //update empployee Http request
  updateEmpHttp(empId,empDetails){
    let url = `${this.baseUri}/employees/${empId}`;
    return this.http.put(url, empDetails, {headers: this.headers});
  }

}
