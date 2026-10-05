import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagosService } from '../pagos.service';
import { RemitoService } from 'app/main/remito/remito.service';
@Component({
  selector: 'app-modelordenes',
  templateUrl: './modelordenes.component.html',
  styleUrls: ['./modelordenes.component.scss']
})
export class ModelordenesComponent implements OnInit {
  @Input() datapagar = []
  public totalhr = 0
  public totaldetalles = 0
  public total = 0
  public proveedor = ""
  public nombreproveedor = ""
  public numero = ""
  public fechapago = new Date().toISOString().split('T')[0]
  public concepto = ""
  public unidad = ""
  public unidades = []
  public detalles = []
  public rowsdetalles = []
  public rows = []
  public idhr = ""
  //Detalle
  public descripciondetalle = ''
  public totaldetalle = 0
  @Output() cerrarModalEvent = new EventEmitter<string>();
  @Output() editarHREvent = new EventEmitter<any>();
  @Output() quitarHREvent = new EventEmitter<string>();
  public selectedOption = 10;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(
    private _selectService: SelectFormatService,
    private _pagoService: PagosService,
    private _remitoService: RemitoService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.unidades = this._pagoService.getUnidades()
    this.page.count = this.datapagar.length
    this.datapagar.forEach(hr => {
      this.totalhr += hr.totalproveedor
      this.total += hr.totalproveedor
    })
    this.proveedor = this.datapagar[0].proveedor
    this.nombreproveedor = this.datapagar[0].expand.proveedor.nombre
  }
  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset + 1), this.page.count)
    this.rows = []
    for (let i = min_i; i < max_i; i++) {
      this.rows.push(this.datapagar[i])
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
  formatPeso(value) {
    return this._selectService.formatPeso(value)
  }
  redondear(num) {
    return Math.round(1000 * num) / 1000
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
  crearOrden() {
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
    if (this.nombreproveedor == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir el proveedor",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    if (this.concepto == '') {
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
    this._pagoService.crearOrden(
      this.numero,
      this.proveedor,
      this.fechapago,
      this.total,
      this.unidad,
      this.concepto,
      this.datapagar,
      ""
    ).then(res => {
      this._pagoService.guardarDetalles(res.id, this.detalles).then(resd => {
        this.vistaXCL(false)
        this.detalles = []
        Swal.fire("Éxito creción", "Se guardó la orden de pago con éxito", "success")
        this.cerrarModalEvent.emit("Cerrar")
      })
    })
  }
  openModalDetalle(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  quitarHR(id) {
    this.datapagar = this.datapagar.filter(h => h.id != id)
    this.quitarHREvent.emit(id)
  }
  addDetalle() {
    let indice = this.generatePass()
    let deta = { indice, descripcion: this.descripciondetalle, total: this.totaldetalle, monto: this.totaldetalle }
    this.descripciondetalle = ""
    this.totaldetalle = 0
    this.total = 0
    this.totaldetalles = 0
    this.detalles.push(deta)
    this.rowsdetalles = []

    for (let i = 0; i < this.detalles.length; i++) {
      this.rowsdetalles.push(this.detalles[i])
      this.totaldetalles += this.detalles[i].total
      this.total += this.detalles[i].total
    }
    this.datapagar.forEach(hr => {
      this.total += hr.totalproveedor
    })


  }
  quitarDetalle(id) {
    this.rowsdetalles = this.rowsdetalles.filter(d => d.indice != id)
    this.total = 0
    this.totaldetalles = 0
    this.rowsdetalles = []

    for (let i = 0; i < this.detalles.length; i++) {
      this.rowsdetalles.push(this.detalles[i])
      this.totaldetalles += this.detalles[i].total
      this.total += this.detalles[i].total
    }
    this.datapagar.forEach(hr => {
      this.total += hr.totalproveedor
    })
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
  vistaXCL(esVistaPrevia) {
    if (this.nombreproveedor == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir el proveedor",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    if (this.concepto == '') {
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
    let csvdata = this.datapagar.map(item => ({
      FECHAENTREGA: this.formatDateExcel(item.fechaentrega, true),
      NUMERO: item.codigo,
      TOTALPROVEEDOR: item.totalproveedor,
      PROVEEDOR: item.expand?.proveedor?.nombre,
      CHOFER: item.expand?.chofer?.nombre,
      VEHICULO: item.expand?.vehiculo?.nombre
    }))
    csvdata.sort((c1, c2) => c1.FECHAENTREGA < c2.FECHAENTREGA ? -1 : 1)
    let totalreporte = [{ TOTAL: this.redondear(this.total) }]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    if (esVistaPrevia) {
      ws['A1'] = { t: 's', v: `Vista previa - ${this.nombreproveedor} - ORDEN ${this.concepto}`, s: {} };
    }
    else {
      ws['A1'] = { t: 's', v: `${this.nombreproveedor} - ORDEN ${this.concepto}`, s: {} };
    }
    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.sheet_add_json(ws, totalreporte, { origin: 'Q2' })
    XLSX.utils.book_append_sheet(wb, ws, 'Hoja de ruta');
    //Detalles
    const wsdetalles = XLSX.utils.aoa_to_sheet([])
    wsdetalles['A1'] = { t: 's', v: "Detalles de la factura", s: {} }
    wsdetalles['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    let csvdetalles = this.detalles.map(d => ({
      DESCRIPCION: d.descripcion,
      TOTAL: d.total
    }))
    XLSX.utils.sheet_add_json(wsdetalles, csvdetalles, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsdetalles, 'Detalles factura');
    if (esVistaPrevia) {
      XLSX.writeFile(wb, `${this.nombreproveedor} - ${this.concepto.replace(/\//g, "-")} - Vista previa.xlsx`, { cellStyles: true });
    }
    else {
      XLSX.writeFile(wb, `${this.nombreproveedor} - ${this.concepto.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
    }
  }
  editarHR(e) {

    this._remitoService.getHRById(this.idhr).subscribe(res => {

      let hr_index = this.datapagar.findIndex(h => h.id == this.idhr)
      this.datapagar[hr_index] = res
      this.datapagar = this.datapagar.map(p => p)
      this.total = 0
      this.totalhr = 0
      for (let i = 0; i < this.detalles.length; i++) {

        this.total += this.detalles[i].total
      }
      this.datapagar.forEach(hr => {
        this.totalhr += hr.totalproveedor
        this.total += hr.totalproveedor
      })
      this.editarHREvent.emit(e)
    })

  }
  detalle(id, modal) {
    this.idhr = id
    this.modalService.open(modal, {
      centered: true,
      size: "xl",
      windowClass: 'modal modal-primary'
    })
  }

}
