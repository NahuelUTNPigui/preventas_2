import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable()
export class EstadoListService implements Resolve<any> {
  rows: any;
  onEstadoListChanged: BehaviorSubject<any>;
  token: string;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;
    this.onEstadoListChanged = new BehaviorSubject({});
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
      this._httpClient.get(`${environment.apiUrl}/api/collections/Estado/records`).subscribe((response: any) => {
        this.rows = response;
        this.onEstadoListChanged.next(this.rows);
        resolve(this.rows);
      }, reject);
    });
  }
  getEstados(perPage: number, page: number, filtro: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Estado/records?page=${page}&perPage=${perPage}&sort=nombre&filter=(nombre~'${filtro}' %26%26 active=true)`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get estados", []))
    )
  }


}
