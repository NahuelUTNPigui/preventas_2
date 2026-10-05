import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChequesService {
  token: string = ''

  constructor(private _httpClient: HttpClient) {
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ": " + error); // log to console instead
      return of(result as T);
    };
  }
  //tipo cheques
  getTipos() {
    return [
      { id: 1, nombre: "Fisico" },
      { id: 2, nombre: "Electronico" }
    ]
  }
  //Bancos
  getBancos(perPage: number, page: number, nombre: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Banco/records?page=${page}&perPage=${perPage}&filter=(active=true %26%26  nombre ~ '${nombre}' )&sort=nombre`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get bancos nombre", []))
    )
  }
  async getAllBancos() {
    let bancos = []
    let url_b = `${environment.apiUrl}/api/collections/Banco/records?filter=(active=True)`
    let res_b = await fetch(url_b, {
      headers: { 'Authorization': this.token }
    })
    let data_b = await res_b.json()
    let paginas = Math.floor(data_b.totalItems / 200) + 1

    for (let pag = 1; pag <= paginas; pag++) {
      let url = `${environment.apiUrl}/api/collections/Banco/records?filter=(active=True)&perPage=200&page=${pag}&skipTotal=true`
      let res = await fetch(url, {
        headers: { 'Authorization': this.token }
      })

      let data = await res.json()

      bancos = bancos.concat(data.items)
    }
    return bancos
  }
  deleteBanco(id) {
    let banco = { active: false }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/Banco/records/${id}`, banco, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("eliminar banco", []))
      )
  }
  addBanco(nombre) {
    let banco = {
      nombre,
      active: true
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/Banco/records`, banco, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("add banco", []))
      )
  }
  modBanco(nombre, id) {
    let banco = { nombre }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/Banco/records/${id}`, banco, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod banco", []))
      )
  }
  //Cheques
  addCheque(nro, fechaIngreso, fechaAcreditacion, fechaEntrega, banco, razonSocial, cuit, cliente, proveedor, tipo, importe, unidad) {
    let data = {
      nro,
      banco,
      razonSocial,
      cuit,
      cliente,
      tipo,
      importe,
      fechaIngreso: fechaIngreso + " 03:00:00",
      fechaAcreditacion: fechaAcreditacion + " 03:00:00",
      fechaEntrega: "",
      active: true,
      propio: false,
      unidad,
      proveedor
    }
    if (fechaEntrega != "") {
      data.fechaEntrega = fechaEntrega + " 03:00:00"
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/Cheque/records`, data, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("add cheque", []))
      )
  }
  modCheque(id, nro, fechaIngreso, fechaAcreditacion, fechaEntrega, banco, razonSocial, cuit, cliente, proveedor, tipo, importe, unidad) {
    let data = {
      nro,
      banco,
      razonSocial,
      cuit,
      cliente,
      tipo,
      importe,
      fechaIngreso: fechaIngreso + " 03:00:00",
      fechaAcreditacion: fechaAcreditacion + " 03:00:00",
      fechaEntrega: "", unidad, proveedor
    }
    if (fechaEntrega != "") {
      data.fechaEntrega = fechaEntrega + " 03:00:00"
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/Cheque/records/${id}`, data, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod cheque", []))
      )
  }
  delCheque(id) {
    let data = {
      active: false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/Cheque/records/${id}`, data, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("del cheque", []))
      )
  }
  async crearAsientoAddCheque(cheque) {
    let datasiento = {
      fecha: cheque.fechaIngreso,
      monto: -cheque.importe,
      factura: "",
      cobro: "",
      orden: "",
      pago: "",
      nota: "",
      cheque: cheque.id,
      transferencia: "",
      flujo: "",
      tipo: "cheque",
      unidad: cheque.unidad,
      cliente: cheque.cliente,
      proveedor: "",
      razon: "",
      descripcion: "Crear cheque: " + cheque.nro
    }
    try {
      // busco cliente y sald
      let res_cliente = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${cheque.cliente}`, { headers: { 'Authorization': this.token } })
      let datacliente = await res_cliente.json()
      // actualizo saldo
      let datasaldo = {
        saldo: datacliente.saldo - cheque.importe
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${cheque.cliente}`, {
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
  async crearAsientoDelCheque(cheque) {
    let datasiento = {
      fecha: cheque.fechaIngreso,
      monto: cheque.importe,
      factura: "",
      cobro: "",
      orden: "",
      pago: "",
      nota: "",
      cheque: cheque.id,
      transferencia: "",
      flujo: "",
      tipo: "cheque",
      unidad: cheque.unidad,
      cliente: cheque.cliente,
      proveedor: "",
      razon: "",
      descripcion: "Eliminar cheque: " + cheque.nro
    }
    try {
      // busco cliente y sald
      let res_cliente = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${cheque.cliente}`, { headers: { 'Authorization': this.token } })
      let datacliente = await res_cliente.json()
      // actualizo saldo
      let datasaldo = {
        saldo: datacliente.saldo + cheque.importe
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Cliente/records/${cheque.cliente}`, {
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
  getChequeId(id) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Cheque/records/${id}?expand=localidad`, { headers: { 'Authorization': this.token } }
    ).pipe(
      catchError(this.handleError<any>("get chequq id", []))
    )
  }
  getCheques(
    page,
    perPage,
    nro,
    fechaIngresoDesde,
    fechaIngresoHasta,
    fechaAcreditacionDesde,
    fechaAcreditacionHasta,
    conFechaAcreditacion,
    fechaEntregaDesde,
    fechaEntregaHasta,
    conFechaEntrega,
    banco,
    razonSocial,
    cuit,
    cliente,
    proveedor,
    tipo,
    unidad,
    sinProveedor = false
  ) {
    let y = "%26%26"
    let filter = "active = true "
    let expand = "cliente,banco,proveedor"

    filter += ` ${y} nro ~ '${nro}'`
    if (tipo != 0) {
      filter += ` ${y} tipo = ${tipo}`
    }
    if (cliente != '') {
      filter += ` ${y} cliente ~ '${cliente}'`
    }
    if (proveedor != '') {
      filter += ` ${y} proveedor ~ '${proveedor}'`
    }
    else if (sinProveedor) {
      filter += ` ${y} proveedor = ''`
    }
    if (banco != '') {
      filter += ` ${y} banco ~ '${banco}'`
    }
    if (unidad != '') {
      filter += ` ${y} unidad ~ '${unidad}'`
    }
    filter += ` ${y} razonSocial ~ '${razonSocial}'`
    filter += ` ${y} cuit ~ '${cuit}'`
    if (fechaIngresoDesde != "") {
      filter += ` ${y} fechaIngreso >= '${fechaIngresoDesde}'`
    }
    if (fechaIngresoHasta != "") {
      filter += ` ${y} fechaIngreso <= '${fechaIngresoHasta}'`
    }
    if (conFechaEntrega) {
      if (fechaEntregaDesde != "") {
        filter += ` ${y} fechaEntrega >= '${fechaEntregaDesde}'`
      }
      if (fechaEntregaHasta != "") {
        filter += ` ${y} fechaEntrega <= '${fechaEntregaHasta}'`
      }
    }
    if (conFechaAcreditacion) {
      if (fechaAcreditacionDesde != "") {
        filter += ` ${y} fechaEntrega >= '${fechaAcreditacionDesde}'`
      }
      if (fechaAcreditacionHasta != "") {
        filter += ` ${y} fechaEntrega <= '${fechaAcreditacionHasta}'`
      }

    }
    let ruta = `${environment.apiUrl}/api/collections/Cheque/records?sort=-created&expand=${expand}&page=${page}&perPage=${perPage}&filter=${filter}`
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get cheques", []))
    )


  }
  async getAllCheques(
    nro,
    fechaIngresoDesde,
    fechaIngresoHasta,
    fechaAcreditacionDesde,
    fechaAcreditacionHasta,
    conFechaAcreditacion,
    fechaEntregaDesde,
    fechaEntregaHasta,
    conFechaEntrega,
    banco,
    razonSocial,
    cuit,
    cliente,
    tipo,
    unidad
  ) {
    let y = "%26%26"
    let filter = "active = true "
    let expand = "cliente,banco"
    filter += ` ${y} nro ~ '${nro}'`
    if (tipo != 0) {
      filter += ` ${y} tipo = ${tipo}`
    }
    if (cliente != '') {
      filter += ` ${y} cliente ~ '${cliente}'`
    }
    if (banco != '') {
      filter += ` ${y} banco ~ '${banco}'`
    }
    if (unidad != '') {
      filter += ` ${y} unidad ~ '${unidad}'`
    }
    filter += ` ${y} razonSocial ~ '${razonSocial}'`
    filter += ` ${y} cuit ~ '${cuit}'`
    if (fechaIngresoDesde != "") {
      filter += ` ${y} fechaIngreso >= '${fechaIngresoDesde}'`
    }
    if (fechaIngresoHasta != "") {
      filter += ` ${y} fechaIngreso <= '${fechaIngresoHasta}'`
    }
    if (conFechaEntrega) {
      if (fechaEntregaDesde != "") {
        filter += ` ${y} fechaEntrega >= '${fechaEntregaDesde}'`
      }
      if (fechaEntregaHasta != "") {
        filter += ` ${y} fechaEntrega <= '${fechaEntregaHasta}'`
      }
    }
    if (conFechaAcreditacion) {
      if (fechaAcreditacionDesde != "") {
        filter += ` ${y} fechaEntrega >= '${fechaAcreditacionDesde}'`
      }
      if (fechaAcreditacionHasta != "") {
        filter += ` ${y} fechaEntrega <= '${fechaAcreditacionHasta}'`
      }

    }
    let cheques = []
    let ruta_c = `${environment.apiUrl}/api/collections/Cheque/records?sort=-created&expand=${expand}&page=${1}&perPage=${1}&filter=${filter}`
    let res_c = await fetch(ruta_c, {
      headers: { 'Authorization': this.token }
    })
    let data_c = await res_c.json()

    let paginas = Math.floor(data_c.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Cheque/records?sort=-created&expand=${expand}&page=${pag}&perPage=${200}&filter=${filter}&skipTotal=true`
      let res = await fetch(ruta, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()

      cheques = cheques.concat(data.items)
    }
    return cheques
  }
  async existeCheque(numero) {
    let cheques = []
    let y = "%26%26"
    let filter = "active = true "
    let expand = "cliente,banco"
    filter += ` ${y} nro = '${numero}'`
    let ruta_c = `${environment.apiUrl}/api/collections/Cheque/records?sort=-created&page=${1}&perPage=${1}&filter=${filter}`
    let res_c = await fetch(ruta_c, {
      headers: { 'Authorization': this.token }
    })
    let data_c = await res_c.json()
    if (data_c.totalItems > 0) {
      return true
    }
    else {
      return false
    }
  }

}

