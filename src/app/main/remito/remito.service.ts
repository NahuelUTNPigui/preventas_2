import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthenticationService } from 'app/auth/service';
import { RemitoData } from './model/remito-model';
import { EstadoData } from '../cruds/estado/model/estado-model';
import { SelectFormatService } from '../common';
import { RemitoStateService } from '../common/services/remito-state.service';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class RemitoService implements Resolve<any> {
  rows: any;
  onRemitoChanged: BehaviorSubject<any>;
  token: string = ''
  estados: EstadoData[]
  ultimoRemito: RemitoData
  pendienteID: string
  responsable: string
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient, private _selectFormatService: SelectFormatService, private remitoStateService: RemitoStateService) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || "{}");
    if (currentUser && currentUser.role === 'User') {
      this.responsable = currentUser.record.id;
    }
    // Set the defaults

    this.token = JSON.parse(localStorage.getItem('currentUser') || "{}").token;

    this.onRemitoChanged = new BehaviorSubject({});
    this._selectFormatService.getEstados().subscribe(estados => {
      this.estados = estados;
      const estadoPendiente = estados.find((estado) => estado.nombre === 'Pendiente');
      if (estadoPendiente) {
        this.pendienteID = estadoPendiente.id;
      }
    });
    this.remitoStateService.obtenerUltimoRemitoSeleccionado().subscribe(ultimoRemito => {
      this.ultimoRemito = ultimoRemito
    });

  }
  private registrarHistorial(remitoId: string, remitoData: any): Observable<any> {
    return this._httpClient.post(`${environment.apiUrl}/api/collections/HistorialRemito/records`, { remito: remitoId, ...remitoData, id: null, modifiedBy: this.responsable }, { headers: { 'Authorization': this.token } });
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
      this._httpClient.get(`${environment.apiUrl}/api/collections/Remito/records`).subscribe((response: any) => {
        this.rows = response;
        this.onRemitoChanged.next(this.rows);
        resolve(this.rows);
      }, reject);
    });
  }
  //id de hoja de ruta
  async getHRMaxId() {
    let res = await fetch(`${environment.apiUrl}/api/collections/CodigoHR/records`, {
      headers: { 'Authorization': this.token }
    })
    let data = await res.json()
    return data.items[0]
  }
  async updateHRMaxId(maximo, id) {

    let res = await fetch(`${environment.apiUrl}/api/collections/CodigoHR/records/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maximo })
    })

    let data = await res.json()

    return data

  }
  getRemitosSimple(perPage: number, page: number, nroRemito: string, estadoId: string, fechaInicio: string, fechaFin: string, cliente: string) {

    let estadoFilter = estadoId ? `%26%26 estado='${estadoId}'` : '';
    let fechaInicioFilter = fechaInicio ? `%26%26 fechaIngreso>='${fechaInicio}'` : '';
    let fechaFinFilter = fechaFin ? `%26%26 fechaIngreso<='${fechaFin}'` : '';

    let filtrocampos = ``
    filtrocampos = `(nroRemito~'${nroRemito}' %26%26 cliente.nombre~'${cliente}')`
    let filter = `${filtrocampos} ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter} `
    let ruta = `${environment.apiUrl}/api/collections/Remito/records?sort=-created&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado,hojaruta&page=${page}&perPage=${perPage}&filter=${filter} %26%26 active=true`
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitos", []))
    )
  }
  getRemitos(perPage: number, page: number, filtro: string, estadoId: string, fechaInicio: string, fechaFin: string, fechaEntrega: string, selectedFiltroOption: string, valores: any, etiqueta = "") {
    let fechaEntregaDesde = fechaEntrega + " 00:00:01.000Z"
    let fechaEntregaHasta = fechaEntrega + " 23:59:01.000Z"
    let estadoFilter = estadoId ? `%26%26 estado='${estadoId}'` : '';
    let fechaInicioFilter = fechaInicio ? `%26%26 fechaIngreso>='${fechaInicio}'` : '';
    let fechaFinFilter = fechaFin ? `%26%26 fechaIngreso<='${fechaFin}'` : '';
    let fechaEntregaFilter = fechaEntrega ? `%26%26 fechaEntrega<='${fechaEntregaHasta}'%26%26 fechaEntrega !=''%26%26 fechaEntrega>='${fechaEntregaDesde}'` : '';
    let etiquetaFilter = `%26%26 etiqueta~'${etiqueta}'`
    let filtrocampos = ``
    if (selectedFiltroOption != "") {
      if (selectedFiltroOption == "nro") {
        filtrocampos = `(nroRemito ~ '${valores.nro}')`
      }
      else if (selectedFiltroOption == "destinatario") {
        filtrocampos = `(destinatario.nombre~'${valores.destinatario}')`
      }
      else if (selectedFiltroOption == "localidad") {
        filtrocampos = `(destinatario.localidad.nombre~'${valores.localidad}')`
      }
      else if (selectedFiltroOption == "cliente") {
        filtrocampos = `(cliente.nombre~'${valores.cliente}')`
      }
      else if (selectedFiltroOption == "proveedor") {
        filtrocampos = `(proveedor.nombre~'${valores.proveedor}')`
      }
      else if (selectedFiltroOption == 'zona') {
        filtrocampos = `(destinatario.zona='${valores.zona}')`
      }
      else if (selectedFiltroOption == 'hr') {
        filtrocampos = `(hojaruta.codigo~'${valores.hojaruta}')`
      }


    }
    else {
      filtrocampos = `(nroRemito~'${filtro}' %7C%7C cliente.nombre~'${filtro}' %7C%7C remitente.nombre~'${filtro}' %7C%7C destinatario.nombre~'${filtro}' %7C%7C proveedor.nombre~'${filtro}' %7C%7C destinatario.localidad.nombre~'${filtro}')`
    }
    let filter = `${filtrocampos} ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter} ${fechaEntregaFilter}`
    if (etiqueta != "") {
      filter += etiquetaFilter
    }
    let ruta = `${environment.apiUrl}/api/collections/Remito/records?sort=-created&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado,hojaruta&page=${page}&perPage=${perPage}&filter=${filter} %26%26 active=true`
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitos", []))
    )
  }
  getRemitosPreventas(perPage: number, page: number, cliente: string, destinatario: string, remitente: string, estadoId: string, fechaInicio: string, fechaFin: string, opcionFacturar: string, skiptotal = false, nro = "") {

    let estadoFilter = estadoId && estadoId.length > 0 ? `%26%26 estado='${estadoId}'` : '';
    let fechaInicioFilter = fechaInicio && fechaInicio.length > 0 ? `%26%26 fechaIngreso>='${fechaInicio}'` : '';
    let fechaFinFilter = fechaFin && fechaFin.length > 0 ? `%26%26 fechaIngreso<='${fechaFin}'` : '';


    let filtrocampos = `(active = true`
    if (nro != "") {
      filtrocampos += ` %26%26 nroRemito ~ '${nro}'`
    }
    if (destinatario != "") {
      filtrocampos += ` %26%26 destinatario.nombre~'${destinatario}'`
    }
    if (remitente != "") {
      filtrocampos += ` %26%26 remitente.nombre~'${remitente}'`
    }
    if (cliente != "") {
      filtrocampos += ` %26%26 cliente~'${cliente}'`
    }
    if (opcionFacturar != "") {
      if (opcionFacturar == "sin") {
        filtrocampos += ` %26%26 factura=''`
      }
      else {
        filtrocampos += ` %26%26 factura !=''`
      }
    }

    let filter = `${filtrocampos} ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter} )`

    let ruta = `${environment.apiUrl}/api/collections/Remito/records?sort=-created&expand=cliente,remitente,destinatario,destinatario.localidad,responsable,estado&page=${page}&perPage=${perPage}&filter=${filter}${skiptotal ? " & skipTotal=true " : ""}`
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitos", []))
    )
  }
  async getRemitosPreventasTotal(cliente: string, destinatario: string, remitente: string, estadoId: string, fechaInicio: string, fechaFin: string, nro = "") {
    let estadoFilter = estadoId && estadoId.length > 0 ? `%26%26 estado='${estadoId}'` : '';
    let fechaInicioFilter = fechaInicio && fechaInicio.length > 0 ? `%26%26 fechaIngreso>='${fechaInicio}'` : '';
    let fechaFinFilter = fechaFin && fechaFin.length > 0 ? `%26%26 fechaIngreso<='${fechaFin}'` : '';


    let filtrocampos = `(active = true`
    if (nro != "") {
      filtrocampos += ` %26%26 nroRemito ~ '${nro}'`
    }
    if (destinatario != "") {
      filtrocampos += ` %26%26 destinatario.nombre~'${destinatario}'`
    }
    if (remitente != "") {
      filtrocampos += ` %26%26 remitente.nombre~'${remitente}'`
    }
    if (cliente != "") {
      filtrocampos += ` %26%26 cliente~'${cliente}'`
    }

    let filter = `${filtrocampos} ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter} )`
    let totales = { valor: 0, peso: 0 }
    let res_rem = await fetch(`${environment.apiUrl}/api/collections/Remito/records?sort=-created&expand=cliente,remitente,destinatario,destinatario.localidad,estado&filter=${filter}`, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_rem.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Remito/records?sort=-created&perPage=200&page=${pag}&expand=cliente,remitente,destinatario,destinatario.localidad,estado&skipTotal=true&filter=${filter}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      for (let i = 0; i < data.items.length; i++) {
        totales.valor += data.items[i].totalViaje
        totales.peso += data.items[i].kilos
      }

    }
    return totales
  }
  async getHojaRuta(id: string) {
    let reshr = await fetch(`${environment.apiUrl}/api/collections/HojaRuta/records/${id}`, {
      headers: { 'Authorization': this.token }
    })
    let hr = await reshr.json()
    return hr

  }
  async getRemitosSkipTotal(filtro: string, estadoId: string, fechaInicio: string, fechaFin: string, fechaEntrega: string) {
    let fechaEntregaDesde = fechaEntrega + " 00:00:01.000Z"
    let fechaEntregaHasta = fechaEntrega + " 23:59:01.000Z"
    let estadoFilter = estadoId ? `%26%26 estado='${estadoId}'` : '';
    let fechaInicioFilter = fechaInicio ? `%26%26 fechaIngreso>='${fechaInicio}'` : '';
    let fechaFinFilter = fechaFin ? `%26%26 fechaIngreso<='${fechaFin}'` : '';
    let fechaEntregaFilter = fechaEntrega ? `%26%26 fechaEntrega<='${fechaEntregaHasta}'%26%26 fechaEntrega !=''%26%26 fechaEntrega>='${fechaEntregaDesde}'` : '';
    let remitos = []
    let res_rem = await fetch(`${environment.apiUrl}/api/collections/Remito/records?sort=-created&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado&filter=(nroRemito~'${filtro}' %7C%7C cliente.nombre~'${filtro}' %7C%7C remitente.nombre~'${filtro}' %7C%7C destinatario.nombre~'${filtro}' %7C%7C proveedor.nombre~'${filtro}' %7C%7C destinatario.localidad.nombre~'${filtro}') ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter} ${fechaEntregaFilter} %26%26 active=true`, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_rem.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Remito/records?sort=-created&perPage=200&page=${pag}&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado&skipTotal=true&filter=(nroRemito~'${filtro}' %7C%7C cliente.nombre~'${filtro}' %7C%7C remitente.nombre~'${filtro}' %7C%7C destinatario.nombre~'${filtro}' %7C%7C proveedor.nombre~'${filtro}' %7C%7C destinatario.localidad.nombre~'${filtro}') ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter} ${fechaEntregaFilter} %26%26 active=true`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      remitos = remitos.concat(data.items)
    }
    return remitos
  }
  async getTotales(filtro: string, estadoId: string, fechaInicio: string, fechaFin: string, fechaEntrega: string) {
    let fechaEntregaDesde = fechaEntrega + " 00:00:01.000Z"
    let fechaEntregaHasta = fechaEntrega + " 23:59:01.000Z"
    let estadoFilter = estadoId ? `%26%26 estado='${estadoId}'` : '';
    let fechaInicioFilter = fechaInicio ? `%26%26 fechaIngreso>='${fechaInicio}'` : '';
    let fechaFinFilter = fechaFin ? `%26%26 fechaIngreso<='${fechaFin}'` : '';
    let fechaEntregaFilter = fechaEntrega ? `%26%26 fechaEntrega<='${fechaEntregaHasta}'%26%26 fechaEntrega !=''%26%26 fechaEntrega>='${fechaEntregaDesde}'` : '';

    let totales = { valor: 0, peso: 0 }
    let res_rem = await fetch(`${environment.apiUrl}/api/collections/Remito/records?sort=-created&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado&filter=(nroRemito~'${filtro}' %7C%7C cliente.nombre~'${filtro}' %7C%7C remitente.nombre~'${filtro}' %7C%7C destinatario.nombre~'${filtro}' %7C%7C proveedor.nombre~'${filtro}' %7C%7C destinatario.localidad.nombre~'${filtro}') ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter} ${fechaEntregaFilter} %26%26 active=true`, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_rem.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/Remito/records?sort=-created&perPage=200&page=${pag}&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado&skipTotal=true&filter=(nroRemito~'${filtro}' %7C%7C cliente.nombre~'${filtro}' %7C%7C remitente.nombre~'${filtro}' %7C%7C destinatario.nombre~'${filtro}' %7C%7C proveedor.nombre~'${filtro}' %7C%7C destinatario.localidad.nombre~'${filtro}') ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter} ${fechaEntregaFilter} %26%26 active=true`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      for (let i = 0; i < data.items.length; i++) {
        totales.valor += data.items[i].totalViaje
        totales.peso += data.items[i].kilos
      }

    }
    return totales
  }
  getRemito(id: string) {
    const url = `${environment.apiUrl}/api/collections/Remito/records/${id}?expand=cliente,remitente,localidad,destinatario,proveedor,chofer,vehiculo,formaPago,estado`;
    return this._httpClient.get<RemitoData>(url, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<RemitoData>("", null))
    );
  }
  getHistorialRemito(id: string, perPage: number, page: number, filtro: string, estadoId: string, fechaInicio: string, fechaFin: string) {
    let estadoFilter = estadoId ? `%26%26 estado='${estadoId}'` : '';
    let fechaInicioFilter = fechaInicio ? `%26%26 created>='${fechaInicio}'` : '';
    let fechaFinFilter = fechaFin ? `%26%26 created<='${fechaFin}'` : '';

    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/HistorialRemito/records?sort=-created&expand=cliente,remitente,destinatario,proveedor,chofer,vehiculo,responsable,modifiedBy,estado&page=${page}&perPage=${perPage}&filter=(nroRemito~'${filtro}' %7C%7C id~'${filtro}' %7C%7C cliente.nombre~'${filtro}' %7C%7C remitente.nombre~'${filtro}' %7C%7C destinatario.nombre~'${filtro}' %7C%7C proveedor.nombre~'${filtro}' %7C%7C destinatario.localidad.nombre~'${filtro}') ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter}  %26%26 remito='${id}'`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitentes", []))
    )
  }
  postRemito(remito: RemitoData) {
    return this._httpClient
      .post(`${environment.apiUrl}/api/collections/Remito/records`,
        { ...remito, active: true },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap((response: any) => {
          this.registrarHistorial(response.id, { operacion: 'crear', ...remito }).subscribe();
        })
      );
  }

  putRemito(id: string, remito: RemitoData, operacion: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { ...remito },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: operacion ?? 'actualizar', ...remito }).subscribe();
        })
      );
  }
  getDeletedRemitos(perPage: number, page: number, filtro: string, estadoId: string, fechaInicio: string, fechaFin: string) {
    let estadoFilter = estadoId ? `%26%26 estado='${estadoId}'` : '';
    let fechaInicioFilter = fechaInicio ? `%26%26 fechaIngreso>='${fechaInicio}'` : '';
    let fechaFinFilter = fechaFin ? `%26%26 fechaIngreso<='${fechaFin}'` : '';

    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Remito/records?sort=-created&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado&page=${page}&perPage=${perPage}&filter=(nroRemito~'${filtro}' %7C%7C cliente.nombre~'${filtro}' %7C%7C remitente.nombre~'${filtro}' %7C%7C destinatario.nombre~'${filtro}' %7C%7C proveedor.nombre~'${filtro}' %7C%7C destinatario.localidad.nombre~'${filtro}') ${estadoFilter} ${fechaInicioFilter} ${fechaFinFilter} %26%26 active=false`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get deleted remitos", []))
    )
  }
  restoreRemito(id: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { active: true },
        { headers: { 'Authorization': this.token } }
      )
  }
  deleteRemito(id: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { active: false },
        { headers: { 'Authorization': this.token } }
      )
  }

  cancelRemito(id: string, observacion: string, novedad: string) {

    const canceladoId = this.estados.find((estado) => estado.nombre === 'Cancelado').id;

    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { estado: canceladoId, observacion, novedad },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: 'cancelar', ...this.ultimoRemito, estado: canceladoId, observacion, novedad }).subscribe();
        })
      );
  }
  anularRemito(id: string, observacion: string, novedad: string) {

    const anuladoId = this.estados.find((estado) => estado.nombre === 'Anulado').id;

    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { estado: anuladoId, observacion, novedad },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: 'Anular', ...this.ultimoRemito, estado: anuladoId, observacion, novedad }).subscribe();
        })
      );
  }
  deliverRemito(id: string, observacion: string, novedad: string, deliverConformado: boolean) {

    const entregadoId = this.estados.find((estado) => estado.nombre === 'Entregado').id;
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { estado: entregadoId, observacion, novedad, confirmado: deliverConformado },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: 'entregar', ...this.ultimoRemito, estado: entregadoId, observacion, novedad }).subscribe();
        })
      );
  }
  rejectRemito(id: string, observacion: string, novedad: string) {
    const rechazadoId = this.estados.find((estado) => estado.nombre === 'Rechazado').id;
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { estado: rechazadoId, observacion, novedad },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: 'rechazar', ...this.ultimoRemito, estado: rechazadoId, observacion, novedad }).subscribe();
        })
      );
  }
  relocateRemito(id: string, observacion: string, novedad: string) {
    const pendienteId = this.estados.find((estado) => estado.nombre === 'Pendiente').id;
    if (!pendienteId) {
      throw new Error('ID del estado pendiente no encontrado');
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { estado: pendienteId, reubicado: true, fechaEntrega: '', proveedor: null, vehiculo: null, chofer: null, novedad, observacion },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: 'reubicar', ...this.ultimoRemito, estado: pendienteId, reubicado: true, fechaEntrega: '', proveedor: null, vehiculo: null, chofer: null, novedad, observacion }).subscribe();
        })
      );
  }

  postHR(
    codigo: string,
    proveedor: string,
    chofer: string,
    vehiculo: string,
    estado: number,
    totalclientes: number,
    totalproveedor: number,
    fechaentrega: string,
    fechafin: string
  ) {
    let data = {
      codigo,
      chofer,
      estado,
      vehiculo,
      proveedor,
      totalclientes,
      totalproveedor,
      fechafin,
      fechaentrega: fechaentrega + " 03:00:00"
    }

    return this._httpClient
      .post(`${environment.apiUrl}/api/collections/HojaRuta/records`,
        data,
        { headers: { 'Authorization': this.token } }
      )
  }
  async postHRCodigo(
    codigo: string,
    proveedor: string,
    chofer: string,
    vehiculo: string,
    estado: number,
    totalclientes: number,
    totalproveedor: number,
    fechaentrega: string,
    fechafin: string,
    primeravuelta = false
  ) {

    let data = {
      codigo,
      chofer,
      estado,
      vehiculo,
      proveedor,
      totalclientes,
      totalproveedor,
      fechafin,
      fechaentrega: fechaentrega + " 03:00:00",
      primeravuelta
    }


    let resrecordhr = await fetch(`${environment.apiUrl}/api/collections/HojaRuta/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    let recordhr = await resrecordhr.json()
    return recordhr
  }
  async editarFechaEntregaHR(id: string, fecha: string, remitos: any[]) {
    let datahr = {
      fechaentrega: fecha + " 03:00:00"
    }
    let datare = {
      fechaEntrega: fecha + " 03:00:00"
    }
    let res = await fetch(`${environment.apiUrl}/api/collections/HojaRuta/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, "Content-Type": "application/json" },
      body: JSON.stringify(datahr)
    })
    let res_json = await res.json()
    for (let i = 0; i < remitos.length; i++) {
      let r = remitos[i]
      await fetch(`${environment.apiUrl}/api/collections/Remito/records/${r.id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify(datare)
      })

    }

  }
  putSimpleHR(id, codigo, totalproveedor, primeravuelta, proveedor, vehiculo, chofer, fechaEntrega) {
    let data = {
      codigo,
      totalproveedor,
      primeravuelta,
      fechaentrega: fechaEntrega + " 03:00:00",
      proveedor,
      vehiculo,
      chofer
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/HojaRuta/records/${id}`,
        data,
        { headers: { 'Authorization': this.token } }
      )
  }
  putHR(
    id: string,
    codigo: string,
    proveedor: string,
    chofer: string,
    vehiculo: string,
    estado: number,
    totalclientes: number,
    totalproveedor: number,
    fechafin: string
  ): Observable<any> {
    let data = {
      codigo,
      chofer,
      estado,
      vehiculo,
      proveedor,
      totalclientes,
      totalproveedor,
      fechafin
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/HojaRuta/records/${id}`,
        data,
        { headers: { 'Authorization': this.token } }
      )
  }
  
  confirmRemito(id: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { confirmado: true },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: 'conformado', ...this.ultimoRemito, confirmado: true }).subscribe();
        })
      );
  }
  desconfirmRemito(id: string) {
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { confirmado: false },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: 'conformado', ...this.ultimoRemito, confirmado: false }).subscribe();
        })
      );
  }
  removeRemitoHR(id: string, novedad: string, observacion: string, hr: string) {
    const pendienteId = this.estados.find((estado) => estado.nombre === 'Pendiente').id;
    if (!pendienteId) {
      throw new Error('ID del estado pendiente no encontrado');
    }
    let reubicado = false
    if (novedad != '' && observacion != '') {
      reubicado = true
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/Remito/records/${id}`,
        { estado: pendienteId, fechaEntrega: '', reubicado, proveedor: null, vehiculo: null, chofer: null, novedad, observacion, hojaruta: "" },
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap(() => {
          this.registrarHistorial(id, { operacion: 'quitar de hoja de ruta', ...this.ultimoRemito, estado: pendienteId, fechaEntrega: '', reubicado: false, proveedor: null, vehiculo: null, chofer: null, novedad, observacion }).subscribe();
        })
      ).pipe(
        tap(() => {

          let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?page=1&perPage=1&filter=(hojaruta~'${hr}' %26%26 active=true)`
          this._httpClient.get<any>(rutacompleta, { headers: { 'Authorization': this.token } }).subscribe(res => {
            if (res.totalItems == 0) {
              let rutaeliminar = `${environment.apiUrl}/api/collections/HojaRuta/records/${hr}`
              this._httpClient.delete<any>(rutaeliminar, { headers: { 'Authorization': this.token } }).subscribe(res => { })

            }
          })
        })
      );
  }
  getRemitoXNro(nro: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Remito/records?page=1&perPage=1&filter=(nroRemito='${nro}' %26%26 active=true)`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitos", []))
    )
  }
  getRemitosXHR(idhr: string, perPage: number, page: number) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Remito/records?page=${page}&perPage=${perPage}&filter=(hojaruta='${idhr}' %26%26 active=true)`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitos", []))
    )
  }
  getRemitoXNroCliente(nro: string, cliente: string) {

    if (cliente == "") {
      return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Remito/records?page=1&perPage=1&filter=(nroRemito='${nro}' %26%26 active=true)`, {
        headers: { 'Authorization': this.token }
      }
      ).pipe(
        catchError(this.handleError<any>("get remitos", []))
      )
    }
    else {
      return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/Remito/records?page=1&perPage=1&filter=(nroRemito='${nro}' %26%26 cliente='${cliente}' %26%26 active=true)`, {
        headers: { 'Authorization': this.token }
      }
      ).pipe(
        catchError(this.handleError<any>("get remitos", []))
      )
    }

  }
  duplicarRemito(remito: RemitoData, facturarOriginal: boolean, reubicadoOriginal: boolean) {
    let nuevoremito = { ...remito, active: true }

    nuevoremito.proveedor = ''
    nuevoremito.chofer = ''
    nuevoremito.vehiculo = ''
    nuevoremito.fechaEntrega = null
    nuevoremito.observacion = ''
    nuevoremito.novedad = ''
    nuevoremito.confirmado = false
    nuevoremito.reubicado = reubicadoOriginal
    nuevoremito.estado = this.pendienteID
    nuevoremito.id = null

    return this._httpClient
      .post(`${environment.apiUrl}/api/collections/Remito/records`,
        nuevoremito,
        { headers: { 'Authorization': this.token } }
      )
      .pipe(
        tap((response: any) => {
          this.registrarHistorial(response.id, { operacion: 'crear', ...remito }).subscribe();
        })

      )
      .pipe(
        tap((response) => {
          let data = {
            facturar: facturarOriginal
          }
          this._httpClient.patch(`${environment.apiUrl}/api/collections/Remito/records/${remito.id}`, data,
            { headers: { 'Authorization': this.token } }
          ).subscribe()
        })
      )
      .pipe(
        tap(resp => {
          this.registrarHistorial(remito.id, { operacion: 'duplicar', ...remito }).subscribe();
        })

      )
  }


  getTarifarioCliente(cliente: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/tarifariocliente/records?perPage=${200}&page=${1}&filter=(active=true %26%26 cliente = '${cliente}')&expand=cliente,unidad`, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("get tarifiario cliente nombre", []))
      )
  }
  getTarifarioProveedor(proveedor: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/tarifarioproveedor/records?perPage=${200}&page=${1}&filter=(active=true %26%26 proveedor = '${proveedor}')&expand=proveedor,unidad`, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("get tarifiario proveedor nombre", []))
      )
  }
  async getTarifarioClienteCompleto(cliente: string) {
    let tarifario = []
    let res_d = await fetch(environment.apiUrl + "/api/collections/tarifariocliente/records?filter=(active=true %26%26 cliente = '" + cliente + "' )&page=1&perPage=1", { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(environment.apiUrl + "/api/collections/tarifariocliente/records?filter=(active=true %26%26 cliente = '" + cliente + "' )&page=" + pag + '&perPage=200&expand=cliente,unidad&skipTotal=true', { headers: { 'Authorization': this.token } })
      let data = await res.json()
      tarifario = tarifario.concat(data.items)
    }
    tarifario.sort((p1, p2) => p1.fechadesde.toLowerCase() > p2.fechadesde.toLowerCase() ? -1 : 1)
    return tarifario
  }
  calcularTarifarioClienteVigente(tarifariocompleto, fecharemito = "") {
    let tarifario = []
    let tarifariomap = {}
    let f_remito = new Date(fecharemito)
    for (let i = 0; i < tarifariocompleto.length; i++) {
      let fila = tarifariocompleto[i]
      let fechadesde = new Date(fila.fechadesde)
      let fechahasta = new Date(fila.fechahasta)
      
      if(fila.oculto){
        continue
      }
      if (fecharemito != "") {
        
        //Deve ser el camino negativo -> !(fechadesde<=fecharemito<=fechahasta)
        if (f_remito < fechadesde || f_remito>fechahasta) {
          continue
        }
      }
      if (tarifariomap[fila.expand.unidad.nombre]) {
        if (!tarifariomap[fila.expand.unidad.nombre][fila.descripcion]) {
          tarifario.push(fila)
          tarifariomap[fila.expand.unidad.nombre][fila.descripcion] = { fila }
        }
      }
      else {
        tarifariomap[fila.expand.unidad.nombre] = {}
        tarifariomap[fila.expand.unidad.nombre][fila.descripcion] = {
          fila
        }
        tarifario.push(fila)
      }
    }
    return tarifario
  }
  async getTarifarioClienteVigente(cliente, fecharemito = "") {
    let tarifariocompleto = await this.getTarifarioClienteCompleto(cliente)
    let tarifario = this.calcularTarifarioClienteVigente(tarifariocompleto, fecharemito)
    return tarifario
  }
  calcularTarifarioProveedorVigente(tarifariocompleto, fechahoja = "") {
    let tarifario = []
    let tarifariomap = {}
    let h_fecha = new Date(fechahoja)
    for (let i = 0; i < tarifariocompleto.length; i++) {
      let fila = tarifariocompleto[i]
      let fechadesde = new Date(fila.fechadesde)
      let fechahasta = new Date(fila.fechahasta)
      if(fila.oculto){
        continue
      }
      if (fechahoja != "") {
        if (h_fecha < fechadesde || h_fecha>fechahasta) {
          continue
        }
      }
      if (tarifariomap[fila.expand.unidad.nombre]) {
        if (!tarifariomap[fila.expand.unidad.nombre][fila.descripcion]) {
          tarifario.push(fila)
          tarifariomap[fila.expand.unidad.nombre][fila.descripcion] = { fila }
        }
      }
      else {
        tarifariomap[fila.expand.unidad.nombre] = {}
        tarifariomap[fila.expand.unidad.nombre][fila.descripcion] = {
          fila
        }
        tarifario.push(fila)
      }
    }
    return tarifario
  }
  async getTarifarioProveedorCompleto(proveedor: string) {
    let tarifario = []
    let res_d = await fetch(environment.apiUrl + "/api/collections/tarifarioproveedor/records?filter=(active=true %26%26 proveedor = '" + proveedor + "' )&page=1&perPage=1", { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(environment.apiUrl + "/api/collections/tarifarioproveedor/records?filter=(active=true %26%26 proveedor = '" + proveedor + "' )&page=" + pag + '&perPage=200&expand=proveedor,unidad&skipTotal=true', { headers: { 'Authorization': this.token } })
      let data = await res.json()
      tarifario = tarifario.concat(data.items)
    }
    tarifario.sort((p1, p2) => p1.fechadesde.toLowerCase() > p2.fechadesde.toLowerCase() ? -1 : 1)
    return tarifario

  }
  async getTarifarioProveedorVigente(proveedor, fechahoja = "") {
    let tarifariocompleto = await this.getTarifarioProveedorCompleto(proveedor)
    let tarifario = this.calcularTarifarioProveedorVigente(tarifariocompleto, fechahoja)
    return tarifario
  }
  getEstadosHR() {
    return [
      { id: 0, nombre: "En tránsito" },
      { id: 1, nombre: "Entrega parcial" },
      { id: 2, nombre: "Entrega total" },
      { id: 3, nombre: "Fin" },
      { id: 4, nombre: "Cobrado" }

    ]

  }
  getHR(
    perPage: number, page: number, skipTotal: boolean,
    nro: string,
    fechadesde: string,
    fechahasta: string,
    fechafindesde: string,
    fechafinhasta: string,
    estado: number,
    proveedor: string,
    vehiculo: string,
    chofer: string,
    confechafin: boolean,
    conorden: number

  ) {
    let filter = ""
    let y = "%26%26"
    let expand = "proveedor,chofer,vehiculo"
    filter += ` codigo ~ '${nro}' `
    if (fechadesde != "") {
      filter += ` ${y} fechaentrega > '${fechadesde}' `
    }
    if (fechahasta != "") {
      filter += ` ${y} fechaentrega < '${fechahasta}' `
    }
    if (confechafin && fechafindesde != "") {
      filter += ` ${y} fechafin > '${fechafindesde}' `
    }
    if (confechafin && fechafinhasta != "") {
      filter += ` ${y} fechafin < '${fechafinhasta}' `
    }
    if (proveedor != "") {
      filter += ` ${y} proveedor.nombre ~ '${proveedor}'`
    }
    if (vehiculo != "") {
      filter += ` ${y} vehiculo.nombre ~ '${vehiculo}'`
    }
    if (chofer != "") {
      filter += ` ${y} chofer.nombre ~ '${chofer}'`
    }
    if (estado != -1) {
      filter += ` ${y} estado = ${estado} `
    }
    if (conorden != -1) {
      if (conorden == 1) {
        filter += ` ${y} pago != '' `
      }
      else {
        filter += ` ${y} pago = '' `
      }
    }
    let rutacompleta = `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=${perPage}&page=${page + 1}&filter=(${filter})&expand=${expand}&skipTotal=${skipTotal}&sort=-fechaentrega`
    return this._httpClient.get<any>(`${rutacompleta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get Hoja rutas", []))
    )
  }
  async getAllHR(
    nro: string,
    fechadesde: string,
    fechahasta: string,
    fechafindesde: string,
    fechafinhasta: string,
    estado: number,
    proveedor: string,
    vehiculo: string,
    chofer: string,
    confechafin: boolean
  ) {
    let filter = ""
    let y = "%26%26"
    let expand = "proveedor,chofer,vehiculo"
    filter += ` codigo ~ '${nro}' `
    if (fechadesde != "") {
      filter += ` ${y} fechaentrega > '${fechadesde}' `
    }
    if (fechahasta != "") {
      filter += ` ${y} fechaentrega < '${fechahasta}' `
    }
    if (confechafin && fechafindesde != "") {
      filter += ` ${y} fechafin > '${fechafindesde}' `
    }
    if (confechafin && fechafinhasta != "") {
      filter += ` ${y} fechafin < '${fechafinhasta}' `
    }
    if (proveedor != "") {
      filter += ` ${y} proveedor.nombre ~ '${proveedor}'`
    }
    if (vehiculo != "") {
      filter += ` ${y} vehiculo.nombre ~ '${vehiculo}'`
    }
    if (chofer != "") {
      filter += ` ${y} chofer.nombre ~ '${chofer}'`
    }
    if (estado != -1) {
      filter += ` ${y} estado = ${estado} `
    }
    let todoshr = []
    let f_ruta = (perPage: number, page: number, skipTotal: boolean) => `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=${perPage}&page=${page}&filter=(${filter})&expand=${expand}&skipTotal=${skipTotal}&sort=-created`
    let maxpagesize = 500
    let res_hr = await fetch(f_ruta(1, 1, false), { headers: { 'Authorization': this.token } })
    let data_hr = await res_hr.json()
    let paginas = Math.floor(data_hr.totalItems / maxpagesize) + 1

    for (let pag = 1; pag <= paginas; pag++) {
      let res = await fetch(f_ruta(maxpagesize, pag, true), { headers: { 'Authorization': this.token } })
      let data = await res.json()
      todoshr = todoshr.concat(data.items)
    }
    return todoshr
  }
  getHROrden(
    perPage: number, page: number, skipTotal: boolean,
    nro: string,
    fechadesde: string,
    fechahasta: string,
    estado: string,
    proveedor: string,
    conorden: number

  ) {
    let filter = ""
    let y = "%26%26"
    let expand = "proveedor,chofer,vehiculo"
    filter += ` codigo ~ '${nro}' `
    if (fechadesde != "") {
      filter += ` ${y} fechaentrega > '${fechadesde}' `
    }
    if (fechahasta != "") {
      filter += ` ${y} fechaentrega < '${fechahasta}' `
    }

    if (proveedor != "") {
      filter += ` ${y} proveedor ~ '${proveedor}'`
    }

    if (estado != "") {
      filter += ` ${y} estado = ${estado} `
    }
    if (conorden != -1) {
      if (conorden == 1) {
        filter += ` ${y} pago != '' `
      }
      else {
        filter += ` ${y} pago = '' `
      }
    }
    let rutacompleta = `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=${perPage}&page=${page + 1}&filter=(${filter})&expand=${expand}&skipTotal=${skipTotal}&sort=-fechaentrega`
    return this._httpClient.get<any>(`${rutacompleta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get Hoja rutas", []))
    )
  }
  getHRById(id: string) {
    return this._httpClient.get<any>(`${environment.apiUrl}/api/collections/HojaRuta/records/${id}?expand=chofer,vehiculo,proveedor`, { headers: { 'Authorization': this.token } })
      .pipe(
        catchError(this.handleError<any>("get hr por id", []))
      )
  }
  async getRemitosHR(idhr: string) {

    let res = await fetch(
      `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=1&filter=(active=true %26%26 hojaruta='${idhr}')&expand=cliente,remitente,destinatario&skipTotal=true`,
      { headers: { 'Authorization': this.token } }
    )
    let data = await res.json()
    return data.items
  }
  async detalleHR(id: string) {
    let remitos = []
    let res = await fetch(
      `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=1&filter=(active=true %26%26 hojaruta='${id}')&expand=cliente,remitente,destinatario,estado&skipTotal=true`,
      { headers: { 'Authorization': this.token } }
    )
    let data = await res.json()
    remitos = data.items
    let rutacompleta = `${environment.apiUrl}/api/collections/HojaRuta/records/${id}?expand=chofer,vehiculo,proveedor`

    let reshr = await fetch(rutacompleta,
      { headers: { 'Authorization': this.token } }
    )
    let hr = await reshr.json()
    hr.remitos = remitos
    return hr

  }
  async eliminarHR(id: string) {
    let remitos = []
    let res = await fetch(
      `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=1&filter=(active=true %26%26 hojaruta='${id}')&expand=cliente,remitente,destinatario&skipTotal=true`,
      { headers: { 'Authorization': this.token } }
    )
    let data = await res.json()
    remitos = data.items


    for (let i = 0; i < remitos.length; i++) {

      await fetch(`${environment.apiUrl}/api/collections/Remito/records/${remitos[i].id}`, {
        method: 'PATCH',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify({ estado: this.pendienteID })
      });
    }

    await fetch(`${environment.apiUrl}/api/collections/HojaRuta/records/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': this.token },
    })
  }
  agregarHR(idremito: string, hr: any) {

    let rem = {
      proveedor: hr.proveedor,
      chofer: hr.chofer,
      vehiculo: hr.vehiculo,
      estado: hr.estado,
      fechaEntrega: hr.fechaentrega,
      hojaruta: hr.id
    }
    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records/${idremito}`
    return this._httpClient.patch<any>(`${rutacompleta}`, rem, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("put rem en hr", []))
    )
  }
  cambiarTotal(id, totalproveedor) {
    let data = {
      totalproveedor
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/HojaRuta/records/${id}`,
        data,
        { headers: { 'Authorization': this.token } }
      )
  }
  async cambiarProveedores(remitos: any[], proveedor, vehiculo, chofer) {
    let data = {
      proveedor,
      vehiculo,
      chofer
    }
    for (let i = 0; i < remitos.length; i++) {
      let r = { ...remitos[i], ...data }
      let idremito = r.id
      delete r.id

      await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
        method: 'POST',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify({ ...r, remito: idremito, modifiedBy: this.responsable, operacion: "Cambiar proveedor" })
      });
      await fetch(`${environment.apiUrl}/api/collections/Remito/records/${idremito}`, {
        method: 'PATCH',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }

  }
  //Deberia modificar los remitos tambien 
  cambiarProveedor(id, proveedor, vehiculo, chofer) {
    let data = {
      proveedor,
      vehiculo,
      chofer
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/HojaRuta/records/${id}`,
        data,
        { headers: { 'Authorization': this.token } }
      )
  }
  async cambioMultiple(remitos: any[], estado: string, confirmado, observacion, novedad) {
    let data: any = {
      estado,
      confirmado
    }
    if (novedad.length > 0) {
      data.novedad = novedad
    }
    if (observacion.length > 0) {
      data.observacion = observacion
    }
    for (let i = 0; i < remitos.length; i++) {
      let r = { ...remitos[i], ...data }
      let idremito = r.id
      delete r.id

      await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
        method: 'POST',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify({ ...r, remito: idremito, operacion: "Cambio múltiple", modifiedBy: this.responsable })
      });
      await fetch(`${environment.apiUrl}/api/collections/Remito/records/${idremito}`, {
        method: 'PATCH',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  }
  async cerrarHR(idhr: string, remitos: any[]) {
    let hrdata = {
      estado: 1,
      fechafin:new Date().toISOString().split("T")[0]+" 03:00:00"
    }
    await fetch(`${environment.apiUrl}/api/collections/HojaRuta/records/${idhr}`, {
      method: 'PATCH',
      headers: { 'Authorization': this.token, "Content-Type": "application/json" },
      body: JSON.stringify(hrdata)
    });
    for (let i = 0; i < remitos.length; i++) {
      let data = { ...remitos[i] }
      let idremito = data.id
      delete data.id
      await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
        method: 'POST',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, remito: idremito, operacion: "Cerrar HR", modifiedBy: this.responsable })
      });
      await fetch(`${environment.apiUrl}/api/collections/Remito/records/${idremito}`, {
        method: 'PATCH',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  }
  crearRemito() {
    let remito = {

    }
  }
  async editarEstadoRemitos(dataEstado, remitos: any[]) {
    for (let i = 0; i < remitos.length; i++) {
      let data = { ...remitos[i] }
      let idremito = data.id
      delete data.id
      await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
        method: 'POST',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, remito: idremito, operacion: "Cerrar HR", modifiedBy: this.responsable })
      });
      await fetch(`${environment.apiUrl}/api/collections/Remito/records/${idremito}`, {
        method: 'PATCH',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify(dataEstado)
      });
    }
  }
  async editarTarifario(remitos: any[], remitosViejo: any[]) {
    for (let i = 0; i < remitos.length; i++) {
      let dataVieja = { ...remitosViejo[i] }
      let remito = remitos[i]
      let data = {
        totalViaje: remito.totalViaje,
        porcentajeCobro: remito.porcentajeCobro,
        valorDeclarado: remito.valorDeclarado,
        precioUnitario: remito.precioUnitario,
        kilos: remito.kilos,
        bultos: remito.bultos,
      }
      let idremito = remitos[i].id
      delete dataVieja.id
      await fetch(`${environment.apiUrl}/api/collections/HistorialRemito/records`, {
        method: 'POST',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify({ ...dataVieja, remito: idremito, operacion: "Cerrar HR", modifiedBy: this.responsable })
      });
      await fetch(`${environment.apiUrl}/api/collections/Remito/records/${idremito}`, {
        method: 'PATCH',
        headers: { 'Authorization': this.token, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
  }
  getRemitoPaginacionPendientes(
    perPage: number, page: number, skipTotal: boolean,
    nroRemito: string,
    fechaIngresoDesde: string,
    fechaIngresoHasta: string,
    porFechaEntrega: boolean,
    fechaEntregaDesde: string,
    fechaEntregaHasta: string,

    cliente: string,
    destinatario: string,
    remitente: string,
    provincia: string,
    localidad: string,
    estado: string,
    todoscheck: boolean,
    reubicado: boolean,
    confirmado: boolean,
    facturar: boolean
  ) {
    let y = "%26%26"
    let filter = "active = true"
    let expand = "cliente,remitente,destinatario,destinatario.localidad,destinatario.localidad.provincia,estado,responsable"

    //nroremito
    filter += ` ${y} nroRemito ~ '${nroRemito}'`

    //fechas
    if (fechaIngresoDesde != "") {
      filter += ` ${y} fechaIngreso>= '${fechaIngresoDesde}' `
    }
    if (fechaIngresoHasta != "") {
      filter += ` ${y} fechaIngreso<='${fechaIngresoHasta}' `
    }
    //filter += ` ${y} fechaIngreso>= '${fechaIngresoDesde}' ${y} fechaIngreso<='${fechaIngresoHasta}' `
    if (porFechaEntrega) {
      filter += ` ${y} fechaEntrega>= '${fechaEntregaDesde}' ${y} fechaEntrega<='${fechaEntregaHasta}' `
    }

    //Cliente
    filter += ` ${y} cliente ~'${cliente}'`
    filter += ` ${y} destinatario.nombre ~'${destinatario}'`
    filter += ` ${y} remitente.nombre ~'${remitente}'`
    // Geografia
    filter += ` ${y} destinatario.localidad.nombre ~ '${localidad}'`
    filter += ` ${y} destinatario.localidad.provincia.nombre ~ '${provincia}'`
    //Estado
    filter += ` ${y} estado~'${estado}'`


    //Estados
    if (!todoscheck) {
      if (reubicado) {
        filter += `${y} reubicado = true`
      }
      else {
        filter += `${y} reubicado = false`
      }
      if (confirmado) {
        filter += `${y} confirmado = true`
      }
      else {
        filter += `${y} confirmado = false`
      }
      if (facturar) {
        filter += `${y} facturar = true`
      }
      else {
        filter += `${y} facturar = false`
      }
    }
    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=${perPage}&page=${page + 1}&filter=(${filter})&expand=${expand}&skipTotal=${skipTotal}&sort=-fechaIngreso`

    return this._httpClient.get<any>(`${rutacompleta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitos", []))
    )
  }
  getEditRemitoPaginacion(
    perPage: number, page: number, skipTotal: boolean,
    nroRemito: string,
    fechaIngresoDesde: string,
    fechaIngresoHasta: string,
    porFechaEntrega: boolean,
    fechaEntregaDesde: string,
    fechaEntregaHasta: string,
    proveedor: string,
    vehiculo: string,
    chofer: string,
    cliente: string,
    destinatario: string,
    remitente: string,
    provincia: string,
    localidad: string,
    estado: string,
    todoscheck: boolean,
    reubicado: boolean,
    confirmado: boolean,
    facturar: boolean
  ) {
    let y = "%26%26"
    let filter = "active = true"

    let expand = "cliente,remitente,destinatario,destinatario.localidad,destinatario.localidad.provincia,estado,responsable"
    expand += ",proveedor,chofer,vehiculo"
    //nroremito
    filter += ` ${y} nroRemito ~ '${nroRemito}'`

    //fechas
    if (fechaIngresoDesde != "") {
      filter += ` ${y} fechaIngreso>= '${fechaIngresoDesde}' `
    }
    if (fechaIngresoHasta != "") {
      filter += ` ${y} fechaIngreso<='${fechaIngresoHasta}' `
    }
    //filter += ` ${y} fechaIngreso>= '${fechaIngresoDesde}' ${y} fechaIngreso<='${fechaIngresoHasta}' `
    if (porFechaEntrega) {
      filter += ` ${y} fechaEntrega>= '${fechaEntregaDesde}' ${y} fechaEntrega<='${fechaEntregaHasta}' `
    }
    filter += ` ${y} proveedor ~'${proveedor}'`
    filter += ` ${y} vehiculo.nombre ~'${vehiculo}'`
    filter += ` ${y} chofer.nombre ~'${chofer}'`
    //Cliente
    filter += ` ${y} cliente ~'${cliente}'`
    filter += ` ${y} destinatario.nombre ~'${destinatario}'`
    filter += ` ${y} remitente.nombre ~'${remitente}'`
    // Geografia
    filter += ` ${y} destinatario.localidad.nombre ~ '${localidad}'`
    filter += ` ${y} destinatario.localidad.provincia.nombre ~ '${provincia}'`
    //Estado
    filter += ` ${y} estado~'${estado}'`


    //Estados
    if (!todoscheck) {
      if (reubicado) {
        filter += `${y} reubicado = true`
      }
      else {
        filter += `${y} reubicado = false`
      }
      if (confirmado) {
        filter += `${y} confirmado = true`
      }
      else {
        filter += `${y} confirmado = false`
      }
      if (facturar) {
        filter += `${y} facturar = true`
      }
      else {
        filter += `${y} facturar = false`
      }
    }
    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=${perPage}&page=${page + 1}&filter=(${filter})&expand=${expand}&skipTotal=${skipTotal}&sort=-fechaIngreso`

    return this._httpClient.get<any>(`${rutacompleta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get remitos", []))
    )
  }
  calculaTotalHR(filter){
    let rutacompleta = `${environment.apiUrl}/api/collections/Remito/records?perPage=${200}&page=${ 1}&filter=(${filter})&skipTotal=${true}`
    return this._httpClient.get<any>(`${rutacompleta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get Hoja rutas", []))
    )
  }

}
