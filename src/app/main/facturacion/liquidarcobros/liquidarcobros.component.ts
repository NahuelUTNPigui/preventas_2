import { Component, OnInit, ɵɵsetComponentScope } from '@angular/core';
import { ColumnMode} from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { FacturacionService } from '../facturacion.service';
import { SelectFormatService } from 'app/main/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
@Component({
  selector: 'app-liquidarcobros',
  templateUrl: './liquidarcobros.component.html',
  styleUrls: ['./liquidarcobros.component.scss']
})
export class LiquidarcobrosComponent implements OnInit {
   //tab
  public tab = 1;

  public datafacturas = []
  public esDetalle = true

  //Filas
  public rows = []
  public retencioneslabels = []

  public retenciones = []
  public rowretenciones = []

  public descuentos = []
  public rowdescuentos = []

  public detallespago = []
  public rowdetallespago = []


  public acuentas = []
  public rowsacuentas = []
  public notascredito = []


  //Valores 
  public selectedOption = 10
  public responsableinscripto = false
  private IVA = 1.21
  public fechacobro = ""
  public fechacobrocompleto = ""
  public numero = ""
  public tabactivo = 0
  public completo = true
  public cliente = ""
  public cuit = ""
  //Totales
  public totalfact = 0
  public totalfactiva = 0
  public totalretenciones = 0
  public totaldescuentos = 0
  public totalpagos = 0
  public totalnotas = 0
  public totalacuentas = 0
  //lo que me pagaron de mas
  public acuenta = 0
  //lo que le faltan de pagar
  public saldo = 0
  //Detalles y retenciones
  public descripciondetalle = ""
  public totaldetalle = 0
  public descripcionretencion = ""

  public totaldetarete = 0
  public partes = 0
  //cuentas
  public idcuenta = ""
  public montocuenta = 0
  public fechacuenta = 0
  public descripcioncuenta = ""

  //Ver detalles y retenciones
  public esVerFila = false
  public nuevoCheque = false
  public indicefila = ""
  public indiceretencion = ""
  public indicedescuento = ""

  //Detalles, descuentos y retenciones
  public fila: any
  public descuento: any
  public retencion: any
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;

  constructor(
    private _factService: FacturacionService,
    private _selectService: SelectFormatService,
    private _router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    let localcobro = this._factService.retomarCobro()
    this.datafacturas = localcobro.datafacturas
    this.cliente = this.datafacturas[0].cliente
    this.cuit = this.datafacturas[0].expand.cliente.cuit
    this.detallespago = localcobro.detallespago
    this.retenciones = localcobro.retenciones
    this.descuentos = localcobro.descuentos
    this.acuentas = localcobro.acuentas
    this.acuenta = localcobro.acuenta
    this.numero = localcobro.numero
    this.completo = localcobro.completo
    this.fechacobro = localcobro.fechacobro
    this.fechacobrocompleto = localcobro.fechacobrocompleto


    this.page.count = this.datafacturas.length
    this.retencioneslabels = this._factService.getAllRetenciones()
    this.loadPage()
    if (this.datafacturas[0].expand.cliente.responsableinscripto) {
      this.responsableinscripto = true
    }
    this.datafacturas.forEach(f => {
      this.totalfact += f.expand.cliente.responsableinscripto ? f.total / this.IVA : f.total
      this.totalfactiva += f.total
      this.saldo += f.total
    })
    this.retenciones.forEach(r => {
      this.rowretenciones.push(r)
      this.totalretenciones += r.monto
      this.saldo -= r.monto
    })

    this.detallespago.forEach(p => {
      this.rowdetallespago.push(p)
      this.totalpagos += p.total
      this.saldo -= p.total
    })

    this.descuentos.forEach(d => {
      this.rowdescuentos.push(d)
      this.totaldescuentos += d.monto
      this.saldo -= d.monto
    })
    this.acuentas.forEach(a => {
      this.rowsacuentas.push(a)
      this.totalacuentas += a.monto
      this.saldo -= a.monto
    })
    this.recalcularNotas()

  }
  getNombreRetencion(tiporete) {
    let idx_rete = this.retencioneslabels.findIndex(r => r.id == tiporete)
    if (idx_rete != -1) {
      let r = this.retencioneslabels[idx_rete]
      return r.nombre
    }
    else {
      return ""
    }
  }
  recalcularNotas() {
    let idfacturas = this.datafacturas.map(f => f.id)

    this._factService.getNotasCreditoLiquidacion(idfacturas).then(res => {
      this.notascredito = res
      this.totalnotas = 0
      res.forEach(n => {

        this.totalnotas += n.monto
        this.saldo -= n.monto

      })
      this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
      if(this.saldo<0){
        this.acuenta = this.saldo  * (-1.0)
      }
      
    })
  }
  formatPeso(value) {
    return this._factService.formatPeso(value)
  }
  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset + 1), this.page.count)
    this.rows = []
    for (let i = min_i; i < max_i; i++) {
      this.rows.push(this.datafacturas[i])
    }
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  onPage(event) {
    this.page.offset = event.offset;
    this.loadPage();
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
  onChangeCampo() {
    this.guardarCobro()
  }
  guardarCobro() {
    let cobro = {
      acuenta: this.acuenta,
      completo: this.completo,
      numero: this.numero,
      fechacobro: this.fechacobro,
      fechacobrocompleto: this.fechacobrocompleto,
      cliente: this.datafacturas[0].cliente,
      totalfact: this.totalfact,
      totalpagos: this.totalpagos,
      totalretenciones: this.totalretenciones,
      datafacturas: this.datafacturas,
      retenciones: this.retenciones,
      descuentos: this.descuentos,
      detallespago: this.detallespago,
      acuentas: this.acuentas
    }
    this._factService.guardarCobro(cobro)
  }
  verFilaDescuento(indice, modal) {
    this.indicedescuento = indice
    this.esVerFila = true
    let idx_des = this.descuentos.findIndex(d => d.indice == this.indicedescuento)
    if (idx_des != -1) {
      this.descuento = this.descuentos[idx_des]
      this.modalService.open(modal, {
        centered: true,
        size: 'lg',
        windowClass: 'modal modal-primary'
      });

    }


  }
  verFilaRetencion(indice, modal) {
    this.indiceretencion = indice
    let r_idx = this.retenciones.findIndex(r => r.indice == indice)
    this.esVerFila = true
    if (r_idx != -1) {
      this.retencion = this.retenciones[r_idx]

      this.modalService.open(modal, {
        centered: true,
        size: 'lg',
        windowClass: 'modal modal-primary'
      });
    }

  }
  verFila(indice, modalcheque, modaltransfer, modaltrans, esDetalle) {
    this.indicefila = indice
    this.esDetalle = esDetalle
    this.esVerFila = true
    if (esDetalle) {
      this.fila = this.detallespago.filter(d => d.indice == indice)[0]
    }
    else {
      this.fila = this.retenciones.filter(d => d.indice == indice)[0]
    }

    if (this.fila.categoria == "Cheque") {

      this.modalService.open(modalcheque, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }
    else if (this.fila.categoria == "Transferencia") {

      this.modalService.open(modaltransfer, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }
    else {

      this.modalService.open(modaltrans, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }

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
  guardarRetencion(e, modal) {
    if (this.indiceretencion == "") {
      let indice = this.generatePass()
      let nuevo = true
      let retencion = { ...e, indice, nuevo }
      this.retenciones.push(retencion)
      this.onChangeCampo()
    }
    else {
      let r_idx = this.retenciones.findIndex(r => r.indice == this.indiceretencion)
      if (r_idx != -1) {
        this.retenciones[r_idx] = {
          ...this.retenciones[r_idx],
          ...e
        }
      }
      this.onChangeCampo()
    }

    this.calcularTotal()
    modal.dismiss('Cross click')
  }
  calcularTotal() {
    this.saldo = 0
    this.totaldescuentos = 0
    this.totalretenciones = 0
    this.totalpagos = 0
    this.totalnotas = 0
    this.totalacuentas = 0
    this.datafacturas.forEach(f => {

      this.saldo += f.total
    })

    this.rowdetallespago = []
    for (let i = 0; i < this.detallespago.length; i++) {
      this.rowdetallespago.push(this.detallespago[i])
      this.totalpagos += this.detallespago[i].total
      this.saldo -= this.detallespago[i].total
    }
    this.rowretenciones = []
    for (let i = 0; i < this.retenciones.length; i++) {
      this.rowretenciones.push(this.retenciones[i])
      this.totalretenciones += this.retenciones[i].monto
      this.saldo -= this.retenciones[i].monto
    }
    this.rowdescuentos = []
    for (let i = 0; i < this.descuentos.length; i++) {
      this.rowdescuentos.push(this.descuentos[i])
      this.totaldescuentos += this.descuentos[i].monto
      this.saldo -= this.descuentos[i].monto
    }
    this.rowsacuentas = []
    for (let i = 0; i < this.acuentas.length; i++) {
      
      this.rowsacuentas.push(this.acuentas[i])
      this.totalacuentas += this.acuentas[i].monto
      this.saldo -= this.acuentas[i].monto
    }
    for (let i = 0; i < this.notascredito.length; i++) {
      this.totalnotas += this.notascredito[i].monto
      this.saldo -= this.notascredito[i].monto
    }

    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
    if(this.saldo<0){
      this.acuenta = this.saldo * (-1.0)
    }
    else{
      this.acuenta = 0
    }
  }
  guardarFila(e, modal) {

    if (this.indicefila == "") {
      if (this.esDetalle) {
        let indice = this.generatePass()
        let nuevo = true
        let deta = { ...e, indice, nuevo }
        this.detallespago.push(deta)
      }
      else {
        let indice = this.generatePass()
        let nuevo = true
        let rete = { ...e, indice, nuevo }
        this.retenciones.push(rete)
      }
      this.onChangeCampo()
    }
    else {
      if (this.esDetalle) {
        let index = this.detallespago.findIndex(d => d.indice == this.indicefila)
        if (index !== -1) {
          this.detallespago[index] = { ...e, indice: this.indicefila }
        }
      }
      else {
        let index = this.retenciones.findIndex(d => d.indice == this.indicefila)
        if (index !== -1) {
          this.retenciones[index] = { ...e, indice: this.indicefila }
        }
      }
      this.onChangeCampo()
    }

    this.calcularTotal()
    modal.dismiss('Cross click')

  }
  elegirCheque(e, modal) {
    this.nuevoCheque = false
    let repetido = this.detallespago.findIndex(d => d.categoria == "Cheque" && d.id == e.id) != -1
    

    if (!repetido) {
      let indice = this.generatePass()
      let nuevo = false
      let deta = { ...e, indice, nuevo }
      this.detallespago.push(deta)
      this.onChangeCampo()
      this.calcularTotal()
      modal.dismiss('Cross click')
    }
    else {
      Swal.fire("Cheque repetido", "Ya se eligió el cheque", "info")
    }

  }

  addDetalle() {
    let indice = this.generatePass()

    let deta = { indice, descripcion: this.descripciondetalle, total: this.totaldetalle }
    this.descripciondetalle = ""
    this.totaldetalle = 0
    this.totalpagos = 0
    this.detallespago.push(deta)
    this.rowdetallespago = []

    for (let i = 0; i < this.detallespago.length; i++) {
      this.rowdetallespago.push(this.detallespago[i])
      this.totalpagos += this.detallespago[i].total
      this.saldo += this.detallespago[i].total

    }
    this.onChangeCampo()
    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000

  }
  quitarDetalle(iddeta) {
    let idx = this.detallespago.findIndex(d => d.indice == iddeta)
    this.detallespago.splice(idx, 1)
    this.rowdetallespago = []
    this.totalpagos = 0
    for (let i = 0; i < this.detallespago.length; i++) {
      this.rowdetallespago.push(this.detallespago[i])
      this.totalpagos -= this.detallespago[i].total
      this.saldo -= this.detallespago[i].total
    }
    this.onChangeCampo()
    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
  }
  addRetencion() {
    let indice = this.generatePass()
    let rete = { indice, descripcion: this.descripcionretencion, total: this.totaldetarete }
    this.descripcionretencion = ""
    this.totaldetarete = 0
    this.totalretenciones = 0
    this.retenciones.push(rete)
    this.rowretenciones = []
    for (let i = 0; i < this.retenciones.length; i++) {
      this.rowretenciones.push(this.retenciones[i])
      this.totalretenciones += this.retenciones[i].total
      this.saldo += this.retenciones[i].total
    }
    this.onChangeCampo()
    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
  }
  quitarDescuento(idesc) {
    let idx = this.descuentos.findIndex(r => r.indice == idesc)
    if (idx != -1) {
      this.descuentos.splice(idx, 1)
      this.calcularTotal()
    }
    this.onChangeCampo()
  }
  quitarRetencion(idrete) {
    let idx = this.retenciones.findIndex(r => r.indice == idrete)
    if (idx != -1) {
      this.retenciones.splice(idx, 1)
      this.calcularTotal()
    }
    this.onChangeCampo()

  }
  //acuenta

  verCuenta(rowid, modal) {
    let idx_cuenta = this.acuentas.findIndex(a => a.indice == rowid)
    if (idx_cuenta != -1) {
      let a = this.acuentas[idx_cuenta]
      this.montocuenta = a.monto
      this.fechacuenta = a.created.split(" ")[0]
      this.descripcioncuenta = a.descripcion
      this.esVerFila = true
      this.modalService.open(modal, {
        centered: true,
        size: 'lg',
        windowClass: 'modal modal-primary'
      });
    }
  }
  quitarCuenta(rowid) {
    let idx = this.acuentas.findIndex(d => d.indice == rowid)
    this.acuentas.splice(idx, 1)
    
    this.calcularTotal()
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

    }
    else {
      modal.dismiss('Cross click')
      Swal.fire("A cuenta elegida", "Ya se eligió esta fila de acuenta", "info")
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
  vistaPrevia(esVistaPrevia: boolean) {
    this.acuenta = this.saldo
    let csvcobro = [
      {
        ACUENTA: this.acuenta,
        COMPLETO: this.completo ? "Sí" : "No",
        NUMERO: this.numero,
        FECHACOBRO: this.fechacobro,
        FECHACOBROCOMPLETO: this.fechacobrocompleto,
        CLIENTE: this.datafacturas[0].expand.cliente.nombre||"",
        FACTURAS: this.totalfact,
        PAGOS: this.totalpagos,
        RETENCIONES: this.totalretenciones,
        DESCUENTOS: this.totaldescuentos,
        NOTAS: this.totalnotas,
        ACUENTAS: this.totalacuentas,
        SALDO: this.saldo
      }
    ]

    let csvdatafact = this.datafacturas.map(item => ({
      FECHAFACTURACION: this.formatDateExcel(item.fechafacturacion, true),
      COBRADO: item.cobrado ? "Si" : "No",
      PERIODO: item.monthyear,
      CLIENTE: item.expand.cliente.nombre||"",
      NUMERO: item.numero,
      TOTAL: "$" + item.total,
    }))
    let csvdatadetalles = this.detallespago.map(item => ({
      DESCRIPCION: item.descripcion,
      MONTO: "$" + item.total,
      CATEGORIA: item.categoria,

    }))
    let csvdatareten = this.retenciones.map(item => ({
      DESCRIPCION: this.getNombreRetencion(item.descripcion),
      MONTO: "$" + item.monto
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
    //Cobro
    const wscobro = XLSX.utils.aoa_to_sheet([])
    if (esVistaPrevia) {
      wscobro['A1'] = { t: 's', v: `VISTA PREVIA COBRO - FECHA COBRO: ${this.fechacobro}`, s: {} };
    }
    else {
      wscobro['A1'] = { t: 's', v: `COBRO - FECHA COBRO: ${this.fechacobro}`, s: {} };
    }
    wscobro['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wscobro, csvcobro, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wscobro, 'Cobro');
    //Facturas
    const ws = XLSX.utils.aoa_to_sheet([])
    ws['A1'] = { t: 's', v: "Facturas", s: {} }
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdatafact, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
    // Detalles pagos
    const wsdetalles = XLSX.utils.aoa_to_sheet([])
    wsdetalles['A1'] = { t: 's', v: "Detalles de pagos", s: {} }
    wsdetalles['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsdetalles, csvdatadetalles, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsdetalles, 'Pagos');
    // Retenciones
    const wsretenciones = XLSX.utils.aoa_to_sheet([])
    wsretenciones['A1'] = { t: 's', v: "Retenciones", s: {} }
    wsretenciones['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsretenciones, csvdatareten, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsretenciones, 'Retenciones');
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
      XLSX.writeFile(wb, `VISTA PREVIA - COBRO_${this.datafacturas[0].expand.cliente.nombre}_${this.formatDateExcel(this.fechacobro,true)}.xlsx`, { cellStyles: true });
    }
    else {
      XLSX.writeFile(wb, `COBRO_${this.datafacturas[0].expand.cliente.nombre}_${this.formatDateExcel(this.fechacobro,true)}.xlsx`, { cellStyles: true });
    }

  }
  onChangeAcuenta() {
    this.calcularTotal()
  }
  volver() {
    this._router.navigateByUrl("/facturacion/lista")
  }

  cobro() {
    if (this.numero.length == 0) {
      Swal.fire("Error número", "Debe escribir algun número para indentificar el cobro", "error")
      return
    }
    if (this.fechacobro.length == 0) {
      Swal.fire("Error fecha cobro", "Debe elegir alguna fecha de cobro", "error")
      return
    }
    if (this.completo && this.fechacobrocompleto.length == 0) {
      Swal.fire("Error fecha cobro completo", "Debe elegir alguna fecha de cobro completo si es completo el cobro", "error")
      return
    }
    if(this.saldo <0){
        this.acuenta = this.saldo * (-1.0)
    }
    else{
      this.acuenta = 0
    }
    
    if (this.acuenta > 0) {
      let html = `
            <p>Los pagos exceden las facturas</p> 
            <p>Se va a crear una fila a cuenta</p> 
          `
      Swal.fire({
        title: 'Quiere crear a cuenta?',
        
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
          this._factService.cobrarCompleto(
            this.numero, this.fechacobro, this.cliente,
            this.totalfact, this.totalpagos, this.totalretenciones,
            this.totaldescuentos, this.totalacuentas, this.totalnotas,
            this.acuenta, this.completo, this.fechacobrocompleto,
            this.datafacturas, this.retenciones, this.descuentos,
            this.detallespago, this.acuentas
          ).then(res => {
            this.vistaPrevia(false)
            Swal.fire("Éxito", "Se logró guardar el cobro con 'A cuenta'", "success")
            this._factService.crearCobro([])
            this._router.navigateByUrl("/facturacion/cobros")
          });
        }
      });
    }
    else {
      this._factService.cobrarCompleto(
        this.numero, this.fechacobro, this.cliente,
        this.totalfact, this.totalpagos, this.totalretenciones,
        this.totaldescuentos, this.totalacuentas, this.totalnotas,
        this.acuenta, this.completo, this.fechacobrocompleto,
        this.datafacturas, this.retenciones, this.descuentos,
        this.detallespago, this.acuentas
      ).then(res => {
        this.vistaPrevia(false)
        Swal.fire("Éxito", "Se logró guardar el cobro", "success")
        this._factService.crearCobro([])
        this._router.navigateByUrl("/facturacion/cobros")
      });
    }




  }

  clickTab(t) {
    this.tabactivo = t
  }
  openModalRetenciones(modal) {
    this.esVerFila = false
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  openModalDecuento(modal) {
    this.esVerFila = false
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  openModalDetalles(modal) {

    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  openModalCuenta(modal) {
    this.idcuenta = ""
    this.montocuenta = 0
    this.descripcioncuenta = ""
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  openModal(modal, esDetalle) {
    this.esDetalle = esDetalle
    this.indicefila = ""
    this.fila = { nuevo: true }
    this.esVerFila = false
    this.nuevoCheque = true
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  onNavChange(event: any) {
    this.tab = event.nextId;
  }
}
