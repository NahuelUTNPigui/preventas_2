import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProveedorData } from '../model/proveedor-model';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ProveedorService implements Resolve<any> {
  rows: any;
  onProveedorListChanged: BehaviorSubject<any>;
  token: string;
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.onProveedorListChanged = new BehaviorSubject({});
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;
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
  getDataTableRows(): Promise<any[]> {

    return new Promise((resolve, reject) => {
      this._httpClient.get<Array<ProveedorData>>(`${environment.apiUrl}/api/collections/Proveedor/records`)
        .subscribe((response: any) => {
          this.rows = response.items;
          this.onProveedorListChanged.next(this.rows);
          resolve(this.rows);
        }, reject);
    });
  }

  getProveedores(perPage: number, page: number, filtro: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Proveedor/records?page=${page}&perPage=${perPage}&filter=(active=true %26%26 (cuit ~ '${filtro}' || razonSocial ~ '${filtro}' || nombre ~ '${filtro}'))&sort=nombre`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get proveedores", []))
    )
  }
  async getTodosProveedores(filtro: string) {
    let proveedores = []
    let urlfuncion = (page, perPage, skipTotal) => `${environment.apiUrl}/api/collections/Proveedor/records?page=${page}&perPage=${perPage}&filter=(active=true %26%26 (cuit ~ '${filtro}' || razonSocial ~ '${filtro}' || nombre ~ '${filtro}'))&sort=nombre${skipTotal ? "&skipTotal=true" : ""}`
    const urlp = urlfuncion(1, 1, false)
    let res_p = await fetch(urlp, {
      headers: { 'Authorization': this.token }
    })
    let pageSize = 500
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / pageSize) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let url = urlfuncion(pag, pageSize, true)

      let res = await fetch(url, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      proveedores = proveedores.concat(data.items)
    }
    return proveedores
  }
  getProveedorID(id: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Proveedor/records/${id}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get proveedor", []))
    )
  }
  agregarProveedor(nombre: string, cuit: string, razonSocial: string, observacion: string, responsable: boolean) {
    let proveedor = {
      nombre, cuit, razonSocial, observacion, active: true, responsable

    }
    return this._httpClient.post<any>(environment.apiUrl + '/api/collections/Proveedor/records', proveedor, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("add proveedor", []))
    )
  }
  modificarProveedor(nombre: string, cuit: string, razonSocial: string, observacion: string, id: string, responsable) {
    let proveedor = {
      nombre, cuit, razonSocial, observacion, responsable
    }

    return this._httpClient.patch<any>(environment.apiUrl + '/api/collections/Proveedor/records/' + id, proveedor, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("mod proveedor", []))
    )
  }
  eliminarProveedor(id: string) {
    let proveedor = {
      active: false
    }
    return this._httpClient.patch<any>(environment.apiUrl + '/api/collections/Proveedor/records/' + id, proveedor, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("mod proveedor", []))
    )
  }
  async getAllChoferesProveedor(idProveedor: string) {
    let choferes = []
    let ruta = `${environment.apiUrl}/api/collections/Chofer/records?filter=(active=true%26%26proveedor='${idProveedor}')&page=1&perPage=1`
    let res_p = await fetch(ruta, {
      headers: { 'Authorization': this.token }
    })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Chofer/records?filter=(active=true%26%26proveedor='${idProveedor}')&page=${pag}&perPage=200`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      choferes = choferes.concat(data.items)
    }
    choferes.sort((c1, c2) => c1.nombre.toLowerCase() < c2.nombre.toLowerCase() ? -1 : 1)
    return choferes
  }
  async getAllVehiculosProveedor(idProveedor: string) {
    let vehiculos = []
    let ruta = `${environment.apiUrl}/api/collections/Vehiculo/records?filter=(active=true%26%26proveedor='${idProveedor}')&page=1&perPage=1`
    let res_p = await fetch(ruta, {
      headers: { 'Authorization': this.token }
    })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Vehiculo/records?filter=(active=true%26%26proveedor='${idProveedor}')&page=${pag}&perPage=200`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      vehiculos = vehiculos.concat(data.items)
    }
    vehiculos.sort((v1, v2) => v1.nombre.toLowerCase() < v2.nombre.toLowerCase() ? -1 : 1)
    return vehiculos
  }
  //Proveedor

  async getTarifariosProveedor(proveedor: string) {
    let tarifario = []
    let res_d = await fetch(environment.apiUrl + "/api/collections/tarifarioproveedor/records?filter=(active=true %26%26 programado=false %26%26 proveedor = '" + proveedor + "' )&page=1&perPage=1", { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(environment.apiUrl + "/api/collections/tarifarioproveedor/records?filter=(active=true %26%26 programado=false %26%26 proveedor = '" + proveedor + "' )&page=" + pag + '&perPage=200&expand=proveedor,unidad&skipTotal=true', { headers: { 'Authorization': this.token } })
      let data = await res.json()
      tarifario = tarifario.concat(data.items)
    }
    tarifario.sort((p1, p2) => p1.fechadesde.toLowerCase() > p2.fechadesde.toLowerCase() ? -1 : 1)
    return tarifario

  }
  async getTarifariosProveedorProgramado(proveedor: string) {
    let tarifario = []
    let res_d = await fetch(environment.apiUrl + "/api/collections/tarifarioproveedor/records?filter=(active=true %26%26 programado=true %26%26 proveedor = '" + proveedor + "' )&page=1&perPage=1", { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(environment.apiUrl + "/api/collections/tarifarioproveedor/records?filter=(active=true %26%26 programado=true %26%26 proveedor = '" + proveedor + "' )&page=" + pag + '&perPage=200&expand=proveedor,unidad&skipTotal=true', { headers: { 'Authorization': this.token } })
      let data = await res.json()
      tarifario = tarifario.concat(data.items)
    }
    tarifario.sort((p1, p2) => p1.fechadesde.toLowerCase() > p2.fechadesde.toLowerCase() ? -1 : 1)
    return tarifario

  }
  async getTarifarioProveedorVigente(proveedor) {
    let tarifariocompleto = await this.getTarifariosProveedor(proveedor)
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
  getTarifarioProveedor(id: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records/${id}?expand=proveedor,unidad`, { headers: { 'Authorization': this.token } }
    ).pipe(
      catchError(this.handleError<any>("get tarifario proveedor id", []))
    )
  }
  addTarifarioProveedor(precio: number, descripcion: string, proveedor: string, unidad: string, fechadesde: String, fechahasta: string) {
    let tarcli = {
      proveedor, precio, descripcion, fechadesde: fechadesde + ' 03:00:00.000Z', fechahasta: fechahasta + ' 03:00:00.000Z', unidad, active: true, programado: false
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("add tarifario proveedor", []))
      )
  }
  programarTarifarioProveedor(precio: number, descripcion: string, proveedor: string, unidad: string, fechadesde: String, fechahasta: string) {
    let tarpro = {
      proveedor, precio, descripcion, fechadesde: fechadesde + ' 03:00:00.000Z', fechahasta: fechahasta + ' 03:00:00.000Z', unidad, active: true, programado: true
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records`, tarpro, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("programar tarifario proveedor", []))
      )
  }
  setVigenteTarifario(id) {
    let tarpro = {
      programado: false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records/${id}`, tarpro, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("poner vigente tarifario proveedor", []))
      )
  }
  async setVigenteTarifarioLista(lista: any[]) {
    let tarpro = {
      programado: false
    }

    let res: any[] = []
    for (let i = 0; i < lista.length; i++) {
      let id = lista[i]
      let res_pro = await fetch(
        `${environment.apiUrl}/api/collections/tarifarioproveedor/records/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", 'Authorization': this.token },
          body: JSON.stringify(tarpro)
        }
      )
      res.push(res_pro)
    }
    return res

  }
  modTarifarioProveedor(id: string, precio: number, descripcion: string, proveedor: string, unidad: string, fechadesde: String, fechahasta: string) {
    let tarcli = {
      proveedor, precio, descripcion, fechadesde: fechadesde + ' 03:00:00.000Z', fechahasta: fechahasta + ' 03:00:00.000Z', unidad
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records/${id}`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod tarifario proveedor", []))
      )
  }
  delTarifarioProveedor(id: string) {
    let tarcli = {
      active: false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records/${id}`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod tarifario proveedor", []))
      )
  }
  ocultarTarifario(tarifario: string) {
    let tarcli = {
      oculto: true
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records/${tarifario}`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod tarifario proveedor", []))
      )
  }
  desocultarTarifario(tarifario: string) {
    let tarcli = {
      oculto: false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records/${tarifario}`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("mod tarifario proveedor", []))
      )
  }
  async getAsientosFullList(proveedor:string,fechadesde:string,fechahasta:string){
    let filter = `(proveedor~'${proveedor}'`
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
