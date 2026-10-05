import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DestinatarioService {
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
  //Destinatarios
  getDestinatarioPaginacion(perPage: number, page: number, nombre: string, direccion) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Destinatario/records?expand=localidad&page=${page}&perPage=${perPage}&filter=(active=true %26%26  nombre ~ '${nombre}'  %26%26 direccion ~'${direccion}')&sort=nombre`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get destinatarios nombre", []))
    )
  }
  getDestinatarioID(id: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Destinatario/records/${id}?expand=localidad`, { headers: { 'Authorization': this.token } }
    ).pipe(
      catchError(this.handleError<any>("get destinatario id", []))
    )
  }
  addDestinatario(nombre: string, observacion: string, horarios: string, direccion: string, localidad: string, zona: string, ubicacion: string, importancia: number) {
    let destinatario = {
      nombre, observacion, horarios, direccion, localidad, active: true, zona, ubicacion, importancia
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/Destinatario/records`, destinatario, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("add destinatario", []))
      )
  }
  modDestinatario(nombre: string, observacion: string, horarios: string, direccion: string, id: string, localidad: string, zona: string, ubicacion: string, importancia: number) {
    let destinatario = {
      nombre, observacion, horarios, direccion, localidad, zona, ubicacion, importancia
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/Destinatario/records/${id}`, destinatario, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod destinatario", []))
      )
  }
  delDestinatario(id: string) {
    let destinatario = {
      active: false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/Destinatario/records/${id}`, destinatario, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("eliminar destinatario", []))
      )
  }
  // Clientes de un destinatario
  getClientesDestinatario(page: number, perPage: number, id: string, nombre: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/DestinatarioXCliente/records?page=${page}&perPage=${perPage}&filter=(destinatario = '${id}' %26%26 cliente.nombre ~ '${nombre}')&expand=cliente&sort=cliente.nombre`, {
      headers: { 'Authorization': this.token }
    })
      .pipe(
        catchError(this.handleError<any>("get clientes de un destinatarios", []))
      )
  }
  async delClienteFromDestinatario(id: string) {

    let borrar = await fetch(`${environment.apiUrl}/api/collections/DestinatarioXCliente/records/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': this.token }
    })

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
  async todosClientes() {
    let clientes = []
    let res_c = await fetch(environment.apiUrl + '/api/collections/Cliente/records?filter=(active=true)&page=1&perPage=1', { headers: { 'Authorization': this.token } })
    let data_c = await res_c.json()
    let paginas = Math.floor(data_c.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(environment.apiUrl + '/api/collections/Cliente/records?filter=(active=true)&page=' + pag + '&perPage=200', { headers: { 'Authorization': this.token } })
      let data = await res.json()
      clientes = clientes.concat(data.items)

    }
    clientes.sort((p1, p2) => p1.nombre.toLowerCase() < p2.nombre.toLowerCase() ? -1 : 1)
    return clientes
  }
  async todosClientesDestinatario(destinatario: string, filtro: string) {
    let clientes = []
    let res_c = await fetch(
      `${environment.apiUrl}/api/collections/Cliente/records?filter=( active = true %26%26 nombre ~'${filtro}')&page=1&perPage=1`,
      { headers: { 'Authorization': this.token } }
    )
    let data_c = await res_c.json()
    let paginas = Math.floor(data_c.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(
        `${environment.apiUrl}/api/collections/Cliente/records?filter=( active = true %26%26 nombre ~'${filtro}')&page=${pag}&perPage=${200}&skipTotal = true`,
        { headers: { 'Authorization': this.token } }
      )
      let data = await res.json()
      for (let i = 0; i < data.items.length; i++) {
        let c = data.items[i]
        let res_dxc = await fetch(
          `${environment.apiUrl}/api/collections/DestinatarioXCliente/records?filter=( cliente = '${c.id}' %26%26 destinatario = '${destinatario}')&page=1&perPage=1`,
          { headers: { 'Authorization': this.token } }
        )
        let data_dxc = await res_dxc.json()
        if (data_dxc.items.length == 0) {
          clientes.push(c)
        }
      }
    }
    clientes.sort((p1, p2) => p1.nombre.toLowerCase() < p2.nombre.toLowerCase() ? -1 : 1)
    return clientes
  }
  async ponerTodosClientes(destinatario: string) {

    let res_c = await fetch(
      `${environment.apiUrl}/api/collections/Cliente/records?filter=( active = true)&page=1&perPage=1`,
      { headers: { 'Authorization': this.token } }
    )
    let data_c = await res_c.json()
    let paginas = Math.floor(data_c.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(
        `${environment.apiUrl}/api/collections/Cliente/records?filter=( active = true)&page=${pag}&perPage=${200}&skipTotal = true`,
        { headers: { 'Authorization': this.token } }
      )
      let data = await res.json()
      for (let i = 0; i < data.items.length; i++) {
        let c = data.items[i]
        let res_dxc = await fetch(
          `${environment.apiUrl}/api/collections/DestinatarioXCliente/records?filter=( cliente = '${c.id}' %26%26 destinatario = '${destinatario}')&page=1&perPage=1`,
          { headers: { 'Authorization': this.token } }
        )
        let data_dxc = await res_dxc.json()
        if (data_dxc.items.length == 0) {
          let dxc = { destinatario, cliente: c.id }
          let add_dxc = await fetch(
            `${environment.apiUrl}/api/collections/DestinatarioXCliente/records?`,
            {
              method: "POST",
              headers: { 'Authorization': this.token, "Content-Type": "application/json" },
              body: JSON.stringify(dxc)
            }
          )
        }
      }
    }
  }
  async ponerClientesNuevoDest(clientesid: string[], destinatario: string) {
    for (let i = 0; i < clientesid.length; i++) {
      let c = clientesid[i]
      let dxc = { destinatario, cliente: c }
      let add_dxc = await fetch(
        `${environment.apiUrl}/api/collections/DestinatarioXCliente/records?`,
        {
          method: "POST",
          headers: { 'Authorization': this.token, "Content-Type": "application/json" },
          body: JSON.stringify(dxc)
        }
      )
    }
  }
  async todasprovincias() {
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Provincia/records?filter=(active=true)`, { headers: { 'Authorization': this.token } })
    let data_p = await res_p.json()
    return data_p.items
  }
  async provinciadelocalidad(localidad) {
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Localidad/records/${localidad})`, { headers: { 'Authorization': this.token } })
    let data_p = await res_p.json()
    return data_p
  }
  async todaslocalidades(provincia) {
    let localidades = []
    let res_l = await fetch(`${environment.apiUrl}/api/collections/Localidad/records?filter=(active=true%26%26provincia~${provincia})&page=1&perPage=1`, { headers: { 'Authorization': this.token } })
    let data_l = await res_l.json()
    let paginas = Math.floor(data_l.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Localidad/records?filter=(active=true%26%26provincia~${provincia})&page=${pag}&perPage=200`, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      localidades = localidades.concat(data.items)

    }
    localidades.sort((p1, p2) => p1.nombre.toLowerCase() < p2.nombre.toLowerCase() ? -1 : 1)
    return localidades
  }
  async todosDestinatarios() {
    let destinatarios = []
    let url_d = `${environment.apiUrl}/api/collections/Destinatario/records?filter=(active=True)`
    let res_d = await fetch(url_d, {
      headers: { 'Authorization': this.token }
    })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1

    for (let pag = 1; pag <= paginas; pag++) {
      let url = `${environment.apiUrl}/api/collections/Destinatario/records?filter=(active=True)&perPage=200&page=${pag}&expand=localidad&skipTotal=true`
      let res = await fetch(url, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()

      destinatarios = destinatarios.concat(data.items)
    }
    return destinatarios
  }
  async putZonaMasivo(ids: any[], zonas: any[]) {

    for (let i = 0; i < ids.length; i++) {
      let id = ids[i]
      let zona = zonas[i]
      ///api/collections/Destinatario/records/:id
      await fetch(
        `${environment.apiUrl}/api/collections/Destinatario/records/${id}`,
        {
          method: "PATCH",
          headers: { 'Authorization': this.token, "Content-Type": "application/json" },
          body: JSON.stringify({ zona })
        }
      )


    }
  }
  importanciaDestinatario() {
    return [
      { id: 0, nombre: "Normal" },
      { id: 1, nombre: "Alta" }
    ]
  }
}
