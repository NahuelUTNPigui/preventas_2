import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RemitoData } from '../remito/model/remito-model';
import { environment } from 'environments/environment';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  token: string;
  IVA = 1.21
  responsable: string
  constructor(private _httpClient: HttpClient) {
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'User') {
      this.responsable = currentUser.record.id;
    }
  }
  private registrarHistorial(remitoId: string, remitoData: any): Observable<any> {
    return this._httpClient.post(`${environment.apiUrl}/api/collections/HistorialRemito/records`, { remito: remitoId, ...remitoData, id: null, modifiedBy: this.responsable }, { headers: { 'Authorization': this.token } });
  }
  estadoPendiente() {
    return "0kxg8jr071yozsk"
  }
  getUnidades() {
    return [{ nombre: "SAS" }, { nombre: "JUAREZ" }, { nombre: "EFECTIVO" }]
  }
  getCategoria(nombre) {
    let tipos = [{ id: 0, nombre: "" }, { id: 1, nombre: "Cheque" }, { id: 2, nombre: "Transferencia" }, { id: 3, nombre: "Efectivo" }]
    return tipos.filter(t => t.nombre == nombre)[0].id
  }
  async todasprovincias() {
    let res_p = await fetch(environment.apiUrl + '/api/collections/Provincia/records?perPage=200&page=1&filter=(active=true)', { headers: { 'Authorization': this.token } })
    let data_p = await res_p.json()
    let provincias = data_p.items
    provincias.sort((p1, p2) => p1.nombre < p2.nombre ? -1 : 1)
    return provincias
  }
  async todaslocalidades(provincia: string) {
    let localidades = []
    let res_l = await fetch(environment.apiUrl + `/api/collections/Localidad/records?perPage=1&page=1&filter=(active=true %26%26 provincia~'${provincia}')`, { headers: { 'Authorization': this.token } })
    let data_l = await res_l.json()
    let paginas = Math.floor(data_l.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Localidad/records?perPage=200&page=1&filter=(active=true %26%26 provincia~'${provincia}')`, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      localidades = localidades.concat(data.items)
    }
    localidades.sort((l1, l2) => l1.nombre < l2.nombre ? -1 : 1)
    return localidades
  }
  async todasformaspago() {
    let res_f = await fetch(environment.apiUrl + '/api/collections/FormaPago/records?filter=(active=true)', { headers: { 'Authorization': this.token } })
    let data_f = await res_f.json()
    return data_f.items

  }
  async todosestados() {
    let res_e = await fetch(environment.apiUrl + '/api/collections/Estado/records?filter=(active=true)', { headers: { 'Authorization': this.token } })
    let data_e = await res_e.json()
    return data_e.items
  }
  async facturaRemitos(
    nroRemito: string,
    fechaIngresoDesde: string,
    fechaIngresoHasta: string,
    porFechaEntrega: boolean,
    fechaEntregaDesde: string,
    fechaEntregaHasta: string,
    proveedor: string,
    vehiculo: string,
    chofer: string,
    cliente: string,
    destinatario: string,
    remitente: string,
    provincia: string,
    localidad: string,
    estado: string,
    formaPago: string,
    todoscheck: boolean,
    reubicado: boolean,
    confirmado: boolean,
    facturar: boolean,
    conFactura: boolean,
    totalCero: boolean
  ) {
    let todosremitos = []
    let y = "%26%26"
    let filter = "active = true " //+ y + " factura = ''"
    let esPendiente = estado === "0kxg8jr071yozsk"
    let expand = "cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,destinatario.localidad.provincia,estado,responsable"
    if (!esPendiente) {
      expand += ",proveedor,chofer,vehiculo"
    }
    //nroremito
    filter += ` ${y} nroRemito ~ '${nroRemito}'`

    //fechas
    if (fechaIngresoDesde != "") {
      filter += ` ${y} fechaIngreso>= '${fechaIngresoDesde}' `
    }
    if (fechaIngresoHasta != "") {
      filter += ` ${y} fechaIngreso<='${fechaIngresoHasta}' `
    }
    //filter += ` ${y} fechaIngreso>= '${fechaIngresoDesde}' ${y} fechaIngreso<='${fechaIngresoHasta}' `
    if (porFechaEntrega) {
      filter += ` ${y} fechaEntrega>= '${fechaEntregaDesde}' ${y} fechaEntrega<='${fechaEntregaHasta}' `
    }
    if (!esPendiente) {
      //proveedor

      filter += ` ${y} proveedor.nombre ~'${proveedor}'`
      filter += ` ${y} vehiculo.nombre ~'${vehiculo}'`
      filter += ` ${y} chofer.nombre ~'${chofer}'`
    }


    //Cliente
    filter += ` ${y} cliente.nombre ~'${cliente}'`
    filter += ` ${y} destinatario.nombre ~'${destinatario}'`
    filter += ` ${y} remitente.nombre ~'${remitente}'`
    // Geografia
    filter += ` ${y} destinatario.localidad.nombre ~ '${localidad}'`
    filter += ` ${y} destinatario.localidad.provincia.nombre ~ '${provincia}'`
    //Estado
    filter += ` ${y} estado~'${estado}'`

    //Forma pago
    filter += ` ${y} cliente.formaPago ~ '${formaPago}'`
    if (!todoscheck) {
      if (reubicado) {
        filter += `${y} reubicado = true`
      }
      else {
        filter += `${y} reubicado = false`
      }
      if (confirmado) {
        filter += `${y} confirmado = true`
      }
      else {
        filter += `${y} confirmado = false`
      }
    }
    if (facturar) {
      filter += `${y} facturar = true`
    }
    else {
      filter += `${y} facturar = false`
    }


    if (conFactura) {
      filter += `${y} factura != ''`
    }
    else {
      filter += `${y} factura = ''`
    }

    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&filter=(${filter})&expand=${expand}`

    let res_r = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_p = await res_r.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1

    for (let pag = 1; pag <= paginas; pag++) {

      let rutacompletapag = `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=${pag}&filter=(${filter})&expand=${expand}&skipTotal=true`
      //let rutacompletapag =`${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=${pag}&filter=(estado~'${estado}')&skipTotal=true`

      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()

      todosremitos = todosremitos.concat(data.items)
    }
    todosremitos.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
    return todosremitos
  }
  async facturar(remitos: any[], numero: string, monthyear: string, cliente: string, total: number, fechafacturacion: string, unidad: string, nuevocod: string) {
    let factura = {
      cliente,
      monthyear,
      numero,
      cobrado: false,

      active: true,
      fechafacturacion,
      fecharevision: new Date().toISOString().split("T")[0] + " 03:00:00",
      enrevision: true,
      enliquidacion: false,

      unidad,
      total,
      identidad: nuevocod,
      usuario: this.responsable
    }
    let res_f = await fetch(`${environment.apiUrl}/api/collections/Factura/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(factura)
    })
    let data_f = await res_f.json()
    remitos.forEach(async r => {
      let res_r = await fetch(`${environment.apiUrl}/api/collections/Remito/records/${r.id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ factura: data_f.id })
      })
      let res_h = await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ remito: r.id, ...r, id: null, responsable: this.responsable })
      })
    })
    return data_f

  }
  async facturarSimple(remitos: any[], monthyear: string, cliente: string, nuevocod: string, detalles: any = []) {

    let totalremitos = 0
    remitos.forEach(r => {
      totalremitos += r.totalViaje
    })
    let factura = {
      cliente,
      monthyear,
      numero: "",
      cobrado: false,

      active: true,
      fechafacturacion: new Date().toISOString().split("T")[0] + " 03:00:00",
      fecharevision: new Date().toISOString().split("T")[0] + " 03:00:00",
      enrevision: true,
      enliquidacion: false,
      total: totalremitos,
      identidad: nuevocod,
      usuario: this.responsable
    }
    let res_f = await fetch(`${environment.apiUrl}/api/collections/Factura/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(factura)
    })
    let data_f = await res_f.json()
    remitos.forEach(async r => {
      let res_r = await fetch(`${environment.apiUrl}/api/collections/Remito/records/${r.id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ factura: data_f.id })
      })
      let res_h = await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ remito: r.id, ...r, id: null, responsable: this.responsable })
      })
    })
    if (detalles.length > 0) {
      await this.guardarDetalles(data_f.id, detalles)
    }

    return data_f

  }

  async crearAsientoAceptarFactura(factura: any) {
    let datasiento = {
      fecha: factura.fechacliente,
      monto: factura.total,
      factura: factura.id,
      cobro: "",
      orden: "",
      pago: "",
      nota: "",
      cheque: "",
      transferencia: "",
      flujo: "",
      tipo: "fact",
      unidad: factura.unidad,
      cliente: factura.cliente,
      proveedor: "",
      razon: "",
      descripcion: "Aceptar factura: " + factura.monthyear
    }
    try {
      // busco cliente y sald
      let res_cliente = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, { headers: { 'Authorization': this.token } })
      let datacliente = await res_cliente.json()
      // actualizo saldo
      let datasaldo = {
        saldo: datacliente.saldo + factura.total
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasaldo)
      })
      //Creo asiento
      let res_asiento = await fetch(`${environment.apiUrl}/api/collections/Asiento/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasiento)
      })
      let data_asiento = await res_asiento.json()
      return data_asiento
    }
    catch (err) {
      console.error(err)
    }

  }

  async guardarDetalles(idfactura: string, detalles: any[]) {
    for (let i = 0; i < detalles.length; i++) {
      let res_d = await fetch(`${environment.apiUrl}/api/collections/DetalleFactura/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...detalles[i], factura: idfactura })
      })

    }
  }
  async getFactura(id: string) {
    let res_f = await fetch(`${environment.apiUrl}/api/collections/Factura/records/${id}?expand=cliente`, { headers: { 'Authorization': this.token } })
    let data_f = await res_f.json()
    let detalles = []
    let rutacompleta = `${environment.apiUrl}/api/collections/DetalleFactura/records?perPage=1&page=1&filter=(factura~'${id}')`
    let res_d = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/DetalleFactura/records?perPage=200&page=${pag}&filter=(factura~'${id}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      detalles = detalles.concat(data.items)
    }
    let remitos = []
    rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&filter=(factura~'${id}' %26%26 active=true)`
    let res_r = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_r = await res_r.json()
    paginas = Math.floor(data_r.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=${pag}&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado&filter=(factura~'${id}'%26%26 active=true)&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      remitos = remitos.concat(data.items)
    }
    let fac = data_f
    fac.remitos = remitos
    fac.detalles = detalles
    return fac
  }
  // Debo quitar los remitos asociados a la factura y borrar los detalles
  async deleteFactura(id: string) {
    let res_f = await fetch(`${environment.apiUrl}/api/collections/Factura/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false })
    })
    let data_f = await res_f.json()
    let rems = []
    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&filter=(factura~'${id}')`
    let res_r = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_r = await res_r.json()
    let paginas = Math.floor(data_r.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=${pag}&filter=(factura~'${id}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      rems = rems.concat(data.items)
    }
    for (let i = 0; i < rems.length; i++) {
      let res_r = await fetch(`${environment.apiUrl}/api/collections/Remito/records/${rems[i].id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ factura: '' })
      })
      let res_h = await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ remito: rems[i].id, ...rems[i], id: null })
      })
    }
    let dets = []
    rutacompleta = `${environment.apiUrl}/api/collections/DetalleFactura/records?perPage=1&page=1&filter=(factura~'${id}')`
    let res_d = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/DetalleFactura/records?perPage=200&page=${pag}&filter=(factura~'${id}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      dets = dets.concat(data.items)
    }
    for (let i = 0; i < dets.length; i++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/DetalleFactura/records/${dets[i].id}`
      let res = await fetch(rutacompletapag, {
        method: "DELETE",
        headers: { 'Authorization': this.token }
      })
    }
    return data_f
  }
  editFactura(numero: string, unidad: string, concepto: string, total: number, fechafacturacion: string, id: string) {
    let data = {
      fechafacturacion: fechafacturacion + " 03:00:00",
      numero,
      unidad,
      monthyear: concepto,
      total
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Factura/records/${id}`,
        { ...data },
        { headers: { 'Authorization': this.token } }
      )
  }
  revisar(nota: string, fecha: string, id: string) {
    let data = {
      notarevision: nota,
      fecharevision: fecha + " 03:00:00",
      enrevision: true,
      enliquidacion: false,
      fechaliquidacion: "",
      aceptacliente: false,
      cobrado: false,
      cerrada: false,

    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Factura/records/${id}`,
        { ...data },
        { headers: { 'Authorization': this.token } }
      )
  }
  liquidar(fecha: string, id: string) {
    let data = {

      fechaliquidacion: fecha + " 03:00:00",
      enrevision: false,
      enliquidacion: true,
      aceptacliente: false,
      cobrado: false,
      cerrada: false,

    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Factura/records/${id}`,
        { ...data },
        { headers: { 'Authorization': this.token } }
      )
  }
  aceptar(fecha: string, id: string) {
    let data = {

      fechacliente: fecha + " 03:00:00",
      enrevision: false,
      enliquidacion: false,
      aceptacliente: true,
      cobrado: false,
      cerrada: false,

    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Factura/records/${id}`,
        { ...data },
        { headers: { 'Authorization': this.token } }
      )
  }
  cerrar(nota: string, fecha: string, id: string) {
    let data = {
      notacierre: nota,
      fechacierre: fecha + " 03:00:00",
      enrevision: false,
      enliquidacion: false,
      cobrado: false,
      aceptacliente: false,
      cerrada: true,


    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Factura/records/${id}`,
        { ...data },
        { headers: { 'Authorization': this.token } }
      )
  }
  async crearAsientoFacturaCerrada(factura: any) {
    let datasiento = {
      fecha: factura.fechacierre,
      monto: -factura.total,
      factura: factura.id,
      cobro: "",
      orden: "",
      pago: "",
      nota: "",
      cheque: "",
      transferencia: "",
      flujo: "",
      tipo: "fact",
      unidad: factura.unidad,
      cliente: factura.cliente,
      proveedor: "",
      razon: "",
      descripcion: "Cerrar factura: " + factura.monthyear
    }
    try {
      // busco cliente y sald
      let res_cliente = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, { headers: { 'Authorization': this.token } })
      let datacliente = await res_cliente.json()
      // actualizo saldo
      let datasaldo = {
        saldo: datacliente.saldo - factura.total
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasaldo)
      })
      //Creo asiento
      let res_asiento = await fetch(`${environment.apiUrl}/api/collections/Asiento/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasiento)
      })
      let data_asiento = await res_asiento.json()
      return data_asiento
    }
    catch (err) {
      console.error(err)
    }
  }
  async crearAsientoFacturaEliminada(factura: any) {
    let datasiento = {
      fecha: new Date().toISOString().split("T")[0]+" 03:00:00",
      monto: -factura.total,
      factura: factura.id,
      cobro: "",
      orden: "",
      pago: "",
      nota: "",
      cheque: "",
      transferencia: "",
      flujo: "",
      tipo: "fact",
      unidad: factura.unidad,
      cliente: factura.cliente,
      proveedor: "",
      razon: "",
      descripcion: "Eliminar factura: " + factura.monthyear
    }
    try {
      // busco cliente y sald
      let res_cliente = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, { headers: { 'Authorization': this.token } })
      let datacliente = await res_cliente.json()
      // actualizo saldo
      let datasaldo = {
        saldo: datacliente.saldo - factura.total
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasaldo)
      })
      //Creo asiento
      let res_asiento = await fetch(`${environment.apiUrl}/api/collections/Asiento/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasiento)
      })
      let data_asiento = await res_asiento.json()
      return data_asiento
    }
    catch (err) {
      console.error(err)
    }
  }
  async crearAsientoNota(factura: any,nota:any) {
    let datasiento = {
      fecha: new Date().toISOString().split("T")[0]+" 03:00:00",
      monto: -nota.monto,
      factura: "",
      cobro: "",
      orden: "",
      pago: "",
      nota: nota.id,
      cheque: "",
      transferencia: "",
      flujo: "",
      tipo: "nota",
      unidad: factura.unidad,
      cliente: factura.cliente,
      proveedor: "",
      razon: "",
      descripcion: "Crear nota: " + nota.numero
    }
    try {
      // busco cliente y sald
      let res_cliente = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, { headers: { 'Authorization': this.token } })
      let datacliente = await res_cliente.json()
      // actualizo saldo
      let datasaldo = {
        saldo: datacliente.saldo - nota.monto
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasaldo)
      })
      //Creo asiento
      let res_asiento = await fetch(`${environment.apiUrl}/api/collections/Asiento/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasiento)
      })
      let data_asiento = await res_asiento.json()
      return data_asiento
    }
    catch (err) {
      console.error(err)
    }
  }
  async crearAsientoEliminarNota(factura: any,nota:any) {
    let datasiento = {
      fecha: new Date().toISOString().split("T")[0]+" 03:00:00",
      monto: nota.monto,
      factura: "",
      cobro: "",
      orden: "",
      pago: "",
      nota: nota.id,
      cheque: "",
      transferencia: "",
      flujo: "",
      tipo: "nota",
      unidad: factura.unidad,
      cliente: factura.cliente,
      proveedor: "",
      razon: "",
      descripcion: "Eliminar nota: " + nota.numero
    }
    try {
      // busco cliente y sald
      let res_cliente = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, { headers: { 'Authorization': this.token } })
      let datacliente = await res_cliente.json()
      // actualizo saldo
      let datasaldo = {
        saldo: datacliente.saldo + nota.monto
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${factura.cliente}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasaldo)
      })
      //Creo asiento
      let res_asiento = await fetch(`${environment.apiUrl}/api/collections/Asiento/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasiento)
      })
      let data_asiento = await res_asiento.json()
      return data_asiento
    }
    catch (err) {
      console.error(err)
    }
  }
  async getFacturas(nombreCliente: string, nrofactura: string, identidad: string, monthyear: string, todos: boolean, enrevision: boolean, enliquidacion: boolean, aceptadocliente: boolean, cobrado: boolean, cerrada: boolean, fechaDesde: string, fechaHasta: string, fechaCreacionDesde: string, fechaCreacionHasta: string) {
    let y = "%26%26"
    let expand = "cliente,usuario"
    let filter = "active = true"
    filter += ` ${y} numero ~ '${nrofactura}'`
    filter += ` ${y} identidad ~ '${identidad}'`
    filter += ` ${y} cliente.nombre ~ '${nombreCliente}'`
    filter += ` ${y} monthyear ~ '${monthyear}'`
    filter += ``
    if (!todos) {
      if (cobrado) {
        filter += ` ${y} cobrado = true`
      }
      else {
        filter += ` ${y} cobrado = false`
      }
      if (enrevision) {
        filter += ` ${y} enrevision = true`
      }
      else {
        filter += ` ${y} enrevision = false`
      }
      if (enliquidacion) {
        filter += ` ${y} enliquidacion = true`
      }
      else {
        filter += ` ${y} enliquidacion = false`
      }
      if (aceptadocliente) {
        filter += ` ${y} aceptacliente = true`
      }
      else {
        filter += ` ${y} aceptacliente = false`
      }
      if (cerrada) {
        filter += ` ${y} cerrada = true`
      }
      else {
        filter += ` ${y} cerrada = false`
      }
    }
    if (fechaDesde) {
      filter += ` ${y} fechafacturacion>= '${fechaDesde}' `
    }
    if (fechaHasta) {
      filter += ` ${y} fechafacturacion <= '${fechaHasta}' `
    }
    if (fechaCreacionDesde) {
      filter += ` ${y} created>= '${fechaCreacionDesde}' `
    }
    if (fechaCreacionHasta) {
      filter += ` ${y} created <= '${fechaCreacionHasta}' `
    }

    let facturas = []
    let res_f = await fetch(`${environment.apiUrl}/api/collections/Factura/records?perPage=1&page=1&filter=(${filter})&expand=${expand}`, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })

    let data_f = await res_f.json()
    let paginas = Math.floor(data_f.totalItems / 200) + 1

    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Factura/records?perPage=200&page=${pag}&filter=(${filter})&expand=${expand}`, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })

      let data = await res.json()
      facturas = facturas.concat(data.items)
    }
    facturas.sort((f1, f2) => new Date(f1.fechafacturacion) < new Date(f2.fechafacturacion) ? 1 : -1)
    return facturas

  }

  putRemito(id: string, remito: RemitoData, operacion: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { ...remito },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: operacion ?? 'actualizar', ...remito }).subscribe();
        })
      );
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ": " + error); // log to console instead
      return of(result as T);
    };
  }
  getRemito(id: string) {
    let expand = "cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,destinatario.localidad.provincia,estado,responsable"
    const url = `${environment.apiUrl}/api/collections/Remito/records/${id}?expand=${expand}`;
    return this._httpClient.get<RemitoData>(url, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<RemitoData>("", null))
    );
  }
  cobrarFactura(id: string) {
    return this._httpClient.patch(`${environment.apiUrl}/api/collections/Factura/records/${id}`,
      { cobrado: true },
      { headers: { 'Authorization': this.token } }
    )
  }
  getCobros(perPage: number, page: number, fechaCobroDesde: string, fechaCobroHasta: string, clientenombre: string) {
    let filterfechaCobroDesde = fechaCobroDesde ? `%26%26 fechacobro >= '${fechaCobroDesde}'` : ""
    let filterfechaCobroHasta = fechaCobroHasta ? `%26%26 fechacobro <='${fechaCobroHasta}' ` : ""

    let ruta = `${environment.apiUrl}/api/collections/Cobro/records?sort=-created&expand=cliente&page=${page}&perPage=${perPage}&filter=(active = true %26%26 cliente.nombre~'${clientenombre}' ${filterfechaCobroDesde} ${filterfechaCobroHasta})`

    return this._httpClient.get<any>(ruta, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("get cobros", []))
    )
  }
  async getTodosCobros(fechaCobroDesde: string, fechaCobroHasta: string, cliente: string) {
    let filterfechaCobroDesde = fechaCobroDesde ? `%26%26 fechacobro >= '${fechaCobroDesde}'` : ""
    let filterfechaCobroHasta = fechaCobroHasta ? `%26%26 fechacobro <='${fechaCobroHasta}' ` : ""

    let ruta_c = `${environment.apiUrl}/api/collections/Cobro/records?sort=-created&expand=cliente&page=${1}&perPage=${1}&filter=(active = true %26%26 cliente.nombre~'${cliente}' ${filterfechaCobroDesde} ${filterfechaCobroHasta})`

    let res_c = await fetch(ruta_c, { headers: { 'Authorization': this.token } })

    let data_d = await res_c.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1

    let cobros = []
    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Cobro/records?sort=-created&expand=cliente&page=${pag}&perPage=${200}&filter=(active = true %26%26 cliente.nombre~'${cliente}' ${filterfechaCobroDesde} ${filterfechaCobroHasta})&skipTotal=true`

      let res = await fetch(ruta, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      cobros = cobros.concat(data.items)
    }
    cobros.sort((r1, r2) => new Date(r1.fechacobro) < new Date(r2.fechacobro) ? -1 : 1)
    return cobros
  }
  async guardarDetalleCobro(p_detalle, cliente, cobroid) {
    let d = p_detalle
    let tipo = this.getCategoria(d.categoria)
    //cheque
    if (tipo == 1) {
      if (d.nuevo) {
        let cheque = {
          nro: d.nro,
          banco: d.banco,
          razonSocial: d.razonSocial,
          cuit: d.cuit,
          cliente: cliente,
          tipo: d.tipo,
          importe: d.importe,
          fechaIngreso: d.fechaIngreso + " 03:00:00",
          fechaAcreditacion: d.fechaAcreditacion + " 03:00:00",
          fechaEntrega: "",
          active: true,
          propio: false,
          unidad: d.unidad
        }
        if (d.fechaEntrega != "") {
          cheque.fechaEntrega = d.fechaEntrega + " 03:00:00"
        }
        let res_che = await fetch(`${environment.apiUrl}/api/collections/Cheque/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(cheque)
        })
        let data_che = await res_che.json()
        let detalle = {
          cobro: cobroid,
          descripcion: d.descripcion,
          monto: d.total,
          cheque: data_che.id,
          tipocobro: 1
        }
        let res_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)

        })
        let data_d = await res_d.json()
        return data_d

      }
      else {
        let detalle = {
          cobro: cobroid,
          descripcion: d.descripcion,
          monto: d.total,
          cheque: d.id,
          tipocobro: 1
        }
        let res_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)

        })
        let data_d = await res_d.json()
        return data_d
      }
    }
    //transferencia
    else if (tipo == 2) {
      let transfer = {
        fecha: d.fecha + " 03:00:00",
        proveedor: "",
        ingreso: true,
        importe: d.importe,
        bancoorigen: d.bancoorigen,
        bancodestino: d.bancodestino,
        alias: d.alias,
        cbu: d.cbu,
        cliente: cliente,
        unidad: d.unidad
      }
      let res_t = await fetch(`${environment.apiUrl}/api/collections/Transferencia/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(transfer)
      })
      let data_t = await res_t.json()
      let detalle = {
        cobro: cobroid,
        descripcion: d.descripcion,
        monto: d.total,
        tipocobro: 2,
        transferencia: data_t.id
      }
      let res_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(detalle)
      })
      let data_d = await res_d.json()
      return data_d
    }
    //Efectivo
    else if (tipo == 3) {
      let trans = {
        fecha: d.fecha + " 03:00:00",
        cliente: cliente,
        importe: d.importe,
        ingreso: true
      }
      let res_f = await fetch(`${environment.apiUrl}/api/collections/Flujo/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(trans)
      })
      let data_f = await res_f.json()
      let detalle = {
        cobro: cobroid,
        descripcion: d.descripcion,
        monto: d.total,
        tipocobro: 3,
        flujo: data_f.id
      }
      let res_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(detalle)
      })
      let data_d = await res_d.json()
      return data_d
    }
  }
  async guardarRetencion(p_retencion, cliente, cobroid) {
    let r = p_retencion
    let rete = {
      cobro: cobroid,
      descripcion: r.descripcion,
      monto: r.monto
    }
    let data_d = await fetch(`${environment.apiUrl}/api/collections/Detalleretencion/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(rete)
    })
    return data_d
  }
  async guardarDescuento(p_descuento, cliente, cobroid) {
    let d = p_descuento
    let desc = {
      cobro: cobroid,
      descripcion: d.descripcion,
      monto: d.monto
    }
    let data_d = await fetch(`${environment.apiUrl}/api/collections/Detalledescuento/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(desc)
    })
    return data_d
  }
  async guardarAcuenta(p_acuenta, cliente, cobroid) {
    let a = p_acuenta
    let data_acuenta = {
      cobro: cobroid,
    }
    let data_a = await fetch(`${environment.apiUrl}/api/collections/Acuenta/records/${a.id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(data_acuenta)
    })
  }
  async cobrarCompleto(
    numero: string, fechacobro: string, cliente: string,
    //Los totales sirven para no recalcular los totales
    totalfacturas: number, totaldetalles: number, totalretenciones: number,
    totaldescuentos: number, totalacuentas: number, totalnotas: number,
    //Lo que se pago de mas, si se pago todo, fecha del pago todo
    acuenta: number, completo: boolean, cobrocompleto: string,
    //listas
    facturas: any[], retenciones: any[], descuentos: any[], detalles: any[], acuentas: any[]
  ) {
    let cobro = {
      fechacobro: fechacobro + ' 03:00:00.000Z',
      totalfacturas,
      totaldetalles,
      totalretenciones,
      cliente,
      active: true,
      numero,
      completo,
      totaldescuentos,
      acuenta,
      cobrocompleto: cobrocompleto.length > 0 ? cobrocompleto + ' 03:00:00.000Z' : "",
      totalacuentas,
      totalnotas
    }
    let res_c = await fetch(`${environment.apiUrl}/api/collections/Cobro/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(cobro)
    })
    let data_c = await res_c.json()
    //Facturas
    for (let i = 0; i < facturas.length; i++) {
      let data_f = await fetch(`${environment.apiUrl}/api/collections/Factura/records/${facturas[i].id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cobro: data_c.id,

          enrevision: false,
          enliquidacion: false,
          aceptacliente: false,
          cobrado: true,
          cerrada: false

        })
      })
    }
    //Detalles
    for (let i = 0; i < detalles.length; i++) {
      let d = detalles[i]
      let tipo = this.getCategoria(d.categoria)
      //cheque
      if (tipo == 1) {
        if (d.nuevo) {
          let cheque = {
            nro: d.nro,
            banco: d.banco,
            razonSocial: d.razonSocial,
            cuit: d.cuit,
            cliente: cliente,
            tipo: d.tipo,
            importe: d.importe,
            fechaIngreso: d.fechaIngreso + " 03:00:00",
            fechaAcreditacion: d.fechaAcreditacion + " 03:00:00",
            fechaEntrega: "",
            active: true,
            propio: false,
            unidad: d.unidad
          }
          if (d.fechaEntrega != "") {
            cheque.fechaEntrega = d.fechaEntrega + " 03:00:00"
          }
          let res_che = await fetch(`${environment.apiUrl}/api/collections/Cheque/records`, {
            method: "POST",
            headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
            body: JSON.stringify(cheque)
          })
          let data_che = await res_che.json()
          let detalle = {
            cobro: data_c.id,
            descripcion: detalles[i].descripcion,
            monto: detalles[i].total,
            cheque: data_che.id,
            tipocobro: 1
          }
          let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
            method: "POST",
            headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
            body: JSON.stringify(detalle)

          })

        }
        else {

          let detalle = {
            cobro: data_c.id,
            descripcion: detalles[i].descripcion,
            monto: detalles[i].total,
            cheque: d.id,
            tipocobro: 1
          }
          let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
            method: "POST",
            headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
            body: JSON.stringify(detalle)

          })
        }
      }
      //transferencia
      else if (tipo == 2) {
        let transfer = {
          fecha: d.fecha + " 03:00:00",
          proveedor: "",
          ingreso: true,
          importe: d.importe,
          bancoorigen: d.bancoorigen,
          bancodestino: d.bancodestino,
          alias: d.alias,
          cbu: d.cbu,
          cliente: cliente,
          unidad: d.unidad
        }
        let res_t = await fetch(`${environment.apiUrl}/api/collections/Transferencia/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(transfer)
        })
        let data_t = await res_t.json()
        let detalle = {
          cobro: data_c.id,
          descripcion: detalles[i].descripcion,
          monto: detalles[i].total,
          tipocobro: 2,
          transferencia: data_t.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)
        })
      }
      //Efectivo
      else if (tipo == 3) {
        let trans = {
          fecha: d.fecha + " 03:00:00",
          cliente: cliente,
          importe: d.importe,
          ingreso: true
        }
        let res_f = await fetch(`${environment.apiUrl}/api/collections/Flujo/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(trans)
        })
        let data_f = await res_f.json()
        let detalle = {
          cobro: data_c.id,
          descripcion: detalles[i].descripcion,
          monto: detalles[i].total,
          tipocobro: 3,
          flujo: data_f.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)
        })
      }
    }
    //Retenciones
    for (let i = 0; i < retenciones.length; i++) {
      let r = retenciones[i]
      let rete = {
        cobro: data_c.id,
        fecha: r.fecha.length > 0 ? r.fecha + " 03:00:00" : "",
        descripcion: r.descripcion,
        monto: r.monto
      }
      let data_d = await fetch(`${environment.apiUrl}/api/collections/Detalleretencion/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(rete)
      })
    }
    //Descuentos
    for (let i = 0; i < descuentos.length; i++) {
      let d = descuentos[i]
      let desc = {
        cobro: data_c.id,
        fecha: d.fecha.length > 0 ? d.fecha + " 03:00:00" : "",
        descripcion: d.descripcion,
        monto: d.monto
      }
      let data_d = await fetch(`${environment.apiUrl}/api/collections/Detalledescuento/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(desc)
      })
    }
    //Acuentas
    for (let i = 0; i < acuentas.length; i++) {
      let a = acuentas[i]
      let data_acuenta = {
        cobro: data_c.id,
      }
      let data_a = await fetch(`${environment.apiUrl}/api/collections/Acuenta/records/${a.id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(data_acuenta)
      })
    }
    //Crear a cuenta
    if (acuenta > 0) {
      let data_acuenta = {
        descripcion: "Cobro de " + fechacobro,
        monto: acuenta,
        fecha: fechacobro + " 03:00:00",
        cliente,
        active: true
      }
      let data_a = await fetch(`${environment.apiUrl}/api/collections/Acuenta/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(data_acuenta)
      })
    }
    return data_c

  }
  async editarCobro(id,
    //Los totales sirven para no recalcular los totales
    totaldetalles: number, totalretenciones: number,
    totaldescuentos: number, totalacuentas: number,
    //Lo que se pago de mas, si se pago todo, fecha del pago todo
    acuenta: number, completo: boolean, cobrocompleto: string,
    fechacobro: string
  ) {
    let cobro = {
      totaldetalles,
      totalretenciones,
      completo,
      totaldescuentos,
      acuenta,
      cobrocompleto: cobrocompleto.length > 0 ? cobrocompleto + ' 03:00:00.000Z' : "",
      totalacuentas,
      fechacobro: fechacobro + " 03:00:00"
    }
    let res_c = await fetch(`${environment.apiUrl}/api/collections/Cobro/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(cobro)
    })
    let data_c = await res_c.json()
    return data_c
  }
  //Es la version vieja
  async cobrar(acuenta: number, completo: boolean, numero: string, fechacobro: string, cliente: string, totalfacturas: number, totaldetalles: number, totalretenciones: number, totaldescuentos: number, facturas: any[], retenciones: any[], descuentos: any[], detalles: any[]) {
    let cobro = {
      acuenta,
      completo,
      numero,
      cliente,
      fechacobro: fechacobro + ' 03:00:00.000Z',
      totalfacturas,
      totaldetalles,
      totalretenciones,
      active: true
    }
    let res_c = await fetch(`${environment.apiUrl}/api/collections/Cobro/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(cobro)
    })
    let data_c = await res_c.json()
    for (let i = 0; i < facturas.length; i++) {
      let data_f = await fetch(`${environment.apiUrl}/api/collections/Factura/records/${facturas[i].id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cobrado: true, cobro: data_c.id })
      })
    }
    //Detalles
    for (let i = 0; i < detalles.length; i++) {
      let d = detalles[i]
      let tipo = this.getCategoria(d.categoria)
      //Cheque
      if (tipo == 1) {
        let cheque = {
          nro: d.nro,
          banco: d.banco,
          razonSocial: d.razonSocial,
          cuit: d.cuit,
          cliente: cliente,
          tipo: d.tipo,
          importe: d.importe,
          fechaIngreso: d.fechaIngreso + " 03:00:00",
          fechaAcreditacion: d.fechaAcreditacion + " 03:00:00",
          fechaEntrega: "",
          active: true,
          propio: false,
          unidad: d.unidad
        }
        if (d.fechaEntrega != "") {
          cheque.fechaEntrega = d.fechaEntrega + " 03:00:00"
        }
        let res_che = await fetch(`${environment.apiUrl}/api/collections/Cheque/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(cheque)
        })
        let data_che = await res_che.json()
        let detalle = {
          cobro: data_c.id,
          descripcion: detalles[i].descripcion,
          monto: detalles[i].total,
          cheque: data_che.id,
          tipocobro: 1
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)

        })

      }
      //Transferencia
      else if (tipo == 2) {
        let transfer = {
          fecha: d.fecha + " 03:00:00",
          proveedor: "",
          ingreso: true,
          importe: d.importe,
          bancoorigen: d.bancoorigen,
          bancodestino: d.bancodestino,
          alias: d.alias,
          cbu: d.cbu,
          cliente: cliente,
          unidad: d.unidad
        }
        let res_t = await fetch(`${environment.apiUrl}/api/collections/Transferencia/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(transfer)
        })
        let data_t = await res_t.json()
        let detalle = {
          cobro: data_c.id,
          descripcion: detalles[i].descripcion,
          monto: detalles[i].total,
          tipocobro: 2,
          transferencia: data_t.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)
        })
      }
      //Efectivo
      else if (tipo == 3) {
        let trans = {
          fecha: d.fecha + " 03:00:00",
          cliente: cliente,
          importe: d.importe,
          ingreso: true
        }
        let res_f = await fetch(`${environment.apiUrl}/api/collections/Flujo/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(trans)
        })
        let data_f = await res_f.json()
        let detalle = {
          cobro: data_c.id,
          descripcion: detalles[i].descripcion,
          monto: detalles[i].total,
          tipocobro: 3,
          flujo: data_f.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)
        })
      }


    }
    //Retenciones
    for (let i = 0; i < retenciones.length; i++) {
      let rete = {
        cobro: data_c.id,
        descripcion: retenciones[i].descripcion,
        monto: retenciones[i].monto
      }
      let data_d = await fetch(`${environment.apiUrl}/api/collections/Detalleretencion/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(rete)
      })

    }
    //Descuentos
    for (let i = 0; i < descuentos.length; i++) {
      let desc = {
        cobro: data_c.id,
        descripcion: descuentos[i].descripcion,
        monto: descuentos[i].monto
      }
      let data_d = await fetch(`${environment.apiUrl}/api/collections/Detalledescuento/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(desc)
      })
    }
    return data_c

  }
  //Debo eliminar los cheques, las transfer y los efectivos
  async eliminarCobro(id) {

    let res_c = await fetch(`${environment.apiUrl}/api/collections/Cobro/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false })
    })
    let data_c = await res_c.json()
    //Facturas
    let res_facturas = await fetch(`${environment.apiUrl}/api/collections/Factura/records?perPage=200&page=1&filter=(cobro~'${id}')`, { headers: { 'Authorization': this.token } })
    let data_facturas = await res_facturas.json()
    let fs = data_facturas.items
    for (let i = 0; i < fs.length; i++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Factura/records/${fs[i].id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cobro: "", enrevision: true, enliquidacion: false, aceptacliente: false, cerrada: false })
      })
      //let data = await res.json()
    }


    //Pagos
    let resdetallespago = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records?perPage=200&page=1&filter=(cobro~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datadetallespago = await resdetallespago.json()
    let items = datadetallespago.items
    for (let i = 0; i < items.length; i++) {
      let fila = items[i]

      let ruta = `${environment.apiUrl}/api/collections/Detallecobro/records/${fila.id}`
      await fetch(ruta, {
        method: "DELETE",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      })
      //Debo eliminar los cheques, transfer y transacciones ? sí
      let cheque = fila.cheque
      let transferencia = fila.transferencia
      let flujo = fila.flujo
      if (cheque.length > 0) {
        let rutacheque = `${environment.apiUrl}/api/collections/Cheque/records/${cheque}`
        await fetch(rutacheque, {
          method: "DELETE",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        })
      }
      if (transferencia.length > 0) {
        let rutatrans = `${environment.apiUrl}/api/collections/Transferencia/records/${transferencia}`
        await fetch(rutatrans, {
          method: "DELETE",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        })
      }
      if (flujo.length > 0) {
        let rutaflujo = `${environment.apiUrl}/api/collections/Flujo/records/${flujo}`
        await fetch(rutaflujo, {
          method: "DELETE",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        })
      }


    }
    //Retenciones
    let resretenciones = await fetch(`${environment.apiUrl}/api/collections/Detalleretencion/records?perPage=200&page=1&filter=(cobro~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let dataretenciones = await resretenciones.json()
    items = dataretenciones.items
    for (let i = 0; i < items.length; i++) {
      let fila = items[i]

      let ruta = `${environment.apiUrl}/api/collections/Detalleretencion/records/${fila.id}`
      await fetch(ruta, {
        method: "DELETE",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      })
    }
    //Descuentos
    let resdescuentos = await fetch(`${environment.apiUrl}/api/collections/Detalledescuento/records?perPage=200&page=1&filter=(cobro~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datadescuentos = await resdescuentos.json()
    items = datadescuentos.items
    for (let i = 0; i < items.length; i++) {
      let fila = items[i]
      let ruta = `${environment.apiUrl}/api/collections/Detalledescuento/records/${fila.id}`
      await fetch(ruta, {
        method: "DELETE",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      })
    }
    //Acuenta
    let resacuentas = await fetch(`${environment.apiUrl}/api/collections/Acuenta/records?perPage=200&page=1&filter=(cobro~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let dataacuentas = await resacuentas.json()
    items = dataacuentas.items
    for (let i = 0; i < items.length; i++) {
      let fila = items[i]
      let data = {
        cobro: ""
      }
      let ruta = `${environment.apiUrl}/api/collections/Acuenta/records/${fila.id}`
      await fetch(ruta, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    }
    return data_c
  }
  async getCobro(id) {
    let res_cobro = await fetch(`${environment.apiUrl}/api/collections/Cobro/records/${id}?expand=cliente`, {
      headers: { 'Authorization': this.token }
    })
    let data_cobro = await res_cobro.json()
    let resdetallespago = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records?perPage=200&page=1&filter=(cobro~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datadetallespago = await resdetallespago.json()
    let resretenciones = await fetch(`${environment.apiUrl}/api/collections/Detalleretencion/records?perPage=200&page=1&filter=(cobro~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let dataretenciones = await resretenciones.json()
    let resfacturas = await fetch(`${environment.apiUrl}/api/collections/Factura/records?expand=cliente&perPage=200&page=1&filter=(cobro~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datafacturas = await resfacturas.json()
    let resdescuentos = await fetch(`${environment.apiUrl}/api/collections/Detalledescuento/records?perPage=200&page=1&filter=(cobro~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datadescuentos = await resdescuentos.json()
    let resacuentas = await fetch(`${environment.apiUrl}/api/collections/Acuenta/records?perPage=200&page=1&filter=(cobro~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let dataacuentas = await resacuentas.json()
    let cobro = {
      fechacobro: data_cobro.fechacobro,
      totalfacturas: data_cobro.totalfacturas,
      totaldetalles: data_cobro.totaldetalles,
      totalretenciones: data_cobro.totalretenciones,
      razonSocial: data_cobro.expand.cliente.razonSocial,
      cliente: data_cobro.cliente,
      numero: data_cobro.numero,
      completo: data_cobro.completo,
      totaldescuentos: data_cobro.totaldescuentos,
      acuenta: data_cobro.acuenta,
      cobrocompleto: data_cobro.cobrocompleto,
      totalacuentas: data_cobro.totalacuentas,
      totalnotas: data_cobro.totalnotas,
      pagos: datadetallespago.items,
      retenciones: dataretenciones.items,
      facturas: datafacturas.items,
      descuentos: datadescuentos.items,
      acuentas: dataacuentas.items,
      responsableinscripto: data_cobro.expand.cliente.responsableinscripto,
      expand: data_cobro.expand
    }
    return cobro

  }
  crearNotaCredito(factura: string, numero: string, monto: number, descripcion: string): Observable<any> {
    let nota = {
      factura,
      numero,
      monto,
      descripcion
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/NotaCredito/records`, nota, { headers: { 'Authorization': this.token } })
  }
  getNotasCredito(factura: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/NotaCredito/records?perPage=200&page=1&filter=(factura='${factura}' %26%26 eliminado=false)`, { headers: { 'Authorization': this.token } })
  }
  async asyncGetNotasCredito(factura: string) {
    let ruta = `${environment.apiUrl}/api/collections/NotaCredito/records?perPage=200&page=1&filter=(factura='${factura}')&&skipTotal=true`
    let res = await fetch(ruta, {
      headers: { 'Authorization': this.token }
    })
    let data = await res.json()
    return data.items

  }
  //Es cronologico, no agrupativo
  async getCuentaCorrienteCliente(cliente: string, perPage: number, page: number, fechadesde: string, fechahasta: string) {

    let ctacorrientes = []
    //facturas

    let rutafacturas = `${environment.apiUrl}/api/collections/Factura/records?perPage=1&page=1`

    let filterfactura = `&filter=(active=true`
    if (fechadesde != "") {
      filterfactura += `%26%26fechafacturacion>'${fechadesde}'`
    }

    if (fechahasta != "") {
      filterfactura += `%26%26fechafacturacion<'${fechahasta}'`
    }
    if (cliente != '') {
      filterfactura += `%26%26 cliente='${cliente}')`
    } else {
      filterfactura += `)`
    }
    rutafacturas = `${rutafacturas}${filterfactura}`
    let res_f = await fetch(rutafacturas, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    let data_f = await res_f.json()
    let paginas = Math.floor(data_f.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Factura/records?perPage=${200}&page=${pag}${filterfactura}&expand=cliente`
      let res = await fetch(ruta, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })
      let data = await res.json()
      let lista = data.items
      for (let i = 0; i < lista.length; i++) {
        let item = lista[i]
        let fila = {
          numero: item.numero,
          fecha: item.fechafacturacion,
          razonSocial: item.expand.cliente.razonSocial,
          nombrecliente: item.expand.cliente.nombre,
          acuenta: 0,
          iva: item.expand.cliente.responsableinscripto ? 0.21 * item.total : 0,
          total: item.total,
          pagos: 0,
          retenciones: 0,
          descuentos: 0,
          acuentas: 0,
          notas: 0,
          saldo: 0
        }
        ctacorrientes.push(fila)
      }

    }
    //pagos
    let rutapagos = `${environment.apiUrl}/api/collections/Cobro/records?perPage=1&page=1`
    let filtercobro = `&filter=(active=true`
    if (fechadesde != "") {
      filtercobro += `%26%26fechacobro>'${fechadesde}'`
    }
    if (fechahasta != "") {
      filtercobro += `%26%26fechacobro<'${fechahasta}'`
    }

    if (cliente != '') {
      filtercobro += `%26%26 cliente='${cliente}')`
    } else {
      filtercobro += `)`
    }

    rutapagos = `${rutapagos}${filtercobro}`
    let res_p = await fetch(rutapagos, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    let data_p = await res_p.json()
    paginas = Math.floor(data_p.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Cobro/records?perPage=${200}&page=${pag}${filtercobro}&expand=cliente`
      let res = await fetch(ruta, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })

      let data = await res.json()
      let lista = data.items
      for (let i = 0; i < lista.length; i++) {
        let item = lista[i]
        let fila = {
          numero: item.numero,
          fecha: item.fechacobro,
          razonSocial: item.expand.cliente.razonSocial,
          acuenta: 0,
          iva: 0,
          total: 0,
          pagos: item.totaldetalles,
          retenciones: item.totalretenciones,
          descuentos: item.totaldescuentos,
          acuentas: item.totalacuentas,
          notas: item.totalnotas,
          nombrecliente: item.expand.cliente.nombre,
          saldo: 0
        }
        ctacorrientes.push(fila)
      }

    }
    //acuentas
    let rutaacuenta = `${environment.apiUrl}/api/collections/Acuenta/records?perPage=1&page=1`
    let filteracuenta = `&filter=(active=true`
    if (fechadesde != "") {
      filteracuenta += `%26%26 fecha>'${fechadesde}'`
    }
    if (fechahasta != "") {
      filteracuenta += `%26%26 fecha<'${fechahasta}'`
    }

    if (cliente != '') {
      filteracuenta += `%26%26 cliente='${cliente}')`
    } else {
      filteracuenta += `)`
    }

    rutaacuenta = `${rutaacuenta}${filteracuenta}`
    let res_a = await fetch(rutaacuenta, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })

    let data_a = await res_a.json()
    paginas = Math.floor(data_a.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Acuenta/records?perPage=${200}&page=${pag}${filteracuenta}&expand=cliente`
      let res = await fetch(ruta, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })

      let data = await res.json()
      let lista = data.items

      for (let i = 0; i < lista.length; i++) {
        let item = lista[i]
        let fila = {
          numero: item.descripcion,
          fecha: item.fecha,
          acuenta: item.monto,
          razonSocial: item.expand.cliente.razonSocial,

          nombrecliente: item.expand.cliente.nombre,
          iva: 0,
          total: 0,
          pagos: 0,
          retenciones: 0,
          descuentos: 0,
          acuentas: 0,
          notas: 0,
          saldo: 0
        }
        ctacorrientes.push(fila)
      }

    }
    ctacorrientes = ctacorrientes.sort((a, b) => new Date(a.fecha) < new Date(b.fecha) ? -1 : 1)
    return ctacorrientes
  }
  async getTodasCuentasCorrientes(fechadesde: string, fechahasta: string) {
    let ctacorrientes = []
    let clientes = []
    let ruta = `${environment.apiUrl}/api/collections/Cliente/records?page=1&perPage=1`
    let filter = `&filter=(active=true)`
    let res = await fetch(`${ruta}${filter}`, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    let data = await res.json()
    let paginas = Math.floor(data.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      ruta = `${environment.apiUrl}/api/collections/Cliente/records?skipTotal=true&page=${pag}&perPage=${200}`
      res = await fetch(`${ruta}${filter}`, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })
      data = await res.json()
      clientes = clientes.concat(data.items)
    }
    for (let i = 0; i < clientes.length; i++) {

      let cliente = clientes[i]

      //Facturas
      let facturas = []
      let facturatotal = 0
      let rutafacturas = `${environment.apiUrl}/api/collections/Factura/records?perPage=1&page=1`
      let filterfactura = `&filter=(active=true%26%26cliente='${cliente.id}'`
      if (fechadesde != "") {
        filterfactura += `%26%26fechafacturacion>'${fechadesde}'`
      }

      if (fechahasta != "") {
        filterfactura += `%26%26fechafacturacion<'${fechahasta}'`
      }
      filterfactura += ")"
      rutafacturas = `${rutafacturas}${filterfactura}`
      let res_f = await fetch(rutafacturas, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })
      let data_f = await res_f.json()
      let paginas = Math.floor(data_f.totalItems / 200) + 1
      for (let pag = 1; pag <= paginas; pag++) {
        let ruta = `${environment.apiUrl}/api/collections/Factura/records?perPage=${200}&page=${pag}${filterfactura}`
        let res = await fetch(ruta, {
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
        })
        let data = await res.json()
        facturas = facturas.concat(data.items)
      }
      cliente.facturas = facturas
      for (let j = 0; j < facturas.length; j++) {
        facturatotal += cliente.responsableinscripto ? facturas[j].total * this.IVA : facturas[j].total
      }
      // Pagos
      let pagos = []
      let pagostotal = 0
      let retencionestotal = 0

      let rutapagos = `${environment.apiUrl}/api/collections/Cobro/records?perPage=1&page=1`
      let filtercobro = `&filter=(active=true%26%26cliente='${cliente.id}'`
      if (fechadesde != "") {
        filtercobro += `%26%26fechacobro>'${fechadesde}'`
      }
      if (fechahasta != "") {
        filtercobro += `%26%26fechacobro<'${fechahasta}'`
      }
      filtercobro += ")"
      rutapagos = `${rutapagos}${filtercobro}`
      let res_p = await fetch(rutapagos, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })
      let data_p = await res_p.json()
      paginas = Math.floor(data_p.totalItems / 200) + 1
      for (let pag = 1; pag <= paginas; pag++) {
        let ruta = `${environment.apiUrl}/api/collections/Cobro/records?perPage=${200}&page=${pag}${filtercobro}`
        let res = await fetch(ruta, {
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
        })

        let data = await res.json()
        pagos = pagos.concat(data.items)

      }
      cliente.pagos = pagos
      for (let j = 0; j < pagos.length; j++) {
        pagostotal += pagos[j].totaldetalles
        retencionestotal += pagos[j].totalretenciones
      }
      cliente.facturatotal = facturatotal
      cliente.pagostotal = pagostotal
      cliente.retencionestotal = retencionestotal
      cliente.saldototal = -1 * (facturatotal - pagostotal - retencionestotal)

      ctacorrientes.push(cliente)
    }

    return ctacorrientes
  }
  async getrazonSocialCliente(cliente: string) {
    let res = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${cliente}`, { headers: { 'Authorization': this.token } })
    let data = await res.json()
    return data.razonSocial
  }
  formatPeso(value) {
    if (value) {
      return value.toLocaleString('es-ar', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      });
    }
    else {
      return (0).toLocaleString('es-ar', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      });
    }

  }
  //liquidacion
  crearFactura(remitos) {
    let factura = {
      numero: "",
      concepto: "",
      total: "",
      unidad: "",
      remitos,
      detalles: []
    }
    localStorage.setItem("FACTURA",
      JSON.stringify(factura)
    )
  }
  retomarFactura() {
    let factura = {
      numero: "",
      concepto: "",
      total: "",
      unidad: "",
      remitos: [],
      detalles: []
    }
    if (localStorage.getItem("FACTURA") == null) {
      localStorage.setItem("FACTURA",
        JSON.stringify(factura)
      )
      return factura
    }
    else {
      let localop = JSON.parse(localStorage.getItem("FACTURA"))
      let merged = {
        ...factura,
        ...localop
      }
      return merged
    }
  }
  guardarFactura(factura: any) {
    localStorage.setItem("FACTURA",
      JSON.stringify(factura)
    )
  }
  async getDetallesEnFactura(idfactura) {
    let detalles = []
    let rutacompleta = `${environment.apiUrl}/api/collections/DetalleFactura/records?perPage=1&page=1&filter=(factura~'${idfactura}')`
    let res_d = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/DetalleFactura/records?perPage=200&page=${pag}&filter=(factura~'${idfactura}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      detalles = detalles.concat(data.items)
    }
    return detalles
  }
  async getNotasEnFactura(idfactura) {
    let notas = []
    let rutacompleta = `${environment.apiUrl}/api/collections/NotaCredito/records?perPage=1&page=1&filter=(factura~'${idfactura}' %26%26 eliminado=false)`
    let res_d = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    
    let data_d = await res_d.json()
    
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/NotaCredito/records?perPage=200&page=${pag}&filter=(factura~'${idfactura}' %26%26 eliminado=false)&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      notas = notas.concat(data.items)
    }
    return notas
  }
  async guardarNotaEnFactura(nota) {
    let res_n = await fetch(`${environment.apiUrl}/api/collections/NotaCredito/records/`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nota })
    })
    let data_n = await res_n.json()
    return data_n
  }
  async quitarNotaEnFactura(idnota) {
    let data = {eliminado:true}
    let res_d = await fetch(`${environment.apiUrl}/api/collections/NotaCredito/records/${idnota}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res_d
  }
  async guardarDetalleEnFactura(detalle, idfactura) {
    let res_d = await fetch(`${environment.apiUrl}/api/collections/DetalleFactura/records/`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...detalle, factura: idfactura })
    })
    let data_d = await res_d.json()
    return data_d
  }
  async quitarDetalleEnFactura(iddetalle) {
    let res_d = await fetch(`${environment.apiUrl}/api/collections/DetalleFactura/records/${iddetalle}`, {
      method: "DELETE",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    return res_d
  }
  async guardarRemitoEnFactura(remito, idfactura) {
    let res_r = await fetch(`${environment.apiUrl}/api/collections/Remito/records/${remito.id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ factura: idfactura })
    })
    let res_h = await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ remito: remito.id, ...remito, factura: idfactura, id: null, responsable: this.responsable })
    })

    return res_h

  }
  async quitarRemitoEnFactura(remito) {
    let res_r = await fetch(`${environment.apiUrl}/api/collections/Remito/records/${remito.id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ factura: "" })
    })
    let res_h = await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ remito: remito.id, ...remito, factura: "", id: null, responsable: this.responsable })
    })
    return res_h
  }
  async getRemitosFactura(id) {
    let remitos = []
    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&filter=(factura~'${id}' %26%26 active=true)`
    let res_r = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_r = await res_r.json()
    let paginas = Math.floor(data_r.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=${pag}&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado&filter=(factura~'${id}'%26%26 active=true)&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      remitos = remitos.concat(data.items)
    }
    return remitos
  }
  //cobros
  crearCobro(facturas) {
    let cobro = {
      acuenta: "",
      completo: true,
      numero: "",
      fechacobro: "",
      fechacobrocompleto: "",
      cliente: "",
      totalfact: "",
      totalpagos: "",
      totalretenciones: "",
      datafacturas: facturas,
      retenciones: [],
      descuentos: [],
      detallespago: [],
      acuentas: []
    }
    localStorage.setItem("COBRO",
      JSON.stringify(cobro)
    )
  }
  retomarCobro() {
    let cobro = {
      acuenta: "",
      completo: true,
      numero: "",
      fechacobro: "",
      fechacobrocompleto: "",
      cliente: "",
      totalfact: "",
      totalpagos: "",
      totalretenciones: "",
      datafacturas: [],
      retenciones: [],
      descuentos: [],
      detallespago: [],
      acuentas: []
    }
    if (localStorage.getItem("COBRO") == null) {
      localStorage.setItem("COBRO",
        JSON.stringify(cobro)
      )
      return cobro
    }
    else {
      let localop = JSON.parse(localStorage.getItem("COBRO"))
      let merged = {
        ...cobro,
        ...localop
      }
      return merged
    }
  }
  guardarCobro(cobro: any) {
    localStorage.setItem("COBRO",
      JSON.stringify(cobro)
    )
  }

  async getNotasCreditoLiquidacion(facturasid) {
    let notas = []
    for (let i = 0; i < facturasid.length; i++) {
      let id = facturasid[i]
      let ruta = `${environment.apiUrl}/api/collections/NotaCredito/records?perPage=200&page=1&filter=(factura~'${id}')&expand=factura`

      let res = await fetch(ruta, { headers: { 'Authorization': this.token } })

      let data = await res.json()

      notas = notas.concat(data.items)
    }

    return notas
  }
  async getTotalAcuentas(descripcion: string, fechadesde: string, fechahasta: string, cliente: string) {
    let filter = `(active=true`
    if (descripcion != "") {
      filter += ` %26%26  descripcion~'${descripcion}'`
    }
    if (fechadesde != "") {
      filter += ` %26%26 fecha >= '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 fecha <= '${fechahasta}'`
    }
    if (cliente != "") {
      filter += ` %26%26 cliente ~ '${cliente}'`
    }
    filter += ")"
    let ruta_cuenta = `${environment.apiUrl}/api/collections/Acuenta/records?filter=${filter}&page=${1}&perPage=${1}`
    let res_cuenta = await fetch(ruta_cuenta, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_cuenta.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    let total = 0

    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Acuenta/records?filter=${filter}&page=${pag}&perPage=${200}&expand=factura&sort=-fecha`
      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      let subtotal = data.items.reduce((res, item) =>
        res + item.monto
        , 0)
      total += subtotal
    }


    return total
  }
  // A cuentas
  getAcuentas(perPage: number, page: number, descripcion: string, fechadesde: string, fechahasta: string, cliente: string) {
    let filter = `(active=true`
    if (descripcion != "") {
      filter += ` %26%26  descripcion~'${descripcion}'`
    }
    if (fechadesde != "") {
      filter += ` %26%26 fecha >= '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 fecha <= '${fechahasta}'`
    }
    if (cliente != "") {
      filter += ` %26%26 cliente ~ '${cliente}'`
    }
    filter += ")"

    let ruta = `${environment.apiUrl}/api/collections/Acuenta/records?filter=${filter}&page=${page}&perPage=${perPage}&sort=-fecha`
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get acuentas", []))
    )

  }
  async getAcuentasTodos(descripcion: string, fechadesde: string, fechahasta: string, cliente: string) {
    let filter = `(active=true`
    if (descripcion != "") {
      filter += ` %26%26  descripcion~'${descripcion}'`
    }
    if (fechadesde != "") {
      filter += ` %26%26 fecha >= '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 fecha <= '${fechahasta}'`
    }
    if (cliente != "") {
      filter += ` %26%26 cliente ~ '${cliente}'`
    }
    filter += ")"
    let ruta_cuenta = `${environment.apiUrl}/api/collections/Acuenta/records?filter=${filter}&page=${1}&perPage=${1}`
    let res_cuenta = await fetch(ruta_cuenta, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_cuenta.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    let acuentas = []

    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Acuenta/records?filter=${filter}&page=${pag}&perPage=${200}&expand=factura&sort=-fecha`
      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      acuentas = acuentas.concat(data.items)
    }


    return acuentas
  }
  async getAcuentasClienteSinUsar(cliente: string, fechadesde: string, fechahasta: string) {
    let filter = `(active=true %26%26 cobro=''`

    if (cliente != "") {
      filter += ` %26%26 cliente ~ '${cliente}'`
    }
    if (fechadesde != "") {
      filter += ` %26%26 created >= '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 created <= '${fechahasta}'`
    }
    filter += ")"
    let ruta_cuenta = `${environment.apiUrl}/api/collections/Acuenta/records?filter=${filter}&page=${1}&perPage=${1}`
    let res_cuenta = await fetch(ruta_cuenta, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_cuenta.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    let acuentas = []

    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Acuenta/records?filter=${filter}&page=${pag}&perPage=${200}&expand=factura&sort=-fecha`
      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      acuentas = acuentas.concat(data.items)
    }


    return acuentas
  }
  async addAcuenta(a, cobro) {
    let data_acuenta = {
      cobro,
    }
    let res_a = await fetch(`${environment.apiUrl}/api/collections/Acuenta/records/${a.id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(data_acuenta)
    })
    let data_a = await res_a.json()

    return data_a
  }
  async modAcuenta(cuenta, id) {
    let data_acuenta = {
      ...cuenta
    }
    delete data_acuenta.id
    let res_a = await fetch(`${environment.apiUrl}/api/collections/Acuenta/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(data_acuenta)
    })
    let data_a = await res_a.json()

    return data_a
  }
  async delAcuenta(idacuenta) {
    let ruta = `${environment.apiUrl}/api/collections/Acuenta/records/${idacuenta}`
    let res_cuenta = await fetch(ruta, {
      method: "DELETE",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
    })
    let data_acuenta = await res_cuenta.json()
    return data_acuenta
  }
  //notas credito
  getNotas(perPage: number, page: number, fechadesde: string, fechahasta: string, cliente: string) {
    let filter = `(eliminado=false`
    if (cliente != "") {
      filter += `%26%26 factura.cliente ~ '${cliente}'`
    }

    if (fechadesde != "") {
      filter += ` %26%26 created > '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 created < '${fechahasta}'`
    }

    filter += ")"

    let ruta = `${environment.apiUrl}/api/collections/NotaCredito/records?filter=${filter}&page=${page}&perPage=${perPage}&expand=factura&sort=-created`
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(

      catchError(this.handleError<any>("get notas", []))
    )
  }
  async getNotasTodos(fechadesde: string, fechahasta: string, cliente: string) {
    let filter = `( eliminado=false `
    if (fechadesde != "") {
      filter += ` %26%26 created > '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 created < '${fechahasta}'`
    }
    if (cliente != "") {
      filter += ` %26%26 factura.cliente ~ '${cliente}'`
    }
    filter += ")"
    //let ruta_notas = `${environment.apiUrl}/api/collections/NotaCredito/records?filter=${filter}&page=${1}&perPage=${1}&expand=factura`
    let ruta_notas = `${environment.apiUrl}/api/collections/NotaCredito/records?filter=${filter}&page=${1}&perPage=${1}&expand=factura`
    let res_notas = await fetch(ruta_notas, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_notas.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    let notas = []

    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/NotaCredito/records?filter=${filter}&page=${pag}&perPage=${200}&expand=factura&sort=-created`
      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      notas = notas.concat(data.items)
    }


    return notas
  }
  async getTotalNotas(fechadesde: string, fechahasta: string, cliente: string) {
    let filter = `( eliminado=False `
    if (fechadesde != "") {
      filter += ` %26%26 created > '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 created < '${fechahasta}'`
    }
    if (cliente != "") {
      filter += ` %26%26 factura.cliente ~ '${cliente}'`
    }
    filter += ")"
    //let ruta_notas = `${environment.apiUrl}/api/collections/NotaCredito/records?filter=${filter}&page=${1}&perPage=${1}&expand=factura`
    let ruta_notas = `${environment.apiUrl}/api/collections/NotaCredito/records?filter=${filter}&page=${1}&perPage=${1}&expand=factura`
    let res_notas = await fetch(ruta_notas, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_notas.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    let total = 0

    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/NotaCredito/records?filter=${filter}&page=${pag}&perPage=${200}&expand=factura&sort=-created`
      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      let subtotal = data.items.reduce((res, item) => res + item.monto, 0)
      total += subtotal
    }


    return total
  }
  delNota(id) {
    let data = {
      eliminado:true
    }
    let ruta = `${environment.apiUrl}/api/collections/NotaCredito/records/${id}`
    return this._httpClient.patch<any>(`${ruta}`,data, {

      headers: { 'Authorization': this.token },
      
    }
    ).pipe(
      catchError(this.handleError<any>("delete notas", []))
    )
  }
  //retenciones
  getAllRetenciones() {
    let retes = [
      { id: "ing brutos cba", nombre: "Ingresos Brutos CBA" },
      { id: "ing brutos caba", nombre: "Ingresos Brutos CABA" },
      { id: "ing brutos bsas", nombre: "Ingresos Brutos Bs As" },
      { id: "suss", nombre: "SUSS" },
      { id: "ganancias", nombre: "Ganancias" },
      { id: "iva", nombre: "Iva" },
      { id: "comercio", nombre: "Comercio e Industria" },
      { id: "descuentos", nombre: "Descuentos" },
      { id: "otros", nombre: "Otros" }

    ]
    return retes
  }
  getRetenciones(perPage: number, page: number, descripcion: string, cliente: string, fechadesde: string, fechahasta: string) {
    let filter = `(1 = 1`
    if (cliente != "") {
      filter += ` %26%26 cobro.cliente ~ '${cliente}'`
    }
    if (descripcion != "") {
      filter += ` %26%26 descripcion ~ '${descripcion}'`
    }
    if (fechadesde != "") {
      filter += ` %26%26 cobro.fechacobro > '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 cobro.fechacobro < '${fechahasta}'`
    }

    filter += ")"

    let ruta = `${environment.apiUrl}/api/collections/Detalleretencion/records?filter=${filter}&page=${page}&perPage=${perPage}&expand=cobro&sort=-created`
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(

      catchError(this.handleError<any>("get retenciones", []))
    )
  }
  async getTodasRetenciones(descripcion: string, cliente: string, fechadesde: string, fechahasta: string) {
    let filter = `(1 = 1`
    if (cliente != "") {
      filter += ` %26%26 cobro.cliente ~ '${cliente}'`
    }
    if (descripcion != "") {
      filter += ` %26%26 descripcion ~ '${descripcion}'`
    }
    if (fechadesde != "") {
      filter += ` %26%26 created > '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 created < '${fechahasta}'`
    }

    filter += ")"
    let ruta_rete = `${environment.apiUrl}/api/collections/Detalleretencion/records?filter=${filter}&page=${1}&perPage=${1}&expand=cobro`

    let res_rete = await fetch(ruta_rete, {
      headers: { 'Authorization': this.token }
    })
    let data_rete = await res_rete.json()
    let paginas = Math.floor(data_rete.totalItems / 200) + 1
    let rete = []

    for (let pag = 1; pag <= paginas; pag++) {

      let ruta = `${environment.apiUrl}/api/collections/Detalleretencion/records?filter=${filter}&page=${pag}&perPage=${200}&expand=cobro&sort=-created`
      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      rete = rete.concat(data.items)

    }


    return rete
  }
  async addRetencion(r, cobro) {
    let rete = {
      cobro,
      fecha: r.fecha.length > 0 ? r.fecha + " 03:00:00" : "",
      descripcion: r.descripcion,
      monto: r.monto
    }
    let res_d = await fetch(`${environment.apiUrl}/api/collections/Detalleretencion/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(rete)
    })
    let data_d = await res_d.json()
    return data_d
  }
  async modRetencion(id, r) {
    let rete = {

      descripcion: r.descripcion,
      monto: r.monto
    }
    let res_d = await fetch(`${environment.apiUrl}/api/collections/Detalleretencion/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(rete)
    })
    let data_d = await res_d.json()
    return data_d
  }
  async delRetencion(id) {
    let res_d = await fetch(`${environment.apiUrl}/api/collections/Detalleretencion/records/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    let data_d = await res_d.json()
    return data_d
  }
  //Descuentos
  getDescuento(perPage: number, page: number, cliente: string, fechadesde: string, fechahasta: string) {
    let filter = `(1 = 1`
    if (cliente != "") {
      filter += ` %26%26 cobro.cliente ~ '${cliente}'`
    }

    if (fechadesde != "") {
      filter += ` %26%26 cobro.fechacobro > '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 cobro.fechacobro < '${fechahasta}'`
    }

    filter += ")"

    let ruta = `${environment.apiUrl}/api/collections/Detalledescuento/records?filter=${filter}&page=${page}&perPage=${perPage}&expand=cobro&sort=-created`

    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(

      catchError(this.handleError<any>("get descuentos", []))
    )
  }
  async getTodosDescuentos(cliente: string, fechadesde: string, fechahasta: string) {
    let filter = `(1 = 1`
    if (cliente != "") {
      filter += ` %26%26 cobro.cliente ~ '${cliente}'`
    }

    if (fechadesde != "") {
      filter += ` %26%26 created > '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 created < '${fechahasta}'`
    }

    filter += ")"
    let ruta_desc = `${environment.apiUrl}/api/collections/Detalledescuento/records?filter=${filter}&page=${1}&perPage=${1}&expand=cobro`
    let res_desc = await fetch(ruta_desc, {
      headers: { 'Authorization': this.token }
    })
    let data_desc = await res_desc.json()
    let paginas = Math.floor(data_desc.totalItems / 200) + 1
    let desc = []

    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Detalledescuento/records?filter=${filter}&page=${pag}&perPage=${200}&expand=cobro&sort=-created`
      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      desc = desc.concat(data.items)
    }


    return desc
  }
  async addDescuento(d, cobro) {
    let desc = {
      cobro,
      fecha: d.fecha.length > 0 ? d.fecha + " 03:00:00" : "",
      descripcion: d.descripcion,
      monto: d.monto
    }
    let res_d = await fetch(`${environment.apiUrl}/api/collections/Detalledescuento/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(desc)
    })
    let data_d = await res_d.json()
    return data_d
  }
  async modDescuento(id, d) {
    let desc = {

      descripcion: d.descripcion,
      monto: d.monto
    }
    let res_d = await fetch(`${environment.apiUrl}/api/collections/Detalledescuento/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(desc)
    })
    let data_d = await res_d.json()
    return data_d
  }
  async delDescuento(id) {
    let res_d = await fetch(`${environment.apiUrl}/api/collections/Detalledescuento/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    let data_d = await res_d.json()
    return data_d
  }
  //elegir cheque
  async elegirCheque(cobro, cheque) {
    let detalle = {
      cobro,
      descripcion: cheque.nro,
      monto: cheque.total,
      cheque: cheque.id,
      tipocobro: 1
    }
    let res_d = await fetch(`${environment.apiUrl}/api/collections/Detallecobro/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(detalle)
    })
    let data_d = await res_d.json()
    return data_d
  }
  async getRentabilidad(fechadesde: string, fechahasta: string, nro: string) {
    let filter = ""
    let y = "%26%26"
    let expand = "proveedor"
    filter += ` codigo ~ '${nro}' `
    if (fechadesde != "") {
      filter += ` ${y} fechaentrega > '${fechadesde}' `
    }
    if (fechahasta != "") {
      filter += ` ${y} fechaentrega < '${fechahasta}' `
    }
    let todoshr = []
    let f_ruta = (perPage: number, page: number, skipTotal: boolean) => `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=${perPage}&page=${page}&filter=(${filter})&expand=${expand}&skipTotal=${skipTotal}&sort=-created`
    let maxpagesize = 500
    let res_hr = await fetch(f_ruta(1, 1, false), { headers: { 'Authorization': this.token } })
    let data_hr = await res_hr.json()
    let paginas = Math.floor(data_hr.totalItems / maxpagesize) + 1

    for (let pag = 1; pag <= paginas; pag++) {
      //busco las hojas de ruta
      let res = await fetch(f_ruta(maxpagesize, pag, true), { headers: { 'Authorization': this.token } })
      let data = await res.json()
      let hrs = data.items
      for (let j = 0; j < hrs.length; j++) {
        let hr = hrs[j]
        let idhr = hr.id
        let res_remito = await fetch(
          `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=1&filter=(active=true %26%26 hojaruta='${idhr}')&expand=cliente,remitente,destinatario,estado&skipTotal=true`,
          { headers: { 'Authorization': this.token } }
        )
        let data_remito = await res_remito.json()
        let remitos = data_remito.items.map(r => ({ ...r, hrcodigo: hr.codigo }))
        let costo = hr.totalproveedor
        let total = remitos.reduce((total, item) => total + item.totalViaje, 0)
        for (let z = 0; z < remitos.length; z++) {
          let r = remitos[z]
          let totalViaje = r.totalViaje
          let proporcionTotal = totalViaje / total
          let costoViaje = proporcionTotal * costo
          let beneficioViaje = totalViaje - costoViaje
          let rentabilidadViaje = costoViaje > 0 ? beneficioViaje / costoViaje : 0
          remitos[z].costoViaje = costoViaje
          remitos[z].beneficioViaje = beneficioViaje
          remitos[z].rentabilidadViaje = rentabilidadViaje
        }
        hrs[j].remitos = remitos


      }
      todoshr = todoshr.concat(hrs)
    }



    return todoshr

  }
  async editarTarifario(remitos: any[], remitosViejo: any[]) {
    for (let i = 0; i < remitos.length; i++) {
      let dataVieja = { ...remitosViejo[i] }
      let remito = remitos[i]
      let data = {
        totalViaje: remito.totalViaje,
        porcentajeCobro: remito.porcentajeCobro,
        valorDeclarado: remito.valorDeclarado,
        precioUnitario: remito.precioUnitario,
        kilos: remito.kilos,
        bultos: remito.bultos,
      }
      let idremito = remitos[i].id
      delete dataVieja.id
      await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
        method: 'POST',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify({ ...dataVieja, remito: idremito, operacion: "Cerrar HR", modifiedBy: this.responsable })
      });
      await fetch(`${environment.apiUrl}/api/collections/Remito/records/${idremito}`, {
        method: 'PATCH',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  }
  async getFacMaxId() {
    let res = await fetch(`${environment.apiUrl}/api/collections/CodigoFactura/records`, {
      headers: { 'Authorization': this.token }
    })
    let data = await res.json()
    return data.items[0]
  }
  async updateFacMaxId(maximo, id) {
    let res = await fetch(`${environment.apiUrl}/api/collections/CodigoFactura/records/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maximo })
    })

    let data = await res.json()

    return data
  }
}

