import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FacturacionService } from '../facturacion.service';
import { SelectFormatService } from 'app/main/common';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-detallefactura',
  templateUrl: './detallefactura.component.html',
  styleUrls: ['./detallefactura.component.scss']
})
export class DetallefacturaComponent implements OnInit {
  public conpermisos = false
  //tab
  public tab = 1;

  public url = this.router.url;
  public remitosid = []
  public id = ""
  public numero: string = ""
  public identidad: string = ""
  public periodo: string = ""
  public cliente: string = ""
  public idcliente: string = ""
  public unidad: string = ""
  public prevunidad: string = ""
  public numeroremito = ""

  public total = 0
  public totaliva = 0
  public totalremitos = 0
  public totaldetalles = 0
  public totalsumado = 0
  public totalsumadoiva = 0
  public cobrado = false
  public enrevision = false
  public enliquidacion = false
  public aceptacliente = false
  public cerrada = false
  public clienteinscripto = false

  public verremitos = true
  public verdetalles = true
  public vernotas = true

  public verrevision = false
  public verliquidacion = false
  public veraceptacion = false
  public vercobro = false
  public vercierre = false


  public fechafacturacion = ""
  public fecharevision = ""
  public notarevision = ""
  public fechaliquidacion = ""
  public fechaaceptacion = ""
  public fechacobro = ""
  public fechacierre = ""
  public notacierre = ""
  public cobro = ""

  public detalles = []
  public rowsdetalles = []
  public notas = []
  public rowsnotas = []
  public remitos = []
  public rowremitos = []
  public unidades = []

  public opciones = [
    { id: "todo", nombre: "Todos" },
    { id: "revi", nombre: "En revisión" },
    { id: "liqi", nombre: "En liquidación" },
    { id: "acep", nombre: "Acepta cliente" },
    { id: "cobr", nombre: "Cobrada" },
    { id: "cerr", nombre: "Cerrada" },
  ]

  public opcionSeleccionada = "revi"

  public IVA = 1.21
  //Add y eliminaar nota
  public totalnota = 0
  public decripcionnota = ""
  public codigonota = ""
  //add y eliminar detalle
  public totaldetalle = 0
  public descripciondetalle
  //Remit
  public idremito = ""
  public pagedeta = {
    size: 100, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public pagerem = {
    size: 100, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(
    private router: Router,
    private _facturacionService: FacturacionService,
    private _selectService: SelectFormatService,
    private modalService: NgbModal

  ) {
    this.id = this.url.substr(this.url.lastIndexOf('/') + 1);
    let user = JSON.parse(localStorage.getItem('currentUser') || "{}")
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this.unidades = this._facturacionService.getUnidades()
    this._facturacionService.getFactura(this.id).then(res => {

      this.detalles = res.detalles
      this.rowsdetalles = this.detalles.map(x => x)
      this.remitos = res.remitos.map(r => ({ ...r, observacioncorto: r.observacion.substr(0, 80) }))
      this.remitosid = this.remitos.map(r => r.id)
      this.rowremitos = res.remitos.map(r => ({ ...r, observacioncorto: r.observacion.substr(0, 80) }))
      this.numero = res.numero
      this.identidad = res.identidad
      this.periodo = res.monthyear
      this.cobrado = res.cobrado
      this.cobro = res.cobro
      this.enrevision = res.enrevision
      this.cerrada = res.cerrada
      this.enliquidacion = res.enliquidacion
      this.aceptacliente = res.aceptacliente
      this.fechafacturacion = this.formatDate(res.fechafacturacion)
      this.fechaaceptacion = this.formatDate(res.fechacliente)
      this.fechacierre = this.formatDate(res.fechacierre)
      this.fechaliquidacion = this.formatDate(res.fechaliquidacion)
      this.fecharevision = this.formatDate(res.fecharevision)
      this.notarevision = res.notarevision
      this.notacierre = res.notacierre
      this.enliquidacion = res.enliquidacion
      this.aceptacliente = res.aceptacliente
      this.cliente = res.expand.cliente.nombre
      this.idcliente = res.cliente
      this.clienteinscripto = res.expand.cliente.responsableinscripto
      this.total = res.total
      this.totaliva = this.redondear(this.IVA * Number(this.total))
      this.unidad = res.unidad
      this.prevunidad = res.unidad
      this.pagedeta.count = res.detalles.length
      this.pagerem.count = res.remitos.length
      this.onChangeEstado()
      this.calcularSumatoria()
    })
    this._facturacionService.getNotasCredito(this.id).subscribe(res => {
      this.notas = res.items
      this.rowsnotas = this.notas.map(x => x)
    })

  }
  calcularTotalRemitos() {
    this.totalremitos = 0
    this.remitos.forEach(r => {
      this.totalremitos += r.totalViaje
    })
    this.totalremitos = this.redondear(this.totalremitos)
  }
  calcularTotalDetalles() {
    this.totaldetalles = 0
    this.detalles.forEach(d => {
      this.totaldetalles += d.total
    })
    this.totaldetalles = this.redondear(this.totaldetalles)
  }
  calcularSumatoria() {
    this.calcularTotalRemitos()
    this.calcularTotalDetalles()

    this.totalsumado = this.totalremitos + this.totaldetalles
    this.total = this.totalsumado
    this.totalsumado = this.redondear(this.totalsumado)
    this.totalsumadoiva = this.redondear(this.IVA * Number(this.totalsumado))
    this.totalsumadoiva = this.redondear(this.totalsumadoiva)
  }

  recalcularTotal() {
    this.totaliva = this.redondear(this.IVA * Number(this.total))
  }
  redondear(num) {
    return Math.round(1000 * num) / 1000
  }
  openModal(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }

  updateremitos(event) {

    this.rowremitos = this.remitos.filter(r => r.nroRemito.includes(this.numeroremito))
    this.remitosid = this.remitos.map(r => r.id)
    this.pagerem.count = this.rowremitos.length

    this.calcularSumatoria()
  }
  formatDate(fechaCompleta) {
    if (fechaCompleta.length > 0) {
      const fecha = new Date(fechaCompleta);
      return fecha.toISOString().split('T')[0];
    }
    else {
      return ""
    }

  }
  editarFactura() {

    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para editar facturas", "error")
      return
    }

    if (this.aceptacliente) {
      Swal.fire("Edición denegada", "Una vez aceptada la factura, solo se puede, cerrar, eliminar o cobrar pero no editar", "error")
      return
    }
    else if (this.cerrada) {
      Swal.fire("Edición denegada", "Una vez cerrada la factura, solo se puede eliminar", "error")
      return
    }
    else {
      this._facturacionService.editFactura(this.numero, this.unidad, this.periodo, this.total, this.fechafacturacion, this.id).subscribe(res => {
        this.prevunidad = this.unidad
        Swal.fire("Exito editar", "Se pudo editar la factura", "success")
        this.recalcularTotal()

      })
    }

  }
  openModalBuscarRemito(modalBuscar) {
    this.modalService.open(modalBuscar, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }

  agregarRemito(modal, remito) {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para agregar remitos", "error")
      return
    }

    this._facturacionService.guardarRemitoEnFactura(remito, this.id).then(res => {


      this._facturacionService.getRemitosFactura(this.id).then(res => {
        this.remitos = res.map(r => ({ ...r, observacioncorto: r.observacion.substr(0, 80) }))
        this.updateremitos(remito)
        this._facturacionService.editFactura(this.numero, this.unidad, this.periodo, this.total, this.fechafacturacion, this.id).subscribe(res => { })
        Swal.fire("Éxito editar", "Se logró editar el remito de la factura", "success")



      })
    })

    modal.dismiss('Cross click')
  }
  putRemito(modal, remito) {
    modal.dismiss('Cross click')

    this._facturacionService.getRemitosFactura(this.id).then(res => {

      Swal.fire("Éxito editar", "Se logró editar el remito de la factura", "success")

      this.remitos = res.map(r => ({ ...r, observacioncorto: r.observacion.substr(0, 80) }))
      this.updateremitos(remito)

    })


  }
  editarRemito(modalEdit, idremito) {
    this.idremito = idremito
    this.modalService.open(modalEdit, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }

  cerrarModalEdit(modal, remito) {
    this.updateremitos(remito)
    modal.dismiss('Cross click')

  }
  eliminarRemito(remito) {
    this._facturacionService.quitarRemitoEnFactura(remito).then(res => {

      this._facturacionService.getRemitosFactura(this.id).then(res => {
        this.remitos = res.map(r => ({ ...r, observacioncorto: r.observacion.substr(0, 80) }))
        this.updateremitos(remito)
        this._facturacionService.editFactura(this.numero, this.unidad, this.periodo, this.total, this.fechafacturacion, this.id).subscribe(res => { })
        Swal.fire("Éxito editar", "Se logró editar el remito de la factura", "success")



      })
    })

  }

  agregarDetalle() {
    if (this.descripciondetalle.length == 0) {
      Swal.fire("Sin descripción", "Debe escribir alguna descripción", "error")
      return
    }
    this.rowsdetalles = []
    let data = {
      descripcion: this.descripciondetalle,
      total: this.totaldetalle
    }

    this._facturacionService.guardarDetalleEnFactura(data, this.id).then(resdeta => {
      Swal.fire("Éxito agregar", "Se logró agregar detalle", "success")
      this.descripciondetalle = ""
      this.totaldetalle = 0

      this.detalles = this.detalles.map(x => x).concat(resdeta)
      //this.rowsdetalles = this.detalles.map(x=>x)
      this.calcularSumatoria()
      this._facturacionService.editFactura(this.numero, this.unidad, this.periodo, this.total, this.fechafacturacion, this.id).subscribe(res => { })
      this.pagedeta.count = this.detalles.length
      this.pagedeta.size = this.detalles.length


      //this._facturacionService.getDetallesEnFactura(this.id).then(res => {
      //  this.detalles = res
      //  this.pagedeta.count = this.detalles.length
      //})
    })

  }
  quitarDetalle(row) {
    this.rowsdetalles = []
    this._facturacionService.quitarDetalleEnFactura(row.id).then(resdeta => {
      Swal.fire("Éxito quitar", "Se logró quitar detalle", "success")
      this._facturacionService.getDetallesEnFactura(this.id).then(res => {

        this.detalles = res
        this.rowsdetalles = this.detalles.map(x => x)
        this.pagedeta.count = this.detalles.length

        this.calcularSumatoria()
        this._facturacionService.editFactura(this.numero, this.unidad, this.periodo, this.total, this.fechafacturacion, this.id).subscribe(res => { })
      })
    })
  }
  onInputTotal() {
    this.recalcularTotal()
  }
  agregarNota() {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para crear notas de crédito", "error")
      return
    }
    if (this.decripcionnota.length == 0 && this.codigonota.length == 0) {
      Swal.fire("Sin descripción ni código", "Debe escribir alguna descripción o código", "error")
      return
    }
    if (this.unidad.length < 1) {
      Swal.fire("Error unidad", "Debe seleccionar una unidad para crear notas de crédito", "error")
      return
    }
    if (this.prevunidad != this.unidad) {
      this.editarFactura()
    }
    let data = {
      monto: this.totalnota,
      numero: this.codigonota,
      descripcion: this.decripcionnota,
      factura: this.id
    }
    this.rowsnotas = []
    this._facturacionService.guardarNotaEnFactura(data).then(resnota => {
      let factura = {
        id: this.id,
        cliente: this.idcliente,
        unidad: this.unidad
      }
      let notaasiento = resnota
      this._facturacionService.crearAsientoNota(factura, notaasiento).then(resasiento => {
        Swal.fire("Éxito guardar nota", "Se logró guardar la nota", "success")
        this.decripcionnota = ""
        this.codigonota = ""
        this.totalnota = 0
        this._facturacionService.getNotasEnFactura(this.id).then(res => {
          this.notas = res
          this.rowsnotas = this.notas.map(x => x)
        })
      })

    })
  }
  quitarNota(row) {
    this.rowsnotas = []
    let factura = {
      id: this.id,
      cliente: this.idcliente,

      unidad: this.unidad
    }
    this._facturacionService.crearAsientoEliminarNota(factura, row).then(resasiento => {
      this._facturacionService.quitarNotaEnFactura(row.id).then(resnota => {

        Swal.fire("Éxito quitar nota", "Se logró quitar la nota", "success")
        this._facturacionService.getNotasEnFactura(this.id).then(res => {
          this.notas = res
          this.rowsnotas = this.notas.map(x => x)
        })
      })
    })

  }



  ConfirmRevisar() {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para modificar el estado de la factura", "error")
      return
    }
    if (this.fecharevision.length < 1) {
      Swal.fire("Error", "Debe seleccionar una fecha de revisión", "error")
      return
    }
    if (this.aceptacliente) {
      Swal.fire("Revisión denegada", "Una vez aceptada la factura, solo se puede, cerrar, eliminar o cobrar pero no editar", "error")
      return
    }
    else if (this.cerrada) {
      Swal.fire("Revisión denegada", "Una vez cerrada la factura, solo se puede eliminar", "error")
      return
    }
    let html = `
      <p>Se cambiará el estado a "En Revisión"</p> 
    `
    Swal.fire({
      title: 'Revisar?',
      //text: "Se eliminará el remito"
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
        this.revisar()
      }
    });
  }
  revisar() {
    this._facturacionService.revisar(this.notarevision, this.fecharevision, this.id).subscribe(res => {
      this.enrevision = true
      this.enliquidacion = false
      this.aceptacliente = false
      this.cobrado = false
      this.cerrada = false
      this.onChangeEstado()
      Swal.fire("Éxito", "Se cambió a En Revisión con éxito ", "success")
    })
  }
  ConfirmLiquidar() {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para modificar el estado de la factura", "error")
      return
    }
    if (this.fechaliquidacion.length < 1) {
      Swal.fire("Error", "Debe seleccionar una fecha de liquidación", "error")
      return
    }
    if (this.aceptacliente) {
      Swal.fire("Revisión denegada", "Una vez aceptada la factura, solo se puede, cerrar, eliminar o cobrar pero no editar", "error")
      return
    }
    else if (this.cerrada) {
      Swal.fire("Revisión denegada", "Una vez cerrada la factura, solo se puede eliminar", "error")
      return
    }
    let html = `
      <p>Se cambiará el estado a "Liquidación"</p> 
    `
    Swal.fire({
      title: 'Liquidar?',
      //text: "Se eliminará el remito"
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
        this.liquidar()
      }
    });
  }
  liquidar() {
    this._facturacionService.liquidar(this.fechaliquidacion, this.id).subscribe(res => {
      this.enrevision = false
      this.enliquidacion = true
      this.aceptacliente = false
      this.cobrado = false
      this.cerrada = false
      this.onChangeEstado()
      Swal.fire("Éxito", "Se cambió a En liquidacón con éxito ", "success")
    })
  }
  ConfirmAceptar() {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para modificar el estado de la factura", "error")
      return
    }
    if (this.fechaaceptacion.length < 1) {
      Swal.fire("Error", "Debe seleccionar una fecha de aceptación", "error")
      return
    }
    if (this.unidad.length < 1) {
      Swal.fire("Error", "Debe seleccionar una unidad", "error")
      return
    }
    if (this.aceptacliente) {
      Swal.fire("Revisión denegada", "Una vez aceptada la factura, solo se puede, cerrar, eliminar o cobrar pero no editar", "error")
      return
    }
    else if (this.cerrada) {
      Swal.fire("Revisión denegada", "Una vez cerrada la factura, solo se puede eliminar", "error")
      return
    }
    let html = `
      <p>Se cambiará el estado a "Aceptada por cliente"</p> 
    `
    Swal.fire({
      title: 'Aceptar?',
      //text: "Se eliminará el remito"
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
        this.aceptar()
      }
    });
  }
  aceptar() {
    if (this.prevunidad != this.unidad) {
      this.editarFactura()
    }
    this._facturacionService.aceptar(this.fechaaceptacion, this.id).subscribe(res => {
      this.enrevision = false
      this.enliquidacion = false
      this.aceptacliente = true
      this.cobrado = false
      this.cerrada = false
      this.onChangeEstado()
      let factura = {
        id: this.id,
        cliente: this.idcliente,
        fechacliente: this.fechaaceptacion + " 03:00:00",
        unidad: this.unidad,
        monthyear: this.periodo,
        total: this.total
      }
      this._facturacionService.crearAsientoAceptarFactura(factura).then(res_asiento => {
        Swal.fire("Éxito", "Se cambió a Aceptada por el cliente con éxito ", "success")
      })


    })
  }
  ConfirmCerrar() {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para modificar el estado de la factura", "error")
      return
    }
    if (this.fechacierre.length < 1) {
      Swal.fire("Error", "Debe seleccionar una fecha de cierre", "error")
      return
    }
    if (this.aceptacliente && this.unidad.length < 1) {
      Swal.fire("Error", "Debe seleccionar una unidad cuando esta aceptada la factura", "error")
      return
    }
    let html = `
      <p>Se cambiará el estado a "Cerrada"</p> 
    `
    Swal.fire({
      title: 'Cerrar?',
      //text: "Se eliminará el remito"
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
        this.cerrar()
      }
    });
  }
  cerrar() {
    this._facturacionService.cerrar(this.notacierre, this.fechacierre, this.id).subscribe(res => {
      if (this.aceptacliente) {
        let factura = {
          id: this.id,
          cliente: this.idcliente,
          fechacierre: this.fechacierre + " 03:00:00",
          unidad: this.unidad,
          monthyear: this.periodo,
          total: this.total
        }
        this._facturacionService.crearAsientoFacturaCerrada(factura).then(res => {
          this.enrevision = false
          this.enliquidacion = false
          this.aceptacliente = false
          this.cobrado = false
          this.cerrada = true
          this.onChangeEstado()
          Swal.fire("Éxito", "Se cambió a Cerrada con éxito y se creó un asiento", "success")
        })
      }
      else {
        this.enrevision = false
        this.enliquidacion = false
        this.aceptacliente = false
        this.cobrado = false
        this.cerrada = true
        this.onChangeEstado()
        Swal.fire("Éxito", "Se cambió a Cerrada con éxito ", "success")
      }

    })
  }
  onChangeOpcion(e) {
    this.cobrado = false
    this.enliquidacion = false
    this.enrevision = true
    this.aceptacliente = false
    this.cerrada = false
    if (this.opcionSeleccionada == "revi") {
      this.enrevision = true
    }
    else if (this.opcionSeleccionada == "liqi") {
      this.enliquidacion = true
    }
    else if (this.opcionSeleccionada == "acep") {
      this.aceptacliente = true
    }
    else if (this.opcionSeleccionada == "cobr") {
      this.cobrado = true
    }
    else if (this.opcionSeleccionada == "cerr") {
      this.cerrada = true
    }
  }
  onChangeEstado() {
    this.opcionSeleccionada = "revi"
    if (this.cobrado) {
      this.opcionSeleccionada = "cobr"
    }
    else if (this.enliquidacion) {
      this.opcionSeleccionada = "liqi"
    }
    else if (this.enrevision) {
      this.opcionSeleccionada = "revi"
    }
    else if (this.aceptacliente) {
      this.opcionSeleccionada = "acep"
    }
    else if (this.cerrada) {
      this.opcionSeleccionada = "cerr"
    }

  }
  onNavChange(event: any) {
    this.tab = event.nextId;
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
  exportarFactura() {
    let csvdata = this.remitos.map(item => ({


      FECHAINGRESO: this.formatDateExcel(item.fechaIngreso, false),

      RTO: item.nroRemito,
      REUBICADO: item.reubicado ? "Si" : "No",
      KG: item.kilos,
      BULTOS: item.bultos,
      DESTINATARIO: item.expand?.destinatario?.nombre,
      LOCALIDAD: item.expand?.destinatario?.expand?.localidad?.nombre,

      OBSERVACION: item.observacion,
      NOVEDAD: item.novedad,
      PUN: item.precioUnitario,
      TOTAL: item.totalViaje
    }))

    csvdata.sort((c1, c2) => c1.FECHAINGRESO < c2.FECHAINGRESO ? -1 : 1)
    //let totalreporte = [{TOTALREPORTE:this.total}]
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])

    ws['A1'] = { t: 's', v: `${this.cliente} - ${this.periodo}`, s: {} };

    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });

    //ws[`K${csvdata.length+3}` ] = {t:'s',v:this.totalremitos, s: {}}
    //XLSX.utils.sheet_add_json(ws, totalcsv, { origin: `K${csvdata.length+2}` });
    //XLSX.utils.sheet_add_json(ws,totalreporte,{origin:'O2'})
    XLSX.utils.book_append_sheet(wb, ws, 'Remitos facturacion');
    XLSX.writeFile(wb, `${this.cliente} - ${this.periodo}.xlsx`, { cellStyles: true });
  }



}
