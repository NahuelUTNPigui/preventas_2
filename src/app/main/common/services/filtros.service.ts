import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FiltrosService {

  constructor() {
    if (localStorage.getItem("repremitos") == null) {
      localStorage.setItem("repremitos",
        JSON.stringify(this.repremitosFromZero())
      )
    }
    else {
      this.setItemFiltro("repremitos", "zona", "")
    }
    if (localStorage.getItem("repremitosclientes") == null) {
      localStorage.setItem("repremitosclientes",
        JSON.stringify(this.repremitosClientesFromZero())
      )
    }
    if (localStorage.getItem("repremitosprovs") == null) {
      localStorage.setItem("repremitosprovs",
        JSON.stringify(this.repremitosProveedorFromZero())
      )
    }

    if (localStorage.getItem("facturas") == null) {
      localStorage.setItem("facturas",
        JSON.stringify(this.facturasFromZero())
      )
    }
    else {
      let filtro = JSON.parse(localStorage.getItem("facturas"))
      let fact = this.facturasFromZero()
      let merged = {
        ...fact,
        ...filtro
      }
      localStorage.setItem("facturas",
        JSON.stringify(merged)
      )
    }
    if (localStorage.getItem("cobros") == null) {
      localStorage.setItem("cobros",
        JSON.stringify(this.cobroFromZero())
      )
    }
    if (localStorage.getItem("hr") == null) {
      localStorage.setItem("hr",
        JSON.stringify(this.HRFromZero())
      )
    }

    if (localStorage.getItem("facturacion") == null || localStorage.getItem("facturacion") == 'null') {
      localStorage.setItem("facturacion",
        JSON.stringify(this.facturacionFromZero())
      )
    }
    else {
      let defaultObj = this.facturacionFromZero()
      let facObj = JSON.parse(localStorage.getItem("facturacion"))
      let merged = {
        ...defaultObj,
        ...facObj
      }
      localStorage.setItem("facturacion",
        JSON.stringify(merged)
      )
    }
    if (localStorage.getItem("cheques") == null) {
      localStorage.setItem("cheques",
        JSON.stringify(this.chequesFromZero())
      )
    }
    else {
      this.setItemFiltro("cheques", "proveedor", "")
    }
    if (localStorage.getItem("transferencias") == null) {
      localStorage.setItem("transferencias",
        JSON.stringify(this.transferFromZero())
      )
    }
    else {
      this.setItemFiltro("transferencias", "tipo", 0)
    }
    if (localStorage.getItem("flujos") == null) {
      localStorage.setItem("flujos",
        JSON.stringify(this.flujosFromZero())
      )
    }
    else {
      this.setItemFiltro("flujos", "tipo", 0)
    }
    if (localStorage.getItem("ordenes") == null) {
      localStorage.setItem("ordenes",
        JSON.stringify(this.ordenesFromZero())
      )
    }
    if (localStorage.getItem("pagos") == null) {
      localStorage.setItem("pagos",
        JSON.stringify(this.pagosFromZero())
      )
    }
    else {
      let defaultObj = this.pagosFromZero()
      let pagosObj = JSON.parse(localStorage.getItem("pagos"))
      let merged = {
        ...defaultObj,
        ...pagosObj
      }
      localStorage.setItem("pagos",
        JSON.stringify(merged)
      )

    }
    if (localStorage.getItem("rentabilidadcliente") == null) {
      localStorage.setItem("rentabilidadcliente",
        JSON.stringify(this.rentabilidadClienteFromZero())
      )
    }
    else {
      let defaultObj = this.rentabilidadClienteFromZero()
      let pagosObj = JSON.parse(localStorage.getItem("rentabilidadcliente"))
      let merged = {
        ...defaultObj,
        ...pagosObj
      }
      localStorage.setItem("rentabilidadcliente",
        JSON.stringify(merged)
      )
    }
    if (localStorage.getItem("rentabilidadproveedor") == null) {
localStorage.setItem("rentabilidadproveedor",
        JSON.stringify(this.rentabilidadProveedorFromZero())
      )
    }
    else {
      let defaultObj = this.rentabilidadProveedorFromZero()
      let pagosObj = JSON.parse(localStorage.getItem("rentabilidadproveedor"))
      let merged = {
        ...defaultObj,
        ...pagosObj
      }
      localStorage.setItem("rentabilidadproveedor",
        JSON.stringify(merged)
      )
    }

  }
  REPREMITOS() {
    return "repremitos"
  }
  REPREMITOSCLIENTES() {
    return "repremitosclientes"
  }
  REPREMITOSPROVS() {
    return "repremitosprovs"
  }
  FACTURAS() {
    return "facturas"
  }
  COBROS() {
    return "cobros"
  }
  HR() {
    return "hr"
  }
  FACTURACION() {
    return "facturacion"
  }
  CHEQUES() {
    return "cheques"
  }
  TRANSFER() {
    return "transferencias"
  }
  FLUJOS() {
    return "flujos"
  }
  ORDENES() {
    return "ordenes"
  }
  PAGOS() {
    return "pagos"
  }
  RENTABILIDADCLIENTE() {
    return "rentabilidadcliente"
  }
  RENTABILIDADPROVEEDOR() {
    return "rentabilidadproveedor"
  }
  pagosFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechadesde = primer_dia_mes.toISOString().split('T')[0]
    let fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    let proveedor = ''
    let numero = ""
    let estado = -1
    let conorden = -1

    let vehiculo = ""
    let chofer = ""
    return {
      fechadesde,
      fechahasta,
      proveedor,
      numero,
      estado,
      conorden,
      vehiculo,
      chofer
    }
  }
  ordenesFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechadesde = primer_dia_mes.toISOString().split('T')[0]
    let fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    let concepto = ''
    let proveedor = ''
    let nro = ''
    let todos = true
    let pagado = false
    return {
      fechadesde,
      fechahasta,
      concepto,
      proveedor,
      nro,
      todos,
      pagado
    }
  }
  flujosFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechaDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaHasta = ultima_dia_mes.toISOString().split('T')[0]
    let cliente = ""
    let proveedor = ""
    let tipo = 0
    return {
      fechaDesde,
      fechaHasta,
      cliente,
      proveedor,
      tipo
    };
  }
  transferFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechaDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaHasta = ultima_dia_mes.toISOString().split('T')[0]
    let cliente = ""
    let proveedor = ""
    let cbu = ""
    let alias = ""
    let bancoorigen = ""
    let bancodestino = ""
    let unidad = ""
    let tipo = 0
    return {
      fechaDesde,
      fechaHasta,
      cliente,
      proveedor,
      cbu, alias,
      bancoorigen, bancodestino,
      unidad,
      tipo
    }
  }
  chequesFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let nro = ""
    let fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    let fechaAcreditacionDesde = ""
    let fechaAcreditacionHasta = ""
    let conFechaAcreditacion = false
    let fechaEntregaDesde = ""
    let fechaEntregaHasta = ""
    let conFechaEntrega = false
    let banco = ""
    let razonSocial = ""
    let cuit = ""
    let cliente = ""
    let proveedor = ""
    let tipo = 0
    let unidad = ""
    return {
      nro,
      fechaIngresoDesde,
      fechaIngresoHasta,
      fechaAcreditacionDesde,
      fechaAcreditacionHasta,
      conFechaAcreditacion,
      fechaEntregaDesde,
      fechaEntregaHasta,
      conFechaEntrega,
      banco,
      razonSocial,
      cuit,
      cliente,
      tipo,
      unidad,
      proveedor
    }
  }
  cobroFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechadesde = primer_dia_mes.toISOString().split('T')[0]
    let fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    let cliente = ''
    return {
      fechadesde,
      fechahasta,
      cliente
    }
  }
  facturasFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechadesde = primer_dia_mes.toISOString().split('T')[0]
    let fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    let concepto = ''
    let cliente = ''
    let nro = ''
    let identidad = ''
    let todos = true
    let cobrados = false
    let enliquidacion = false
    let enrevision = true
    let aceptadocliente = false
    let cerrada = false
    return {
      fechadesde,
      fechahasta,
      fechacreaciondesde: fechadesde,
      fechacreacionhasta: fechahasta,
      concepto,
      cliente,
      nro,
      identidad,
      todos,
      cobrados,
      enliquidacion,
      enrevision,
      aceptadocliente,
      cerrada

    }
  }
  facturacionFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaEntregaDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    let fechaEntregaHasta = ultima_dia_mes.toISOString().split('T')[0]
    let nroRemito = ""
    let porFechaEntrega = false
    let nombreProveedor = ""
    let nombreVehiculo = ""
    let nombreChofer = ""
    let nombreCliente = ""
    let cliente = ""
    let nombreDestinatario = ""
    let nombreRemitente = ""
    let provincia = ""
    let localidad = ""
    let estado = ""
    let formaPago = ""
    let todos = true
    let confirmado = false
    let reubicado = false
    let facturar = true
    let conFactura = false
    let totalCero = false
    return {
      nroRemito,
      fechaIngresoDesde,
      fechaEntregaDesde,
      fechaEntregaHasta,
      fechaIngresoHasta,
      porFechaEntrega,
      nombreProveedor,
      nombreVehiculo,
      nombreChofer,
      nombreCliente,
      cliente,
      nombreDestinatario,
      nombreRemitente,
      provincia,
      localidad,
      estado,
      formaPago,
      todos,
      reubicado,
      confirmado,
      facturar,
      conFactura,
      totalCero
    }
  }
  repremitosFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaEntregaDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    let fechaEntregaHasta = ultima_dia_mes.toISOString().split('T')[0]
    let porFechaEntrega = false
    let nombreProveedor = ""
    let nombreVehiculo = ""
    let nombreChofer = ""
    let nombreCliente = ""
    let nombreDestinatario = ""
    let nombreRemitente = ""
    let provincia = ""
    let localidad = ""
    let estado = ""
    let formaPago = ""
    let todos = true
    let confirmado = false
    let reubicado = false
    let facturar = false
    let zona = ''
    return {
      nroRemito: "",
      fechaIngresoDesde,
      fechaEntregaDesde,
      fechaEntregaHasta,
      fechaIngresoHasta,
      porFechaEntrega,
      nombreProveedor,
      nombreVehiculo,
      nombreChofer,
      nombreCliente,
      nombreDestinatario,
      nombreRemitente,
      provincia,
      localidad,
      estado,
      formaPago,
      todos,
      reubicado,
      confirmado,
      facturar,
      zona
    }
  }
  repremitosClientesFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaEntregaDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    let fechaEntregaHasta = ultima_dia_mes.toISOString().split('T')[0]
    let porFechaEntrega = false
    let nombreProveedor = ""
    let nombreVehiculo = ""
    let nombreChofer = ""
    let nombreCliente = ""
    let nombreDestinatario = ""
    let nombreRemitente = ""
    let provincia = ""
    let localidad = ""
    let estado = ""
    let formaPago = ""
    let todos = true
    let confirmado = false
    let reubicado = false
    let facturar = false
    let zona = ''
    return {
      nroRemito: "",
      fechaIngresoDesde,
      fechaEntregaDesde,
      fechaEntregaHasta,
      fechaIngresoHasta,
      porFechaEntrega,
      nombreProveedor,
      nombreVehiculo,
      nombreChofer,
      nombreCliente,
      nombreDestinatario,
      nombreRemitente,
      provincia,
      localidad,
      estado,
      formaPago,
      todos,
      reubicado,
      confirmado,
      facturar,
      zona

    }
  }
  repremitosProveedorFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaEntregaDesde = primer_dia_mes.toISOString().split('T')[0]
    let fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    let fechaEntregaHasta = ultima_dia_mes.toISOString().split('T')[0]
    let porFechaEntrega = false
    let nombreProveedor = ""
    let nombreVehiculo = ""
    let nombreChofer = ""
    let nombreCliente = ""
    let nombreDestinatario = ""
    let nombreRemitente = ""
    let provincia = ""
    let localidad = ""
    let estado = ""
    let formaPago = ""
    let todos = true
    let confirmado = false
    let reubicado = false
    let facturar = false
    let zona = ''
    return {
      nroRemito: "",
      fechaIngresoDesde,
      fechaEntregaDesde,
      fechaEntregaHasta,
      fechaIngresoHasta,
      porFechaEntrega,
      nombreProveedor,
      nombreVehiculo,
      nombreChofer,
      nombreCliente,
      nombreDestinatario,
      nombreRemitente,
      provincia,
      localidad,
      estado,
      formaPago,
      todos,
      reubicado,
      confirmado,
      facturar,
      zona


    }
  }
  HRFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechadesde = primer_dia_mes.toISOString().split('T')[0]
    let fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    let fechafindesde = primer_dia_mes.toISOString().split('T')[0]
    let fechafinhasta = ultima_dia_mes.toISOString().split('T')[0]
    let estado = "-1"
    let proveedor = ""
    let vehiculo = ""
    let chofer = ""
    let nro = ""
    let confechafin = false
    return {
      fechadesde,
      fechahasta,
      fechafindesde,
      fechafinhasta,
      estado,
      proveedor,
      vehiculo,
      chofer,
      nro,
      confechafin
    }

  }
  rentabilidadClienteFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechadesde = primer_dia_mes.toISOString().split('T')[0]
    let fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    let nro = ""
    let cliente = ""
    let estadoremito = ""
    let destinatario = ""
    let remitente = ""
    return {
      fechadesde,
      fechahasta,
      nro,
      cliente,
      estadoremito,
      destinatario,
      remitente
    };
  }
  rentabilidadProveedorFromZero() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechadesde = primer_dia_mes.toISOString().split('T')[0]
    let fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    let nro = ""
    let proveedor = ""
    let estadoremito = ""
    let chofer = ""
    let vehiculo = ""
    return {
      fechadesde,
      fechahasta,
      nro,
      proveedor,
      estadoremito,
      chofer,
      vehiculo
    };
  }
  // Set a value in local storage
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
  // Get a value from local storage
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }
  setItemFiltro(nombrefiltro: string, key: string, value: any) {
    let filtro = JSON.parse(localStorage.getItem(nombrefiltro))
    filtro[key] = value
    this.setItem(nombrefiltro, JSON.stringify(filtro))
  }

  getFiltro(nombrefiltro: string) {
    return JSON.parse(localStorage.getItem(nombrefiltro))
  }
  limpiarFiltro(nombrefiltro: string) {
    if (nombrefiltro == this.REPREMITOS()) {
      this.setItem(nombrefiltro, JSON.stringify(this.repremitosFromZero()))
    }
    if (nombrefiltro == this.REPREMITOSCLIENTES()) {
      this.setItem(nombrefiltro, JSON.stringify(this.repremitosClientesFromZero()))
    }
    if (nombrefiltro == this.REPREMITOSPROVS()) {
      this.setItem(nombrefiltro, JSON.stringify(this.repremitosProveedorFromZero()))
    }
    if (nombrefiltro == this.HR()) {
      this.setItem(nombrefiltro, JSON.stringify(this.HRFromZero()))
    }
    if (nombrefiltro == this.FACTURACION()) {
      this.setItem(nombrefiltro, JSON.stringify(this.facturacionFromZero()))
    }
    if (nombrefiltro == this.CHEQUES()) {
      this.setItem(nombrefiltro, JSON.stringify(this.chequesFromZero()))
    }
    if (nombrefiltro == this.TRANSFER()) {
      this.setItem(nombrefiltro, JSON.stringify(this.transferFromZero()))
    }
    if (nombrefiltro == this.FLUJOS()) {
      this.setItem(nombrefiltro, JSON.stringify(this.flujosFromZero()))
    }
    if (nombrefiltro == this.ORDENES()) {
      this.setItem(nombrefiltro, JSON.stringify(this.ordenesFromZero()))
    }
    if (nombrefiltro == this.PAGOS()) {
      this.setItem(nombrefiltro, JSON.stringify(this.pagosFromZero()))
    }
  }
}
