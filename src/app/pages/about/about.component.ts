import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private modalService: BsModalService) { }

  ngOnInit() {
  }

  modalRef: BsModalRef;
  imgSource:string;
  //open modal function
  openModal(imageTemplate: TemplateRef<any>,imgSource) {
    this.imgSource=imgSource;
    this.modalRef = this.modalService.show(imageTemplate,{class:"modal-lg"});
  }

}
