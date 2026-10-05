import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { PagosService } from '../pagos.service';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-detallepago',
  templateUrl: './detallepago.component.html',
  styleUrls: ['./detallepago.component.scss']
})
export class DetallepagoComponent implements OnInit {
  //tab
  public tab = 1
  //Datos
  public url = this.router.url;

  // Modales
  public indicefila = ""
  public fila = {}
  public indicedescuento = ""
  public descuento = {}



  public id = ""

  public conpermisos = false
  HOY = new Date().toISOString().split("T")[0]

  public selectedOption = 10;
  public rowsdetalles: any[] = []
  public rowsdescuentos: any[] = []
  public rowsacuenta: any[] = []
  public rowsordenes: any[] = []
  public ColumnMode = ColumnMode;
  public numero = ""
  public fechapago = ''
  public pagocompleto = ''
  public completo = false
  public responsable = false
  public proveedor = ''
  public nombreproveedor = ''
  public totalordenes = 0
  public totaldetalles = 0
  public totaldescuentos = 0
  public totalacuentas = 0
  public saldo = 0


  pageordenes = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  pagedetalles = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  pagedescuentos = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  pageacuentas = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
    private router: Router,
    private _pagoService: PagosService,
    private modalService: NgbModal,
    private _selectService: SelectFormatService,
  ) {
    this.id = this.url.substr(this.url.lastIndexOf('/') + 1);
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this._pagoService.getPago(this.id).then(res => {
      this.rowsdetalles = res.pagos
      this.pagedetalles.size = res.pagos.length
      this.pagedetalles.count = res.pagos.length
      this.rowsacuenta = res.acuentas
      this.pageacuentas.size = res.acuentas.length
      this.pageacuentas.count = res.acuentas.length
      this.rowsordenes = res.ordenes
      this.pageordenes.size = res.ordenes.length
      this.pageordenes.count = res.ordenes.length
      this.rowsdescuentos = res.descuentos

      this.pagedescuentos.size = res.descuentos.length
      this.pagedescuentos.count = res.descuentos.length
      this.numero = res.numero
      this.fechapago = res.fechapago.split(" ")[0]
      this.pagocompleto = res.pagocompleto.split(" ")[0]
      this.completo = res.completo
      this.proveedor = res.proveedor
      this.nombreproveedor = res.expand.proveedor.nombre
      this.responsable = res.expand.proveedor.responsable
      this.calcularTotal()
      this.tab = 1
      //this.totalacuentas = res.totalacuentas
      //this.totalordenes = res.total
      //this.totaldetalles = res.totalpagos
      //this.totaldescuentos = res.totaldescuentos
      //this.saldo = this.totalordenes - (this.totaldetalles + this.totaldescuentos + this.totalacuentas)
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
  exportarXLX() {
    let csvpago = [
      {

        SALDO: this.saldo,
        COMPLETO: this.completo ? "Sí" : "No",
        NUMERO: this.numero,
        FECHAPAGO: this.fechapago,
        FECHAPAGOCOMPLETO: this.pagocompleto,
        PROVEEDOR: this.nombreproveedor,
        ORDENES: this.totalordenes,
        PAGOS: this.totaldetalles,
        DESCUENTOS: this.totaldescuentos,
        ACUENTAS: this.totalacuentas
      }
    ]
    let csvordenes = this.rowsordenes.map(item => ({
      FECHAORDEN: this.formatDateExcel(item.fechaorden, true),
      CONCEPTO: item.concepto,
      NUMERO: item.numero,
      TOTAL: item.total
    }))
    let csvdatadetalles = this.rowsdetalles.map(item => ({
      DESCRIPCION: item.descripcion,
      MONTO: "$" + item.total,
      CATEGORIA: item.categoria,

    }))
    let csvdatadesc = this.rowsdescuentos.map(item => ({
      DESCRIPCION: item.descripcion,
      MONTO: "$" + item.monto
    }))
    let csvdatacuentas = this.rowsacuenta.map(item => ({
      DESCRIPCION: item.descripcion,
      MONTO: "$" + item.monto
    }))

    const wb = XLSX.utils.book_new();
    const range = XLSX.utils.decode_range('A1:K1');
    //pago 
    const wspago = XLSX.utils.aoa_to_sheet([])
    wspago['A1'] = { t: 's', v: `PAGO - FECHA PAGO: ${this.formatDateExcel(this.fechapago, true)}`, s: {} };
    wspago['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wspago, csvpago, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wspago, 'Pago');
    //Ordenes
    const wsordenes = XLSX.utils.aoa_to_sheet([])
    wsordenes['A1'] = { t: 's', v: "Ordenes", s: {} }
    wsordenes['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsordenes, csvordenes, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsordenes, 'Ordenes');
    // Detalles pagos
    const wsdetalles = XLSX.utils.aoa_to_sheet([])
    wsdetalles['A1'] = { t: 's', v: "Detalles de pagos", s: {} }
    wsdetalles['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsdetalles, csvdatadetalles, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsdetalles, 'Pagos');
    // Descuentos
    const wsdescuentos = XLSX.utils.aoa_to_sheet([])
    wsdescuentos['A1'] = { t: 's', v: "Descuentos", s: {} }
    wsdescuentos['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsdescuentos, csvdatadesc, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsdescuentos, 'Descuentos');
    //a cuentas
    const wsacuentas = XLSX.utils.aoa_to_sheet([])
    wsacuentas['A1'] = { t: 's', v: "A cuentas", s: {} }
    wsacuentas['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsacuentas, csvdatacuentas, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsacuentas, 'A cuentas');
    XLSX.writeFile(wb, `PAGO_${this.nombreproveedor}_${this.formatDateExcel(this.fechapago, true)}.xlsx`, { cellStyles: true });

  }
  openModal(modal) {
    this.indicefila = ""
    this.fila = {}
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  guardarPago() {
    this._pagoService.editPago(
      this.id, this.numero,
      this.fechapago, this.pagocompleto, this.completo,
      this.totalordenes, this.totaldetalles, this.totaldescuentos,
      this.totalacuentas
    ).subscribe(res => {

      Swal.fire("Éxito editar pago", "Se logró editar", "success")
    })
  }
  openModalDescuento(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  guardarFila(fila, modal) {
    this._pagoService.addDetalle(fila, this.proveedor, this.id).then(res => {
      this.rowsdetalles = this.rowsdetalles.map(x => x).concat(res)
      this.pagedetalles.size = this.rowsdetalles.length
      this.pagedetalles.count = this.rowsdetalles.length
      this.calcularTotal()
      this._pagoService.editPago(
        this.id, this.numero,
        this.fechapago, this.pagocompleto, this.completo,
        this.totalordenes, this.totaldetalles, this.totaldescuentos,
        this.totalacuentas
      ).subscribe(res2 => {
        modal.dismiss('Cross click')
        Swal.fire("Éxito guardar pago", "Se logró guardar", "success")
      })
    })
  }
  guardarDescuento(fila, modal) {
    this._pagoService.addDescuento(fila, this.id).then(res => {
      this.rowsdescuentos = this.rowsdescuentos.map(x => x).concat(res)
      this.pagedescuentos.size = this.rowsdescuentos.length
      this.pagedescuentos.count = this.rowsdescuentos.length
      this.calcularTotal()
      this._pagoService.editPago(
        this.id, this.numero,
        this.fechapago, this.pagocompleto, this.completo,
        this.totalordenes, this.totaldetalles, this.totaldescuentos,
        this.totalacuentas
      ).subscribe(res2 => {
        modal.dismiss('Cross click')
        Swal.fire("Éxito guardar descuento", "Se logró guardar", "success")
      })
    })
  }
  elegirCuenta(fila, modal) {
    let idx_cuenta = this.rowsacuenta.findIndex(c => c.id == fila.id)

    if (idx_cuenta == -1) {
      this._pagoService.addCuenta(fila, this.id).then(res => {
        this.rowsacuenta = this.rowsacuenta.map(x => x).concat(res)
        this.pageacuentas.count = this.rowsacuenta.length
        this.pageacuentas.size = this.rowsacuenta.length
        this.calcularTotal()
        this._pagoService.editPago(
          this.id, this.numero,
          this.fechapago, this.pagocompleto, this.completo,
          this.totalordenes, this.totaldetalles, this.totaldescuentos,
          this.totalacuentas
        ).subscribe(res2 => {
          modal.dismiss('Cross click')
          Swal.fire("Éxito guardar a cuenta", "Se logró guardar", "success")
        })
      })

    }
    else {

      Swal.fire("A cuenta elegida", "Ya se eligió esta fila de acuenta", "info")
    }
  }
  elegirCheque(e, modal) {
    let repetido = this.rowsdetalles.findIndex(d => d.tipopago == 1 && d.cheque == e.id) != -1

    if (!repetido) {
      this._pagoService.elegirCheque(e, this.proveedor, this.id, this.HOY).then(res => {
        this.rowsdetalles = this.rowsdetalles.map(x => x).concat(res)
        this.pagedetalles.size = this.rowsdetalles.length
        this.pagedetalles.count = this.rowsdetalles.length
        this.calcularTotal()
        this._pagoService.editPago(
          this.id, this.numero,
          this.fechapago, this.pagocompleto, this.completo,
          this.totalordenes, this.totaldetalles, this.totaldescuentos,
          this.totalacuentas
        ).subscribe(res => {
          modal.dismiss('Cross click')
          Swal.fire("Cheque elegido", "Se logró guardar", "success")
        })
      })


    }
    else {
      Swal.fire("Cheque repetido", "Ya se eligió el cheque", "info")
    }

  }
  formatPeso(value) {
    return this._selectService.formatPeso(value)
  }
  redondear(num) {
    return Math.round(1000 * num) / 1000
  }
  calcularTotal() {

    this.saldo = 0
    this.totalordenes = 0
    this.totaldescuentos = 0
    this.totaldetalles = 0
    this.totalacuentas = 0
    for (let i = 0; i < this.rowsordenes.length; i++) {
      let d = this.rowsordenes[i]

      this.totalordenes += d.total
      this.saldo += d.total
    }
    for (let i = 0; i < this.rowsdetalles.length; i++) {
      let p = this.rowsdetalles[i]

      this.totaldetalles += p.monto
      this.saldo -= p.monto
    }
    for (let i = 0; i < this.rowsdescuentos.length; i++) {
      let d = this.rowsdescuentos[i]

      this.totaldescuentos += d.monto
      this.saldo -= d.monto
    }
    for (let i = 0; i < this.rowsacuenta.length; i++) {
      let a = this.rowsacuenta[i]

      this.totalacuentas += a.monto
      this.saldo -= a.monto
    }
  }
  onNavChange(event: any) {
    this.tab = event.nextId;
  }

}

