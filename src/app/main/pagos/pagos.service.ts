import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RemitoData } from '../remito/model/remito-model';
import { environment } from 'environments/environment';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PagosService {
  token: string;
  responsable: string
  constructor(private _httpClient: HttpClient) {
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'User') {
      this.responsable = currentUser.record.id;
    }
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(operation + ": " + error); // log to console instead
      return of(result as T);
    };
  }
  getEstadosHR() {
    return [{ id: 0, nombre: "Abierto" }, { id: 1, nombre: "Fin" }, { id: 2, nombre: "Cobrado" }]
  }
  getUnidades() {
    return [{ nombre: "SAS" }, { nombre: "JUAREZ" }, { nombre: "EFECTIVO" }]
  }
  getCategoria(nombre) {
    let tipos = [{ id: 0, nombre: "" }, { id: 1, nombre: "Cheque" }, { id: 2, nombre: "Transferencia" }, { id: 3, nombre: "Efectivo" }]
    return tipos.filter(t => t.nombre == nombre)[0].id
  }
  putHR(id, codigo, totalproveedor, primeravuelta) {
    let data = {
      codigo,
      totalproveedor,
      primeravuelta
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/HojaRuta/records/${id}`,
        data,
        { headers: { 'Authorization': this.token } }
      )
  }
  async pagar(numero, proveedor, fechapago, total, totalpagos, totaladicionales, pagos: any[], adicionales: any[], ordenes: any[]) {
    let pago = {
      numero,
      proveedor,
      fechapago: fechapago + ' 03:00:00.000Z',
      total,//El valor de las ordenes
      totalpagos,//La cantidad que te pago
      totaladicionales,//El valor de los adicionales
      activo: true
    }
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Pago/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(pago)
    })
    let data_c = await res_p.json()
    for (let i = 0; i < ordenes.length; i++) {
      let data_f = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records/${ordenes[i].id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagado: true, pago: data_c.id })
      })
    }
    for (let i = 0; i < pagos.length; i++) {
      let p = pagos[i]
      let tipo = this.getCategoria(p.categoria)
      if (tipo == 1) {
        let cheque = {
          proveedor: proveedor,
          fechaEntrega: fechapago + ' 03:00:00.000Z'
        }
        let res_che = await fetch(`${environment.apiUrl}/api/collections/Cheque/records/${p.id}`, {
          method: "PATCH",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(cheque)
        })
        let detalle = {
          pago: data_c.id,
          descripcion: p.descripcion,
          monto: p.total,
          cheque: p.id,
          tipocobro: 1
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)

        })
      }
      else if (tipo == 2) {
        let transfer = {
          fecha: p.fecha + " 03:00:00",
          proveedor: proveedor,
          ingreso: false,
          importe: p.importe,
          bancoorigen: p.bancoorigen,
          bancodestino: p.bancodestino,
          alias: p.alias,
          cbu: p.cbu,
          cliente: "",
          unidad: p.unidad
        }
        let res_t = await fetch(`${environment.apiUrl}/api/collections/Transferencia/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(transfer)
        })
        let data_t = await res_t.json()
        let detalle = {
          pago: data_c.id,
          descripcion: p.descripcion,
          monto: p.total,
          tipocobro: 2,
          transferencia: data_t.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)
        })
      }
      else if (tipo == 3) {
        let trans = {
          fecha: p.fecha + " 03:00:00",
          cliente: "",
          proveedor: proveedor,
          importe: p.importe,
          ingreso: false
        }
        let res_f = await fetch(`${environment.apiUrl}/api/collections/Flujo/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(trans)
        })
        let data_f = await res_f.json()
        let detalle = {
          pago: data_c.id,
          descripcion: p.descripcion,
          monto: p.total,
          tipocobro: 3,
          flujo: data_f.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)
        })
      }
    }
    for (let i = 0; i < adicionales.length; i++) {
      let a = adicionales[i]
      let tipo = this.getCategoria(a.categoria)
      if (tipo == 1) {
        let cheque = {
          proveedor: a.proveedor,
          fechaEntrega: fechapago + ' 03:00:00.000Z'
        }
        let res_che = await fetch(`${environment.apiUrl}/api/collections/Cheque/records/${a.id}`, {
          method: "PATCH",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(cheque)
        })
        let adicional = {
          pago: data_c.id,
          descripcion: a.descripcion,
          monto: a.total,
          cheque: a.id,
          tipocobro: 1
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Adicionales/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(adicional)

        })
      }
      else if (tipo == 2) {
        let transfer = {
          fecha: a.fecha + " 03:00:00",
          proveedor: a.proveedor,
          ingreso: false,
          importe: a.importe,
          bancoorigen: a.bancoorigen,
          bancodestino: a.bancodestino,
          alias: a.alias,
          cbu: a.cbu,
          cliente: "",
          unidad: a.unidad
        }
        let res_t = await fetch(`${environment.apiUrl}/api/collections/Transferencia/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(transfer)
        })
        let data_t = await res_t.json()
        let adicional = {
          pago: data_c.id,
          descripcion: a.descripcion,
          monto: a.total,
          tipocobro: 2,
          transferencia: data_t.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Adicionales/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(adicional)
        })
      }
      else if (tipo == 3) {
        let trans = {
          fecha: a.fecha + " 03:00:00",
          cliente: "",
          proveedor: a.proveedor,
          importe: a.importe,
          ingreso: false
        }
        let res_f = await fetch(`${environment.apiUrl}/api/collections/Flujo/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(trans)
        })
        let data_f = await res_f.json()
        let adicional = {
          pago: data_c.id,
          descripcion: a.descripcion,
          monto: a.total,
          tipocobro: 3,
          flujo: data_f.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Adicionales/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(adicional)
        })
      }
    }
    return data_c

  }
  async pagarCompleto(
    numero, proveedor,
    fechapago, fechapagocompleto, completo,
    total, acuenta,
    totalpagos, totaldescuentos, totalacuentas,
    ordenes: any[], pagos: any[], descuentos: any[], acuentas: any[]
  ) {
    let pago = {
      activo: true,
      numero, proveedor,
      fechapago: fechapago + " 03:00:00",
      fechapagocompleto: completo ? fechapagocompleto + " 03:00:00" : "",
      completo,
      total,
      acuenta,
      totalpagos,
      totaldescuentos,
      totalacuentas
    }
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Pago/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(pago)
    })
    let data_p = await res_p.json()
    //ordenes
    for (let i = 0; i < ordenes.length; i++) {
      let data_o = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records/${ordenes[i].id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },

        body: JSON.stringify({ pago: data_p.id, pagado: true, enrevision: false, enliquidacion: false, escerrada: false, })
      })
    }
    //pagos
    for (let i = 0; i < pagos.length; i++) {
      let p = pagos[i]
      let tipo = this.getCategoria(p.categoria)
      if (tipo == 1) {
        let cheque = {
          proveedor: proveedor,
          fechaEntrega: fechapago + ' 03:00:00'
        }


        let res_che = await fetch(`${environment.apiUrl}/api/collections/Cheque/records/${p.id}`, {
          method: "PATCH",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(cheque)
        })
        let detalle = {
          pago: data_p.id,
          descripcion: p.descripcion,
          monto: p.total,
          cheque: p.id,
          tipopago: 1
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)

        })
      }
      else if (tipo == 2) {
        let transfer = {
          fecha: p.fecha + " 03:00:00",
          proveedor: proveedor,
          ingreso: false,
          importe: p.importe,
          bancoorigen: p.bancoorigen,
          bancodestino: p.bancodestino,
          alias: p.alias,
          cbu: p.cbu,
          cliente: "",
          unidad: p.unidad
        }
        let res_t = await fetch(`${environment.apiUrl}/api/collections/Transferencia/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(transfer)
        })
        let data_t = await res_t.json()
        let detalle = {
          pago: data_p.id,
          descripcion: p.descripcion,
          monto: p.total,
          tipopago: 2,
          transferencia: data_t.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)
        })
      }
      else if (tipo == 3) {
        let trans = {
          fecha: p.fecha + " 03:00:00",
          cliente: "",
          proveedor: proveedor,
          importe: p.importe,
          ingreso: false
        }
        let res_f = await fetch(`${environment.apiUrl}/api/collections/Flujo/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(trans)
        })
        let data_f = await res_f.json()
        let detalle = {
          pago: data_p.id,
          descripcion: p.descripcion,
          monto: p.total,
          tipopago: 3,
          flujo: data_f.id
        }
        let data_d = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records`, {
          method: "POST",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify(detalle)
        })
      }

    }
    //descuentos
    for (let i = 0; i < descuentos.length; i++) {
      let d = descuentos[i]
      let desc = {
        pago: data_p.id,
        descripcion: d.descripcion,
        monto: d.monto
      }
      let data_d = await fetch(`${environment.apiUrl}/api/collections/Detalledescuentopago/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(desc)
      })
    }
    //acuentas
    for (let i = 0; i < acuentas.length; i++) {
      let a = acuentas[i]
      let data_acuenta = {
        pago: data_p.id,
      }
      let data_a = await fetch(`${environment.apiUrl}/api/collections/Acuentaproveedor/records/${a.id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(data_acuenta)
      })
    }
    //Crear a cuenta
    if (acuenta > 0) {
      let data_acuenta = {
        descripcion: "Cobro de " + fechapago,
        monto: acuenta,
        fecha: fechapago + " 03:00:00",
        proveedor,
        active: true
      }
      let data_a = await fetch(`${environment.apiUrl}/api/collections/Acuentaproveedor/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(data_acuenta)
      })
    }
    return data_p


  }
  async eliminarPago(id) {
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Pago/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: false })
    })
    let data_p = await res_p.json()
    let res_ordenes = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records?perPage=200&page=1&filter=(pago~'${id}')`, { headers: { 'Authorization': this.token } })
    let data_ordenes = await res_ordenes.json()
    let os = data_ordenes.items
    for (let i = 0; i < os.length; i++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records/${os[i].id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: "", enrevision: true, enliquidacion: false, escerrada: false, notarevision: "Eliminar pago" })
      })
    }
    //Pagos
    let resdetallespago = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records?perPage=200&page=1&filter=(pago~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datadetallespago = await resdetallespago.json()
    let items = datadetallespago.items
    for (let i = 0; i < items.length; i++) {
      let fila = items[i]

      let ruta = `${environment.apiUrl}/api/collections/Detallepago/records/${fila.id}`
      await fetch(ruta, {
        method: "DELETE",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      })
      //Debo eliminar los cheques, transfer y transacciones ? sí
      let cheque = fila.cheque
      let transferencia = fila.transferencia
      let flujo = fila.flujo
      if (cheque.length > 0) {
        let rutacheque = `${environment.apiUrl}/api/collections/Cheque/records/${cheque}`
        await fetch(rutacheque, {
          method: "PATCH",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ proveedor: "", fechaEntrega: "" })

        })
      }
      if (transferencia.length > 0) {
        let rutatrans = `${environment.apiUrl}/api/collections/Transferencia/records/${transferencia}`
        await fetch(rutatrans, {
          method: "DELETE",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        })
      }
      if (flujo.length > 0) {
        let rutaflujo = `${environment.apiUrl}/api/collections/Flujo/records/${flujo}`
        await fetch(rutaflujo, {
          method: "DELETE",
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        })
      }


    }
    //Descuentos
    let resdescuentos = await fetch(`${environment.apiUrl}/api/collections/Detalledescuentopago/records?perPage=200&page=1&filter=(pago~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datadescuentos = await resdescuentos.json()
    items = datadescuentos.items
    for (let i = 0; i < items.length; i++) {
      let fila = items[i]
      let ruta = `${environment.apiUrl}/api/collections/Detalledescuentopago/records/${fila.id}`
      await fetch(ruta, {
        method: "DELETE",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      })
    }
    //Acuenta
    let resacuentas = await fetch(`${environment.apiUrl}/api/collections/Acuentaproveedor/records?perPage=200&page=1&filter=(pago~'${id}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let dataacuentas = await resacuentas.json()
    items = dataacuentas.items
    for (let i = 0; i < items.length; i++) {
      let fila = items[i]
      let data = {
        pago: ""
      }
      let ruta = `${environment.apiUrl}/api/collections/Acuentapago/records/${fila.id}`
      await fetch(ruta, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    }
  }
  async crearOrdenSimple(hrs: any[], total: number, concepto: string, proveedor: string, identidad: string) {
    let orden = {
      proveedor,
      concepto,
      numero: concepto,
      pagado: false,
      enliquidacion: false,
      enrevision: true,
      escerrada: false,
      fechaliquidacion: "",
      fecharevision: new Date().toISOString().split("T")[0] + ' 03:00:00.000Z',

      active: true,
      fechaorden: new Date().toISOString().split("T")[0] + ' 03:00:00.000Z',

      total,
      identidad,
      pago: ""
    }
    let res_o = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(orden)
    })
    let data_o = await res_o.json()
    hrs.forEach(async h => {
      let res_h = await fetch(`${environment.apiUrl}/api/collections/HojaRuta/records/${h.id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: data_o.id })
      })
    })
    return data_o
  }
  async crearAsientoLiquidarOrden(orden: any) {
    let datasiento = {
      fecha: orden.liquidacion,
      //Desde la perspectiva de egeo es un liability
      monto: -orden.total,
      factura: "",
      cobro: "",
      orden: orden.id,
      pago: "",
      nota: "",
      cheque: "",
      transferencia: "",
      flujo: "",
      tipo: "orden",
      unidad: orden.unidad,
      cliente: "",
      proveedor: orden.proveedor,
      razon: "",
      descripcion: "Liquidar orden: " + orden.numero
    }
    try {
      // busco proveedor y sald
      let res_proveedor = await fetch(`${environment.apiUrl}/api/collections/Proveedor/records/${orden.proveedor}`, { headers: { 'Authorization': this.token } })
      let dataproveedor = await res_proveedor.json()
      // actualizo saldo
      //Es negativo porque le debo plata al proeedor
      let datasaldo = {
        saldo: dataproveedor.saldo - orden.total
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Proveedor/records/${orden.proveedor}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasaldo)
      })
      //Creo asiento
      let res_asiento = await fetch(`${environment.apiUrl}/api/collections/Asiento/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasiento)
      })
      let data_asiento = await res_asiento.json()
      return data_asiento
    }
    catch (err) {
      console.error(err)
    }
  }
  async crearAsientoCerrarOrden(orden: any) {
    let datasiento = {
      fecha: orden.fechacierre,
      //Desde la perspectiva de egeo es un liability
      monto: orden.total,
      factura: "",
      cobro: "",
      orden: orden.id,
      pago: "",
      nota: "",
      cheque: "",
      transferencia: "",
      flujo: "",
      tipo: "orden",
      unidad: orden.unidad,
      cliente: "",
      proveedor: orden.proveedor,
      razon: "",
      descripcion: "Cerrar orden: " + orden.numero
    }
    try {
      // busco proveedor y sald
      let res_proveedor = await fetch(`${environment.apiUrl}/api/collections/Proveedor/records/${orden.proveedor}`, { headers: { 'Authorization': this.token } })
      let dataproveedor = await res_proveedor.json()
      // actualizo saldo

      let datasaldo = {
        saldo: dataproveedor.saldo + orden.total
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Proveedor/records/${orden.proveedor}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasaldo)
      })
      //Creo asiento
      let res_asiento = await fetch(`${environment.apiUrl}/api/collections/Asiento/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasiento)
      })
      let data_asiento = await res_asiento.json()
      return data_asiento
    }
    catch (err) {
      console.error(err)
    }
  }

  async crearAsientoEliminarOrden(orden: any) {
    let datasiento = {
      fecha: new Date().toISOString().split("T")[0]+" 03:00:00",
      //Desde la perspectiva de egeo es un liability
      monto: orden.total,
      factura: "",
      cobro: "",
      orden: orden.id,
      pago: "",
      nota: "",
      cheque: "",
      transferencia: "",
      flujo: "",
      tipo: "orden",
      unidad: orden.unidad,
      cliente: "",
      proveedor: orden.proveedor,
      razon: "",
      descripcion: "Eliminar orden: " + orden.numero
    }
    try {
      // busco proveedor y sald
      let res_proveedor = await fetch(`${environment.apiUrl}/api/collections/Proveedor/records/${orden.proveedor}`, { headers: { 'Authorization': this.token } })
      let dataproveedor = await res_proveedor.json()
      // actualizo saldo

      let datasaldo = {
        saldo: dataproveedor.saldo + orden.total
      }
      //update saldo
      //`${environment.apiUrl}/api/collections/Cliente/records/${id}`
      let res_update = await fetch(`${environment.apiUrl}/api/collections/Proveedor/records/${orden.proveedor}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasaldo)
      })
      //Creo asiento
      let res_asiento = await fetch(`${environment.apiUrl}/api/collections/Asiento/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(datasiento)
      })
      let data_asiento = await res_asiento.json()
      return data_asiento
    }
    catch (err) {
      console.error(err)
    }
  }
  async crearOrden(numero, proveedor, fecha, total, unidad, concepto, hrs: any[], nuevocod: string) {
    let orden = {
      proveedor,
      concepto,
      numero,
      pagado: false,
      enliquidacion: false,
      enrevision: true,
      escerrada: false,
      fechaliquidacion: "",
      fecharevision: new Date().toISOString().split("T")[0] + ' 03:00:00.000Z',

      active: true,
      fechaorden: fecha + ' 03:00:00.000Z',
      unidad,
      total,
      pago: "",
      identidad: nuevocod,
    }
    let res_o = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(orden)
    })
    let data_o = await res_o.json()
    hrs.forEach(async h => {
      let res_h = await fetch(`${environment.apiUrl}/api/collections/HojaRuta/records/${h.id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: data_o.id })
      })
    })
    return data_o
  }
  async guardarDetalles(idorden, detalles: any[]) {
    for (let i = 0; i < detalles.length; i++) {
      let res_d = await fetch(`${environment.apiUrl}/api/collections/Detalleorden/records/`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...detalles[i], orden: idorden })
      })
    }
  }
  //ORDENES
  async getOrdenes(proveedor: string, nro: string, concepto: string, todos: boolean, pagado: boolean, fechaDesde: string, fechaHasta: string) {
    let y = "%26%26"
    let expand = "proveedor"
    let filter = "active = true"
    filter += ` ${y} numero ~ '${nro}'`
    filter += ` ${y} proveedor ~ '${proveedor}'`
    filter += ` ${y} concepto ~ '${concepto}'`
    filter += ``
    if (!todos) {
      if (pagado) {
        filter += ` ${y} pagado = true`
      }
      else {
        filter += ` ${y} pagado = false`
      }
    }
    if (fechaDesde) {
      filter += ` ${y} fechaorden>= '${fechaDesde}' `
    }
    if (fechaHasta) {
      filter += ` ${y} fechaorden <= '${fechaHasta}' `
    }
    let ordenes = []

    let res_o = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records?perPage=1&page=1&filter=(${filter})&expand=${expand}`, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    let data_o = await res_o.json()
    let paginas = Math.floor(data_o.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {

      let res = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records?perPage=200&page=${pag}&filter=(${filter})&expand=${expand}`, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })

      let data = await res.json()
      ordenes = ordenes.concat(data.items)
    }
    ordenes.sort((o1, o2) => new Date(o1.fechaorden) < new Date(o2.fechaorden) ? 1 : -1)
    return ordenes
  }
  async getOrden(id: string) {
    let res_o = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records/${id}?expand=proveedor,chofer,vehiculo`, { headers: { 'Authorization': this.token } })
    let data_o = await res_o.json()
    let detalles = []
    let rutacompleta = `${environment.apiUrl}/api/collections/Detalleorden/records?perPage=1&page=1&filter=(orden~'${id}')`
    let res_d = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/Detalleorden/records?perPage=200&page=${pag}&filter=(orden~'${id}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      detalles = detalles.concat(data.items)
    }
    let hrs = []
    rutacompleta = `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=1&page=1&filter=(pago~'${id}')`
    let res_hr = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_hr = await res_hr.json()
    paginas = Math.floor(data_hr.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=200&page=${pag}&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado&filter=(pago~'${id}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      hrs = hrs.concat(data.items)
    }
    let orden = data_o
    orden.hrs = hrs
    orden.detalles = detalles
    return orden
  }
  async deleteOrden(id) {
    let res_o = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records/${id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false })
    })
    let data_o = await res_o.json()
    let hrs = []
    let rutacompleta = `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=1&page=1&filter=(pago~'${id}')`
    let res_h = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_h = await res_h.json()
    let paginas = Math.floor(data_h.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=200&page=${pag}&filter=(pago~'${id}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      hrs = hrs.concat(data.items)
    }
    for (let i = 0; i < hrs.length; i++) {
      let res_hr = await fetch(`${environment.apiUrl}/api/collections/HojaRuta/records/${hrs[i].id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: '' })
      })
    }
    let dets = []
    rutacompleta = `${environment.apiUrl}/api/collections/Detalleorden/records?perPage=1&page=1&filter=(orden~'${id}')`
    let res_d = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/Detalleorden/records?perPage=200&page=${pag}&filter=(orden~'${id}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      dets = dets.concat(data.items)
    }


    for (let i = 0; i < dets.length; i++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/Detalleorden/records/${dets[i].id}`
      let res = await fetch(rutacompletapag, {
        method: "DELETE",
        headers: { 'Authorization': this.token }
      })
    }
    return data_o

  }

  editOrden(numero: string, total: number, fechaorden: string, unidad: string, concepto: string, id: string) {
    let data = {
      total,
      numero,
      fechaorden,
      unidad,
      concepto
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/OrdenPago/records/${id}`,
        { ...data },
        { headers: { 'Authorization': this.token } }
      )
  }

  //Pagos
  getPagos(perPage: number, page: number, fechaPagoDesde: string, fechaPagoHasta: string, proveedor: string) {

    let filterfechaPagoDesde = fechaPagoDesde ? `%26%26 fechapago >= '${fechaPagoDesde}'` : ""
    let filterfechaPagoHasta = fechaPagoHasta ? `%26%26 fechapago <='${fechaPagoHasta}' ` : ""
    let filterproveedor = proveedor.length > 0 ? `%26%26 proveedor~'${proveedor}'` : ""
    let ruta = `${environment.apiUrl}/api/collections/Pago/records?sort=-created&expand=proveedor&page=${page}&perPage=${perPage}&filter=(activo = true ${filterproveedor} ${filterfechaPagoDesde} ${filterfechaPagoHasta})`
    return this._httpClient.get<any>(ruta, {
      headers: { 'Authorization': this.token }
    }).pipe(
      catchError(this.handleError<any>("get pagos", []))
    )
  }
  async getTodosPagos(fechaPagoDesde: string, fechaPagoHasta: string, proveedor: string) {
    let filterfechaPagoDesde = fechaPagoDesde ? `%26%26 fechacobro >= '${fechaPagoDesde}'` : ""
    let filterfechaPagoHasta = fechaPagoHasta ? `%26%26 fechacobro <='${fechaPagoHasta}' ` : ""
    let filterproveedor = proveedor.length > 0 ? `%26%26 proveedor~'${proveedor}'` : ""
    let filter = `activo = true ${filterproveedor} ${filterfechaPagoDesde} ${filterfechaPagoHasta}`
    let ruta_p = `${environment.apiUrl}/api/collections/Pago/records?perPage=1&page=1&expand=proveedor&=filter=(${filter})`
    let res_p = await fetch(ruta_p, { headers: { 'Authorization': this.token } })
    let data_p = await res_p.json()
    let paginas = Math.floor(data_p.totalItems / 200) + 1
    let pagos = []
    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Pago/records?perPage=200&page=${pag}&expand=proveedor&=filter=(${filter})&skipTotal=true`
      let res = await fetch(ruta, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      pagos = pagos.concat(data.items)
    }
    pagos.sort((r1, r2) => new Date(r1.fechapago) < new Date(r2.fechapago) ? -1 : 1)
    return pagos
  }
  async deletePago(idpago) {
    let res_p = await fetch(`${environment.apiUrl}/api/collections/Pago/records/${idpago}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: false })
    })
    let data_p = await res_p.json()

    let res_ordenes = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records?perPage=200&page=1&filter=(pago~'${idpago}')`, { headers: { 'Authorization': this.token } })
    let data_ordenes = await res_ordenes.json()
    let os = data_ordenes.items
    for (let i = 0; i < os.length; i++) {
      let res = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records/${os[i].id}`, {
        method: "PATCH",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagado: false, enrevision: false, enliquidacion: false, escerrada: false, pago: "" })
      })
      //let data = await res.json()
    }
    return data_p
  }
  async getPago(idpago) {
    let res_pago = await fetch(`${environment.apiUrl}/api/collections/Pago/records/${idpago}?expand=proveedor`, {
      headers: { 'Authorization': this.token }
    })
    let data_pago = await res_pago.json()
    let resdetallespago = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records?perPage=200&page=1&filter=(pago~'${idpago}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datadetallespago = await resdetallespago.json()

    let resordenes = await fetch(`${environment.apiUrl}/api/collections/OrdenPago/records?expand=proveedor&perPage=200&page=1&filter=(pago~'${idpago}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let dataordenes = await resordenes.json()

    let resacuenta = await fetch(`${environment.apiUrl}/api/collections/Acuentaproveedor/records?&perPage=200&page=1&filter=(pago~'${idpago}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datacuenta = await resacuenta.json()

    let resdescuentos = await fetch(`${environment.apiUrl}/api/collections/Detalledescuentopago/records?&perPage=200&page=1&filter=(pago~'${idpago}')&skipTotal=true`, { headers: { 'Authorization': this.token } })
    let datadescuentos = await resdescuentos.json()

    let pago = {
      ...data_pago,
      pagos: datadetallespago.items,
      acuentas: datacuenta.items,
      ordenes: dataordenes.items,
      descuentos: datadescuentos.items
    }
    return pago
  }
  editPago(idpago, numero,
    fechapago, pagocompleto, completo,
    total,
    totalpagos, totaldescuentos, totalacuentas) {
    let data = {

      numero,
      fechapago: fechapago + " 03:00:00",
      pagocompleto: completo ? pagocompleto + " 03:00:00" : "",
      completo,
      total,
      totalpagos,
      totaldescuentos,
      totalacuentas
    }
    let ruta = `${environment.apiUrl}/api/collections/Pago/records/${idpago}`
    return this._httpClient.patch(ruta, { ...data },
      { headers: { 'Authorization': this.token } }
    )
  }
  async getCuentaCorrienteProveedor(proveedor: string, perPage: number, page: number, fechadesde: string, fechahasta: string) {
    let ctacorrientes = []
    //ordenes
    let rutaordenes = `${environment.apiUrl}/api/collections/OrdenPago/records?perPage=1&page=1`
    let filterorden = `&filter=(active=true`
    if (fechadesde != "") {
      filterorden += `%26%26 fechaorden>'${fechadesde}'`
    }

    if (fechahasta != "") {
      filterorden += `%26%26 fechaorden<'${fechahasta}'`
    }
    if (proveedor != '') {
      filterorden += `%26%26 proveedor='${proveedor}')`
    } else {
      filterorden += `)`
    }

    rutaordenes = `${rutaordenes}${filterorden}`
    let res_o = await fetch(rutaordenes, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    let data_o = await res_o.json()
    let paginas = Math.floor(data_o.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/OrdenPago/records?perPage=${200}&page=${pag}${filterorden}&expand=proveedor`
      let res = await fetch(ruta, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })
      let data = await res.json()
      let lista = data.items
      for (let i = 0; i < lista.length; i++) {
        let item = lista[i]
        let fila = {
          numero: item.numero,
          fecha: item.fechafacturacion,

          nombreproveedor: item.expand.proveedor.nombre,
          acuenta: 0,
          iva: item.expand.proveedor.responsable ? 0.21 * item.total : 0,
          total: item.total,
          pagos: 0,

          descuentos: 0,
          acuentas: 0,

          saldo: 0
        }
        ctacorrientes.push(fila)
      }

    }
    //Pagos
    let rutapagos = `${environment.apiUrl}/api/collections/Pago/records?perPage=1&page=1`
    let filterpago = `&filter=(activo=true`
    if (fechadesde != "") {
      filterpago += `%26%26 fechapago>'${fechadesde}'`
    }
    if (fechahasta != "") {
      filterpago += `%26%26 fechapago<'${fechahasta}'`
    }

    if (proveedor != '') {
      filterpago += `%26%26 proveedor='${proveedor}')`
    } else {
      filterpago += `)`
    }
    rutapagos = `${rutapagos}${filterpago}`
    let res_p = await fetch(rutapagos, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    let data_p = await res_p.json()
    paginas = Math.floor(data_p.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Pago/records?perPage=${200}&page=${pag}${filterpago}&expand=proveedor`
      let res = await fetch(ruta, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })

      let data = await res.json()
      let lista = data.items
      for (let i = 0; i < lista.length; i++) {
        let item = lista[i]
        let fila = {
          numero: item.numero,
          fecha: item.fechapago,
          acuenta: 0,
          iva: 0,
          total: 0,
          pagos: item.totalpagos,

          descuentos: item.totaldescuentos,
          acuentas: item.totalacuentas,

          nombreproveedor: item.expand.proveedor.nombre,
          saldo: 0
        }
        ctacorrientes.push(fila)
      }

    }
    //Acuenta
    let rutaacuenta = `${environment.apiUrl}/api/collections/Acuentaproveedor/records?perPage=1&page=1`
    let filteracuenta = `&filter=(active=true`
    if (fechadesde != "") {
      filteracuenta += `%26%26 fecha>'${fechadesde}'`
    }
    if (fechahasta != "") {
      filteracuenta += `%26%26 fecha<'${fechahasta}'`
    }

    if (proveedor != '') {
      filteracuenta += `%26%26 proveedor='${proveedor}')`
    } else {
      filteracuenta += `)`
    }
    rutaacuenta = `${rutaacuenta}${filteracuenta}`
    let res_a = await fetch(rutaacuenta, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })

    let data_a = await res_a.json()
    paginas = Math.floor(data_a.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Acuentaproveedor/records?perPage=${200}&page=${pag}${filteracuenta}&expand=proveedor`
      let res = await fetch(ruta, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })

      let data = await res.json()
      let lista = data.items

      for (let i = 0; i < lista.length; i++) {
        let item = lista[i]
        let fila = {
          numero: item.descripcion,
          fecha: item.fecha,
          acuenta: item.monto,


          nombreproveedor: item.expand.proveedor.nombre,
          iva: 0,
          total: 0,
          pagos: 0,

          descuentos: 0,
          acuentas: 0,

          saldo: 0
        }
        ctacorrientes.push(fila)
      }

    }
    ctacorrientes = ctacorrientes.sort((a, b) => new Date(a.fecha) < new Date(b.fecha) ? -1 : 1)
    return ctacorrientes
  }
  async getTodasCuentasCorrientesProveedores(fechadesde: string, fechahasta: string) {

    let proveedores = []
    let ruta = `${environment.apiUrl}/api/collections/Proveedor/records?page=1&perPage=1?`
    let filter = `&filter=(active=true)`
    let res = await fetch(`${ruta}${filter}`, {
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
    })
    let data = await res.json()
    let paginas = Math.floor(data.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      ruta = `${environment.apiUrl}/api/collections/Proveedor/records?skipTotal=true&page=${pag}&perPage=${200}`
      res = await fetch(`${ruta}${filter}`, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })
      data = await res.json()
      proveedores = proveedores.concat(data.items)
    }
    let ctacorrientes = []
    for (let i = 0; i < proveedores.length; i++) {
      let prov = proveedores[i]
      //Ordenes
      let ordenes = []
      let ordentotal = 0
      let rutaordenes = `${environment.apiUrl}/api/collections/OrdenPago/records?perPage=1&page=1`
      let filterorden = `&filter=(active=true%26%26proveedor='${prov.id}'`
      if (fechadesde != "") {
        filterorden += `%26%26fechaorden>'${fechadesde}'`
      }

      if (fechahasta != "") {
        filterorden += `%26%26fechaorden<'${fechahasta}'`
      }
      filterorden += ")"
      rutaordenes = `${rutaordenes}${filterorden}`
      let res_o = await fetch(rutaordenes, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })
      let data_o = await res_o.json()
      let paginas = Math.floor(data_o.totalItems / 200) + 1
      for (let pag = 1; pag <= paginas; pag++) {
        let ruta = `${environment.apiUrl}/api/collections/OrdenPago/records?perPage=${200}&page=${pag}${filterorden}`
        let res = await fetch(ruta, {
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
        })
        let data = await res.json()
        ordenes = ordenes.concat(data.items)
      }
      prov.ordenes = ordenes
      for (let j = 0; j < ordenes.length; j++) {

        ordentotal += ordenes[j].total
      }
      //Pagos
      let pagos = []
      let pagostotal = 0
      let adicionales = 0
      let rutapagos = `${environment.apiUrl}/api/collections/Pago/records?perPage=1&page=1`
      let filterpago = `&filter=(activo=true%26%26proveedor='${prov.id}'`
      if (fechadesde != "") {
        filterpago += `%26%26fechapago>'${fechadesde}'`
      }
      if (fechahasta != "") {
        filterpago += `%26%26fechapago<'${fechahasta}'`
      }
      filterpago += ")"
      rutapagos = `${rutapagos}${filterpago}`
      let res_p = await fetch(rutapagos, {
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
      })
      let data_p = await res_p.json()
      paginas = Math.floor(data_p.totalItems / 200) + 1
      for (let pag = 1; pag <= paginas; pag++) {
        let ruta = `${environment.apiUrl}/api/collections/Pago/records?perPage=${200}&page=${pag}${filterpago}`
        let res = await fetch(ruta, {
          headers: { 'Authorization': this.token, 'Content-Type': 'application/json' }
        })

        let data = await res.json()
        pagos = pagos.concat(data.items)
      }
      prov.pagos = pagos
      for (let j = 0; j < pagos.length; j++) {
        pagostotal += pagos[j].totalpagos
        adicionales += pagos[j].totaladicionales
      }
      prov.ordenestotal = ordentotal
      prov.pagostotal = pagostotal
      prov.adicionales = adicionales
      prov.saldototal = (ordentotal - pagostotal - adicionales)

      ctacorrientes.push(prov)
    }
    return ctacorrientes
  }
  //utiles
  formatPeso(value) {
    return value.toLocaleString('es-ar', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    });
  }
  async getNombreProveedor(proveedor) {
    let res = await fetch(`${environment.apiUrl}/api/collections/Proveedor/records/${proveedor}`, { headers: { 'Authorization': this.token } })
    let data = await res.json()
    return data.nombre
  }
  //ordenes de pago
  crearOrdenPago(hojas) {
    let op = {
      numero: "",
      concepto: "",
      fechapago: new Date().toISOString().split('T')[0],
      total: 0,
      unidad: "",
      proveedor: "",
      hojas,
      detalles: []
    }
    localStorage.setItem("ORDENPAGO",
      JSON.stringify(op)
    )
  }
  retomarOrdenPago() {
    let op = {
      numero: "",
      concepto: "",
      fechapago: "",
      total: 0,
      unidad: "",
      proveedor: "",
      hojas: [],
      detalles: []
    }

    if (localStorage.getItem("ORDENPAGO") == null) {
      localStorage.setItem("ORDENPAGO",
        JSON.stringify(op)
      )
      return op
    }
    else {
      let localop = JSON.parse(localStorage.getItem("ORDENPAGO"))
      let merged = {
        ...op,
        ...localop
      }
      return merged
    }
  }
  guardarOrdenPago(op: any) {
    localStorage.setItem("ORDENPAGO",
      JSON.stringify(op)
    )
  }
  async getDetallesEnOrden(id) {
    let detalles = []
    let rutacompleta = `${environment.apiUrl}/api/collections/Detalleorden/records?perPage=1&page=1&filter=(orden~'${id}')`
    let res_d = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_d = await res_d.json()
    let paginas = Math.floor(data_d.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/Detalleorden/records?perPage=200&page=${pag}&filter=(orden~'${id}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      detalles = detalles.concat(data.items)
    }
    return detalles
  }
  quitarDetalleEnOrden(iddetalle) {
    return this._httpClient
      .delete(`${environment.apiUrl}/api/collections/Detalleorden/records/${iddetalle}`, { headers: { 'Authorization': this.token } }
      )
  }
  revisar(nota, fecha, id) {
    let data = {
      notarevision: nota,
      revision: fecha + " 03:00:00",
      enrevision: true,
      enliquidacion: false,
      fechaliquidacion: "",
      pagada: false,
      escerrada: false,

    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/OrdenPago/records/${id}`,
        { ...data },
        { headers: { 'Authorization': this.token } }
      )
  }
  liquidar(fecha, id) {
    let data = {

      enrevision: false,
      enliquidacion: true,
      liquidacion: fecha + " 03:00:00",
      pagada: false,
      escerrada: false,

    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/OrdenPago/records/${id}`,
        { ...data },
        { headers: { 'Authorization': this.token } }
      )
  }
  cerrar(nota, fecha, id) {
    let data = {
      notacierre: nota,
      fechacierre: fecha + " 03:00:00",
      enrevision: false,
      enliquidacion: false,

      pagada: false,
      escerrada: true,

    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/OrdenPago/records/${id}`,
        { ...data },
        { headers: { 'Authorization': this.token } }
      )
  }
  async getHojasEnOrden(idorden: string) {
    let hrs = []
    let rutacompleta = `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=1&page=1&filter=(pago~'${idorden}')`
    let res_hr = await fetch(rutacompleta, { headers: { 'Authorization': this.token } })
    let data_hr = await res_hr.json()
    let paginas = Math.floor(data_hr.totalItems / 200) + 1
    for (let pag = 1; pag <= paginas; pag++) {
      let rutacompletapag = `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=200&page=${pag}&expand=cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,proveedor,chofer,vehiculo,responsable,estado&filter=(pago~'${idorden}')&skipTotal=true`
      let res = await fetch(rutacompletapag, { headers: { 'Authorization': this.token } })
      let data = await res.json()
      hrs = hrs.concat(data.items)
    }
    return hrs

  }
  getHojasSimple(perPage: number, page: number, nro: string, estado: number, fechaDesde: string, fechaHasta: string, proveedor) {
    let filter = ""
    let y = "%26%26"
    let expand = "proveedor,chofer,vehiculo"
    filter += ` codigo ~ '${nro}' `
    if (fechaDesde != "") {
      filter += ` ${y} fechaentrega > '${fechaDesde}' `
    }
    if (fechaHasta != "") {
      filter += ` ${y} fechaentrega < '${fechaHasta}' `
    }
    if (proveedor != "") {
      filter += ` ${y} proveedor.nombre ~ '${proveedor}'`
    }
    if (estado != -1) {
      filter += ` ${y} estado = ${estado} `
    }
    let rutacompleta = `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=${perPage}&page=${page + 1}&filter=(${filter})&expand=${expand}&skipTotal=${false}&sort=-fechaentrega`
    return this._httpClient.get<any>(`${rutacompleta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get Hoja rutas", []))
    )
  }
  agregarHojaEnOrden(idhoja, idorden) {
    let data = {
      pago: idorden
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/HojaRuta/records/${idhoja}`,
        data,
        { headers: { 'Authorization': this.token } }
      )
  }
  quitarHojaEnOrden(idhoja) {
    let data = {
      pago: ""
    }
    return this._httpClient
      .patch(`${environment.apiUrl}/api/collections/HojaRuta/records/${idhoja}`,
        data,
        { headers: { 'Authorization': this.token } }
      )
  }
  crearPago(ordenes) {

    let pago = {
      completo: true,
      proveedor: "",
      numero: "",
      fechapago: "",
      fechapagocompleto: "",
      totalpagos: "",
      totaladicionales: "",
      totaldescuentos: "",
      totalacuentas: "",
      acuenta: "",
      ordenes,
      pagos: [],
      descuentos: [],
      acuentas: []
    }
    localStorage.setItem("PAGO",
      JSON.stringify(pago)
    )
  }

  retomarPago() {
    let pago = {
      completo: true,
      proveedor: "",
      numero: "",
      fechapago: "",
      fechapagocompleto: "",
      totalpagos: "",
      totaldescuentos: "",
      totalacuentas: "",
      acuenta: "",
      ordenes: [],
      pagos: [],
      descuentos: [],
      acuentas: []
    }
    if (localStorage.getItem("PAGO") == null) {
      localStorage.setItem("PAGO",
        JSON.stringify(pago)
      )
      return pago
    }
    else {
      let localop = JSON.parse(localStorage.getItem("PAGO"))
      let merged = {
        ...pago,
        ...localop
      }
      return merged
    }
  }
  guardarPago(pago) {
    localStorage.setItem("PAGO",
      JSON.stringify(pago)
    )
  }
  //acuentoas
  getAcuentas(perPage: number, page: number, descripcion: string, fechadesde: string, fechahasta: string, proveedor: string) {
    let filter = `(active=true`
    if (descripcion != "") {
      filter += ` %26%26  descripcion~'${descripcion}'`
    }
    if (fechadesde != "") {
      filter += ` %26%26 fecha >= '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 fecha <= '${fechahasta}'`
    }
    if (proveedor != "") {
      filter += ` %26%26 proveedor ~ '${proveedor}'`
    }
    filter += ")"

    let ruta = `${environment.apiUrl}/api/collections/Acuentaproveedor/records?filter=${filter}&page=${page}&perPage=${perPage}&sort=-fecha`
    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(
      catchError(this.handleError<any>("get acuentas", []))
    )

  }
  async getAcuentasTodos(descripcion: string, fechadesde: string, fechahasta: string, proveedor: string) {
    let filter = `(active=true`
    if (descripcion != "") {
      filter += ` %26%26  descripcion~'${descripcion}'`
    }
    if (fechadesde != "") {
      filter += ` %26%26 fecha >= '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 fecha <= '${fechahasta}'`
    }
    if (proveedor != "") {
      filter += ` %26%26 proveedor ~ '${proveedor}'`
    }
    filter += ")"
    let ruta_cuenta = `${environment.apiUrl}/api/collections/Acuentaproveedor/records?filter=${filter}&page=${1}&perPage=${1}`
    let res_cuenta = await fetch(ruta_cuenta, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_cuenta.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    let acuentas = []

    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Acuentaproveedor/records?filter=${filter}&page=${pag}&perPage=${200}&expand=factura&sort=-fecha`
      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      acuentas = acuentas.concat(data.items)
    }


    return acuentas
  }
  async getAcuentasProveedorSinUsar(proveedor: string, fechadesde: string, fechahasta: string) {
    let filter = `(active=true %26%26 pago=''`

    if (proveedor != "") {
      filter += ` %26%26 proveedor ~ '${proveedor}'`
    }
    if (fechadesde != "") {
      filter += ` %26%26 created >= '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 created <= '${fechahasta}'`
    }
    filter += ")"
    let ruta_cuenta = `${environment.apiUrl}/api/collections/Acuentaproveedor/records?filter=${filter}&page=${1}&perPage=${1}`
    let res_cuenta = await fetch(ruta_cuenta, {
      headers: { 'Authorization': this.token }
    })
    let data_res = await res_cuenta.json()
    let paginas = Math.floor(data_res.totalItems / 200) + 1
    let acuentas = []

    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Acuentaproveedor/records?filter=${filter}&page=${pag}&perPage=${200}&expand=factura&sort=-fecha`
      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      acuentas = acuentas.concat(data.items)
    }


    return acuentas
  }
  async delAcuenta(idacuenta) {
    let ruta = `${environment.apiUrl}/api/collections/Acuentaproveedor/records/${idacuenta}`
    let res_cuenta = await fetch(ruta, {
      method: "DELETE",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
    })
    let data_acuenta = await res_cuenta.json()
    return data_acuenta
  }
  //Descuentos
  getDescuento(perPage: number, page: number, proveedor: string, fechadesde: string, fechahasta: string) {
    let filter = `(1 = 1`
    if (proveedor != "") {
      filter += ` %26%26 pago.proveedor ~ '${proveedor}'`
    }

    if (fechadesde != "") {
      filter += ` %26%26 created > '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 created < '${fechahasta}'`
    }

    filter += ")"

    let ruta = `${environment.apiUrl}/api/collections/Detalledescuentopago/records?filter=${filter}&page=${page}&perPage=${perPage}&expand=pago&sort=-created`

    return this._httpClient.get<any>(`${ruta}`, {
      headers: { 'Authorization': this.token }
    }
    ).pipe(

      catchError(this.handleError<any>("get descuentos", []))
    )
  }
  async getTodosDescuentos(proveedor: string, fechadesde: string, fechahasta: string) {
    let filter = `(1 = 1`
    if (proveedor != "") {
      filter += ` %26%26 pago.proveedor ~ '${proveedor}'`
    }

    if (fechadesde != "") {
      filter += ` %26%26 created > '${fechadesde}'`
    }
    if (fechahasta != "") {
      filter += ` %26%26 created < '${fechahasta}'`
    }

    filter += ")"
    let ruta_desc = `${environment.apiUrl}/api/collections/Detalledescuentopago/records?filter=${filter}&page=${1}&perPage=${1}&expand=pago`

    let res_desc = await fetch(ruta_desc, {
      headers: { 'Authorization': this.token }
    })
    let data_desc = await res_desc.json()
    let paginas = Math.floor(data_desc.totalItems / 200) + 1
    let desc = []

    for (let pag = 1; pag <= paginas; pag++) {
      let ruta = `${environment.apiUrl}/api/collections/Detalledescuentopago/records?filter=${filter}&page=${pag}&perPage=${200}&expand=pago&sort=-created`

      let res = await fetch(`${ruta}`, {
        headers: { 'Authorization': this.token }
      })
      let data = await res.json()
      desc = desc.concat(data.items)
    }


    return desc
  }
  async getRemitosFromHRs(hrs: any) {
    let remitos = []
    for (let i = 0; i < hrs.length; i++) {
      let idhr = hrs[i]
      let ruta = `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=1&filter=(active=true %26%26 hojaruta='${idhr}')&expand=cliente,remitente,destinatario&skipTotal=true`
      let res = await fetch(
        `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=1&filter=(active=true %26%26 hojaruta='${idhr}')&expand=cliente,remitente,destinatario&skipTotal=true`,
        { headers: { 'Authorization': this.token } }
      )
      let data = await res.json()
      remitos = remitos.concat(data.items)

    }
    return remitos
  }
  //Detalles
  async elegirCheque(fila, proveedor, pago, fecheEntrega) {
    let cheque = {
      proveedor: proveedor,
      fechaEntrega: fecheEntrega + ' 03:00:00'
    }
    let res_che = await fetch(`${environment.apiUrl}/api/collections/Cheque/records/${fila.id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(cheque)
    })
    let detalle = {
      pago: pago,
      descripcion: fila.descripcion,
      monto: fila.total,
      cheque: fila.id,
      tipopago: 1
    }
    let res_d = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(detalle)

    })
    let data_d = await res_d.json()
    return data_d
  }
  async addDetalle(detalle, proveedor, pago) {
    let p = detalle
    let tipo = this.getCategoria(p.categoria)

    if (tipo == 2) {
      let transfer = {
        fecha: p.fecha + " 03:00:00",
        proveedor: proveedor,
        ingreso: false,
        importe: p.importe,
        bancoorigen: p.bancoorigen,
        bancodestino: p.bancodestino,
        alias: p.alias,
        cbu: p.cbu,
        cliente: "",
        unidad: p.unidad
      }
      let res_t = await fetch(`${environment.apiUrl}/api/collections/Transferencia/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(transfer)
      })
      let data_t = await res_t.json()
      let detalle = {
        pago,
        descripcion: p.descripcion,
        monto: p.total,
        tipopago: 2,
        transferencia: data_t.id
      }
      let res_d = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(detalle)
      })
      let data_d = await res_d.json()
      return data_d
    }
    else if (tipo == 3) {
      let trans = {
        fecha: p.fecha + " 03:00:00",
        cliente: "",
        proveedor: proveedor,
        importe: p.importe,
        ingreso: false
      }
      let res_f = await fetch(`${environment.apiUrl}/api/collections/Flujo/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(trans)
      })
      let data_f = await res_f.json()
      let detalle = {
        pago,
        descripcion: p.descripcion,
        monto: p.total,
        tipopago: 3,
        flujo: data_f.id
      }
      let res_d = await fetch(`${environment.apiUrl}/api/collections/Detallepago/records`, {
        method: "POST",
        headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(detalle)
      })
      let data_d = await res_d.json()
      return data_d
    }
  }
  //Descuentos
  async addDescuento(descuento, pago) {
    let d = descuento
    let desc = {
      pago: pago,
      descripcion: d.descripcion,
      monto: d.monto
    }
    let res_d = await fetch(`${environment.apiUrl}/api/collections/Detalledescuentopago/records`, {
      method: "POST",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(desc)
    })
    let data_d = await res_d.json()
    return data_d

  }
  //Acuenta
  async addCuenta(cuenta, pago) {
    let data_acuenta = {
      pago: pago,
    }
    let res_a = await fetch(`${environment.apiUrl}/api/collections/Acuentaproveedor/records/${cuenta.id}`, {
      method: "PATCH",
      headers: { 'Authorization': this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(data_acuenta)
    })
    let data_a = await res_a.json()
    return data_a
  }
  async getRentabilidad(fechadesde: string, fechahasta: string, nro: string, proveedor: string) {
    let filter = ""
    let y = "%26%26"
    let expand = "proveedor"
    filter += ` codigo ~ '${nro}' `
    if (fechadesde != "") {
      filter += ` ${y} fechaentrega > '${fechadesde}' `
    }
    if (fechahasta != "") {
      filter += ` ${y} fechaentrega < '${fechahasta}' `
    }
    if (proveedor != "") {
      filter += ` ${y} proveedor ~ '${proveedor}' `
    }
    let todoshr = []

    let f_ruta = (perPage: number, page: number, skipTotal: boolean) => `${environment.apiUrl}/api/collections/HojaRuta/records?perPage=${perPage}&page=${page}&filter=(${filter})&expand=${expand}&skipTotal=${skipTotal}&sort=-created`
    let maxpagesize = 500
    let res_hr = await fetch(f_ruta(1, 1, false), { headers: { 'Authorization': this.token } })
    let data_hr = await res_hr.json()
    let paginas = Math.floor(data_hr.totalItems / maxpagesize) + 1

    for (let pag = 1; pag <= paginas; pag++) {
      //busco las hojas de ruta
      let res = await fetch(f_ruta(maxpagesize, pag, true), { headers: { 'Authorization': this.token } })
      let data = await res.json()
      let hrs = data.items
      for (let j = 0; j < hrs.length; j++) {
        let hr = hrs[j]
        let idhr = hr.id
        let res_remito = await fetch(
          `${environment.apiUrl}/api/collections/Remito/records?perPage=200&page=1&filter=(active=true %26%26 hojaruta='${idhr}')&expand=cliente,proveedor,estado&skipTotal=true`,
          { headers: { 'Authorization': this.token } }
        )
        let data_remito = await res_remito.json()
        let remitos = data_remito.items
        let costo = hr.totalproveedor
        let total = remitos.reduce((total, item) => total + item.totalViaje, 0)
        for (let z = 0; z < remitos.length; z++) {
          let r = remitos[z]
          let totalViaje = r.totalViaje
          let proporcionTotal = totalViaje / total
          let costoViaje = proporcionTotal * costo
          let beneficioViaje = totalViaje - costoViaje
          let rentabilidadViaje = costoViaje > 0 ? beneficioViaje / costoViaje : 0
          remitos[z].costoViaje = costoViaje
          remitos[z].beneficioViaje = beneficioViaje
          remitos[z].rentabilidadViaje = rentabilidadViaje
        }
        hrs[j].remitos = remitos
      }
      todoshr = todoshr.concat(hrs)
    }
    return todoshr

  }
  async getOrdenMaxId() {
    let res = await fetch(`${environment.apiUrl}/api/collections/CodigoOrden/records`, {
      headers: { 'Authorization': this.token }
    })
    let data = await res.json()
    return data.items[0]
  }
  async updateOrdenMaxId(maximo, id) {
    let res = await fetch(`${environment.apiUrl}/api/collections/CodigoOrden/records/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maximo })
    })

    let data = await res.json()

    return data
  }
}
