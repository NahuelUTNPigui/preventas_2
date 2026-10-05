import { Component, OnInit, OnDestroy, ViewChild  } from '@angular/core';

import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';

import { RemitoService } from '../remito.service';

@Component({
  selector: 'app-tablaremitos',
  templateUrl: './tablaremitos.component.html',
  styleUrls: ['./tablaremitos.component.scss']
})
export class TablaremitosComponent implements OnInit {

  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;
  
  constructor(private _remitoService:RemitoService) { }

  ngOnInit(): void {
    let t = JSON.parse(localStorage.getItem('currentUser')).token;
    this._remitoService.getUltimosRemitos().subscribe(res=>{
      this.rows = res.items
      this.page.count=this.rows.length
      
    })
  }
  public toFecha(fecha){
    return new Date(fecha).toLocaleDateString()
  }

}
