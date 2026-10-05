import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import { FacturacionService } from '../facturacion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-modalfacturacion',
  templateUrl: './modalfacturacion.component.html',
  styleUrls: ['./modalfacturacion.component.scss']
})
export class ModalfacturacionComponent implements OnInit {

  @Input() datafacturar = []
  public total = 0
  public totaliva = 0
  public totalremitos = 0
  public totaldetalles = 0
  public nombreCliente = ''
  public fechafacturacion = new Date().toISOString().split('T')[0]
  public cliente = ''
  public idremito = ''
  @Output() facturaEvent = new EventEmitter<string>();
  @Output() cerrarModalEvent = new EventEmitter<string>();
  @Output() editarRemitoEvent = new EventEmitter<any>();
  public rows = []
  public clientes = []
  public selectedOption = 10;
  public monthyear = ''
  public nroFactura = ''
  public unidad = ''
  public datadetalles = []
  public rowsdetalles = []
  public unidades = []
  public descripciondetalle = ''
  public totaldetalle = 0
  public IVA = 1.21
  public esResponsable = false
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
  }

  ngOnInit(): void {
    this.unidades = this._factService.getUnidades()
    this.page.count = this.datafacturar.length
    this.datafacturar.forEach(r => {
      this.total += Number(r.totalViaje)
      this.totalremitos += Number(r.totalViaje)
    })
    this.totaliva = this.redondear(this.IVA * Number(this.total))
    this.datadetalles = []
    this.rowsdetalles = []
    this.loadPage()
    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
    })
    this.cliente = this.datafacturar[0].cliente
    this.nombreCliente = this.datafacturar[0].expand.cliente.nombre

  }
  modalEditRemitoOpen(modalEdit, idremito) {
    this.idremito = idremito
    this.modalService.open(modalEdit, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  openModalDetalle(modalDeta) {
    this.modalService.open(modalDeta, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  changeCliente() {
    let c = this.clientes.filter(c => c.id == this.cliente)[0]
    this.esResponsable = c.responsableinscripto
    this.nombreCliente = c.nombre
  }
  quitarRemito(id: string) {

    this.page.offset = 0;
    this.facturaEvent.emit(id)
    this.total = 0
    this.datafacturar = this.datafacturar.filter(r => r.id != id)
    this.datafacturar.forEach(r => this.total += r.totalViaje)
    this.datafacturar.forEach(r => this.total += r.totalremitos)
    this.datadetalles.forEach(d => this.total += d.total)

    this.totaliva = this.redondear(this.IVA * Number(this.total))
    this.loadPage()
  }
  vistaXCL(esVistaPrevia: boolean) {
    if (this.nombreCliente == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir el cliente",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    if (this.monthyear == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir algun concepto",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }

    let csvdata = this.datafacturar.map(item => ({
      ESTADO: item.expand.estado.nombre,
      FACTURAR: item.facturar ? "Facturar" : "No facturar",
      FECHAINGRESO: this.formatDateExcel(item.fechaIngreso, false),
      CLIENTE: item.expand?.cliente?.nombre,
      RTO: item.nroRemito,
      KG: item.kilos,
      BULTOS: item.bultos,
      DESTINATARIO: item.expand?.destinatario?.nombre,
      LOCALIDAD: item.expand?.destinatario?.expand?.localidad?.nombre,
      FECHAENTREGA: item.fechaEntrega ? this.formatDateExcel(item.fechaEntrega, false) : "",
      NOVEDAD: item.novedad,
      PRECIOUNITARIO: item.precioUnitario,
      VALORDECLARADO: item.valorDeclarado,
      PORCENTAJE: item.porcentajeCobro,
      TOTAL: Number(item.totalViaje)
    }))

    csvdata.sort((c1, c2) => c1.FECHAINGRESO < c2.FECHAINGRESO ? -1 : 1)
    let totalreporte = [{ TOTALFACTURACION: this.redondear(this.total) }]
    let totalreporteiva = [{ TOTALFACTURACIONIVA: this.redondear(this.totaliva) }]
    const wb = XLSX.utils.book_new()

    const ws = XLSX.utils.aoa_to_sheet([])

    if (esVistaPrevia) {
      ws['A1'] = { t: 's', v: `Vista previa - ${this.nombreCliente} - INGRESOS ${this.monthyear}`, s: {} };
    }
    else {
      ws['A1'] = { t: 's', v: `${this.nombreCliente} - INGRESOS ${this.monthyear}`, s: {} };
    }

    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.sheet_add_json(ws, totalreporte, { origin: 'Q2' })
    XLSX.utils.sheet_add_json(ws, totalreporteiva, { origin: 'S2' })
    XLSX.utils.book_append_sheet(wb, ws, 'Remitos facturacion');
    // Detalles
    const wsdetalles = XLSX.utils.aoa_to_sheet([])
    wsdetalles['A1'] = { t: 's', v: "Detalles de la factura", s: {} }
    wsdetalles['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    let csvdetalles = this.datadetalles.map(d => ({
      DESCRIPCION: d.descripcion,
      TOTAL: d.total
    }))
    XLSX.utils.sheet_add_json(wsdetalles, csvdetalles, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsdetalles, 'Detalles factura');
    if (esVistaPrevia) {
      XLSX.writeFile(wb, `${this.nombreCliente} - ${this.monthyear.replace(/\//g, "-")} - Vista previa.xlsx`, { cellStyles: true });
    }
    else {
      XLSX.writeFile(wb, `${this.nombreCliente} - ${this.monthyear.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
    }

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
  recalcularTotal() {
    this.total = 0
    this.datafacturar.forEach(r => this.total += Number(r.totalViaje))
    this.datadetalles.forEach(d => this.total += Number(d.total))
    this.totaliva = this.redondear(this.IVA * Number(this.total))
  }
  redondear(num) {
    return Math.round(1000 * num) / 1000
  }
  facturar() {
    if (this.unidad == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe elegir la unidad",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    if (this.nombreCliente == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir el cliente",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    if (this.monthyear == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir el concepto",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    let algun_no_facturar = false
    for (let i = 0; i < this.datafacturar.length; i++) {
      if (!this.datafacturar[i].facturar) {
        algun_no_facturar = true
        break
      }
    }
    let algun_facturado = false
    for (let i = 0; i < this.datafacturar.length; i++) {
      if (this.datafacturar[i].factura != "") {
        algun_facturado = true
        break
      }
    }
    if (algun_no_facturar) {
      let html = `
        <p>Hay remitos marcados de no facturar, serán facturados</p>
        <p>Desea continuar con la facturación?</p>
      
      `
      Swal.fire({
        title: "Remitos no facturar",
        html,
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

          this._factService.facturar(this.datafacturar, this.nroFactura, this.monthyear, this.cliente, this.total, this.fechafacturacion + ' 03:00:00.000Z', this.unidad,"").then(
            res => {
              this._factService.guardarDetalles(res.id, this.datadetalles).then(res2 => {
                this.vistaXCL(false)
                this.datadetalles = []
                this.cerrarModalEvent.emit("Cerrar")
              })

            }
          )
        }
      })
    }
    else if (algun_facturado) {

      let html = `
        <p>Hay remitos ya facturados que se van a omitir</p>
        <p>Desea continuar?</p>
      
      `
      Swal.fire({
        title: "Remitos facturados",
        html,
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
          this.datafacturar = this.datafacturar.filter(d => d.factura == "")
          if (this.datafacturar.length != 0) {
            Swal.fire("Factura vacia", "No hay remitos para facturar", "error")
            return
          }
          this._factService.facturar(this.datafacturar, this.nroFactura, this.monthyear, this.cliente, this.total, this.fechafacturacion + ' 03:00:00.000Z', this.unidad,"").then(
            res => {
              this._factService.guardarDetalles(res.id, this.datadetalles).then(res2 => {
                this.vistaXCL(false)
                this.datadetalles = []
                this.cerrarModalEvent.emit("Cerrar")
              })

            }
          )
        }
      })
    }
    else {
      this._factService.facturar(this.datafacturar, this.nroFactura, this.monthyear, this.cliente, this.total, this.fechafacturacion + ' 03:00:00.000Z', this.unidad,"").then(
        res => {
          this._factService.guardarDetalles(res.id, this.datadetalles).then(res2 => {
            this.vistaXCL(false)
            this.datadetalles = []
            this.cerrarModalEvent.emit("Cerrar")
          })

        }
      )
    }
  }
  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset + 1), this.page.count)
    this.rows = []
    for (let i = min_i; i < max_i; i++) {
      this.rows.push(this.datafacturar[i])
    }
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  limpiarDetalles() {
    this.datadetalles = []
    this.rowsdetalles = []
    this.totaldetalle = 0
  }
  cerrarModalEdit(modal, remito) {
    modal.dismiss('Cross click')
    let indice = this.datafacturar.findIndex(r => r.id == remito.id)
    this.datafacturar[indice] = remito
    this.loadPage()
    this.total = 0
    this.totalremitos = 0

    this.datafacturar.forEach(r => {
      this.totalremitos += Number(r.totalViaje)
      this.total += Number(r.totalViaje)
    })
    this.datadetalles.forEach(d => this.total += Number(d.total))
    this.totaliva = this.redondear(this.IVA * Number(this.total))
    this.editarRemitoEvent.emit(remito)
  }
  quitarDetalle(indice) {
    let idx = this.datadetalles.findIndex(d => d.indice == indice)
    this.datadetalles.splice(idx, 1)
    this.rowsdetalles = []
    this.total = 0
    this.totalremitos = 0
    this.totaldetalles = 0
    for (let i = 0; i < this.datadetalles.length; i++) {
      this.rowsdetalles.push(this.datadetalles[i])
      this.totaldetalles += Number(this.datadetalles[i].total)
      this.total += Number(this.datadetalles[i].total)

    }
    this.datafacturar.forEach(r => {
      this.total += Number(r.totalViaje)
      this.totalremitos += Number(r.totalViaje)
    })
    this.totaliva = this.redondear(this.IVA * Number(this.total))
  }
  generatePass() {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      'abcdefghijklmnopqrstuvwxyz0123456789@#$';

    for (let i = 1; i <= 15; i++) {
      let char = Math.floor(Math.random()
        * str.length + 1);

      pass += str.charAt(char)
    }

    return pass;
  }
  calcularConiva() {
    this.totaliva = this.redondear(this.IVA * Number(this.total))
  }
  addDetalle() {

    let indice = this.generatePass()
    let deta = { indice, descripcion: this.descripciondetalle, total: this.totaldetalle }
    this.descripciondetalle = ''
    this.totaldetalle = 0
    this.datadetalles.push(deta)
    this.total = 0
    this.totaldetalles = 0
    this.rowsdetalles = []
    for (let i = 0; i < this.datadetalles.length; i++) {
      this.rowsdetalles.push(this.datadetalles[i])
      this.total += Number(this.datadetalles[i].total)
      this.totaldetalles += Number(this.datadetalles[i].total)
    }
    this.datafacturar.forEach(r => {
      this.total += Number(r.totalViaje)
    })
    this.totaliva = this.redondear(this.IVA * Number(this.total))
  }
  limpiarNoFact() {
    this.datafacturar = this.datafacturar.filter(d => d.facturar)
    this.page.count = this.datafacturar.length
    this.total = 0
    this.totalremitos = 0
    this.datafacturar.forEach(r => {
      this.total += Number(r.totalViaje)
      this.totalremitos += Number(r.totalViaje)
    })
    this.datadetalles.forEach(d => this.total += Number(d.total))
    this.totaliva = this.redondear(this.IVA * Number(this.total))

    this.datadetalles = []
    this.rowsdetalles = []
    this.loadPage()
  }
  limpiarFacturados() {
    this.datafacturar = this.datafacturar.filter(d => d.factura == "")
    this.page.count = this.datafacturar.length
    this.total = 0
    this.totalremitos = 0
    this.datafacturar.forEach(r => {
      this.total += Number(r.totalViaje)
      this.totalremitos += Number(r.totalViaje)
    })
    this.datadetalles.forEach(d => this.total += Number(d.total))
    this.totaliva = this.redondear(this.IVA * Number(this.total))

    this.datadetalles = []
    this.rowsdetalles = []
    this.loadPage()
  }
  formatPeso(value) {
    return this._selectService.formatPeso(value)
  }
  formatKilo(value) {
    return this._selectService.formatKilo(value)
  }

}
