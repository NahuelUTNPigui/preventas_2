import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthenticationService } from 'app/auth/service';
import { FormaPagoData } from './model/forma-pago-model';
@Injectable()
export class FormaPagoService implements Resolve<any> {
  rows: any;
  onFormaPagoChanged: BehaviorSubject<any>;
  token: string = ''
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;

    this.onFormaPagoChanged = new BehaviorSubject({});
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
      this._httpClient.get(`${environment.apiUrl}/api/collections/FormaPago/records`).subscribe((response: any) => {
        this.rows = response;
        this.onFormaPagoChanged.next(this.rows);
        resolve(this.rows);
      }, reject);
    });
  }

  getFormaPagos(perPage: number, page: number, filtro: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/FormaPago/records?page=${page}&perPage=${perPage}&sort=nombre&filter=nombre~'${filtro}' %26%26 active=true`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get formas de pago", []))
    )
  }
  getFormaPago(id: string) {
    const url = `${environment.apiUrl}/api/collections/FormaPago/records/${id}`;
    return this._httpClient.get<FormaPagoData>(url, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<FormaPagoData>("", null))
    );
  }
  postFormaPago(nombre: string, descripcion: string) {
    return this._httpClient
      .post(`${environment.apiUrl}/api/collections/FormaPago/records`,
        { nombre, descripcion, active: true },
        { headers: { 'Authorization': this.token } }
      )
  }

  putFormaPago(id: string, nombre: string, descripcion: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/FormaPago/records/${id}`,
        { nombre, descripcion },
        { headers: { 'Authorization': this.token } }
      )
  }

  deleteFormaPago(id: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/FormaPago/records/${id}`,
        { active: false },
        { headers: { 'Authorization': this.token } }
      )
  }

}
