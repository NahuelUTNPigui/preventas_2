import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root'
})
export class LocalidadService {
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
  //Localidades
  getLocalidadesPaginacion(perPage: number, page: number, filtro: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Localidad/records?page=${page}&perPage=${perPage}&expand=provincia&filter=(active=true %26%26  nombre ~ '${filtro}' )&sort=nombre`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get localidades nombre", []))
    )
  }
  getLocalidadProvinciaPaginacion(perPage: number, page: number, provincia: string, nombre: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Localidad/records?page=${page}&perPage=${perPage}&expand=provincia&filter=(active=true %26%26  provincia = '${provincia}' %26%26 nombre ~'${nombre}' )&sort=-nombre`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get localidades provincia", []))
    )
  }
  getLocalidadID(id: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Localidad/records/${id}?expand=provincia`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get localidad", []))
    )
  }
  addLocalidad(nombre: string, provincia: string) {
    let localidad = {
      nombre, provincia, active: true
    }
    return this._httpClient.post<any>(environment.apiUrl + '/api/collections/Localidad/records', localidad, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("add localidad", []))
    )
  }
  modLocalidad(nombre: string, provincia: string, id: string) {
    let localidad = {
      nombre, provincia
    }
    return this._httpClient.patch<any>(environment.apiUrl + '/api/collections/Localidad/records/' + id, localidad, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("mod localidad", []))
    )
  }
  borrarLocalidad(id: string) {
    let localidad = {
      active: false
    }
    return this._httpClient.patch<any>(environment.apiUrl + '/api/collections/Localidad/records/' + id, localidad, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("del localidad", []))
    )
  }


  getProvinciasPaginacion(perPage: number, page: number, filtro: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Provincia/records?page=${page}&perPage=${perPage}&filter=(active=true %26%26  nombre ~ '${filtro}' )&sort=nombre`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get provincias nombre", []))
    )
  }
  getProvinciaID(id: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Provincia/records/${id}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get provincias nombre", []))
    )
  }
  addProvincia(nombre: string) {
    let provincia = {
      nombre, active: true
    }
    return this._httpClient.post<any>(environment.apiUrl + '/api/collections/Provincia/records', provincia, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("add provincia", []))
    )
  }
  modProvincia(nombre: string, id: string) {
    let provincia = {
      nombre
    }
    return this._httpClient.patch<any>(environment.apiUrl + '/api/collections/Provincia/records/' + id, provincia, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("mod provincia", []))
    )
  }
  borrarProvincia(id: string) {
    let provincia = {
      active: false
    }
    return this._httpClient.patch<any>(environment.apiUrl + '/api/collections/Provincia/records/' + id, provincia, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("mod provincia", []))
    )
  }
}
