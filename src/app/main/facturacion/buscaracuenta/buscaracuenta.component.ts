import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
import { FacturacionService } from '../facturacion.service';
import { SelectFormatService } from 'app/main/common';
import { ColumnMode } from '@swimlane/ngx-datatable';
@Component({
  selector: 'app-buscaracuenta',
  templateUrl: './buscaracuenta.component.html',
  styleUrls: ['./buscaracuenta.component.scss']
})
export class BuscaracuentaComponent implements OnInit {
  @Input() saldo=0
  @Input() cliente="";
  public selectedOption = 10;
  public data: any[];
  public rows: any[];
  public fechaDesde = ""
  public fechaHasta = ""
  public ColumnMode = ColumnMode;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  @Output() cuentaEvent = new EventEmitter<any>();
  constructor(
      private _selectFormatService: SelectFormatService,
      private _facturacionService:FacturacionService
    ) { }

  ngOnInit(): void {
  
    this._facturacionService.getAcuentasClienteSinUsar(this.cliente,this.fechaDesde,this.fechaHasta).then(res=>{
      this.data = res
      this.rows = res
      this.page.count = this.rows.length
      
    })
  }
  filterUpdate(event){
    this._facturacionService.getAcuentasClienteSinUsar(this.cliente,this.fechaDesde,this.fechaHasta).then(res=>{
      this.data = res
      this.rows = res
      this.page.count = this.rows.length
    })
  }
  loadPage(){
    this.filterUpdate({})
  }
  elegirCuenta(rowid){
    let idx_cuenta = this.data.findIndex(d=>d.id == rowid)
    if(idx_cuenta != -1){
      let cuenta = this.data[idx_cuenta]
      this.cuentaEvent.emit({
        ...cuenta
      })
    }
  }
  
}
