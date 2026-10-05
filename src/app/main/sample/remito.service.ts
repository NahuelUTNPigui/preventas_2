import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RemitoService {
  token: string = ''
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
  getUltimosRemitos(){
    let pendienteID= "0kxg8jr071yozsk"
    let transitoID="zowdo68g83kwahx"
    let estado = `%26%26(estado='${pendienteID}'%7C%7Cestado = '${transitoID}')`
    let filter = `active=true %26%26 prioridad=1 ${estado}`
    let pageSize = 15
    let expand = "expand=cliente,destinatario,destinatario.localidad,estado"
    let ruta = `${environment.apiUrl}/api/collections/Remito/records?page=${1}&perPage=${pageSize}&${expand}&filter=(${filter})&sort=-updated`
    return this._httpClient.get<any>(ruta,{
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get localidades nombre", []))
    )
  }
}
