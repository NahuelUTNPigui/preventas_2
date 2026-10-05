import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthenticationService } from 'app/auth/service';
import { RemitenteData } from './model/remitente-model';
@Injectable()
export class RemitenteService implements Resolve<any> {
  rows: any;
  onRemitenteChanged: BehaviorSubject<any>;
  token: string = ''
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;

    this.onRemitenteChanged = new BehaviorSubject({});
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
      this._httpClient.get(`${environment.apiUrl}/api/collections/Remitente/records`).subscribe((response: any) => {
        this.rows = response;
        this.onRemitenteChanged.next(this.rows);
        resolve(this.rows);
      }, reject);
    });
  }

  getRemitentes(perPage: number, page: number, filtro: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Remitente/records?&page=${page}&perPage=${perPage}&sort=nombre&filter=(nombre~'${filtro}'  %7C%7C observacion~'${filtro}') %26%26 active=true&sort=-nombre`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitentes", []))
    )
  }
  async getTodosRemitentes(filtro: string) {
    let remitentes = []
    let urlfuncion = (page,perPage,skipTotal)=>`${environment.apiUrl}/api/collections/Remitente/records?page=${page}&perPage=${perPage}&filter=((nombre~'${filtro}' ) %26%26 active=true) & sort=-nombre ${skipTotal?"&skipTotal=true":""}`
    const urlc = urlfuncion(1,1,false)
    
    let res_r = await fetch(urlc,{
      headers: { 'Authorization': this.token }
    })
    let pageSize = 500
    let data_r = await res_r.json()
    let paginas = Math.floor(data_r.totalItems / pageSize) + 1
    for(let pag = 1 ; pag <= paginas; pag++){
      let url = urlfuncion(pag,pageSize,true)
      
      let res = await fetch(url,{
        headers:{'Authorization': this.token}
      })
      let data = await res.json()
      remitentes = remitentes.concat(data.items)
    }
    return remitentes
  }
  getRemitente(id: string) {
    const url = `${environment.apiUrl}/api/collections/Remitente/records/${id}`;
    return this._httpClient.get<RemitenteData>(url, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<RemitenteData>("", null))
    );
  }
  postRemitente(nombre: string,  observacion: string) {
    return this._httpClient
      .post(`${environment.apiUrl}/api/collections/Remitente/records`,
        { nombre, observacion, active: true },
        { headers: { 'Authorization': this.token } }
      )
  }

  putRemitente(id: string, nombre: string,  observacion: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remitente/records/${id}`,
        { nombre,  observacion },
        { headers: { 'Authorization': this.token } }
      )
  }
  agregarCliente(remitente:string,cliente:string){
    let remxcliente = {
      remitente,cliente
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/RemitenteXCliente/records`, remxcliente, { headers: { 'Authorization': this.token }})
      .pipe(
        catchError(this.handleError<any>("add cliente a un remitente", []))
      )
  }
  async deleteCliente(id:string){
    let borrar = await fetch(`${environment.apiUrl}/api/collections/RemitenteXCliente/records/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': this.token }
    })
  }
  deleteRemitente(id: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remitente/records/${id}`,
        { active: false },
        { headers: { 'Authorization': this.token } }
      )
  }
  // Clientes de un remitente
  getClientesRemitente(page: number, perPage: number, id: string, nombre: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/RemitenteXCliente/records?page=${page}&perPage=${perPage}&filter=(remitente = '${id}' %26%26 cliente.nombre ~ '${nombre}')&expand=cliente&sort=cliente.nombre`,{
      headers: { 'Authorization': this.token }
    })
      .pipe(
        catchError(this.handleError<any>("get clientes de un remitente", []))
      )
  }
  async todosClientesRemiente(remitente:string,filtro:string){
    let clientes = []
    let res_c = await fetch(
      `${environment.apiUrl}/api/collections/Cliente/records?filter=( active = true %26%26 nombre ~'${filtro}')&page=1&perPage=1`,
      {headers: { 'Authorization': this.token }}
    )
    let data_c = await res_c.json()
    let paginas = Math.floor(data_c.totalItems / 200) + 1
    for(let pag = 1 ; pag <= paginas;pag++){
      let res = await fetch(
        `${environment.apiUrl}/api/collections/Cliente/records?filter=( active = true %26%26 nombre ~'${filtro}')&page=${pag}&perPage=${200}&skipTotal = true`,
        {headers: { 'Authorization': this.token }}
      )
      let data = await res.json()
      for(let i  = 0 ;i<data.items.length;i++){
        let c = data.items[i]
        let res_dxc = await fetch(
          `${environment.apiUrl}/api/collections/RemitenteXCliente/records?filter=( cliente = '${c.id}' %26%26 remitente = '${remitente}')&page=1&perPage=1`,
          {headers: { 'Authorization': this.token }}
        )
        let data_dxc = await res_dxc.json()
        if(data_dxc.items.length == 0){
          clientes.push(c)
        }
      }
    }
    clientes.sort((p1, p2) => p1.nombre.toLowerCase() < p2.nombre.toLowerCase() ? -1 : 1)
    return clientes
  }
  async ponerTodosClientes(remitente:string){
    let res_c = await fetch(
      `${environment.apiUrl}/api/collections/Cliente/records?filter=( active = true)&page=1&perPage=1`,
      {headers: { 'Authorization': this.token }}
    )
    let data_c = await res_c.json()
    let paginas = Math.floor(data_c.totalItems / 200) + 1
    for(let pag = 1; pag<=paginas;pag++){
      let res = await fetch(
        `${environment.apiUrl}/api/collections/Cliente/records?filter=( active = true)&page=${pag}&perPage=${200}&skipTotal = true`,
        {headers: { 'Authorization': this.token }}
      )
      let data = await res.json()
      for(let i = 0;i<data.items.length;i++){
        let c = data.items[i]
        
        let res_rxc = await fetch(
          `${environment.apiUrl}/api/collections/RemitenteXCliente/records?filter=( cliente = '${c.id}' %26%26 remitente = '${remitente}')&page=1&perPage=1`,
          {headers: { 'Authorization': this.token }}
        )
        let data_rxc = await res_rxc.json()
        if(data_rxc.items.length == 0){
          let rxc = {remitente,cliente:c.id}
          let add_rxc = await fetch(
            `${environment.apiUrl}/api/collections/RemitenteXCliente/records/`,
            {
              method:"POST",
              headers: { 'Authorization': this.token,"Content-Type":"application/json" },
              body:JSON.stringify(rxc)
            }
          )
        }
      }
    }
  }
}
