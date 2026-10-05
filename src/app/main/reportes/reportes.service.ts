import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
export enum AGRUPARPOR {
  KILOS,
  BOCAS,
  BULTOS,
  VIAJES
}

export enum SEPARARPOR {
  DIA,
  MES,
  YEAR
}


@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  token: string;

  constructor(private _httpClient: HttpClient) {
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;
  }
  estadoPendiente() {
    return "0kxg8jr071yozsk"
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ": " + error); // log to console instead
      return of(result as T);
    };
  }
  //La fecha egreso no puede ser vacia
  async reporteProveedores(
    proveedor: string,
    fechaingresodesde: string,
    fechaingresohasta: string,
    estado: string,
    fechaentregadesde: string,
    fechaentregahasta: string,
    localidad: string,
    provincia: string) {
    let todosremitos = []
    let filter = `active = true %26%26 proveedor !='' %26%26 fechaEntrega != '' `
    filter += ` %26%26 proveedor.nombre ~ '${proveedor}'`
    filter += ` %26%26 fechaIngreso < '${fechaingresohasta}' %26%26 fechaIngreso > '${fechaingresodesde}'  `
    filter += ` %26%26 fechaEntrega < '${fechaentregahasta}' %26%26 fechaEntrega > '${fechaentregadesde}'  `
    filter += ` %26%26 estado ~ '${estado}' %26%26 destinatario.localidad.id ~ '${localidad}'  %26%26 destinatario.localidad.provincia ~ '${provincia}'`

    //filter += ` %26%26 estado ~ '${estado}' %26%26 localidad ~ '${localidad}' `
    let res_r = await fetch(`${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&expand=proveedor,destinatario,destinatario.localidad&filter=(${filter})`, { headers: { 'Authorization': this.token } })

    let data_p = await res_r.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {

      let res = await fetch(`${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=${pag}&expand=proveedor,destinatario,destinatario.localidad&filter=(${filter})&skipTotal=true`, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      todosremitos = todosremitos.concat(data.items)
    }
    //todosremitos.sort((r1,r2)=>new Date(r1.fechaEntrega) < new Date(r2.fechaEntrega) ? -1:1)
    return todosremitos
  }
  async reporteClientes(cliente: string, fechaingresodesde: string, fechaingresohasta: string, fechaentregadesde: string, fechaentregahasta: string, estado: string, localidad: string, provincia: string) {
    let todosremitos = []
    let filter = `active = true %26%26 proveedor !='' %26%26 fechaEntrega != '' `
    filter += ` %26%26 cliente.nombre ~ '${cliente}'`
    filter += ` %26%26 fechaIngreso < '${fechaingresohasta}' %26%26 fechaIngreso >= '${fechaingresodesde}'  `
    filter += ` %26%26 fechaEntrega < '${fechaentregahasta}' %26%26 fechaEntrega >= '${fechaentregadesde}'  `
    filter += ` %26%26 estado ~ '${estado}' %26%26 destinatario.localidad.id ~ '${localidad}'  %26%26 destinatario.localidad.provincia ~ '${provincia}'`
    //let res_r = await fetch(`${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&filter=(cliente ~ '${cliente}' %26%26 estado ~ '${estado}' %26%26 fechaIngreso < '${fechaingresohasta}' %26%26 fechaIngreso > '${fechaingresodesde}')`)
    let res_r = await fetch(`${environment.apiUrl}/api/collections/Remito/records?perPage=1&expand=cliente,destinatario,destinatario.localidad&page=1&filter=(${filter})`, { headers: { 'Authorization': this.token } })
    let data_p = await res_r.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      //let res = await fetch(`${environment.apiUrl}0/api/collections/Remito/records?perPage=200&page=${pag}&filter=(cliente ~ '${cliente}' %26%26 estado ~ '${estado}' %26%26 fechaIngreso < '${fechaingresohasta}' %26%26 fechaIngreso > '${fechaingresodesde}')`)
      let res = await fetch(`${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=${pag}&expand=cliente,destinatario,destinatario.localidad&filter=(${filter})&skipTotal=true`, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      todosremitos = todosremitos.concat(data.items)
    }
    //todosremitos.sort((r1,r2)=>new Date(r1.fechaEntrega) < new Date(r2.fechaEntrega) ? -1:1)
    let reporte = todosremitos
    return reporte
  }
  //Este sirve para saber el total pero
  async reporteRemitos(
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
    zona: string,
    conPendiente = false
  ) {

    let todosremitos = []
    let y = "%26%26"
    let filter = "active = true"
    let esPendiente = estado === "0kxg8jr071yozsk" || conPendiente
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
    //Zona
    if (zona != "") {
      filter += ` ${y} destinatario.zona = '${zona}'`
    }
    //Estados
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
      if (facturar) {
        filter += `${y} facturar = true`
      }
      else {
        filter += `${y} facturar = false`
      }
    }
    let maxpagesize = 500
    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&filter=(${filter})&expand=${expand}`
    //let rutacompleta =`${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&filter=(estado~'${estado}')`
    let res_r = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_r = await res_r.json()
    let paginas = Math.floor(data_r.totalItems / maxpagesize) + 1
    let totalItems = data_r.totalItems
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/Remito/records?perPage=${maxpagesize}&page=${pag}&filter=(${filter})&expand=${expand}&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      todosremitos = todosremitos.concat(data.items)
    }
    todosremitos.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
    let reporte = todosremitos.map(item => ({ ...item, numerorto: `${item.nroRemito}${item.reubicado ? "*" : ""}` }))
    //let reporte = todosremitos
    return { items: reporte, totalItems }
  }
  async reporteRemitosConPendiente(
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
    zona: string,
    conPendiente:boolean
  ) {

    let todosremitos = []
    let y = "%26%26"
    let filter = "active = true"
    let esPendiente = estado === "0kxg8jr071yozsk" || conPendiente
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
    //Zona
    if (zona != "") {
      filter += ` ${y} destinatario.zona = '${zona}'`
    }
    //Estados
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
      if (facturar) {
        filter += `${y} facturar = true`
      }
      else {
        filter += `${y} facturar = false`
      }
    }
    let maxpagesize = 500
    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&filter=(${filter})&expand=${expand}`
    //let rutacompleta =`${environment.apiUrl}/api/collections/Remito/records?perPage=1&page=1&filter=(estado~'${estado}')`
    let res_r = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_r = await res_r.json()
    let paginas = Math.floor(data_r.totalItems / maxpagesize) + 1
    let totalItems = data_r.totalItems
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/Remito/records?perPage=${maxpagesize}&page=${pag}&filter=(${filter})&expand=${expand}&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      todosremitos = todosremitos.concat(data.items)
    }
    todosremitos.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
    let reporte = todosremitos.map(item => ({ ...item, numerorto: `${item.nroRemito}${item.reubicado ? "*" : ""}` }))
    //let reporte = todosremitos
    return { items: reporte, totalItems }
  }
  //Aca tiene que estar incluido lo de pendiente
  getReporteRemitoPaginacion(
    perPage: number, page: number, skipTotal: boolean,
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
    zona: string,
    conPendiente: boolean
  ) {

    let y = "%26%26"
    let filter = "active = true"
    let esPendiente = estado === "0kxg8jr071yozsk" || conPendiente
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
    //Zona
    if (zona != "") {
      filter += ` ${y} destinatario.zona = '${zona}'`
    }
    //Estados
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
      if (facturar) {
        filter += `${y} facturar = true`
      }
      else {
        filter += `${y} facturar = false`
      }
    }
    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=${perPage}&page=${page + 1}&filter=(${filter})&expand=${expand}&skipTotal=${skipTotal}&sort=-fechaIngreso`

    return this._httpClient.get<any>(`${rutacompleta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitos", []))
    )
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
  async getTodosTarifaProveedor(proveedor: string, fechadesde: string, fechahasta: string) {
    let tarifario = []
    let filterfecha = `((fechadesde < '${fechadesde}' %26%26 fechahasta > '${fechadesde}' ) || (fechadesde < '${fechahasta}' %26%26 fechahasta > '${fechahasta}'  ))`
    let res_t = await fetch(`${environment.apiUrl}/api/collections/tarifarioproveedor/records?perPage=${1}&page=${1}&filter=(active=true %26%26 proveedor.nombre ~ '${proveedor}' %26%26 ${filterfecha})&expand=proveedor,unidad`, {
      headers: { 'Authorization': this.token }
    })

    let data_t = await res_t.json()
    let paginas = Math.floor(data_t.totalItems / 200) + 1

    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/tarifarioproveedor/records?perPage=${200}&page=${pag}&filter=(active=true %26%26 proveedor.nombre ~ '${proveedor}' %26%26 ${filterfecha})&expand=proveedor,unidad&sort=proveedor.nombre,-fechadesde`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      tarifario = tarifario.concat(data.items)
    }
    return tarifario
  }

}
