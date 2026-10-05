import { Component, OnInit } from '@angular/core';
import { ColumnMode  } from '@swimlane/ngx-datatable';
import { SelectFormatService } from 'app/main/common';
import { PagosService } from '../pagos.service';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {
  public conpermisos = false

  public selectedOption = 10;
  public proveedores = []
  public rows: any[];
  public data: any[];
  public ColumnMode = ColumnMode;
  public fechaPagoDesde = ''
  public fechaPagoHasta = ''
  public proveedor = ''
  //totales
  public totalordenes = 0
  public totalpagos = 0
  public totaldescuentos = 0
  public totalacuentas = 0
  
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
    private _selectService: SelectFormatService, 
    private _filtroService:FiltrosService,
    private _pagoService:PagosService
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    let filtro = this._filtroService.getFiltro(this._filtroService.PAGOS())
    this._selectService.getTodosProveedores().then(res=>{
      this.proveedores = res
      this.proveedor = filtro.proveedor

    })
    this.fechaPagoDesde = filtro.fechadesde
    this.fechaPagoHasta = filtro.fechahasta
    this.loadPage()
  }
  loadPage(){
    this._pagoService.getPagos(this.page.size,this.page.offset + 1,this.fechaPagoDesde,this.fechaPagoHasta,this.proveedor).subscribe(res=>{
      let lista = res.items.map(x=>({
        ...x,
        saldo:x.total - (x.totalpagos+x.totaldescuentos+x.totalacuentas)
      }))
      this.rows = lista
      
      this.page.count = res.totalItems;
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
  piso(numero){
    return Math.round(numero)
  }
  formatPeso(value){
    return this._pagoService.formatPeso(value)
  }
  limpiarFiltros(){
    this.proveedor = ""
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año,mes,1)
    let ultima_dia_mes = new Date(año,mes+1,0)
    this.fechaPagoDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaPagoHasta = ultima_dia_mes.toISOString().split('T')[0]

    this.filterUpdate({})

  }
  filterUpdate(event){
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(),"fechadesde",this.fechaPagoDesde)
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(),"fechahasta",this.fechaPagoHasta)
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(),"proveedor",this.proveedor)
    this.page.offset = 0;
    this.loadPage();
  }
  changeProveedor(){
    this.filterUpdate({})
  }
  formatDateExcel(fechaString: string, final: boolean) {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const dia = fecha.getUTCDate();
    const mes = fecha.getUTCMonth() + 1;
    const anio = fecha.getUTCFullYear();
    const fechaFormateada = !final ? `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}` : `${(dia - 1).toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
    return fechaFormateada;
  }
  exportarXLX(){
    
    
    this._pagoService.getTodosPagos(this.fechaPagoDesde,this.fechaPagoHasta,this.proveedor).then(res=>{
      let lista  = res.map(x=>({
        ...x,
        saldo:x.total - (x.totalpagos+x.totaldescuentos+x.totalacuentas)
      }))
      let csvdata = lista.map(item=>({
        FECHAPAGO:this.formatDateExcel(item.fechacobro,false),
        PROVEEDOR:item.expand.proveedor.nombre,
        TOTALORDENES:item.total,
        TOTALPAGOS:item.totalpagos,
        TOTALDESCUENTOS:item.totaldescuentos,
        TOTALACUENTAS:item.totalacuentas,
        SALDO:item.saldo
      }))
      //csvdata.sort((c1,c2)=>c1.FECHACOBRO<c2.FECHACOBRO?-1:1)
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `Pagos - Desde: ${this.formatDateExcel(this.fechaPagoDesde,false)} Hasta: ${this.formatDateExcel(this.fechaPagoHasta,false)}`, s: {} };
      const range = XLSX.utils.decode_range('A1:L1');
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'Pagos');
      XLSX.writeFile(wb, `Pagos: ${this.fechaPagoDesde.replace(/\//g, "-")}-${this.fechaPagoHasta.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
    }) 
  }
  ConfirmDeletePago(id){
      Swal.fire({
        title: '¿Eliminar?',
        text: "Se eliminará el pago",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      }).then((result) => {
        if (result.value) {
          this.deletePago(id)
  
        }
      });
    }
    deletePago(id){
      this._pagoService.deletePago(id).then(res=>{
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Pago eliminado exitosamente.',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
        this.page.offset = 0; 
        this.loadPage()
      })
    }


}
