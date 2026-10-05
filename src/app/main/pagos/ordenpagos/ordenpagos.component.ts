import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import { PagosService } from '../pagos.service';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
@Component({
  selector: 'app-ordenpagos',
  templateUrl: './ordenpagos.component.html',
  styleUrls: ['./ordenpagos.component.scss']
})
export class OrdenpagosComponent implements OnInit {
  public data: any[] = []
  public rows: any[] = []
  public proveedores = []
  public ordenes = []
  public listaordenes = ''

  public concepto = ''
  public nroorden = ''

  public proveedor = ''
  public fechaDesde = ''
  public fechaHasta = ""

  public ColumnMode = ColumnMode;
  public todos = true
  public pagado = false
  public total = 0
  private HOY = new Date()

  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  //PERMISOS
  public conpermisos = false
  constructor(
    private _selectService: SelectFormatService,
    private _pagosServicio: PagosService,
    private _filtroService: FiltrosService,
    private modalService: NgbModal,
    private _router: Router

  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    let filtro = this._filtroService.getFiltro(this._filtroService.ORDENES())
    this.nroorden = filtro.nro
    this.fechaDesde = filtro.fechadesde
    this.fechaHasta = filtro.fechahasta
    this.concepto = filtro.concepto
    this.proveedor = filtro.proveedor
    this.todos = filtro.todos
    this.pagado = filtro.pagado

    this._pagosServicio.getOrdenes(
      this.proveedor, this.nroorden,
      this.concepto, this.todos,
      this.pagado, this.fechaDesde, this.fechaHasta
    ).then(res => {
      this.data = res
      for (let i = 0; i < this.data.length; i++) {
        this.data[i].total = Math.round((this.data[i].total + Number.EPSILON) * 10000) / 10000
        let diff = this.HOY.getTime() - new Date(this.data[i].fechaorden).getTime()
        this.data[i].diaspasados = this.data[i].pagado ? 0 : Math.round(diff / (1000 * 3600 * 24));
        this.total += this.data[i].total
      }
      this.page.count = this.data.length
      let localpago = this._pagosServicio.retomarPago()
      this.ordenes = []
      this.ordenes = localpago.ordenes
      this.loadPage()


    })
    this._selectService.getTodosProveedores().then(res => {
      this.proveedores = res
    })


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
  getNombreProveedor(id) {
    let ps = this.proveedores.filter(pro => pro.id == id)
    if (ps.length > 0) {
      return ps[0].nombre
    }
    else {
      return ""
    }
  }
  exportarXLX() {

    let csvdata = this.data.map((item: any) => ({
      FECHAORDEN: this.formatDateExcel(item.fechaorden, false),
      PAGADO: item.pagado ? "Si" : "No",
      CONCEPTO: item.concepto,
      PROVEEDOR: item.expand.proveedor.nombre,
      NUMERO: item.numero,
      TOTAL: item.total
    }))
    csvdata.sort((c1, c2) => c1.FECHAORDEN < c2.FECHAORDEN ? 1 : -1)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    ws['A1'] = { t: 's', v: `ORDENES: ${this.getNombreProveedor(this.proveedor)} - ${this.concepto.replace(/\//g, "-")}`, s: {} };
    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
    XLSX.writeFile(wb, `${this.getNombreProveedor(this.proveedor)} - ${this.concepto.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
  }
  openPagoModal(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  cerrarModalPago(modal) {
    modal.dismiss('Cross click')
  }
  onCheckboxChange(row) {
    if (!this.inOrdenes(row.id)) {
      this.agregarOrden(row.id)
    }
    else {
      this.quitarOrden(row.id)
    }
  }
  agregarTodos() {
    this.ordenes = []
    for (let i = 0; i < this.rows.length; i++) {
      this.ordenes.push(this.rows[i])
    }
  }
  agregarOrden(id) {
    let ord = this.data.filter(f => f.id == id)[0]
    this.ordenes.push(ord)

    this.loadPage()
  }
  showOrdenesCargadas() {
    let fs = ""
    if (this.ordenes.length == 0) {
      return fs
    }
    for (let i = 0; i < this.ordenes.length; i++) {
      fs += " " + this.ordenes[i].concepto
      if (i != (this.ordenes.length - 1)) {
        fs += ","
      }
    }

    return fs
  }
  limpiarLista() {
    this.ordenes = []
    this._pagosServicio.crearPago(this.ordenes)
    this.loadPage()
  }
  quitarOrden(id) {

    this.ordenes = this.ordenes.filter(f => f.id != id)
    this.loadPage()
  }
  inOrdenes(id) {
    for (let i = 0; i < this.ordenes.length; i++) {
      if (this.ordenes[i].id == id) {
        return true
      }
    }
    return false
  }
  ConfirmDeleteOpen(id) {
    Swal.fire({
      title: '¿Eliminar?',
      text: "Se eliminará la orden",
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
        let o_eliminar = this.rows.find((o: any) => o.id == id)
        if (o_eliminar) {
          if (o_eliminar.enliquidacion) {
            let orden = {
              id: o_eliminar.id,
              proveedor: o_eliminar.proveedor,

              unidad: o_eliminar.unidad,
              numero: o_eliminar.numero,
              total: o_eliminar.total
            }
            
            
            this._pagosServicio.crearAsientoEliminarOrden(orden).then(res => {
              this.eliminarOrden(id)
            })


          }
          else {
            
            this.eliminarOrden(id)
          }

        }

      }
    });
  }
  eliminarOrden(id) {
    this._pagosServicio.deleteOrden(id).then(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Factura eliminado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.filterUpdate({})
    })
  }
  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset + 1), this.page.count)
    this.rows = []
    for (let i = min_i; i < max_i; i++) {
      this.rows.push(this.data[i])
    }
  }
  onPage(event) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  pagarOrden(modal) {
    modal.dismiss('Cross click')
    this.ordenes = []
    this.filterUpdate({})
  }
  formatPeso(value) {
    return this._pagosServicio.formatPeso(value)
  }
  limpiarFiltros() {
    this.nroorden = ''
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechaDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.todos = true
    this.pagado = false
    this.concepto = ''
    this.proveedor = ''
    this.filterUpdate({})
  }
  filterUpdate(event) {
    this.total = 0
    this._filtroService.setItemFiltro(this._filtroService.ORDENES(), "nro", this.nroorden)
    this._filtroService.setItemFiltro(this._filtroService.ORDENES(), "fechadesde", this.fechaDesde)
    this._filtroService.setItemFiltro(this._filtroService.ORDENES(), "fechahasta", this.fechaHasta)
    this._filtroService.setItemFiltro(this._filtroService.ORDENES(), "todos", this.todos)
    this._filtroService.setItemFiltro(this._filtroService.ORDENES(), "pagado", this.pagado)
    this._filtroService.setItemFiltro(this._filtroService.ORDENES(), "cliente", this.proveedor)
    this._filtroService.setItemFiltro(this._filtroService.ORDENES(), "concepto", this.concepto)
    this.page.offset = 0
    this._pagosServicio.getOrdenes(
      this.proveedor, this.nroorden,
      this.concepto, this.todos,
      this.pagado, this.fechaDesde, this.fechaHasta
    ).then(res => {
      this.data = res
      for (let i = 0; i < this.data.length; i++) {
        this.data[i].total = Math.round((this.data[i].total + Number.EPSILON) * 10000) / 10000
        let diff = this.HOY.getTime() - new Date(this.data[i].fechafacturacion).getTime()
        this.data[i].diaspasados = this.data[i].cobrado ? 0 : Math.round(diff / (1000 * 3600 * 24));
        this.total += this.data[i].total
      }
      this.page.count = this.data.length
      this.loadPage()

    })
  }
  recuperarPago() {
    this._router.navigateByUrl("/pagos/liquidacionordenes")
  }
  abrirPago() {
    this._pagosServicio.crearPago(this.ordenes)
    this._router.navigateByUrl("/pagos/liquidacionordenes")
  }
  limpiarSeleccion() {
    this.ordenes = []
    this._pagosServicio.crearPago(this.ordenes)
  }

}
