import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { ClienteData } from 'app/main/cruds/cliente/model/cliente-model';
import { ProveedorData } from 'app/main/proveedores/model/proveedor-model';
import { RemitenteData } from 'app/main/cruds/remitente/model/remitente-model';
import { VehiculoData } from 'app/main/proveedores/model/vehiculo-model';
import { ChoferData } from 'app/main/proveedores/model/chofer-model';
import { DestinatarioData } from 'app/main/cruds/destinatario/model/destinatario-model';
import { ProvinciaData } from 'app/main/localidades/model/provincia-model';
import { LocalidadData } from 'app/main/localidades/model/localidad-model';
import { EstadoData } from 'app/main/cruds/estado/model/estado-model';
import { UsuarioData } from 'app/main/usuario/model/usuario-model';
import { FormaPagoData } from 'app/main/cruds/forma-pago/model/forma-pago-model';
@Injectable({
  providedIn: 'root'
})
export class SelectFormatService {

  public token = '';
  rows: any;

  /**
    * Constructor
    *
    * @param {HttpClient} _httpClient
    */
  constructor(private _httpClient: HttpClient) {
    this.token = JSON.parse(localStorage.getItem('currentUser')||"{}").token
  }
  /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
  //    */


  async getTodosClientes(){
    let clientes = []
    let res_c = await fetch(`${environment.apiUrl}/api/collections/Cliente/records?filter=(active=true)&perPage=1&page=1`,{
      headers: { 'Authorization': this.token }
    })
    let data_c = await res_c.json()
    let paginas = Math.floor(data_c.totalItems / 200) + 1
    for(let pag = 1 ; pag <= paginas; pag++){
      let res = await fetch(`${environment.apiUrl}/api/collections/Cliente/records?filter=(active=true)&perPage=200&page=${pag}&skipTotal=true`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      clientes = clientes.concat(data.items)
    }
    clientes.sort((c1:any,c2:any)=>c1.nombre.toLowerCase()<c2.nombre.toLowerCase()?-1:1)
    return clientes

  }

  getClientes(): Observable<ClienteData[]> {  
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Cliente/records?skipTotal=true&filter=(active=true)&perPage=200`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as ClienteData[])
    );
  }
  async getTodosVehiculos(){
    let vehiculos = []
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Vehiculo/records?filter=(active=true)&perPage=1&page=1`,{
      headers: { 'Authorization': this.token }
    })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for(let pag = 1 ; pag <= paginas; pag++){
      let res = await fetch(`${environment.apiUrl}/api/collections/Vehiculo/records?filter=(active=true)&perPage=200&page=${pag}&skipTotal=true`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      vehiculos = vehiculos.concat(data.items)
    }
    vehiculos.sort((c1:any,c2:any)=>c1.nombre.toLowerCase()<c2.nombre.toLowerCase()?-1:1)
    return vehiculos
  }
  async getTodosChoferes(){
    let choferes = []
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Chofer/records?filter=(active=true)&perPage=1&page=1`,{
      headers: { 'Authorization': this.token }
    })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for(let pag = 1 ; pag <= paginas; pag++){
      let res = await fetch(`${environment.apiUrl}/api/collections/Chofer/records?filter=(active=true)&perPage=200&page=${pag}&skipTotal=true`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      choferes = choferes.concat(data.items)
    }
    choferes.sort((c1:any,c2:any)=>c1.nombre.toLowerCase()<c2.nombre.toLowerCase()?-1:1)
    return choferes
  }
  async getTodosProveedores(){
    let proveedores = []
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Proveedor/records?filter=(active=true)&perPage=1&page=1`,{
      headers: { 'Authorization': this.token }
    })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for(let pag = 1 ; pag <= paginas; pag++){
      let res = await fetch(`${environment.apiUrl}/api/collections/Proveedor/records?filter=(active=true)&perPage=200&page=${pag}&skipTotal=true`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      proveedores = proveedores.concat(data.items)
    }
    proveedores.sort((c1:any,c2:any)=>c1.nombre.toLowerCase()<c2.nombre.toLowerCase()?-1:1)
    return proveedores
  }
  getProveedores(): Observable<ProveedorData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Proveedor/records?skipTotal=true&filter=active=true&perPage=200`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as ProveedorData[])
    );
  }
  getChoferes(): Observable<ChoferData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Chofer/records?skipTotal=true&filter=active=true&perPage=200&sorted=-nombre`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as ChoferData[])
    );
  }
  getChoferesProveedor(id_proveedor: string): Observable<ChoferData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Chofer/records?skipTotal=true&filter=(active=true %26%26  proveedor='${id_proveedor}')&perPage=200&sorted=-nombre`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as ChoferData[])
    );
  }
  getVehiculos(): Observable<VehiculoData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Vehiculo/records?skipTotal=true&filter=active=true&perPage=200`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as VehiculoData[])
    );
  }
  getVehiculosProveedor(id_proveedor: string): Observable<VehiculoData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Vehiculo/records?skipTotal=true&filter=(active=true %26%26  proveedor='${id_proveedor}')&perPage=200&sorted=-nombre`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as VehiculoData[])
    );
  }
  getEstados(): Observable<EstadoData[]> {

    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Estado/records?skipTotal=true&filter=active=true`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as EstadoData[])
    );
  }
  getProvincias(): Observable<ProvinciaData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Provincia/records?skipTotal=true&filter=active=true&sort=nombre&perPage=200`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as ProvinciaData[])
    );
  }
  getLocalidades(): Observable<LocalidadData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Localidad/records?skipTotal=true&filter=active=true&perPage=200`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as LocalidadData[])
    );
  }
  async getTodasLocalidadesProvincia(id_provincia:string){
    let localidades = []
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Localidad/records?filter=(active=true %26%26 provincia ~'${id_provincia}')&perPage=1&page=1`,{
      headers: { 'Authorization': this.token }
    })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for(let pag = 1 ; pag <= paginas; pag++){
      let res = await fetch(`${environment.apiUrl}/api/collections/Localidad/records?filter=(active=true %26%26 provincia ~'${id_provincia}')&perPage=200&page=${pag}&skipTotal=true`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      localidades = localidades.concat(data.items)
    }
    localidades.sort((c1:any,c2:any)=>c1.nombre.toLowerCase()<c2.nombre.toLowerCase()?-1:1)
    return localidades
  }
  getLocalidadesProvincia(id_provincia: string): Observable<LocalidadData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Localidad/records?skipTotal=true&filter=(active=true %26%26 provincia='${id_provincia}')&perPage=200&sort=nombre`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as LocalidadData[])
    );
  }
  getRemitentes(): Observable<RemitenteData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Remitente/records?skipTotal=true&filter=active=true&perPage=200`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as RemitenteData[])
    );
  }

  async getRemitentesCliente(id_cliente: string) {

    let rxc:any[] = []
    let remitentes:any[] = []
    let res_p = await fetch(`${environment.apiUrl}/api/collections/RemitenteXCliente/records?filter=( cliente ~'${id_cliente}')&perPage=1&page=1`,{
      headers: { 'Authorization': this.token }
    })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for(let pag = 1 ; pag <= paginas; pag++){
      let res = await fetch(`${environment.apiUrl}/api/collections/RemitenteXCliente/records?filter=(cliente ~'${id_cliente}')&perPage=200&page=${pag}&skipTotal=true`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      rxc = rxc.concat(data.items)
    }
    for(let i = 0;i<rxc.length;i++){
      
      
      let item:any = rxc[i]
      if(item.remitente===""){
        continue
      }
      let res = await fetch(`${environment.apiUrl}/api/collections/Remitente/records/${item.remitente}`,{
        headers: { 'Authorization': this.token }
      })
      let data:any = await res.json()
      remitentes.push(data)
    }
    remitentes.sort((d1:any,d2:any)=>d1.nombre<d2.nombre?-1:1)
    return remitentes
  }
  getDestinatarios(): Observable<DestinatarioData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Destinatario/records?skipTotal=true&filter=active=true&perPage=200`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as DestinatarioData[])
    );
  }
  async getTodosDestinatariosCliente(id_cliente:string){
    let dxc:any[] = []
    let destinatarios:any[] = []
    let res_p = await fetch(`${environment.apiUrl}/api/collections/DestinatarioXCliente/records?filter=( cliente ~'${id_cliente}')&perPage=1&page=1`,{
      headers: { 'Authorization': this.token }
    })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    for(let pag = 1 ; pag <= paginas; pag++){
      let res = await fetch(`${environment.apiUrl}/api/collections/DestinatarioXCliente/records?filter=(cliente ~'${id_cliente}')&perPage=200&page=${pag}&skipTotal=true`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      dxc = dxc.concat(data.items)
    }
    for(let i = 0;i<dxc.length;i++){
      
      
      let item = dxc[i]
      if(item.destinatario===""){
        continue
      }
      let res = await fetch(`${environment.apiUrl}/api/collections/Destinatario/records/${item.destinatario}`,{
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      destinatarios.push(data)
    }
    destinatarios.sort((d1,d2)=>d1.nombre<d2.nombre?-1:1)
    return destinatarios
  }
  getDestinatariosCliente(id_cliente: string): Observable<DestinatarioData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/DestinatarioXCliente/records?skipTotal=true&expand=destinatario&fields=expand.destinatario.id,expand.destinatario.nombre&filter=cliente='${id_cliente}'&perPage=200`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items.map(item => ({
        id: item.expand.destinatario.id,
        nombre: item.expand.destinatario.nombre
      })) as DestinatarioData[])
    );
  }
  
  getResponsables(): Observable<UsuarioData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Responsable/records?skipTotal=true&filter=active=true`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as UsuarioData[])
    );
  }
  getFormaPagos(): Observable<FormaPagoData[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/FormaPago/records?skipTotal=true&filter=active=true`, {
      headers: { 'Authorization': this.token }
    }).pipe(
      map(response => response.items as FormaPagoData[])
    );
  }
  getLocalidadDestinatario(destinatarioId:string){
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Destinatario/records/${destinatarioId}?expand=localidad`,{
      headers: { 'Authorization': this.token }
    })
  }
  getTodasUnidades(){
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/unidad/records?filter=(active=true)&perPage=200&page=1`)
  }
  getTodosUsuarios(){
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/users/records?&perPage=200&page=1&sort=-username`)
  }
  // cuentas empresa
  getCuentas(){
    return [
      {id:"JUAREZ",nombre:"JUAREZ"},
      {id:"SAS",nombre:"SAS"},
      {id:"EFECTIVO",nombre:"EFECTIVO"},
    ]
  }
  //cobros
  getTipoCobro(){
    return [
      {id:0,nombre:"Flujo"},
      {id:1,nombre:"Transferencia"},
      {id:2,nombre:"Transaccion"},
    ]
  }
  getRetenciones(){
    return [
      {id:"IIBB"},
      {id:"SUSS"},
      {id:"GCIA"},
      {id:"IVA"},
      {id:"MUNI"},
      {id:"DESCUENTOS"},
      {id:"OTROS"}
    ]
  }
  // bancos
  getBancos(perPage: number, page: number, nombre: string){
      return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Banco/records?page=${page}&perPage=${perPage}&filter=(active=true %26%26  nombre ~ '${nombre}' )&sort=nombre`, {
        headers: { 'Authorization': this.token }
      })
  }
  async getAllBancos(){
    let bancos = []
    let url_b = `${environment.apiUrl}/api/collections/Banco/records?filter=(active=True)`
    let res_b = await fetch(url_b,{
      headers:{'Authorization': this.token }
    })
    let data_b = await res_b.json()
    let paginas = Math.floor(data_b.totalItems/200) + 1
    
    for(let pag = 1;pag<=paginas;pag++){
      let url = `${environment.apiUrl}/api/collections/Banco/records?filter=(active=True)&perPage=200&page=${pag}&skipTotal=true`
      let res = await fetch(url,{
        headers: { 'Authorization': this.token }
      })
      
      let data = await res.json()
      
      bancos = bancos.concat(data.items)
    }
    return bancos
  }
  //String utiñ
  formatPeso(value) {
    if (value) {
      return value.toLocaleString('es-ar', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      });
    }
    else {
      return (0).toLocaleString('es-ar', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      });
    }

  }
  formatKilo(value){
    return new Intl.NumberFormat("es-ar", {
      style: "decimal",
      maximumFractionDigits: 3, minimumFractionDigits: 2
    }).format(value);
  }
  redondear(value){

    let ans = Math.round(value * 1000)/1000

    return ans
  }
  getEstadosHR(){
    return [{id:0,nombre:"Abierto"},{id:1,nombre:"Cerrada"},{id:2,nombre:"Pagada"}]
    //return [{id:0,nombre:"Abierto"},{id:1,nombre:"Fin"},{id:2,nombre:"Cobrado"},{id:3,nombre:"Entrega parcial"},{id:4,nombre:"Entrega Total"}]
  }
  getPrioridades(){
    return [{id:0,nombre:"Normal"},{id:1,nombre:"Alta"}]
  }
  getAnulado(){
    return "agoikfjwgyieauf"
  }
  getRandomId(length=10){
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    let str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
  }
  esUndefined(valor){
    return valor === undefined || valor === null
  }
  tiposAsiento(){
    return [
      {id:"fact",nombre:"Factura"},
      {id:"orden",nombre:"Orden pago"},
      {id:"cobro",nombre:"Cobro"},
      {id:"pago",nombre:"Pago"},
      {id:"nota",nombre:"Nota crédito"}
    ]
  }
  razonesAsiento(){
    return [
      {id:"fact",nombre:"Factura"},
      {id:"correfact",nombre:"CorrFactura"},
      {id:"orden",nombre:"Orden pago"},
      {id:"cobro",nombre:"Cobro"},
      {id:"pago",nombre:"Pago"},
      {id:"nota",nombre:"Nota crédito"}
    ]
  }
}