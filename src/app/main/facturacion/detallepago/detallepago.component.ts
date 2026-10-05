import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { FacturacionService } from '../facturacion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-detallepago',
  templateUrl: './detallepago.component.html',
  styleUrls: ['./detallepago.component.scss']
})
export class DetallepagoComponent implements OnInit {
  public tab = 1

  public url = this.router.url;

  public id = ""
  private IVA = 1.21
  public conpermisos = false
  public selectedOption = 10;
  //modales
  public indicefila = ""
  public esVerFila = true
  public nuevoCheque = false
  public fila: any;
  //Ver detalles y retenciones
  public indiceretencion = ""
  public indicedescuento = ""
  public descuento: any
  public retencion: any
  //cuentas
  public idcuenta = ""
  public montocuenta = 0
  public fechacuenta = 0
  public descripcioncuenta = ""
  //filas
  public retencioneslabels = []
  public rowsdetalles: any[] = []
  public rowsretenciones: any[] = []
  public rowsfacturas: any[] = []
  public notas: any[] = []
  public acuentas: any[] = []
  public descuentos: any[] = []
  public ColumnMode = ColumnMode;
  //totales
  public saldo = 0
  public totalfacturas = 0
  public totaldetalles = 0
  public totalretenciones = 0
  public totaldescuentos = 0
  public acuenta = 0
  public totalacuentas = 0
  public totalnotas = 0

  //valores
  public fechacobro = ''

  public cliente = ''
  public clientenombre = ""
  public razonSocial = ""
  public cuit = ""
  public numero = ""
  public completo = true
  public cobrocompleto = ''
  public totalfacturasiva = 0
  public responsableinscripto = false

  pagedetalles = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  pageretenciones = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  pagefacturas = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(private router: Router, private _factService: FacturacionService, private modalService: NgbModal) {
    this.id = this.url.substr(this.url.lastIndexOf('/') + 1);
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this.retencioneslabels = this._factService.getAllRetenciones()
    this._factService.getCobro(this.id).then(res => {
      this.rowsdetalles = res.pagos
      this.pagedetalles.size = res.pagos.length
      this.pagedetalles.count = res.pagos.length
      this.rowsretenciones = res.retenciones
      this.pageretenciones.size = res.retenciones.length
      this.pageretenciones.count = res.retenciones.length
      this.rowsfacturas = res.facturas
      this.pagefacturas.size = res.facturas.length
      this.pagefacturas.count = res.facturas.length
      this.acuentas = res.acuentas
      this.descuentos = res.descuentos
      this.fechacobro = res.fechacobro.split(" ")[0]
      this.totalfacturas = res.totalfacturas
      this.totaldetalles = res.totaldetalles
      this.totalretenciones = res.totalretenciones
      this.cliente = res.cliente
      this.razonSocial = res.razonSocial
      this.clientenombre = res.expand.cliente.nombre
      this.cuit = res.expand.cliente.cuit
      this.numero = res.numero
      this.completo = res.completo
      this.totaldescuentos = res.totaldescuentos
      this.acuenta = res.acuenta
      this.totalacuentas = res.totalacuentas
      this.totalnotas = res.totalnotas
      this.cobrocompleto = res.cobrocompleto.split(" ")[0]
      this.responsableinscripto = res.responsableinscripto
      this.totalfacturasiva = res.totalfacturas * this.IVA
      this.calcularTotal()
      this.rowsfacturas.forEach(f => {
        this._factService.asyncGetNotasCredito(f.id).then(resnota => {
          this.notas = this.notas.concat(resnota)
          for (let i = 0; i < resnota.length; i++) {
            this.totalnotas += resnota[i].monto
            this.saldo -= resnota[i].monto
          }
        })
      })




    })
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
  formatPeso(value) {
    return this._factService.formatPeso(value)
  }
  guardarCobro() {

    this._factService.editarCobro(
      this.id, this.totaldetalles,
      this.totalretenciones, this.totaldescuentos,
      this.totalacuentas, this.acuenta,
      this.completo, this.cobrocompleto, this.fechacobro
    ).then(res => {
      Swal.fire("Éxito edición", "Se logró editar", "success")
    })
  }
  openModal(modal) {
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
  calcularNotas() {
    this.totalnotas = 0
  }
  calcularTotal() {
    this.saldo = 0
    this.totaldescuentos = 0
    this.totalretenciones = 0

    this.totaldetalles = 0
    this.totalnotas = 0
    this.totalacuentas = 0

    this.saldo = this.responsableinscripto ? this.totalfacturasiva : this.totalfacturas

    for (let i = 0; i < this.rowsdetalles.length; i++) {
      this.totaldetalles += this.rowsdetalles[i].monto
      this.saldo -= this.rowsdetalles[i].monto
    }

    for (let i = 0; i < this.rowsretenciones.length; i++) {
      this.totalretenciones += this.rowsretenciones[i].monto
      this.saldo -= this.rowsretenciones[i].monto
    }

    for (let i = 0; i < this.descuentos.length; i++) {
      this.totaldescuentos += this.descuentos[i].monto
      this.saldo -= this.descuentos[i].monto
    }

    for (let i = 0; i < this.acuentas.length; i++) {
      this.totalacuentas += this.acuentas[i].monto
      this.saldo -= this.acuentas[i].monto
    }

    for (let i = 0; i < this.notas.length; i++) {
      this.totalnotas += this.notas[i].monto
      this.saldo -= this.notas[i].monto
    }

    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000

  }
  guardarFila(e, modal) {
    this._factService.guardarDetalleCobro(e, this.cliente, this.id).then(res => {
      this.rowsdetalles = this.rowsdetalles.map(x => x).concat(res)
      this.pagedetalles.size = this.rowsdetalles.length
      this.pagedetalles.count = this.rowsdetalles.length
      this.calcularTotal()
      this._factService.editarCobro(
        this.id, this.totaldetalles,
        this.totalretenciones, this.totaldescuentos,
        this.totalacuentas, this.acuenta,
        this.completo, this.cobrocompleto, this.fechacobro
      ).then(res => {
        modal.dismiss('Cross click')
        Swal.fire("Éxito guardar pago", "Se logró guardar", "success")
      })

    })
  }
  elegirCheque(e, modal) {
    let repetido = this.rowsdetalles.findIndex(d => d.tipocobro == 1 && d.cheque == e.id) != -1
    if (!repetido) {
      this._factService.elegirCheque(this.id, e).then(res => {
        this.rowsdetalles = this.rowsdetalles.map(x => x).concat(res)
        this.pagedetalles.size = this.rowsdetalles.length
        this.pagedetalles.count = this.rowsdetalles.length
        this.calcularTotal()
        this._factService.editarCobro(
          this.id, this.totaldetalles,
          this.totalretenciones, this.totaldescuentos,
          this.totalacuentas, this.acuenta,
          this.completo, this.cobrocompleto, this.fechacobro
        ).then(res => {
          modal.dismiss('Cross click')
          Swal.fire("Cheque elegido", "Se logró elegir el cheque", "success")
        })
      })


    }
    else {
      Swal.fire("Cheque repetido", "Ya se eligió el cheque", "info")
    }

  }
  openModalRetenciones(modal) {
    this.esVerFila = false

    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  guardarRetencion(e, modal) {
    this._factService.addRetencion(e, this.id).then(res => {
      this.rowsretenciones = this.rowsretenciones.map(x => x).concat(res)
      this.pageretenciones.size = this.rowsretenciones.length
      this.pageretenciones.count = this.rowsretenciones.length
      this.calcularTotal()
      this._factService.editarCobro(

        this.id, this.totaldetalles,
        this.totalretenciones, this.totaldescuentos,
        this.totalacuentas, this.acuenta,
        this.completo, this.cobrocompleto, this.fechacobro
      ).then(res => {
        modal.dismiss('Cross click')
        Swal.fire("Éxito guardar retencion", "Se logró guardar", "success")
      })
    })


  }
  openModalDecuento(modal) {
    this.esVerFila = false
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  guardarDescuento(e, modal) {
    this._factService.addDescuento(e, this.id).then(res => {
      this.descuentos = this.descuentos.map(x => x).concat(res)
      this.calcularTotal()
      this._factService.editarCobro(
        this.id, this.totaldetalles,
        this.totalretenciones, this.totaldescuentos,
        this.totalacuentas, this.acuenta,
        this.completo, this.cobrocompleto, this.fechacobro
      ).then(res => {
        modal.dismiss('Cross click')
        Swal.fire("Éxito guardar retencion", "Se logró guardar", "success")
      })
    })

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
  elegirCuenta(cuenta, modal) {

    let idx_cuenta = this.acuentas.findIndex(c => c.id == cuenta.id)
    if (idx_cuenta == -1) {
      this._factService.addAcuenta(cuenta, this.id).then(res => {
        this.acuentas = this.acuentas.map(x => x).concat(cuenta)
        this.calcularTotal()
        this._factService.editarCobro(
          this.id, this.totaldetalles,
          this.totalretenciones, this.totaldescuentos,
          this.totalacuentas, this.acuenta,
          this.completo, this.cobrocompleto, this.fechacobro
        ).then(res2 => {
          modal.dismiss('Cross click')

          Swal.fire("A cuenta elegida", "Se agregó acuenta elegida", "success")
        })
      })
    }
    else {

      Swal.fire("A cuenta elegida", "Ya se eligió esta fila de acuenta", "info")
    }

  }
  quitarCuenta(idcuenta) {
    let idx_cuenta = this.acuentas.findIndex(c => c.id == idcuenta)
    if (idx_cuenta != -1) {
      let cuenta = { ...this.acuentas[idx_cuenta] }
      cuenta.cobro = ""
      this.acuentas.splice(idx_cuenta, 1)
      this._factService.modAcuenta(cuenta, idcuenta).then(res => {
        this.calcularTotal()
        this._factService.editarCobro(
          this.id, this.totaldetalles,
          this.totalretenciones, this.totaldescuentos,
          this.totalacuentas, this.acuenta,
          this.completo, this.cobrocompleto, this.fechacobro
        ).then(res => {


          Swal.fire("A cuenta quitada", "Se quitó a cuenta", "success")
        })
      })

    }

  }
  guardarAcuenta(e, modal) {

    this.calcularTotal()
    modal.dismiss('Cross click')
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

    let csvcobro = [
      {
        ACUENTA: this.acuenta,
        COMPLETO: this.completo ? "Sí" : "No",
        NUMERO: this.numero,
        FECHACOBRO: this.fechacobro,
        FECHACOBROCOMPLETO: this.cobrocompleto,
        CLIENTE: this.clientenombre,
        FACTURAS: this.totalfacturas,
        PAGOS: this.totaldetalles,
        RETENCIONES: this.totalretenciones,
        DESCUENTOS: this.totaldescuentos,
        NOTAS: this.totalnotas,
        ACUENTAS: this.totalacuentas,
        SALDO: this.saldo
      }
    ]

    let csvdatafact = this.rowsfacturas.map(item => ({
      FECHAFACTURACION: this.formatDateExcel(item.fechafacturacion, true),
      COBRADO: item.cobrado ? "Si" : "No",
      PERIODO: item.monthyear,
      CLIENTE: item.expand.cliente.nombre || "",
      NUMERO: item.numero,
      TOTAL: "$" + item.total,
    }))
    let csvdatadetalles = this.rowsdetalles.map(item => ({
      DESCRIPCION: item.descripcion,
      MONTO: "$" + item.total,
      CATEGORIA: item.categoria,

    }))
    let csvdatareten = this.rowsretenciones.map(item => ({
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
    wscobro['A1'] = { t: 's', v: `COBRO - FECHA COBRO: ${this.fechacobro}`, s: {} };
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
    XLSX.writeFile(wb, `COBRO_${this.clientenombre}_${this.formatDateExcel(this.fechacobro, true)}.xlsx`, { cellStyles: true });
  }
  onNavChange(event: any) {
    this.tab = event.nextId;
  }
}
