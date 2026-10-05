import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import { FacturacionService } from '../facturacion.service';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-listaretenciones',
  templateUrl: './listaretenciones.component.html',
  styleUrls: ['./listaretenciones.component.scss']
})
export class ListaretencionesComponent implements OnInit {
  public conpermisos = false
  public retenciones = []
  public rows = []
  public clientes = []
  public tiposrete = []
  public totalretenciones = 0
  //filtros
  public buscardescripcion = ""
  public fechaDesde = ""
  public fechaHasta = ""
  public buscarcliente = ""
  //Detalle
  public fecha = ""
  public descripcion = ""
  public monto = ""
  public cliente = ""
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(
    private _selectService: SelectFormatService,
    private _factService: FacturacionService,
    private modalService: NgbModal) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
    })
    this.tiposrete = this._factService.getAllRetenciones()
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechaDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaHasta = ultima_dia_mes.toISOString().split('T')[0]

    this.loadPage()
  }
  getNombreCliente(idcliente) {
    let idx_cliente = this.clientes.findIndex(c => c.id == idcliente)
    if (idx_cliente != -1) {
      let c = this.clientes[idx_cliente]
      return c.nombre
    }
    else {
      return ""
    }
  }
  getNombreDescripcion(iddescripcion) {
    let idx_rete = this.tiposrete.findIndex(c => c.id == iddescripcion)
    if (idx_rete != -1) {
      let c = this.tiposrete[idx_rete]
      return c.nombre
    }
    else {
      return ""
    }
  }
  filterUpdate(event) {
    this.page.offset = 0
    this.loadPage()
  }
  loadPage() {
    this._factService.getRetenciones(this.page.size, this.page.offset + 1, this.buscardescripcion, this.buscarcliente, this.fechaDesde, this.fechaHasta).subscribe(res => {
      
      this.rows = res.items
      this.page.count = res.totalItems
    })
  }
  onPage(event) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
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
  exportarXLX() {
    this._factService.getTodasRetenciones(this.buscardescripcion, this.buscarcliente, this.fechaDesde, this.fechaHasta).then(res => {
      let csvdata = res.map(item => ({
        FECHA: this.formatDateExcel(item.expand.cobro.fechacobro, false),
        DESCRIPCION: this.getNombreDescripcion(item.descripcion),
        MONTO: item.monto,
        CLIENTE: this.getNombreCliente(item.expand?.cobro?.cliente),


      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `Retenciones`, s: {} };
      const range = XLSX.utils.decode_range('A1:K1');
      ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'Retenciones');
      XLSX.writeFile(wb, `Retenciones.xlsx`, { cellStyles: true });
    })

  }
  openRetencion(modal, rowid) {
    let idx_rete = this.rows.findIndex(r => r.id == rowid)
    if (idx_rete != -1) {
      let rete = this.rows[idx_rete]
      this.monto = rete.monto
      this.descripcion = rete.descripcion
      this.fecha = new Date(rete.created).toISOString().split('T')[0]
      this.cliente = this.getNombreCliente(rete.expand.cobro.cliente)
      this.modalService.open(modal, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });

    }
  }
  calcularTotal(){
    this.totalretenciones = 0
    
    this._factService.getTodasRetenciones(this.buscardescripcion, this.buscarcliente, this.fechaDesde, this.fechaHasta).then(res => {
      
      this.totalretenciones += res.reduce((res,item)=>res+item.monto,0)
      
    })
  }

}
