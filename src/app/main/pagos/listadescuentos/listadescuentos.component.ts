import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectFormatService } from 'app/main/common';
import { PagosService } from '../pagos.service';
@Component({
  selector: 'app-listadescuentos',
  templateUrl: './listadescuentos.component.html',
  styleUrls: ['./listadescuentos.component.scss']
})
export class ListadescuentosComponent implements OnInit {
  public conpermisos = false
  public descuentos = []
  public rows = []
  public proveedores = []
  public totaldescuentos = 0
  //filtros
  public fechaDesde = ""
  public fechaHasta = ""
  public buscarproveedor = ""
  //Detalle
  public fecha = ""
  public descripcion = ""
  public monto = ""
  public proveedor = ""
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(
    private _selectService: SelectFormatService,
    private _pagoService: PagosService,
    private modalService: NgbModal) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this._selectService.getTodosProveedores().then(res => {
      this.proveedores = res
    })
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechaDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaHasta = ultima_dia_mes.toISOString().split('T')[0]

    this.loadPage()
  }
  getNombreProveedor(idproveedor) {
    let idx_proveedor = this.proveedores.findIndex(p => p.id == idproveedor)
    if (idx_proveedor != -1) {
      let p = this.proveedores[idx_proveedor]
      return p.nombre
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
    this._pagoService.getDescuento(this.page.size, this.page.offset + 1, this.buscarproveedor, this.fechaDesde, this.fechaHasta).subscribe(res => {

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
    this._pagoService.getTodosDescuentos(this.buscarproveedor, this.fechaDesde, this.fechaHasta).then(res => {
      let csvdata = res.map(item => ({
        FECHA: this.formatDateExcel(item.created, true),
        DESCRIPCION: item.descripcion,
        MONTO: item.monto,
        PROVEEDOR: this.getNombreProveedor(item.expand?.pago?.proveedor)
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `Descuentos Proveedores`, s: {} };
      const range = XLSX.utils.decode_range('A1:K1');
      ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'Descuentos Proveedores');
      XLSX.writeFile(wb, `Descuentos Proveedores.xlsx`, { cellStyles: true });
    })

  }
  openDescuento(modal, rowid) {
    let idx_rete = this.rows.findIndex(r => r.id == rowid)
    if (idx_rete != -1) {
      let rete = this.rows[idx_rete]
      this.monto = rete.monto
      this.descripcion = rete.descripcion
      this.fecha = new Date(rete.created).toISOString().split('T')[0]
      this.proveedor = this.getNombreProveedor(rete.expand.pago.proveedor)
      this.modalService.open(modal, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });

    }
  }
  calcularTotal(){
    this.totaldescuentos = 0
    this._pagoService.getTodosDescuentos(this.buscarproveedor, this.fechaDesde, this.fechaHasta ).then(res => {
        for(let i = 0;i<res.length;i++){
          this.totaldescuentos += res[i].monto
        }
    })
  }

}
