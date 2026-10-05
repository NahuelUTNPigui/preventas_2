import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

import { ClienteData } from './model/cliente-model';

@Injectable()
export class ClienteService implements Resolve<any> {
  rows: any;
  onClienteChanged: BehaviorSubject<any>;
  token: string = ''
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;

    this.onClienteChanged = new BehaviorSubject({});
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ": " + error); // log to console instead
      return of(result as T);
    };
  }
  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getDataTableRows()]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Get rows
   */
  getDataTableRows(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this._httpClient.get(`${environment.apiUrl}/api/collections/Cliente/records`).subscribe((response: any) => {
        this.rows = response;
        this.onClienteChanged.next(this.rows);
        resolve(this.rows);
      }, reject);
    });
  }

  getClientes(perPage: number, page: number, filtro: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Cliente/records?expand=formaPago&page=${page}&perPage=${perPage}&sort=nombre&filter=((nombre~'${filtro}' %7C%7C cuit~'${filtro}' %7C%7C razonSocial~'${filtro}' %7C%7C observacion~'${filtro}' ) %26%26 active=true) & sort=-nombre`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get clientes", []))
    )
  }
  async getClientesSkipTotal(buscar: string) {
    let clientes = []
    let urlfuncion = (page, perPage, skipTotal) => `${environment.apiUrl}/api/collections/Cliente/records?page=${page}&perPage=${perPage}&filter=((nombre~'${buscar}' %7C%7C cuit~'${buscar}' %7C%7C razonSocial~'${buscar}' %7C%7C observacion~'${buscar}' ) %26%26 active=true) & sort=-nombre ${skipTotal ? "&skipTotal=true" : ""}`
    const urlc = urlfuncion(1, 1, false)

    let res_c = await fetch(urlc, {
      headers: { 'Authorization': this.token }
    })
    let pageSize = 500
    let data_c = await res_c.json()
    let paginas = Math.floor(data_c.totalItems / pageSize) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let url = urlfuncion(pag, pageSize, true)

      let res = await fetch(url, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      clientes = clientes.concat(data.items)
    }
    clientes.sort((c1, c2) => c1.nombre.toLowerCase() < c2.nombre.toLowerCase() ? -1 : 1)
    return clientes
  }
  getCliente(id: string) {
    const url = `${environment.apiUrl}/api/collections/Cliente/records/${id}?expand=formaPago`;
    return this._httpClient.get<ClienteData>(url, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<ClienteData>("", null))
    );
  }
  postCliente(nombre: string, cuit: string, razonSocial: string, observacion: string, formaPago: string, responsableinscripto: boolean, operador: string) {
    return this._httpClient
      .post(`${environment.apiUrl}/api/collections/Cliente/records`,
        { nombre, cuit, razonSocial, observacion, formaPago, active: true, responsableinscripto, operador },
        { headers: { 'Authorization': this.token } }
      )
  }


  putCliente(id: string, nombre: string, cuit: string, razonSocial: string, observacion: string, formaPago: string, responsableinscripto: boolean, operador: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Cliente/records/${id}`,
        { nombre, cuit, razonSocial, observacion, formaPago, responsableinscripto, operador },
        { headers: { 'Authorization': this.token } }
      )
  }

  deleteCliente(id: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Cliente/records/${id}`,
        { active: false },
        { headers: { 'Authorization': this.token } }
      )
  }
  getDestinatariosCliente(page: number, perPage: number, idCliente: string, nombreDestinatario: string) {
    return this._httpClient
      .get<any>(`${environment.apiUrl}/api/collections/DestinatarioXCliente/records?page=${page}&perPage=${perPage}&filter=(destinatario!=''%26%26cliente = '${idCliente}' %26%26 destinatario.nombre ~ '${nombreDestinatario}')&expand=destinatario&sort=destinatario.nombre`, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("conseguir destinatarios de un cliente", null))
      );
  }
  getRemitentesCliente(page: number, perPage: number, idCliente: string, nombreRemitente: string) {
    return this._httpClient
      //.get<any>(`${environment.apiUrl}/api/collections/RemitenteXCliente/records?page=${page}&perPage=${perPage}&filter=(cliente = '${idCliente}' %26%26 remitente.nombre ~ '${nombreRemitente}' %26%26) & sort=-remitente.nombre &expand=cliente,remitente`,{ headers: { 'Authorization': this.token } })
      .get<any>(`${environment.apiUrl}/api/collections/RemitenteXCliente/records?expand=remitente&page=${page}&perPage=${perPage}&filter=(cliente = '${idCliente}' %26%26 remitente!='' )`, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("conseguir remitentes de un cliente", null))
      );
  }
  async delDestinatarioFromCliente(id: string) {
    let borrar = await fetch(`${environment.apiUrl}/api/collections/DestinatarioXCliente/records/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': this.token }
    })
  }
  async delRemitenteFromCliente(id: string) {
    let borrar = await fetch(`${environment.apiUrl}/api/collections/RemitenteXCliente/records/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': this.token }
    })
    return borrar
  }
  async addNuevoClienteDestinatarios(destinatarios: string[], cliente: string) {
    for (let i = 0; i < destinatarios.length; i++) {
      let destinatario = destinatarios[i]
      let detxcli = {
        destinatario, cliente
      }
      let res_r = await fetch(
        `${environment.apiUrl}/api/collections/DestinatarioXCliente/records`, {
          method: 'POST',
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detxcli)
        }
      )
    }
  }
  addClienteDestinatario(destinatario: string, cliente: string) {
    let detxcli = {
      destinatario, cliente
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/DestinatarioXCliente/records`, detxcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("add cliente a un destinatario", []))
      )
  }
  addClienteRemitente(remitente: string, cliente: string) {
    let remxcli = {
      remitente, cliente
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/RemitenteXCliente/records`, remxcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("add cliente a un remitente", []))
      )
  }
  async addRemitente(nombre: string, observacion: string, cliente: string) {
    let remitente = { nombre, observacion, active: true }
    let res_r = await fetch(
      `${environment.apiUrl}/api/collections/Remitente/records`, {
      method: 'POST',
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(remitente)
    }
    )
    let data_r = await res_r.json()
    let remxcliente = {
      remitente: data_r.id,
      cliente
    }
    let res_rxc = await fetch(
      `${environment.apiUrl}/api/collections/RemitenteXCliente/records`, {
      method: 'POST',
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(remxcliente)
    }
    )
    let data_rxc = await res_rxc.json()
    return data_rxc
  }
  async addDestinatario(nombre: string, localidad: string, direccion: string, horarios: string, observacion: string, cliente, zona: string) {
    let dest = {
      nombre, localidad, direccion, horarios, observacion, active: true, zona
    }
    let res_d = await fetch(
      `${environment.apiUrl}/api/collections/Destinatario/records`, {
      method: 'POST',
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(dest)
    }
    )
    let data_d = await res_d.json()

    let destxcliente = {
      destinatario: data_d.id, cliente
    }
    let res_dxc = await fetch(
      `${environment.apiUrl}/api/collections/DestinatarioXCliente/records`, {
      method: 'POST',
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(destxcliente)
    }
    )
    let data_dxc = await res_dxc.json()
    return data_dxc
  }
  async todosDestinatarios(cliente: string, filtro: string) {
    let destinatarios = []
    let res_d = await fetch(
      `${environment.apiUrl}/api/collections/Destinatario/records?filter=( active = true %26%26 nombre ~'${filtro}')&page=1&perPage=1`,
      { headers: { 'Authorization': this.token } }
    )
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(
        `${environment.apiUrl}/api/collections/Destinatario/records?filter=( active = true %26%26 nombre ~'${filtro}')&page=${pag}&perPage=${200}&skipTotal = true`,
        { headers: { 'Authorization': this.token } }
      )
      let data = await res.json()
      for (let i = 0; i < data.items.length; i++) {
        let d = data.items[i]
        let res_dxc = await fetch(
          `${environment.apiUrl}/api/collections/DestinatarioXCliente/records?filter=( cliente = '${cliente}' %26%26 destinatario = '${d.id}')&page=1&perPage=1`,
          { headers: { 'Authorization': this.token } }
        )
        let data_dxc = await res_dxc.json()
        if (data_dxc.items.length == 0) {
          destinatarios.push(d)
        }
      }
    }

    destinatarios.sort((p1, p2) => p1.nombre.toLowerCase() < p2.nombre.toLowerCase() ? -1 : 1)
    return destinatarios
  }
  async todosRemitentesNoCliente(cliente: string, filtro: string) {
    let remitentes = []
    let res_r = await fetch(
      `${environment.apiUrl}/api/collections/Remitente/records?filter=( active = true %26%26 nombre ~'${filtro}')&page=1&perPage=1`,
      { headers: { 'Authorization': this.token } }
    )
    let data_r = await res_r.json()
    let paginas = Math.floor(data_r.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(
        `${environment.apiUrl}/api/collections/Remitente/records?filter=( active = true %26%26 nombre ~'${filtro}')&page=${pag}&perPage=${200}&skipTotal = true`,
        { headers: { 'Authorization': this.token } }
      )
      let data = await res.json()
      for (let i = 0; i < data.items.length; i++) {
        let r = data.items[i]
        let res_rxc = await fetch(
          `${environment.apiUrl}/api/collections/RemitenteXCliente/records?filter=( cliente = '${cliente}' %26%26 remitente = '${r.id}')&page=1&perPage=1`,
          { headers: { 'Authorization': this.token } }
        )
        let data_rxc = await res_rxc.json()
        if (data_rxc.items.length == 0) {
          remitentes.push(r)
        }
      }
    }

    remitentes.sort((p1, p2) => p1.nombre.toLowerCase() < p2.nombre.toLowerCase() ? -1 : 1)
    return remitentes
  }
  async todosRemitentes() {
    let remitentes = []
    let res_d = await fetch(environment.apiUrl + "/api/collections/Remitente/records?filter=(active=true )&page=1&perPage=1", { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(environment.apiUrl + "/api/collections/Remitente/records?filter=(active=true )&page=" + pag + '&perPage=200&skipTotal=true', { headers: { 'Authorization': this.token } })
      let data = await res.json()
      remitentes = remitentes.concat(data.items)

    }
    remitentes.sort((p1, p2) => p1.nombre.toLowerCase() < p2.nombre.toLowerCase() ? -1 : 1)
    return remitentes
  }

  async getTarifarioClienteProgramado(cliente: string) {
    let tarifario = []
    let res_d = await fetch(environment.apiUrl + "/api/collections/tarifariocliente/records?filter=(active=true %26%26  programado=true %26%26 cliente = '" + cliente + "' )&page=1&perPage=1", { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(environment.apiUrl + "/api/collections/tarifariocliente/records?filter=(active=true %26%26 programado=true %26%26 cliente = '" + cliente + "' )&page=" + pag + '&perPage=200&expand=cliente,unidad&skipTotal=true', { headers: { 'Authorization': this.token } })
      let data = await res.json()
      tarifario = tarifario.concat(data.items)
    }
    tarifario.sort((p1, p2) => p1.fechadesde.toLowerCase() > p2.fechadesde.toLowerCase() ? -1 : 1)
    return tarifario
  }
  async getTarifarioCliente(cliente: string) {
    let tarifario = []
    let res_d = await fetch(environment.apiUrl + "/api/collections/tarifariocliente/records?filter=(active=true  %26%26 programado=false %26%26 cliente = '" + cliente + "' )&page=1&perPage=1", { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(environment.apiUrl + "/api/collections/tarifariocliente/records?filter=(active=true %26%26 programado=false %26%26 cliente = '" + cliente + "' )&page=" + pag + '&perPage=200&expand=cliente,unidad&skipTotal=true', { headers: { 'Authorization': this.token } })
      let data = await res.json()
      tarifario = tarifario.concat(data.items)
    }
    tarifario.sort((p1, p2) => p1.fechadesde.toLowerCase() > p2.fechadesde.toLowerCase() ? -1 : 1)
    return tarifario
  }
  async getTarifarioClienteVigente(cliente) {
    let tarifariocompleto = await this.getTarifarioCliente(cliente)
    let tarifario = []
    let tarifariomap = {}
    for (let i = 0; i < tarifariocompleto.length; i++) {
      let fila = tarifariocompleto[i]
      if (tarifariomap[fila.expand.unidad.nombre]) {
        if (!tarifariomap[fila.expand.unidad.nombre][fila.descripcion]) {
          tarifario.push(fila)
          tarifariomap[fila.expand.unidad.nombre][fila.descripcion] = { fila }
        }
      }
      else {
        tarifariomap[fila.expand.unidad.nombre] = {}
        tarifariomap[fila.expand.unidad.nombre][fila.descripcion] = {
          fila
        }
        tarifario.push(fila)
      }
    }
    return tarifario
  }
  delTarifario(tarifario: string) {
    let tarcli = {
      active: false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records/${tarifario}`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod tarifario cliente", []))
      )
  }
  ocultarTarifario(tarifario: string) {
    let tarcli = {
      oculto: true
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records/${tarifario}`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod tarifario cliente", []))
      )
  }
  desocultarTarifario(tarifario: string) {
    let tarcli = {
      oculto: false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records/${tarifario}`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod tarifario cliente", []))
      )
  }
  addTarifario(precio: number, descripcion: string, cliente: string, unidad: string, fechadesde: String, fechahasta: string) {
    let tarcli = {
      cliente, precio, descripcion, fechadesde: fechadesde + ' 03:00:00.000Z', fechahasta: fechahasta + ' 03:00:00.000Z', unidad, active: true
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("add tarifario cliente", []))
      )
  }
  programarTarifario(precio: number, descripcion: string, cliente: string, unidad: string, fechadesde: String, fechahasta: string) {
    let tarcli = {
      cliente, precio, descripcion, fechadesde: fechadesde + ' 03:00:00.000Z', fechahasta: fechahasta + ' 03:00:00.000Z', unidad, active: true, programado: true
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("programar tarifario cliente", []))
      )
  }
  modTarifario(id: string, precio: number, descripcion: string, cliente: string, unidad: string, fechadesde: String, fechahasta: string) {
    let tarcli = {
      cliente, precio, descripcion, fechadesde: fechadesde + ' 03:00:00.000Z', fechahasta: fechahasta + ' 03:00:00.000Z', unidad
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records/${id}`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod tarifario cliente", []))
      )
  }
  getTarifario(id: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records/${id}?expand=cliente,unidad`, { headers: { 'Authorization': this.token } }
    ).pipe(
      catchError(this.handleError<any>("get tarifario cliente id", []))
    )
  }
  setVigenteTarifario(id) {
    let tarcli = {
      programado: false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records/${id}`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("poner vigente tarifario cliente", []))
      )
  }
  async setVigenteTarifarioLista(lista: any[]) {
    let tarcli = {
      programado: false
    }

    let res: any[] = []
    for (let i = 0; i < lista.length; i++) {
      let id = lista[i]
      let res_pro = await fetch(
        `${environment.apiUrl}/api/collections/tarifariocliente/records/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", 'Authorization': this.token },
          body: JSON.stringify(tarcli)
        }
      )
      res.push(res_pro)
    }
    return res

  }
  async getAsientosFullList(cliente:string,fechadesde:string,fechahasta:string){
    let filter = `(cliente~'${cliente}'`
    if(fechadesde.length>0){
      filter += ` %26%26 fecha>'${fechadesde}'`
    }
    if(fechahasta.length>0){
      filter += ` %26%26 fecha<'${fechahasta}'`
    }
    filter += ")"
    let asientos = []
    let res_as = await fetch(`${environment.apiUrl}/api/collections/Asiento/records?sort=-created&filter=${filter}`, {
      headers: { 'Authorization': this.token }
    })
    let data_as = await res_as.json()
    let paginas = Math.floor(data_as.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Asiento/records?sort=-created&perPage=200&page=${pag}&skipTotal=true&filter=${filter}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      asientos = asientos.concat(data.items)

    }
    return asientos
  }
}

