import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagosService } from '../pagos.service';
import { RemitoService } from 'app/main/remito/remito.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-liquidacion',
  templateUrl: './liquidacion.component.html',
  styleUrls: ['./liquidacion.component.scss']
})
export class LiquidacionComponent implements OnInit {
  public tab = 1;
  public estados = []
  public datapagar = []
  public remitos = []
  public totalhr = 0
  public totaldetalles = 0
  public total = 0
  public totaliva = 0
  public totalremitos = 0
  public rentabilidadabsoluta = 0
  public rentabilidad = 0
  public kilos = 0
  public bultos = 0
  public declarado = 0
  public responsable = false
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
    private modalService: NgbModal,
    private _router: Router
  ) { }

  ngOnInit(): void {
    let op = this._pagoService.retomarOrdenPago()
    this.estados = this._selectService.getEstadosHR()
    this.datapagar = op.hojas
    this.numero = op.numero
    this.total = Number(op.total)
    this.total = 0
    this.fechapago = op.fechapago
    this.unidad = op.unidad
    this.detalles = op.detalles.map(d => d)
    this.concepto = op.concepto
    this.unidades = this._pagoService.getUnidades()
    this.page.count = this.datapagar.length
    this.datapagar.forEach(hr => {
      this.totalhr += hr.totalproveedor
      this.total += Number(hr.totalproveedor)
    })
    this.totaldetalles = 0
    this.rowsdetalles = []

    for (let i = 0; i < this.detalles.length; i++) {
      this.rowsdetalles.push(this.detalles[i])
      this.totaldetalles += this.detalles[i].total
      this.total += Number(this.detalles[i].total)
    }
    this.totaliva = 1.21 * this.total
    this.proveedor = this.datapagar[0].proveedor
    this.nombreproveedor = this.datapagar[0].expand.proveedor.nombre
    this.responsable = this.datapagar[0].expand.proveedor.responsable
    
  }
  getEstadoNombre(idestado) {
    let est = this.estados.filter(e => e.id == idestado)[0]
    return est.nombre
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
  async crearOrden() {
    if (this.fechapago == "") {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe seleccionar una fecha de pago, puede ser estimativa",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
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
    let ordenid = await this._pagoService.getOrdenMaxId()
    let nuevocod = ordenid.maximo + 1
    this._pagoService.crearOrden(
      this.numero,
      this.proveedor,
      this.fechapago,
      this.total,
      this.unidad,
      this.concepto,
      this.datapagar,
      nuevocod + " - " + this.nombreproveedor
    ).then(res => {
      this._pagoService.updateOrdenMaxId(nuevocod, ordenid.id).then(res2 => {

      })
      this._pagoService.guardarDetalles(res.id, this.detalles).then(resd => {
        this.vistaXCL(false)
        this.detalles = []
        Swal.fire("Éxito creción", "Se guardó la orden de pago con éxito", "success")
        this._router.navigateByUrl("/pagos/ordenes")

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
    this.onChangeCampo()
  }
  addDetalle() {
    if (this.descripciondetalle.length == 0) {
      return
    }
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
    this.totaliva = 1.21 * this.total
    this.onChangeCampo()
  }
  quitarDetalle(id) {
    this.detalles = this.detalles.filter(d => d.indice != id)
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
    this.totaliva = 1.21 * this.total
    this.onChangeCampo()
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
    //orden

    let csvdata = this.datapagar.map(item => ({
      FECHAENTREGA: this.formatDateExcel(item.fechaentrega, true),
      NUMERO: item.codigo,
      TOTALPROVEEDOR: item.totalproveedor,
      PROVEEDOR: item.expand?.proveedor?.nombre,
      CHOFER: item.expand?.chofer?.nombre,
      VEHICULO: item.expand?.vehiculo?.nombre
    }))
    csvdata.sort((c1, c2) => c1.FECHAENTREGA < c2.FECHAENTREGA ? -1 : 1)
    let totalreporte = [{
      TOTALHOJAS: this.redondear(this.totalhr),
      TOTALDETALLES: this.redondear(this.totaldetalles),
      TOTAL: this.redondear(this.total),
      TOTALIVA: this.redondear(this.totaliva)
    }]

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
      this.totaliva = 1.21 * this.total
      this.onChangeCampo()

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
  onChangeCampo() {

    let op = {
      numero: this.numero,
      concepto: this.concepto,
      fechapago: this.fechapago,
      total: this.total,
      unidad: this.unidad,
      proveedor: this.proveedor,
      hojas: this.datapagar,
      detalles: this.detalles
    }

    this._pagoService.guardarOrdenPago(op)
  }
  verRemitos() {
    this.kilos = 0
    this.bultos = 0
    this.totalremitos = 0
    this.declarado = 0
    let idhrs = this.datapagar.map(hr => hr.id)
    this.remitos = []
    this._pagoService.getRemitosFromHRs(idhrs).then(res => {
      this.remitos = res
      for (let i = 0; i < res.length; i++) {
        let fila = res[i]
        this.kilos += fila.kilos
        this.bultos += fila.bultos
        this.totalremitos += fila.totalViaje
        this.declarado += fila.valorDeclarado
      }
      this.rentabilidadabsoluta = this.totalremitos - this.total
      this.rentabilidad = 100 * (this.rentabilidadabsoluta / this.totalremitos)
    })

  }
  onNavChange(event: any) {
    this.tab = event.nextId;

  }
  
}
