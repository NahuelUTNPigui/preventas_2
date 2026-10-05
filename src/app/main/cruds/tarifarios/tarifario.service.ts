import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TarifarioService {

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

  //Clientes
  async getTodosTarifariosClientes(cliente:string){
    let tarifario = []
    let res_t = await fetch(`${environment.apiUrl}/api/collections/tarifariocliente/records?perPage=${1}&page=${1}&filter=(active=true %26%26 cliente.nombre ~ '${cliente}')&expand=cliente,unidad`,{
      headers: { 'Authorization': this.token }
    })
    let data_t = await res_t.json()
    let paginas = Math.floor(data_t.totalItems / 200) + 1
    for(let pag = 1;pag <= paginas;pag++){
      let res = await fetch(`${environment.apiUrl}/api/collections/tarifariocliente/records?perPage=${200}&page=${pag}&filter=(active=true %26%26 cliente.nombre ~ '${cliente}')&expand=cliente,unidad&sort=cliente.nombre,-fechadesde`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      tarifario = tarifario.concat(data.items)
    }
    return tarifario
  }
  getTarifariosClientes(perPage:number,page:number,cliente:string){

    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records?perPage=${perPage}&page=${page}&filter=(active=true%26%26 oculto=false %26%26 cliente.nombre ~ '${cliente}')&expand=cliente,unidad&sort=cliente.nombre,-fechadesde`,{headers: { 'Authorization': this.token }})
    .pipe(
      catchError(this.handleError<any>("get tarifiario cliente nombre", []))
    )
  }
  getTarifarioCliente(id:string){
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records/${id}?expand=cliente,unidad`, { headers: { 'Authorization': this.token } }
    ).pipe(
      catchError(this.handleError<any>("get tarifario cliente id", []))
    )
  }
  addTarifarioCliente(precio:number,descripcion:string,cliente:string,unidad:string,fechadesde:String,fechahasta:string){
    let tarcli={
      cliente,precio,descripcion,fechadesde:fechadesde + ' 03:00:00.000Z',fechahasta : fechahasta + ' 03:00:00.000Z',unidad,active:true
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("add tarifario cliente", []))
      )
  }
  modTarifarioCliente(id:string,precio:number,descripcion:string,cliente:string,unidad:string,fechadesde:String,fechahasta:string){
    let tarcli={
      cliente,precio,descripcion,fechadesde:fechadesde + ' 03:00:00.000Z',fechahasta : fechahasta + ' 03:00:00.000Z',unidad
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records/${id}`, tarcli, { headers: { 'Authorization': this.token }})
      .pipe(
        catchError(this.handleError<any>("mod tarifario cliente", []))
      )
  }
  delTarifarioCliente(id:string){
    let tarcli = {
      active : false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records/${id}`, tarcli, { headers: { 'Authorization': this.token }})
      .pipe(
        catchError(this.handleError<any>("mod tarifario cliente", []))
      )
  }
  //Proveedor
  async getTodosTarifariosProveedores(proveedor:string){
    let tarifario = []
    let res_t = await fetch(`${environment.apiUrl}/api/collections/tarifarioproveedor/records?perPage=${1}&page=${1}&filter=(active=true %26%26 proveedor.nombre ~ '${proveedor}')&expand=proveedor,unidad`,{
      headers: { 'Authorization': this.token }
    })
    let data_t = await res_t.json()
    let paginas = Math.floor(data_t.totalItems / 200) + 1
    for(let pag = 1;pag <= paginas;pag++){
      let res = await fetch(`${environment.apiUrl}/api/collections/tarifarioproveedor/records?perPage=${200}&page=${pag}&filter=(active=true %26%26 proveedor.nombre ~ '${proveedor}')&expand=proveedor,unidad&sort=proveedor.nombre,-fechadesde`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      tarifario = tarifario.concat(data.items)
    }
    return tarifario
  }
  getTarifariosProveedores(perPage:number,page:number,proveedor:string){
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records?perPage=${perPage}&page=${page}&filter=(active=true %26%26 oculto=false %26%26 proveedor.nombre ~ '${proveedor}')&expand=proveedor,unidad&sort=proveedor.nombre,-fechadesde`,{headers: { 'Authorization': this.token }})
    .pipe(
      catchError(this.handleError<any>("get tarifiario proveedor nombre", []))
    )
  }
  getTarifarioProveedor(id:string){
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records/${id}?expand=proveedor,unidad`, { headers: { 'Authorization': this.token } }
    ).pipe(
      catchError(this.handleError<any>("get tarifario proveedor id", []))
    )
  }
  addTarifarioProveedor(precio:number,descripcion:string,proveedor:string,unidad:string,fechadesde:String,fechahasta:string){
    let tarcli={
      proveedor,precio,descripcion,fechadesde:fechadesde + ' 03:00:00.000Z',fechahasta : fechahasta + ' 03:00:00.000Z',unidad,active:true
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records`, tarcli, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("add tarifario proveedor", []))
      )
  }
  modTarifarioProveedor(id:string,precio:number,descripcion:string,proveedor:string,unidad:string,fechadesde:String,fechahasta:string){
    let tarcli={
      proveedor,precio,descripcion,fechadesde:fechadesde + ' 03:00:00.000Z',fechahasta : fechahasta + ' 03:00:00.000Z',unidad
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records/${id}`, tarcli, { headers: { 'Authorization': this.token }})
      .pipe(
        catchError(this.handleError<any>("mod tarifario proveedor", []))
      )
  }
  delTarifarioProveedor(id:string){
    let tarcli = {
      active : false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records/${id}`, tarcli, { headers: { 'Authorization': this.token }})
      .pipe(
        catchError(this.handleError<any>("mod tarifario proveedor", []))
      )
  }
}
