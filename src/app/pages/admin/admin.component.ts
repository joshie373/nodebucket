import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private cookie: CookieService,private router: Router) { }
colorUsers: string ;
colorTasks: string ;
colorReports: string ;
  ngOnInit() {
    //check if employee is admin or not.
    if(this.cookie.get('role') == "User" ){
      alert(
        "You do not have sufficient permission to view this page! \nPlease contact your administrator for access request!");
      this.router.navigate([""]);
    }
    

  }



}
