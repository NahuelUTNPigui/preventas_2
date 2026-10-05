import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UnidadesService {
  token: string;
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ": " + error); // log to console instead
      return of(result as T);
    };
  }
  getUnidades(){
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/unidad/records?page=1&perPage=200&filter=(active = true)`,{
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("get Unidades",[]))
    )
  }
  getUnidad(id:string){
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/unidad/records/${id}`,{
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("get Unidad",[]))
    )
  }
  addUnidad(nombre:string,descripcion:string){
    let unidad={
      nombre,descripcion,active:true
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/unidad/records`,unidad,{
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("add Unidad",[]))
    )
  }
  modUnidad(id:string,nombre:string,descripcion:string){
    let unidad={
      nombre,descripcion
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/unidad/records/${id}`,unidad,{
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("mod Unidad",[]))
    )
  }
  delUnidad(id:string){
    let unidad={
      active :false
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/unidad/records/${id}`,unidad,{
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("mod Unidad",[]))
    )
  }
}
