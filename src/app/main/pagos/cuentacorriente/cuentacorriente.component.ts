import { Component, OnInit } from '@angular/core';
import { ColumnMode  } from '@swimlane/ngx-datatable';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import { PagosService } from '../pagos.service';

@Component({
  selector: 'app-cuentacorriente',
  templateUrl: './cuentacorriente.component.html',
  styleUrls: ['./cuentacorriente.component.scss']
})
export class CuentacorrienteComponent implements OnInit {
  public conpermisos = false
  public fechadesde = ""
  public fechahasta = ""
  public unidad = ""
  public unidades = []
  public proveedores = []
  public cuentas = []
  public proveedor = ""
  //filtros ordnde
  public nroOrden = ""
  public todos = true
  public cobrados = false
  public enliquidacion = false
  public enrevision = false
  public cerrada = false
  private IVA = 1.21
  //filtros pagos
  public todospago = true
  public pagocompleto = true
  //saldos
  public saldofinal = 0
  public saldoinicial = 0
  // totales
  public totalordenes = 0
  public totaliva = 0
  public totalpagos = 0
  public totaldescuentos = 0
  public totalacuentas = 0
  public acuenta = 0
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(private _pagoService:PagosService,private _select:SelectFormatService) { 
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año,mes,1)
    let ultima_dia_mes = new Date(año,mes+1,0)
    this.fechadesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    
    this.filterUpdate({})
    this._select.getTodosProveedores().then(res=>{
      this.proveedores = res
      this.page.count = res.length
    })
  }
  toPesoString(value){
    return this._select.formatPeso(value)
  }
  filterUpdate($event){
    this.totalordenes = 0
    this.totaliva = 0
    this.totalpagos = 0
    this.totaldescuentos =0
    this.totalacuentas = 0
    this.page.offset = 0
    this.cuentas = []
    this._pagoService.getCuentaCorrienteProveedor(this.proveedor,this.page.size,this.page.offset+1,this.fechadesde,this.fechahasta).then(res=>{
      this.cuentas = res
      let saldo_o = this.saldoinicial
      for(let i = 0;i<this.cuentas.length;i++){
        let fila = this.cuentas[i]

        saldo_o += fila.total
        saldo_o += fila.iva
        saldo_o += fila.acuenta
        saldo_o -= fila.pagos
        
        saldo_o -= fila.descuentos
        saldo_o -= fila.acuentas
        

        this.totalordenes += fila.total
        this.totaliva += fila.iva
        this.totalpagos += fila.pagos
        
        this.totaldescuentos += fila.descuentos
        
        this.totalacuentas += fila.acuentas
        this.cuentas[i].saldo = saldo_o
      }
      this.saldofinal = saldo_o
      if(this.cuentas.length == 1){
        this.page.count = 1 
      }
      else{
        this.page.count=this.cuentas.length
      }
    })
  }
  loadPage() {
    this.cuentas = []
    this._pagoService.getCuentaCorrienteProveedor(this.proveedor,this.page.size,this.page.offset+1,this.fechadesde,this.fechahasta).then(res=>{
      this.cuentas = res
    })
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  async exportarXLX(){ 
    if(this.proveedor !=""){
      let csv = []
      csv = this.cuentas.map(c=>({
        PROVEEDOR:c.nombre,
        ORDENES:c.ordenestotal,
        PAGOS:c.pagostotal,
        DESCUENTOS:c.descuentos,
        SALDO:c.saldototal
      }))
      const wb = XLSX.utils.book_new()

      const ws = XLSX.utils.aoa_to_sheet([])
      let vs = `${this.fechadesde} - ${this.fechahasta}`
      if(this.proveedor != ""){
        let nombreproveedor = this.proveedores.filter(c=>c.id==this.proveedor)[0].nombre
        vs = `${vs} ${nombreproveedor}`
      }
      ws['A1'] = { t: 's', v: vs, s: {} };
      const range = XLSX.utils.decode_range('A1:K1');
      ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
      XLSX.utils.sheet_add_json(ws, csv, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'Cuentas corrientes');
      XLSX.writeFile(wb, `${vs}.xlsx`, { cellStyles: true });
    }
    else{
      this._pagoService.getTodasCuentasCorrientesProveedores(this.fechadesde,this.fechahasta).then(res=>{
        let csv = res.map(c=>({
          PROVEEDOR:c.nombre,
          ORDENES:c.ordenestotal,
          PAGOS:c.pagostotal,
          ADICIONALES:c.adicionales,
          SALDO:c.saldototal
        }))
        const wb = XLSX.utils.book_new()

        const ws = XLSX.utils.aoa_to_sheet([])
        let vs = `${this.fechadesde} - ${this.fechahasta}`
        if(this.proveedor != ""){
          let nombreproveedor = this.proveedores.filter(c=>c.id==this.proveedor)[0].nombre
          vs = `${vs} ${nombreproveedor}`
        }
        ws['A1'] = { t: 's', v: vs, s: {} };
        const range = XLSX.utils.decode_range('A1:K1');
        ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
        XLSX.utils.sheet_add_json(ws, csv, { origin: 'A2' });
        XLSX.utils.book_append_sheet(wb, ws, 'Cuentas corrientes');
        XLSX.writeFile(wb, `${vs}.xlsx`, { cellStyles: true });
      })
      
    }
  }
  formatPeso(value) {
    return this._select.formatPeso(value)
  }

}
