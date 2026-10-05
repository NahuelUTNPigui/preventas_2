import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-listafacturas',
  templateUrl: './listafacturas.component.html',
  styleUrls: ['./listafacturas.component.scss']
})
export class ListafacturasComponent implements OnInit {
  public conpermisos = false
  constructor() {
    let user = JSON.parse(localStorage.getItem('currentUser')||"{}")
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
  }

}
