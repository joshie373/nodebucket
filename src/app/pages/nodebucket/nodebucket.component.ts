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
  newTaskdueDateValue: any;

  editTaskForm: FormGroup;
  editTaskText: string;
  editTaskId: string;
  editTaskEmployeeId:string;
  editDueDateValue: any;
  editDateAddedValue: any;
  editDateModifiedValue:any;
  editLastModifiedByValue:any;

  //open modal function
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    this.newTaskForm = this.fb.group({
      newTaskInput : ['', [Validators.required]],
      newTaskdueDate: ['', [Validators.required]]
    })
  }

  //opens edit task modal
  openEditModal(editTaskTemplate: TemplateRef<any>) {

    this.editTaskForm = this.fb.group({
      editTaskTextInput : ['', [Validators.required]],
      editTaskIdInput : ['', [Validators.required]], 
      editDueDate: ['', [Validators.required]],
      editDateAdded:[],
      editDateModified:[],
      editLastModifiedBy:[]
    })
    this.modalRef = this.modalService.show(editTaskTemplate);
    
  }

  //sets values of the edit task input form controls
  setValues(empId,taskId){
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
        this.editDateModifiedValue = res['dateLastModified'];
        this.editLastModifiedByValue = res['lastModifiedBy'];

        this.editDueDateValue=this.editDueDateValue.substring(0, 10);
        this.editDateAddedValue=this.editDateAddedValue.substring(0, 10);
        this.editDateModifiedValue=this.editDateModifiedValue.substring(0, 10);

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
      editDueDate: this.editDueDateValue,
      editDateAdded: this.editDateAddedValue,
      editDateModified: this.editDateModifiedValue,
      editLastModifiedBy: this.editLastModifiedByValue
    });
    
  }

  // Getter to access form control
  get myNewTaskForm(){
    return this.newTaskForm.controls;
  }
  //---end modal elements----

//used to connect to node server to run api calls
baseUri:string = '../api';

 //sets header values for http request
 headers = new HttpHeaders().set('Content-Type', 'application/json');

 //local arrays to be used for the drag and drop
  todo = [];
  doing = [];
  done = [];

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
        console.log(res);

        //sets local array to the response array
        this.todo = res.todo;
        this.doing = res.doing;
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
    let newDoing = [];
    let newDone = [];



    //removes id field from todo array objects and pushes to newTodo array
    this.todo.forEach(e =>{
      let temp = {
        "text":e.text,
        "dueDate": e.dueDate,
        "dateAdded":e.dateAdded,
        "dateLastModified":e.dateLastModified,
        "lastModifiedBy": e.lastModifiedBy
      };
      newTodo.push(temp)
    });

    //removes id field from doing array objects and pushes to newDoing array
    this.doing.forEach(e =>{
      let temp = {
        "text":e.text,
        "dueDate": e.dueDate,
        "dateAdded":e.dateAdded,
        "dateLastModified":e.dateLastModified,
        "lastModifiedBy": e.lastModifiedBy
      };
      newDoing.push(temp)
    });

    //removes id field from done array objects and pushes to newTodo array
    this.done.forEach(e =>{
      let temp = {
        "text":e.text,
        "dueDate": e.dueDate,
        "dateAdded":e.dateAdded,
        "dateLastModified":e.dateLastModified,
        "lastModifiedBy": e.lastModifiedBy
      };
      newDone.push(temp)
    });

    //builds single object with newTodo and newDone arrays
    newItems = {todo: newTodo ,doing: newDoing,done: newDone};
    newItems = JSON.stringify(newItems);//turns the new object into JSON

    let id = this.cookie.get('empLogin');//gets the employee id from the cookies
    let url = `${this.baseUri}/employees/${id}/tasks`;
    return this.http.put(url,newItems, {headers: this.headers});

  }

  //function for saving the changes made.
  save(){
    this.saveAll().subscribe(
      (res) => {
        console.log("save log");
        console.log(res);
        this.FindAllTasks();//reloads task list after delete
      }, (error) => {
        console.log('Error: '+error);
      }
    );
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

    let task = {"text": this.newTaskText, "dueDate":this.newTaskdueDateValue };
    this.newTaskHttp(this.cookie.get('empLogin'),task).subscribe(
      (res) => {
      if(res){
        console.log(res);

        //sets local array to the response array
        this.todo = res.todo;
        this.doing = res.doing;
        this.done = res.done;
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

  //get single task HTTP request
  getTaskHttp(id,taskId){
      let url = `${this.baseUri}/employees/${id}/tasks/${taskId}`;
      return this.http.get(url, {headers: this.headers});
  }

  //updateTask function
  updateTask(){


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
        this.FindAllTasks();//reloads task list after delete

        }
        else{
          console.log(res);
        //closes modal  and clears form on successful insert
        this.modalRef.hide();
        this.editTaskForm.reset();
        this.FindAllTasks();//reloads task list after delete
        }

        }, (error) => {
          console.log('Error: '+error);
        }
      );
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

  //on init functions
    ngOnInit() {
      this.FindAllTasks();
    }
}




