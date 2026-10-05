import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { PagosService } from '../pagos.service';


@Component({
  selector: 'app-liquidacionordenes',
  templateUrl: './liquidacionordenes.component.html',
  styleUrls: ['./liquidacionordenes.component.scss']
})
export class LiquidacionordenesComponent implements OnInit {
  //tab
  public tab = 1;
  //filas
  public datapagar = []
  public rowordenes = []
  public acuentas = []
  public rowsacuentas = []

  public pagos = []
  public rowpagos = []
  public descuentos = []
  public rowdescuentos = []

  public totalordenes = 0
  public totalpagos = 0
  public totaldescuentos = 0
  public totalacuentas = 0
  public acuenta = 0
  public nropago = ""
  public indicefila = ""
  public indicedescuento = ""
  public esVerFila = false
  public fila: any
  public descuento: any
  public tabactivo = 0

  public saldo = 0
  public nombreprov = ""
  public proveedor = ""
  public fechapago = ""
  public fechapagocompleto = ""
  public completo = true
  public ColumnMode = ColumnMode;
  //PERMISOS
  public conpermisos = false
  constructor(
    private _pagosService: PagosService,
    private _selectService: SelectFormatService,
    private _router: Router,
    private modalService: NgbModal
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    let pago = this._pagosService.retomarPago()


    this.completo = pago.completo
    this.nropago = pago.numero
    this.fechapago = pago.fechapago
    this.fechapagocompleto = pago.fechapagocompleto
    this.totalpagos = 0
    this.totaldescuentos = 0
    this.totalacuentas = 0
    this.totalordenes = 0
    this.acuenta = 0


    this.datapagar = pago.ordenes

    this.nombreprov = pago.ordenes[0].expand.proveedor.nombre || ""
    this.proveedor = pago.ordenes[0].proveedor

    this.pagos = pago.pagos
    this.descuentos = pago.descuentos
    this.acuentas = pago.acuentas


    this.calcularTotal()
  }
  calcularTotal() {
    this.rowpagos = []
    this.rowdescuentos = []
    this.rowsacuentas = []
    this.rowordenes = []
    this.acuenta = 0
    this.saldo = 0
    this.totalordenes = 0
    this.totaldescuentos = 0
    this.totalpagos = 0
    this.totalacuentas = 0
    for (let i = 0; i < this.datapagar.length; i++) {
      let d = this.datapagar[i]
      this.rowordenes.push(d)
      this.totalordenes += d.total
      this.saldo += d.total
    }
    for (let i = 0; i < this.pagos.length; i++) {
      let p = this.pagos[i]
      this.rowpagos.push(p)
      this.totalpagos += p.total
      this.saldo -= p.total
    }
    for (let i = 0; i < this.descuentos.length; i++) {
      let d = this.descuentos[i]
      this.rowdescuentos.push(d)
      this.totaldescuentos += d.monto
      this.saldo -= d.monto
    }
    for (let i = 0;i< this.acuentas.length; i++) {
      let a = this.acuentas[i]
      
      this.rowsacuentas.push(a)
      this.totalacuentas += a.monto
      this.saldo -= a.monto
    }
    if(this.saldo<0){
      this.acuenta = this.saldo * (-1.0)
    }


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
  quitarOrden(id) {
    this.datapagar = this.datapagar.filter(o => o.id != id)
    this.calcularTotal()
    this.onChangeCampo()
  }
  formatPeso(value) {
    return this._selectService.formatPeso(value)
  }
  redondear(num) {
    return Math.round(1000 * num) / 1000
  }
  onChangeCampo() {
    this.guardarPago()
  }
  guardarPago() {
    let pago = {
      completo: this.completo,

      numero: this.nropago,
      fechapago: this.fechapago,
      fechapagocompleto: this.fechapagocompleto,
      totalpagos: this.totalpagos,
      totaldescuentos: this.totaldescuentos,
      totalacuentas: this.totalacuentas,
      acuenta: this.acuenta,
      ordenes: this.datapagar,
      pagos: this.pagos,
      descuentos: this.descuentos,
      acuentas: this.acuentas
    }
    this._pagosService.guardarPago(pago)
  }
  guardarFila(fila, modal) {
    if (this.indicefila == "") {
      if (fila.categoria == "Cheque") {
        let repetido = this.pagos.findIndex(p => p.id == fila.id)
        if (repetido != -1) {
          Swal.fire("Cheque repetido", "Ya se eligió el cheque", "info")
          return
        }
      }
      let indice = this.generatePass()
      let deta = { ...fila, indice }
      this.pagos.push(deta)
    }
    else {
      let index = this.pagos.findIndex(d => d.indice == this.indicefila)
      if (index !== -1) {
        this.pagos[index] = { ...fila, indice: this.indicefila }
      }
    }
    this.onChangeCampo()
    this.calcularTotal()

    modal.dismiss('Cross click')
  }
  addDetalle() {

  }
  quitarDetalle(indice) {
    this.pagos = this.pagos.filter(p => p.indice != indice)
    this.calcularTotal()
    this.onChangeCampo()
  }
  editarDetalle() {

  }
  verFila(indice, modalCheque, modalTransfer, modalTrans) {
    this.indicefila = indice

    this.esVerFila = true

    this.fila = this.pagos.filter(d => d.indice == indice)[0]

    if (this.fila.categoria == "Cheque") {

      this.modalService.open(modalCheque, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }
    else if (this.fila.categoria == "Transferencia") {

      this.modalService.open(modalTransfer, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }
    else {

      this.modalService.open(modalTrans, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }
  }
  openModalDecuento(modal) {
    this.esVerFila = false
    this.descuento = {}
    this.indicedescuento = ""
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }

  guardarDescuento(e, modal) {
    if (this.indicedescuento == "") {
      let indice = this.generatePass()
      let nuevo = true
      let descuento = { ...e, indice, nuevo }
      this.descuentos.push(descuento)
      this.onChangeCampo()
    }
    else {
      let d_idx = this.descuentos.findIndex(d => d.indice == this.indicedescuento)
      if (d_idx != -1) {
        this.descuentos[d_idx] = {
          ...this.descuentos[d_idx],
          ...e
        }
      }
      this.onChangeCampo()

    }

    this.calcularTotal()
    modal.dismiss('Cross click')
  }
  openModalDescuento(modal) {
    this.esVerFila = false
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  quitarDescuento(indice) {
    this.descuentos = this.descuentos.filter(d => d.indice != indice)
    this.calcularTotal()
    this.onChangeCampo()
  }

  verFilaDescuento(indice, modalDescuento) {
    this.indicedescuento = indice
    this.esVerFila = true
    let idx_des = this.descuentos.findIndex(d => d.indice == this.indicedescuento)
    if (idx_des != -1) {
      this.descuento = this.descuentos[idx_des]
      this.modalService.open(modalDescuento, {
        centered: true,
        size: 'lg',
        windowClass: 'modal modal-primary'
      });

    }
  }
  elegirCuenta(cuenta, modal) {
    let idx_cuenta = this.acuentas.findIndex(c => c.id == cuenta.id)
    if (idx_cuenta == -1) {
      let fila_cuenta = {
        ...cuenta,
        indice: this.generatePass()
      }
      this.acuentas.push(fila_cuenta)
      this.calcularTotal()
      this.onChangeCampo()
      modal.dismiss('Cross click')
    }
    else {
      modal.dismiss('Cross click')
      Swal.fire("A cuenta elegida", "Ya se eligió esta fila de acuenta", "info")
    }
  }

  verCuenta(indice, modal) { }
  volver() {
    this._router.navigateByUrl("/pagos/ordenes")
  }
  pago() {
    if (this.nropago.length == 0) {
      Swal.fire("Error número", "Debe escribir algun número para indentificar el pago", "error")
      return
    }
    if (this.fechapago.length == 0) {
      Swal.fire("Error fecha pago", "Debe elegir alguna fecha de pago", "error")
      return
    }
    if (this.completo && this.fechapagocompleto.length == 0) {
      Swal.fire("Error fecha pago completo", "Debe elegir alguna fecha de pago completo si es completo el pago", "error")
      return
    }
    this.calcularTotal()
    if (this.acuenta > 0) {
      let html = `
            <p>El pago supera el total de las ordenes</p> 
            <p>Se va a crear una fila a cuenta</p> 
          `
      Swal.fire({
        title: 'Quiere crear a cuenta?',
        //text: "Se eliminará el remito"
        html,
        icon: 'warning',
        showCancelButton: true,

        confirmButtonText: 'Confirmar',
        cancelButtonText: 'No',


        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      }).then((result) => {
        if (result.value) {
          this._pagosService.pagarCompleto(
            this.nropago, this.proveedor,
            this.fechapago, this.fechapagocompleto,
            this.completo, this.totalordenes, this.acuenta,
            this.totalpagos, this.totaldescuentos, this.totalacuentas,
            this.datapagar, this.pagos, this.descuentos, this.acuentas
          ).then(res => {
            this.vistaPrevia(false)
            Swal.fire("Éxito", "Se logró guardar el pago con 'A cuenta'", "success")
            this._pagosService.crearPago([])
            this._router.navigateByUrl("/pagos/ordenes")
          })
        }
        
      })
    }
    else {
      this._pagosService.pagarCompleto(
        this.nropago, this.proveedor,
        this.fechapago, this.fechapagocompleto,
        this.completo, this.totalordenes, this.acuenta,
        this.totalpagos, this.totaldescuentos, this.totalacuentas,
        this.datapagar, this.pagos, this.descuentos, this.acuentas
      ).then(res => {
        this.vistaPrevia(false)
        Swal.fire("Éxito", "Se logró guardar el pago", "success")
        this._pagosService.crearPago([])
        this._router.navigateByUrl("/pagos/ordenes")
      })
    }
  }
  vistaPrevia(esVistaPrevia) {
    let csvpago = [
      {
        ACUENTA: this.acuenta,
        SALDO:this.saldo, 
        COMPLETO: this.completo ? "Sí" : "No",
        NUMERO: this.nropago,
        FECHAPAGO: this.fechapago,
        FECHAPAGOCOMPLETO: this.fechapagocompleto,
        PROVEEDOR: this.datapagar[0].expand.proveedor.nombre || "",
        ORDENES: this.totalordenes,
        PAGOS: this.totalpagos,
        DESCUENTOS: this.totaldescuentos,
        ACUENTAS: this.totalacuentas
      }
    ]
    let csvordenes = this.datapagar.map(item => ({
      FECHAORDEN: this.formatDateExcel(item.fechaorden, true),
      CONCEPTO: item.concepto,
      NUMERO: item.numero,
      TOTAL: item.total
    }))
    let csvdatadetalles = this.pagos.map(item => ({
      DESCRIPCION: item.descripcion,
      MONTO: "$" + item.total,
      CATEGORIA: item.categoria,

    }))
    let csvdatadesc = this.descuentos.map(item => ({
      DESCRIPCION: item.descripcion,
      MONTO: "$" + item.monto
    }))
    let csvdatacuentas = this.acuentas.map(item => ({
      DESCRIPCION: item.descripcion,
      MONTO: "$" + item.monto
    }))

    const wb = XLSX.utils.book_new();
    const range = XLSX.utils.decode_range('A1:K1');
    //pago 
    const wspago = XLSX.utils.aoa_to_sheet([])
    if (esVistaPrevia) {
      wspago['A1'] = { t: 's', v: `VISTA PREVIA PAGO - FECHA PAGO: ${this.formatDateExcel(this.fechapago, true)}`, s: {} };
    }
    else {
      wspago['A1'] = { t: 's', v: `PAGO - FECHA PAGO: ${this.formatDateExcel(this.fechapago, true)}`, s: {} };
    }
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
    //final
    if (esVistaPrevia) {
      XLSX.writeFile(wb, `VISTA PREVIA - PAGO_${this.datapagar[0].expand.proveedor.nombre}_${this.formatDateExcel(this.fechapago, true)}.xlsx`, { cellStyles: true });
    }
    else {
      XLSX.writeFile(wb, `PAGO_${this.datapagar[0].expand.proveedor.nombre}_${this.formatDateExcel(this.fechapago, true)}.xlsx`, { cellStyles: true });
    }

  }
  clickTab(_opcion) {
    this.tabactivo = _opcion
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
  formatDateExcel(fechaString: string, final: boolean) {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const dia = fecha.getUTCDate();
    const mes = fecha.getUTCMonth() + 1;
    const anio = fecha.getUTCFullYear();
    const fechaFormateada = !final ? `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}` : `${(dia - 1).toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
    return fechaFormateada;
  }
  limpiarSeleccion(){
    
  }
  onNavChange(event: any) {
    this.tab = event.nextId;
  }


}
