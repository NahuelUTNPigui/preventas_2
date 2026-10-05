import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  token: string;

  constructor(private _httpClient: HttpClient) { 
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;    
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ": " + error); // log to console instead
      return of(result as T);
    };
  }
  getVehiculos(perPage: number, page: number, filtro: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Vehiculo/records?page=${page}&perPage=${perPage}&expand=proveedor&filter=(active=true %26%26 ( nombre ~ '${filtro}' %7C%7C observacion ~ '${filtro}' %7C%7C proveedor.nombre ~ '${filtro}'))&sort=nombre`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get vehiculos nombre", []))
    )
  }

  getVehiculoID(id: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Vehiculo/records/${id}?expand=proveedor`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get vehiculo id", []))
    )
  }
  agregarVehiculo(nombre: string, proveedor: string, observacion: string) {
    let vehiculo = {
      nombre, proveedor, observacion, active: true
    }
    return this._httpClient.post<any>(environment.apiUrl+'/api/collections/Vehiculo/records', vehiculo, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("add vehiculo", []))
    )
  }
  modificarVehiculo(nombre: string, proveedor: string, observacion: string, id: string) {
    let vehiculo = {
      nombre, proveedor, observacion
    }
    return this._httpClient.patch<any>(environment.apiUrl+'/api/collections/Vehiculo/records/' + id, vehiculo, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("mod vehiculo", []))
    )
  }
  eliminarVehiculo(id: string) {
    let vehiculo = {
      active: false
    }
    return this._httpClient.patch<any>(environment.apiUrl+'/api/collections/Vehiculo/records/' + id, vehiculo, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("eliminar vehiculo", []))
    )
  }
  async getAllProveedores() {
    let proveedores = []
    let res_p = await fetch(environment.apiUrl+'/api/collections/Proveedor/records?filter=(active=true)&page=1&perPage=1', {
      headers: { 'Authorization': this.token }
    })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(environment.apiUrl+'/api/collections/Proveedor/records?filter=(active=true)&page=' + pag + '&perPage=200', {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      proveedores = proveedores.concat(data.items)

    }
    proveedores.sort((p1, p2) => p1.nombre.toLowerCase() < p2.nombre.toLowerCase() ? -1 : 1)
    return proveedores

  }
}
