import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SelectFormatService } from 'app/main/common';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { PagosService } from '../pagos.service';
@Component({
  selector: 'app-buscarcuenta',
  templateUrl: './buscarcuenta.component.html',
  styleUrls: ['./buscarcuenta.component.scss']
})
export class BuscarcuentaComponent implements OnInit {
  @Input() saldo = 0
  @Input() proveedor = "";
  public selectedOption = 10;
  public data: any[] = [];
  public rows: any[] = [];
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
    private _pagoService: PagosService
  ) { }

  ngOnInit(): void {
    this._pagoService.getAcuentasProveedorSinUsar(this.proveedor, this.fechaDesde, this.fechaHasta).then(res => {
      this.data = res
      this.rows = res
      this.page.count = this.rows.length
    })
  }
  filterUpdate(event:any) {
    this._pagoService.getAcuentasProveedorSinUsar(this.proveedor, this.fechaDesde, this.fechaHasta).then(res => {

      this.data = res
      
      this.rows = res
      this.page.count = this.rows.length
    })
  }
  loadPage() {
    this.filterUpdate({})
  }
  elegirCuenta(rowid:any) {
    let idx_cuenta = this.data.findIndex(d => d.id == rowid)
    if (idx_cuenta != -1) {

      let cuenta = this.data[idx_cuenta]
      
      this.cuentaEvent.emit({
        ...cuenta
      })
    }
  }

}
