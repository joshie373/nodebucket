import { Component, OnInit,Inject,TemplateRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { FormControl, Validators, FormGroup,FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-nodebucket',
  templateUrl: './nodebucket.component.html',
  styleUrls: ['./nodebucket.component.css']
})
export class NodebucketComponent implements OnInit {


  constructor(private cookie: CookieService,private http: HttpClient,private modalService: BsModalService,public fb: FormBuilder) { }

//----modal elements-----
modalRef: BsModalRef;

newTaskForm: FormGroup;
newTaskText: string;

//open modal function
openModal(template: TemplateRef<any>) {
  this.modalRef = this.modalService.show(template);
  this.newTaskForm = this.fb.group({
    newTaskInput : ['', [Validators.required]]
  })
}
//---end modal elements----

 //used to connect to node server to run api calls
 baseUri:string = 'http://localhost:3000/api';

 //sets header values for http request
 headers = new HttpHeaders().set('Content-Type', 'application/json');

 //local arrays to be used for the drag and drop
  todo = [];
  done = [];

  //boolean for identifying employee role
  isUser: boolean = false;
  isAdmin:boolean = false;
  isManager: boolean=false;

  // function for drag and dop events
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
    this.save();//saves to database after every change
  }

  //function to find all tasks
  FindAllTasks(){
    this.FindAllTasksHttp(this.cookie.get('empLogin')).subscribe(
      (res) => {
      if(res){
        console.log(res.todo);

        //sets local array to the response array
        this.todo = res.todo;
        this.done = res.done;
      }
      else{
        console.log(res);
      }

      }, (error) => {
        console.log('Error: '+error);
      }
    );
  }

  //HTTP request to get all tasks
  FindAllTasksHttp(id): Observable<any> {
    let url = `${this.baseUri}/employees/${id}/tasks`;
    return this.http.get(url, {headers: this.headers});
  }

  //runs updateTask Http request
  saveAll(){
    let newItems: {};
    let newTodo= [];
    let newDone = [];

    //removes id field from todo array objects and pushes to newTodo array
    this.todo.forEach(e =>{
      let temp = {"text":e.text};
      newTodo.push(temp)
    });

    //removes id field from done array objects and pushes to newTodo array
    this.done.forEach(e =>{
      let temp = {"text":e.text};
      newDone.push(temp)
    });

    //builds single object with newTodo and newDone arrays
    newItems = {todo: newTodo ,done: newDone};
    newItems = JSON.stringify(newItems);//turns the new object into JSON

    let id = this.cookie.get('empLogin');//gets the employee id from the cookies
    let url = `${this.baseUri}/employees/${id}/tasks`;
    return this.http.put(url,newItems, {headers: this.headers});

  }

  //function for saving the changes made.
  save(){
    this.saveAll().subscribe(
      (res) => {
        console.log(res);
      }, (error) => {
        console.log('Error: '+error);
      }
    );
    console.log("save task done");
    console.log(this.done);
    console.log("save task todo");
    console.log(this.todo);
  }

  //delete function
  delete(taskId){
    //confirm window confirming deletion
    let confirmDelete = confirm("Are you sure you want to delete this task?");
    if (confirmDelete){
      //delete task
      this.deleteTaskHttp(this.cookie.get('empLogin'),taskId).subscribe(
        (res) => {
        if(res){
          console.log(res);
          this.FindAllTasks();//reloads task list after delete
        }
        else{
          console.log(res);
          this.FindAllTasks();//reloads task list after delete
        }

        }, (error) => {
          console.log('Error: '+error);
        }
      );
    }else{
      //do nothing
    }
  }

  //delete task http request
  deleteTaskHttp(empId,taskId): Observable<any> {
    let url = `${this.baseUri}/employees/${empId}/tasks/${taskId}`;
    return this.http.delete(url, {headers: this.headers});
  }

  //newTask function
  newTask(){
    // let task = {"text":"please delete me"};

    let task = {"text": this.newTaskText};
    this.newTaskHttp(this.cookie.get('empLogin'),task).subscribe(
      (res) => {
      if(res){
        console.log(res.todo);

        //sets local array to the response array
        this.todo = res.todo;
        this.done = res.done;
        console.log("new task done");
        console.log(this.done);
        console.log("new task todo");
        console.log(this.todo);
        //closes modal  and clears form on successful insert
        this.modalRef.hide();
        this.newTaskForm.reset();

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

  //function to check the role of the user logged in
  logCheck(){
    switch (this.cookie.get('role')) {
      case "User":
        this.isUser = true;
        this.isAdmin = false;
        this.isManager = false;
        break;
      case "Admin":
        this.isUser = false;
        this.isAdmin = true;
        this.isManager = false;
        break;
      case "Manager":
        this.isUser = false;
        this.isAdmin = false;
        this.isManager = true;
          break;

      default:
        break;
    }
  }

//on init functions
  ngOnInit() {
    this.FindAllTasks();
    this.logCheck();


  }
}




