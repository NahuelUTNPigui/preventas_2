import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-listapagos',
  templateUrl: './listapagos.component.html',
  styleUrls: ['./listapagos.component.scss']
})
export class ListapagosComponent implements OnInit {
  public conpermisos = false
  constructor() {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
   }

  ngOnInit(): void {
  }

}
