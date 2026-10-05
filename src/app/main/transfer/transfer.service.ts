import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TransferService {
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
  async getAllTransfer(
    fechaDesde,
    fechaHasta,
    cliente,
    proveedor,
    cbu,
    alias,
    bancoorigen,
    bancodestino,
    unidad,
    ingresoId
  ){
    let y ="%26%26"
    let filter = ingresoId==0 ?" 1=1 ":ingresoId==1 ? "ingreso = true":"ingreso = false"
    let expand = "cliente,bancoorigen,bancodestino,proveedor"
    
    if(fechaDesde != ""){
      filter += ` ${y} fecha >= '${fechaDesde}'`
    }
    if(fechaHasta != ""){
      filter += ` ${y} fecha <= '${fechaHasta}'`
    }
    if(cliente != ""){
      filter += ` ${y} cliente ~ '${cliente}'`
    }
    if(proveedor != ""){
      filter += ` ${y} proveedor ~ '${proveedor}'`
    }
    if(bancoorigen != ""){
      filter += ` ${y} bancoorigen ~ '${bancoorigen}'`
    }
    if(bancodestino != ""){
      filter += ` ${y} bancodestino ~ '${bancodestino}'`
    }
    if(unidad != ""){
      filter += ` ${y} unidad ~ '${unidad}'`
    }
    filter += ` ${y} alias ~ '${alias}'`
    filter += ` ${y} cbu ~ '${cbu}'`
    let transfer = []
    let ruta_t = `${environment.apiUrl}/api/collections/Transferencia/records?sort=-created&expand=${expand}&page=${1}&perPage=${1}&filter=${filter}`
    let res_t = await fetch(ruta_t,{
      headers: { 'Authorization': this.token }
    })
    let data_t = await res_t.json()
    
    let paginas = Math.floor(data_t.totalItems / 200) + 1
    for(let pag = 1;pag<=paginas;pag++){
      let ruta = `${environment.apiUrl}/api/collections/Transferencia/records?sort=-fecha&expand=${expand}&page=${pag}&perPage=${200}&filter=${filter}`
      let res =await fetch(ruta,{
        headers:{'Authorization': this.token}
      })
      let data = await res.json()
      transfer = transfer.concat(data.items)
    }
    return transfer
  }
  getTransfers(
    page,
    perPage,
    fechaDesde,
    fechaHasta,
    cliente,
    proveedor,
    cbu,
    alias,
    bancoorigen,
    bancodestino,
    unidad,
    ingresoId
  ){
    let y ="%26%26"
    let filter = ingresoId==0 ?" 1=1 ":ingresoId==1 ? "ingreso = true":"ingreso = false"
    let expand = "cliente,bancoorigen,bancodestino,proveedor"
    
    if(fechaDesde != ""){
      filter += ` ${y} fecha >= '${fechaDesde}'`
    }
    if(fechaHasta != ""){
      filter += ` ${y} fecha <= '${fechaHasta}'`
    }
    if(cliente != ""){
      filter += ` ${y} cliente ~ '${cliente}'`
    }
    if(proveedor != ""){
      filter += ` ${y} proveedor ~ '${proveedor}'`
    }
    if(bancoorigen != ""){
      filter += ` ${y} bancoorigen ~ '${bancoorigen}'`
    }
    if(bancodestino != ""){
      filter += ` ${y} bancodestino ~ '${bancodestino}'`
    }
    if(unidad != ""){
      filter += ` ${y} unidad ~ '${unidad}'`
    }
    filter += ` ${y} alias ~ '${alias}'`
    filter += ` ${y} cbu ~ '${cbu}'`
    
    let ruta = `${environment.apiUrl}/api/collections/Transferencia/records?sort=-fecha&expand=${expand}&page=${page}&perPage=${perPage}&filter=${filter}`
    
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get transferencias", []))
    )
  }
  addTransfer(
    fecha,
    importe,
    bancoorigen,
    bancodestino,
    alias,
    cbu,
    cliente,
    proveedor,
    unidad,ingreso
  ){
    let data = {
      fecha:fecha+" 03:00:00",
      proveedor,
      ingreso,
      importe,
      bancoorigen,
      bancodestino,
      alias,
      cbu,
      cliente,
      unidad
    }
    return this._httpClient.post<any>(`${environment.apiUrl}/api/collections/Transferencia/records`, data, { headers: { 'Authorization': this.token } })
    .pipe(
        catchError(this.handleError<any>("add transfer", []))
    )
  }
  getTransferID(id){
    let ruta = `${environment.apiUrl}/api/collections/Transferencia/records/${id}`
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get transferencia", []))
    )
  }
  modTransfer(
    id,
    fecha,
    importe,
    bancoorigen,
    bancodestino,
    alias,
    cbu,
    cliente,
    proveedor,
    unidad
  ){
    let data = {
      fecha:fecha+" 03:00:00",
      importe,
      bancoorigen,
      bancodestino,
      alias,
      cbu,
      cliente,
      proveedor,
      unidad
    }
    return this._httpClient.patch<any>(`${environment.apiUrl}/api/collections/Transferencia/records/${id}`, data, { headers: { 'Authorization': this.token } })
    .pipe(
        catchError(this.handleError<any>("mod transfer", []))
    )
  }
  delTrasfer(id){
    let ruta = `${environment.apiUrl}/api/collections/Transferencia/records/${id}`
    return this._httpClient.delete<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("delete transferencia", []))
    )
  }
  //Efectivo
  getFlujos(
    page,
    perPage,
    fechaDesde,
    fechaHasta,
    cliente,
    proveedor,
    ingresoId
  ){
    let y ="%26%26"

    let filter = ingresoId==0 ?" 1=1 ":ingresoId==1 ? "ingreso = true":"ingreso = false"
    let expand = "cliente,proveedor"
    
    if(fechaDesde != ""){
      filter += `${y} fecha >= '${fechaDesde}'`
    }
    if(fechaHasta != ""){
      filter += `${y} fecha <= '${fechaHasta}'`
    }
    if(cliente != ""){
      filter += `${y} cliente ~ '${cliente}'`
    }
    if(proveedor != ""){
      filter += `${y} proveedor ~ '${proveedor}'`
    }
    let ruta = `${environment.apiUrl}/api/collections/Flujo/records?sort=-created&expand=${expand}&page=${page}&perPage=${perPage}&filter=${filter}`
    return this._httpClient.get<any>(ruta,{
       headers: { 'Authorization': this.token } 
    })
  }
  async getAllflujos(
    fechaDesde,
    fechaHasta,
    cliente,
    proveedor,
    ingresoId
  ){
    let y ="%26%26"
    let filter = ingresoId==0 ?" 1=1 ":ingresoId==1 ? "ingreso = true":"ingreso = false"
    let expand = "cliente,proveedor"
    if(fechaDesde != ""){
      filter += `${y} fecha >= '${fechaDesde}'`
    }
    if(fechaHasta != ""){
      filter += `${y} fecha <= '${fechaHasta}'`
    }
    if(cliente != ""){
      filter += `${y} cliente ~ '${cliente}'`
    }
    if(proveedor != ""){
      filter += `${y} proveedor ~ '${proveedor}'`
    }
    let ruta_f = `${environment.apiUrl}/api/collections/Flujo/records?sort=-created&expand=${expand}&page=${1}&perPage=${1}&filter=${filter}`
    let res_f = await fetch(ruta_f,{
      headers: { 'Authorization': this.token } 
    })
    let data_f = await res_f.json()
    let paginas = Math.floor(data_f.totalItems / 200) + 1
    let flujos = []
    for(let pag = 1;pag<=paginas;pag++){
      let ruta = `${environment.apiUrl}/api/collections/Flujo/records?sort=-fecha&expand=${expand}&page=${pag}&perPage=${200}&filter=${filter}&skipTotal=true`
      let res =await fetch(ruta,{
        headers:{'Authorization': this.token}
      })
      let data = await res.json()
      flujos = flujos.concat(data.items)

    }
    return flujos
  }
  getFlujo(id){
    let ruta = `${environment.apiUrl}/api/collections/Flujo/records/${id}`
    this._httpClient.get<any>(ruta,{
       headers: { 'Authorization': this.token } 
    })
  }
  addFlujo(
    fecha,
    cliente,
    proveedor,
    importe,
    ingreso
  ){
    let data = {
      fecha:fecha + " 03:00:00",
      cliente,
      proveedor,
      importe,
      ingreso
    }
    let ruta = `${environment.apiUrl}/api/collections/Flujo/records`
    return this._httpClient.post<any>(ruta, data, { headers: { 'Authorization': this.token } })
    .pipe(
        catchError(this.handleError<any>("add flujo", []))
    )
  }
  modFlujo(
    id,
    fecha,
    cliente,
    proveedor,
    importe
  ){
    let data = {
      fecha:fecha + " 03:00:00",
      cliente,
      proveedor,
      importe
    }
    let ruta = `${environment.apiUrl}/api/collections/Flujo/records/${id}`
    return this._httpClient.patch<any>(ruta, data, { headers: { 'Authorization': this.token } })
    .pipe(
        catchError(this.handleError<any>("mod flujo", []))
    )
  }
  delFlujo(id){
    let ruta = `${environment.apiUrl}/api/collections/Flujo/records/${id}`
    return this._httpClient.delete<any>(ruta,{ headers: { 'Authorization': this.token } })
    .pipe(
        catchError(this.handleError<any>("mod flujo", []))
    )
  }
}
