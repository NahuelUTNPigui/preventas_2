import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import { PagosService } from '../pagos.service';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-listacuentas',
  templateUrl: './listacuentas.component.html',
  styleUrls: ['./listacuentas.component.scss']
})
export class ListacuentasComponent implements OnInit {
  public conpermisos = false
  public acuentas = []
  public rows = []
  public proveedores = []
  public totalacuentas = 0
  
  //filtros
  public buscardescripcion = ""
  public fechaDesde = ""
  public fechaHasta = ""
  public buscarproveedor = ""

  //detalle
  public idcuenta = ""
  public created = ""
  public descripcion = ""
  public monto = 0
  public proveedor = ""
  public fecha = ""
  public pagada = false

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
    this._pagoService.getAcuentas(this.page.size, this.page.offset + 1,this.buscardescripcion, this.fechaDesde, this.fechaHasta, this.buscarproveedor).subscribe(res => {
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
      this._pagoService.getAcuentasTodos(this.buscardescripcion,this.fechaDesde, this.fechaHasta, this.buscarproveedor).then(res => {
        let csvdata = res.map(item => ({
          FECHA: this.formatDateExcel(item.fecha, true),
          DESCRIPCION: item.descripcion,
          MONTO: item.monto,
          PROVEEDOR: this.getNombreProveedor(item.proveedor),
          PAGADA: item.pago.length>0?"Sí":"No",
          
        }))
  
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([])
        ws['A1'] = { t: 's', v: `A cuenta proveedor`, s: {} };
        const range = XLSX.utils.decode_range('A1:K1');
        ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
        XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
        XLSX.utils.book_append_sheet(wb, ws, 'A cuenta proveedor');
        XLSX.writeFile(wb, `A cuenta proveedor.xlsx`, { cellStyles: true });
      })
  
    }
    openACuenta(modal,rowid){
      let idx_cuenta = this.rows.findIndex(r => r.id == rowid)
      if (idx_cuenta != -1) {
        let c = this.rows[idx_cuenta]
        this.idcuenta = c.id
        this.monto = c.monto
        this.descripcion = c.descripcion
        this.proveedor = this.getNombreProveedor(c.proveedor)
        this.created = new Date(c.created).toISOString().split('T')[0]
        this.fecha = new Date(c.fecha).toISOString().split('T')[0]
        this.pagada = c.pago.length>0
        this.modalService.open(modal, {
          centered: true,
          size: 'xl',
          windowClass: 'modal modal-primary'
        });
      }
    }
    calcularTotal(){
      this.totalacuentas = 0
      this._pagoService.getAcuentasTodos(this.buscardescripcion,this.fechaDesde, this.fechaHasta, this.buscarproveedor).then(res => {
          for(let i = 0;i<res.length;i++){
            this.totalacuentas += res[i].monto
          }
      })
    }

}
