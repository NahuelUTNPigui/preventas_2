import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReportesService } from '../reportes.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { SelectFormatService } from 'app/main/common';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-reporteremitos',
  templateUrl: './reporteremitos.component.html',
  styleUrls: ['./reporteremitos.component.scss']
})
export class ReporteremitosComponent implements OnInit, OnDestroy {
  //Permisos
  public conpermisos = false
  public todosRemitos = []
  public selectedOption = 10;
  //public filtro:any;
  public searchValue = '';
  public data: any[];
  public dataprocesada: any[];
  public rows: any[];
  public estados: any[]
  public formas: any[]
  public provincias: any[]
  public localidades: any[]
  public proveedores: any[]
  public ColumnMode = ColumnMode;
  public fechaIngresoDesde = ''
  public fechaIngresoHasta = ''
  public fechaEntregaDesde = ''
  public fechaEntregaHasta = ''
  public porFechaEntrega = false
  public estado = ''
  public formaPago = ''
  public provincia = ''
  public localidad = ''
  public nombreProveedor = ''
  public nombreVehiculo = ''
  public nombreChofer = ''
  public nombreCliente = ''
  public nombreDestinatario = ''
  public nombreRemitente = ''
  public nroRemito = ''
  public zona = ''
  public confirmado = false
  public reubicado = false
  public facturar = false
  public todos = true
  public total = 0
  public stotal = ""
  public totalkilos = 0
  public stotalkilos = ""
  public maxchars = 80
  public pendienteslen = 0
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0, // Página actual
  };
  //Triggers

  private searchTrigger$ = new Subject<any>();
  private destroy$ = new Subject<any>();
  constructor(
    private _selectServoce: SelectFormatService,
    private _reporteService: ReportesService,
    private modalService: NgbModal,
    private _filtroService: FiltrosService
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this.searchTrigger$.pipe(

      debounceTime(200),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.filterUpdate({})
    })
    let filtro = this._filtroService.getFiltro(this._filtroService.REPREMITOS())

    this._selectServoce.getTodosProveedores().then(res => {
      this.proveedores = res
    })
    //Nuevo metodo
    this.nroRemito = filtro.nroRemito
    //Fechas
    this.fechaIngresoDesde = filtro.fechaIngresoDesde
    this.fechaEntregaDesde = filtro.fechaEntregaDesde
    this.fechaIngresoHasta = filtro.fechaIngresoHasta
    this.fechaEntregaHasta = filtro.fechaEntregaHasta
    // Los demas
    this.porFechaEntrega = filtro.porFechaEntrega;
    this.nombreProveedor = filtro.nombreProveedor
    this.nombreVehiculo = filtro.nombreVehiculo
    this.nombreChofer = filtro.nombreChofer
    this.nombreCliente = filtro.nombreCliente
    this.nombreDestinatario = filtro.nombreDestinatario
    this.nombreRemitente = filtro.nombreRemitente
    this.provincia = filtro.provincia
    this.localidad = filtro.localidad
    this.estado = filtro.estado
    this.formaPago = filtro.formaPago
    this.todos = filtro.todos
    this.confirmado = filtro.confirmado
    this.reubicado = filtro.reubicado
    this.facturar = filtro.facturar
    this.zona = filtro.zona

    this._reporteService.todaslocalidades('').then(res => {
      this.localidades = res
    })
    this._reporteService.todasprovincias().then(res => {
      this.provincias = res
    })
    this._reporteService.todosestados().then(res => {
      this.estados = res
    })
    this._reporteService.todasformaspago().then(res => {
      this.formas = res
    })
    this.loadPage()
  }

  formatPeso(value) {
    return value.toLocaleString('es-ar', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    });
  }
  formatKilo(value) {
    return new Intl.NumberFormat("es-ar", {
      style: "decimal",
      maximumFractionDigits: 0, minimumFractionDigits: 0
    }).format(value);
  }
  setfiltros() {
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "nroRemito", this.nroRemito)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "fechaIngresoDesde", this.fechaIngresoDesde)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "fechaEntregaHasta", this.fechaEntregaHasta)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "fechaIngresoHasta", this.fechaIngresoHasta)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "fechaEntregaDesde", this.fechaEntregaDesde)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "porFechaEntrega", this.porFechaEntrega)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "nombreProveedor", this.nombreProveedor)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "nombreVehiculo", this.nombreVehiculo)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "nombreChofer", this.nombreChofer)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "nombreCliente", this.nombreCliente)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "nombreDestinatario", this.nombreDestinatario)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "nombreRemitente", this.nombreRemitente)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "provincia", this.provincia)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "localidad", this.localidad)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "estado", this.estado)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "formaPago", this.formaPago)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "todos", this.todos)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "confirmado", this.confirmado)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "reubicado", this.reubicado)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "facturar", this.facturar)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOS(), "zona", this.zona)
  }
  filterUpdateKeyUp(event) {
    this.searchTrigger$.next()
    //this.filterUpdate(event)
  }
  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    this.setfiltros()
    this.page.count = 0
    this.page.offset = 0
    /*
    this._reporteService.reporteRemitos(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado==="nopen"?"":this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona
    ).then(res=>{
        
      if(this.estado==="" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == ''){
        //Agregar los pendientes
        this._reporteService.reporteRemitos(
          this.nroRemito,
          this.fechaIngresoDesde,
          this.fechaIngresoHasta,
          this.porFechaEntrega,
          this.fechaEntregaDesde,
          this.fechaEntregaHasta,
          this.nombreProveedor,
          this.nombreVehiculo,
          this.nombreChofer,
          this.nombreCliente,
          this.nombreDestinatario,
          this.nombreRemitente,
          this.provincia,
          this.localidad,
          this._reporteService.estadoPendiente(),
          this.formaPago,
          this.todos,
          this.reubicado,
          this.confirmado,
          this.facturar,
          this.zona
        ).then(respen=>{
          this.data = res.items.concat(respen.items)
          this.pendienteslen = respen.totalItems
          this.data.sort((r1,r2)=>new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1:-1)
          // lo normal
          this.data = this.data.map(item=>{
            return {
              ...item,
              observacioncorto:item.observacion.substr(0,this.maxchars)
            }
          })
          this.page.count = respen.totalItems + res.totalItems
          this.page.tempfin = this.data.length
          this.loadPage()
          
        })
      }
      else {
        this.data = res.items.map(item=>{
          return {
            ...item,
            observacioncorto:item.observacion.substr(0,this,this.maxchars)
          }
        })
        this.page.count = this.data.length
        
        if(this.estado === this._reporteService.estadoPendiente()){
          this.pendienteslen = this.data.length
        }
        this.page.tempfin = this.data.length
        this.loadPage()
      }
      
    })
    */
    this.loadPage()

  }
  limpiarFiltros() {
    this.nroRemito = ''
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaEntregaDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.fechaEntregaHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.porFechaEntrega = false
    this.nombreProveedor = ""
    this.nombreVehiculo = ""
    this.nombreChofer = ""
    this.nombreCliente = ""
    this.nombreDestinatario = ""
    this.nombreRemitente = ""
    this.provincia = ""
    this.localidad = ""
    this.estado = ""
    this.formaPago = ""
    this.todos = true
    this.confirmado = false
    this.reubicado = false
    this.facturar = false
    this.setfiltros()
    //this._filtroService.limpiarFiltro(this._filtroService.REPREMITOS())
    this.loadPage()
  }
  loadPage() {
    let conPendiente = this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == ''
    let skipTotal = false
    if (this.page.offset > 0) {
      skipTotal = true
    }
    this._reporteService.getReporteRemitoPaginacion(
      this.page.size,
      this.page.offset,
      skipTotal,
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado === "nopen" ? "" : this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona,
      conPendiente
    ).subscribe(res => {
      if (!skipTotal) {
        this.page.count = res.totalItems
      }

      this.rows = res.items.map(item => ({ ...item, nroRemito: item.nroRemito + (item.reubicado ? "*" : "") }))
      //this.rows = res.items.map(item=>({...item}))
    })


  }

  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage()

  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage()

  }
  formatDateExcel(fechaString: string, final: boolean) {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const dia = fecha.getUTCDate();
    const mes = fecha.getUTCMonth() + 1;
    const anio = fecha.getUTCFullYear();
    const fechaFormateada = !final ? `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}` : `${(dia - 1).toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
    return fechaFormateada;
  }
  crearArchivoXLSX(lista) {
    let csvData = lista.map(item => ({
      FechaIngreso: this.formatDateExcel(item.fechaIngreso, false),
      Facturar: item.facturar ? "Facturar" : "No facturar",
      Cliente: item.expand.cliente.nombre,
      RTO: item.nroRemito,
      KG: item.kilos,
      Boca_Bultos: item.bultos,
      Remitente: item.expand.remitente.nombre,
      Destinatario: item.expand.destinatario.nombre,
      Localidad: item.expand?.destinatario?.expand?.localidad?.nombre,
      Estado: item.expand.estado.nombre,
      Conformado: item.confirmado ? 'Conformado' : 'No conformado',
      Reubicado: item.reubicado ? 'Reubicado' : 'No reubicado',
      Proveedor: this.estado === this._reporteService.estadoPendiente() ? "" : item.expand?.proveedor?.nombre,
      Chofer: this.estado === this._reporteService.estadoPendiente() ? "" : item.expand?.chofer?.nombre,
      Vehiculo: this.estado === this._reporteService.estadoPendiente() ? "" : item.expand?.vehiculo?.nombre,
      FechaEntrega: this.estado === this._reporteService.estadoPendiente() ? "" : this.formatDateExcel(item.fechaEntrega, false),
      Observaciones: item.observacion,
      Novedades: item.novedad,
      PorcentajeCobro: item.porcentajeCobro + '%',
      ValorDeclarado: '$' + item.valorDeclarado,
      PrecioUnitario: '$' + item.precioUnitario,
      Total: '$' + item.totalViaje,
      FormaPago: item.expand?.cliente?.expand?.formaPago?.nombre,
      Responsable: item.expand.responsable.username,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wsFilters = XLSX.utils.aoa_to_sheet([
      ['Filtro', 'Valor'],
      ['Fecha ingreso desde ', this.formatDateExcel(this.fechaIngresoDesde, false)],
      ['Fecha ingreso hasta ', this.formatDateExcel(this.fechaIngresoHasta, false)],
      ['Por fecha egreso', this.porFechaEntrega ? "Si" : "no"],
      ['Fecha entrega desde ', this.formatDateExcel(this.fechaEntregaDesde, false)],
      ['Fecha entrega hasta ', this.formatDateExcel(this.fechaEntregaHasta, false)],
      ['Estado', this.estado ? this.estados.find(e => e.id === this.estado)?.nombre : "-"],
      ['Forma de cobro', this.formaPago ? this.formas.find(f => f.id === this.formaPago)?.nombre : "-"],
      ['Provincia', this.provincia],
      ['Localidad', this.localidad],
      ['Proveedor', this.nombreProveedor],
      ['Chofer', this.nombreChofer],
      ['Vehiculo', this.nombreVehiculo],
      ['Cliente', this.nombreCliente],
      ['Destinatario', this.nombreDestinatario],
      ['Remitente', this.nombreRemitente],
      ['Nro remito', this.nroRemito],
      ['Por reubicado o conformado?', this.todos ? "No" : "Si"],
      ['Conformado', this.confirmado ? "Si" : "No"],
      ["Reubicado", this.reubicado ? "Si" : "No"]
    ]);

    XLSX.utils.book_append_sheet(wb, ws, 'Remitos');
    XLSX.utils.book_append_sheet(wb, wsFilters, 'Filtros aplicados');

    XLSX.writeFile(wb, 'Reporte Remitos.xlsx');
  }
  exportarXLSX2() {
    let conPendiente = this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == ''
    this._reporteService.reporteRemitosConPendiente(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado === "nopen" ? "" : this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona,
      conPendiente
    ).then(res => {
      let lista = res.items.map(item => {
        return {
          ...item,
          observacioncorto: item.observacion.substr(0, this, this.maxchars)
        }
      })
      lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
      this.crearArchivoXLSX(lista)
    })
  }
  exportarXLSX() {
    let conPendiente = this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == ''
    this._reporteService.reporteRemitos(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado === "nopen" ? "" : this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona

    ).then(res => {
      if (this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == '') {
        //Agregar los pendientes
        this._reporteService.reporteRemitos(
          this.nroRemito,
          this.fechaIngresoDesde,
          this.fechaIngresoHasta,
          this.porFechaEntrega,
          this.fechaEntregaDesde,
          this.fechaEntregaHasta,
          this.nombreProveedor,
          this.nombreVehiculo,
          this.nombreChofer,
          this.nombreCliente,
          this.nombreDestinatario,
          this.nombreRemitente,
          this.provincia,
          this.localidad,
          this._reporteService.estadoPendiente(),
          this.formaPago,
          this.todos,
          this.reubicado,
          this.confirmado,
          this.facturar,
          this.zona
        ).then(respen => {

          let lista = res.items.concat(respen.items)
          lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
          // lo normal
          lista = lista.map(item => {
            return {
              ...item,
              observacioncorto: item.observacion.substr(0, this.maxchars)
            }
          })
          this.crearArchivoXLSX(lista)


        })
      }
      else {
        let lista = res.items.map(item => {
          return {
            ...item,
            observacioncorto: item.observacion.substr(0, this, this.maxchars)
          }
        })
        lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
        this.crearArchivoXLSX(lista)
      }
    })
  }
  crearArchivoFacturacionXLSX(lista) {
    let csvdata = lista.map(item => ({
      ESTADO: item.expand.estado.nombre,
      FACTURAR: item.facturar ? "Facturar" : "No facturar",
      FECHAINGRESO: this.formatDateExcel(item.fechaIngreso, false),
      CLIENTE: item.expand?.cliente?.nombre,
      RTO: item.nroRemito,
      REUBICADO: item.reubicado ? "Si" : "No",
      KG: item.kilos,
      BULTOS: item.bultos,
      DESTINATARIO: item.expand?.destinatario?.nombre,
      LOCALIDAD: item.expand?.destinatario?.expand?.localidad?.nombre,
      FECHAENTREGA: this.estado === this._reporteService.estadoPendiente() ? "" : this.formatDateExcel(item.fechaEntrega, false),
      OBSERVACION: item.observacion,
      NOVEDAD: item.novedad,
      PUN: item.precioUnitario,
      TOTAL: item.totalViaje
    }))

    csvdata.sort((c1, c2) => c1.FECHAINGRESO < c2.FECHAINGRESO ? -1 : 1)
    //let totalreporte = [{TOTALREPORTE:this.total}]
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])

    ws['A1'] = { t: 's', v: `${this.nombreCliente} - INGRESOS DESDE ${this.formatDateExcel(this.fechaIngresoDesde, false)} HASTA ${this.formatDateExcel(this.fechaIngresoHasta, false)}`, s: {} };
    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    //XLSX.utils.sheet_add_json(ws,totalreporte,{origin:'O2'})
    XLSX.utils.book_append_sheet(wb, ws, 'Remitos facturacion');
    XLSX.writeFile(wb, `${this.nombreCliente} - ${this.fechaIngresoDesde.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
  }
  exportarFacturacionXLSX2() {
    let conPendiente = this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == ''
    this._reporteService.reporteRemitosConPendiente(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado === "nopen" ? "" : this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona,
      conPendiente
    ).then(res => {
      let lista = res.items.map(item => {
        return {
          ...item,
          observacioncorto: item.observacion.substr(0, this, this.maxchars)
        }
      })
      lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
      this.crearArchivoFacturacionXLSX(lista)
    })
  }
  exportarFacturacionXLSX() {
    this._reporteService.reporteRemitos(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado === "nopen" ? "" : this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona
    ).then(res => {

      if (this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == '') {
        //Agregar los pendientes
        this._reporteService.reporteRemitos(
          this.nroRemito,
          this.fechaIngresoDesde,
          this.fechaIngresoHasta,
          this.porFechaEntrega,
          this.fechaEntregaDesde,
          this.fechaEntregaHasta,
          this.nombreProveedor,
          this.nombreVehiculo,
          this.nombreChofer,
          this.nombreCliente,
          this.nombreDestinatario,
          this.nombreRemitente,
          this.provincia,
          this.localidad,
          this._reporteService.estadoPendiente(),
          this.formaPago,
          this.todos,
          this.reubicado,
          this.confirmado,
          this.facturar,
          this.zona
        ).then(respen => {
          let lista = res.items.concat(respen.items)
          lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
          // lo normal
          lista = lista.map(item => {
            return {
              ...item,
              observacioncorto: item.observacion.substr(0, this.maxchars)
            }
          })
          this.crearArchivoFacturacionXLSX(lista)


        })
      }
      else {
        let lista = res.items.map(item => {
          return {
            ...item,
            observacioncorto: item.observacion.substr(0, this, this.maxchars)
          }
        })
        lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
        this.crearArchivoFacturacionXLSX(lista)
      }
    })
  }
  agruparPorDiaChofer(data) {
    let agrupador = {}
    let lista = []
    for (let i = 0; i < data.length; i++) {
      let item = data[i]
      let fecha = this.formatDateExcel(item.fechaEntrega, false)
      let cliente = item.expand?.cliente.nombre
      let localidad = item.expand?.destinatario.expand?.localidad.nombre
      let chofer = item.expand.chofer.nombre
      if (!agrupador[fecha]) {
        agrupador[fecha] = {}
        agrupador[fecha][chofer] = {
          fecha,
          proveedor: '-',
          chofer: item.expand.chofer.nombre,
          cliente,
          localidad
        }
      }
      else {
        if (!agrupador[fecha][chofer]) {
          agrupador[fecha][chofer] = {
            fecha,
            proveedor: '-',
            chofer: item.expand.chofer.nombre,
            cliente,
            localidad
          }
        }
      }
    }
    Object.entries(agrupador).forEach(key => {
      Object.entries(agrupador[key[0]]).forEach(fila => {
        lista.push(fila[1])
      })

    })
    return lista
  }
  async crearOrdenPagoXLSX(lista, conPendientes, modalInvalidOrdenpago) {
    if (conPendientes) {
      this.modalService.open(modalInvalidOrdenpago, {
        centered: true,
        size: 'lg',
        windowClass: 'modal modal-primary'
      });
    }
    else {
      let fecha = new Date(this.fechaEntregaDesde)
      fecha = new Date(fecha.getTime() + 3 * 60 * 60000)
      let mes = fecha.toLocaleString('default', { month: 'long' })
      let totalegeo = [{ TOTALEGEO: this.total }]
      let totalproveedor = [{ TOTALPROVEEDOR: 0 }]
      //Hoja 11
      let csvdata1 = lista.map(item => ({
        RTO: item.nroRemito,
        REUBICADO: item.reubicado ? "Si" : "No",
        FECHA: this.formatDateExcel(item.fechaEntrega, false),
        CLIENTE: item.expand?.cliente.nombre,
        DESTINO: item.expand?.destinatario.expand?.localidad.nombre,
        KILO: item.kilos,
        BULTO: item.bultos,
        CHOFER: item.expand.chofer.nombre,
        PROVEEDOR: "",
        EGEO: item.totalViaje
      }))
      csvdata1.sort((c1, c2) => c1.FECHA < c2.FECHA ? -1 : 1)

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `PROVEEDOR: ${this.nombreProveedor} - ENTREGAS DESDE ${this.formatDateExcel(this.fechaEntregaDesde, false)} HASTA ${this.formatDateExcel(this.fechaEntregaHasta, false)}`, s: {} };
      const range = XLSX.utils.decode_range('A1:I1');
      ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
      XLSX.utils.sheet_add_json(ws, csvdata1, { origin: 'A2' });
      XLSX.utils.sheet_add_json(ws, totalegeo, { origin: 'M2' });
      XLSX.utils.sheet_add_json(ws, totalproveedor, { origin: 'N2' });

      XLSX.utils.book_append_sheet(wb, ws, 'Rentabilidad');
      // Hoja 2 Agrupar por fecha 
      let temp = this.agruparPorDiaChofer(lista)
      let csvdata2 = temp.map(item => ({
        FECHA: item.fecha,
        CLIENTE: item.cliente,
        LOCALIDAD: item.localidad,
        CHOFER: item.chofer,
        PROVEEDOR: item.proveedor

      }))
      csvdata2.sort((c1, c2) => c1.FECHA < c2.FECHA ? -1 : 1)

      const ws2 = XLSX.utils.aoa_to_sheet([])
      ws2['A1'] = { t: 's', v: `PROVEEDOR: ${this.nombreProveedor} - ENTREGAS DESDE ${this.formatDateExcel(this.fechaEntregaDesde, false)} HASTA ${this.formatDateExcel(this.fechaEntregaHasta, false)}`, s: {} };
      const range2 = XLSX.utils.decode_range('A1:I1');
      ws2['!merges'] = [{ s: { r: range2.s.r, c: range2.s.c }, e: { r: range2.e.r, c: range2.e.c } }];
      XLSX.utils.sheet_add_json(ws2, csvdata2, { origin: 'A2' });
      XLSX.utils.sheet_add_json(ws2, totalproveedor, { origin: 'J2' });

      XLSX.utils.book_append_sheet(wb, ws2, 'Orden de pago');
      // Hoja 3 el tarifario del proveedor
      if (this.nombreProveedor != "") {
        let mañanafechaentregadesde = this.addDays(this.fechaEntregaDesde, 1).toISOString().split('T')[0]
        let ayerfechaentregahasta = this.addDays(this.fechaEntregaHasta, -1).toISOString().split('T')[0]

        let tarifariocompleto = await this._reporteService.getTodosTarifaProveedor(this.nombreProveedor, mañanafechaentregadesde, ayerfechaentregahasta)

        let csvData3 = tarifariocompleto.map(item => ({
          PROVEEDOR: item.expand.proveedor.nombre,
          FECHADESDE: item.fechadesde,
          FECHAHASTA: item.fechahasta,
          PRECIO: item.precio,
          UNIDAD: item.expand.unidad.nombre,
          DESCRIPCION: item.descripcion
        }))
        const ws3 = XLSX.utils.aoa_to_sheet([])
        ws3['A1'] = { t: 's', v: `TARIFA DEL PROVEEDOR: ${this.nombreProveedor} - ENTREGAS DESDE ${this.formatDateExcel(this.fechaIngresoDesde, false)} HASTA ${this.formatDateExcel(this.fechaIngresoHasta, false)}`, s: {} };
        const range = XLSX.utils.decode_range('A1:I1');
        ws3['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
        XLSX.utils.sheet_add_json(ws3, csvData3, { origin: 'A2' });
        XLSX.utils.book_append_sheet(wb, ws3, 'Tarifa proveedor');

      }
      XLSX.writeFile(wb, `${this.nombreProveedor} - ${mes}.xlsx`, { cellStyles: true });
    }
  }
  async exportartOrdenPagoXLSX(modalInvalidOrdenpago) {
    this._reporteService.reporteRemitos(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado === "nopen" ? "" : this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona
    ).then(async res => {

      if (this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == '') {
        //Agregar los pendientes
        this._reporteService.reporteRemitos(
          this.nroRemito,
          this.fechaIngresoDesde,
          this.fechaIngresoHasta,
          this.porFechaEntrega,
          this.fechaEntregaDesde,
          this.fechaEntregaHasta,
          this.nombreProveedor,
          this.nombreVehiculo,
          this.nombreChofer,
          this.nombreCliente,
          this.nombreDestinatario,
          this.nombreRemitente,
          this.provincia,
          this.localidad,
          this._reporteService.estadoPendiente(),
          this.formaPago,
          this.todos,
          this.reubicado,
          this.confirmado,
          this.facturar,
          this.zona
        ).then(async respen => {
          if (respen.items.length > 0) {
            this.crearOrdenPagoXLSX([], true, modalInvalidOrdenpago)
          }
          let lista = res.items.concat(respen.items)
          lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
          // lo normal
          lista = lista.map(item => {
            return {
              ...item,
              observacioncorto: item.observacion.substr(0, this.maxchars)
            }
          })
          await this.crearOrdenPagoXLSX(lista, false, modalInvalidOrdenpago)


        })
      }
      else {
        let lista = res.items.map(item => {
          return {
            ...item,
            observacioncorto: item.observacion.substr(0, this, this.maxchars)
          }
        })
        lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
        await this.crearOrdenPagoXLSX(lista, false, modalInvalidOrdenpago)
      }
    })

  }
  crearHojaRutaXLSX(lista) {
    let datacambiado = lista.map(d => {
      if (d.estado === '0kxg8jr071yozsk') {
        let dmejorado = { ...d }
        dmejorado.expand.proveedor = {}
        dmejorado.expand.chofer = {}
        dmejorado.expand.vehiculo = {}
        dmejorado.expand.proveedor.nombre = ''
        dmejorado.expand.chofer.nombre = ''
        dmejorado.expand.vehiculo.nombre = ''
        dmejorado.fechaEntrega = ''
        return dmejorado
      }
      else {
        return d
      }
    })
    let primerremito = datacambiado[0]
    const proveedor = primerremito.expand?.proveedor.nombre
    const chofer = primerremito.expand?.chofer.nombre
    const vehiculo = primerremito.expand?.vehiculo.nombre
    const fechaEntrega = this.formatDateExcel(primerremito.fechaEntrega, false)
    let csvdata = datacambiado.map(item => ({
      RTO: item.nroRemito,
      KG: item.kilos,
      BULTOS: item.bultos,
      REMITENTE: item.expand.remitente.nombre,
      DESTINATARIO: item.expand.destinatario.nombre,
      LOCALIDAD: item.expand?.destinatario?.expand?.localidad?.nombre,
      OBSERVACION: item.expand?.destinatario?.observacion
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    ws['A1'] = { t: 's', v: `Chofer: ${chofer} - ${vehiculo} - Proveedor: ${proveedor} - ${fechaEntrega} `, s: {} };

    const range = XLSX.utils.decode_range('A1:I1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];

    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });

    const wsFilters = XLSX.utils.aoa_to_sheet([
      ['Fecha de entrega', fechaEntrega],
      ['Proveedor', proveedor],
      ['Chofer', chofer],
      ['Vehículo', vehiculo]
    ]);

    XLSX.utils.book_append_sheet(wb, ws, 'Remitos incluidos');
    XLSX.utils.book_append_sheet(wb, wsFilters, 'Hoja de ruta');

    XLSX.writeFile(wb, `${proveedor} - ${fechaEntrega.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
  }
  exportarHojaRutaXLSX() {
    this._reporteService.reporteRemitos(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado === "nopen" ? "" : this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona
    ).then(res => {

      if (this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == '') {
        //Agregar los pendientes
        this._reporteService.reporteRemitos(
          this.nroRemito,
          this.fechaIngresoDesde,
          this.fechaIngresoHasta,
          this.porFechaEntrega,
          this.fechaEntregaDesde,
          this.fechaEntregaHasta,
          this.nombreProveedor,
          this.nombreVehiculo,
          this.nombreChofer,
          this.nombreCliente,
          this.nombreDestinatario,
          this.nombreRemitente,
          this.provincia,
          this.localidad,
          this._reporteService.estadoPendiente(),
          this.formaPago,
          this.todos,
          this.reubicado,
          this.confirmado,
          this.facturar,
          this.zona
        ).then(respen => {

          let lista = res.items.concat(respen.items)
          lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
          // lo normal
          lista = lista.map(item => {
            return {
              ...item,
              observacioncorto: item.observacion.substr(0, this.maxchars)
            }
          })
          this.crearHojaRutaXLSX(lista)


        })
      }
      else {
        let lista = res.items.map(item => {
          return {
            ...item,
            observacioncorto: item.observacion.substr(0, this, this.maxchars)
          }
        })
        lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
        this.crearHojaRutaXLSX(lista)
      }
    })
  }
  totales(lista) {
    let temptotal = 0
    let tempkilos = 0
    for (let i = 0; i < lista.length; i++) {
      temptotal += lista[i].totalViaje
      tempkilos += lista[i].kilos
    }
    this.total = temptotal
    this.stotal = this.formatPeso(this.total)
    this.totalkilos = tempkilos
    this.stotalkilos = this.formatKilo(this.totalkilos)
  }
  openAnalisis(modalAnalisisEvolucion) {
    this._reporteService.reporteRemitos(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado === "nopen" ? "" : this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona
    ).then(res => {

      if (this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == '') {
        //Agregar los pendientes
        this._reporteService.reporteRemitos(
          this.nroRemito,
          this.fechaIngresoDesde,
          this.fechaIngresoHasta,
          this.porFechaEntrega,
          this.fechaEntregaDesde,
          this.fechaEntregaHasta,
          this.nombreProveedor,
          this.nombreVehiculo,
          this.nombreChofer,
          this.nombreCliente,
          this.nombreDestinatario,
          this.nombreRemitente,
          this.provincia,
          this.localidad,
          this._reporteService.estadoPendiente(),
          this.formaPago,
          this.todos,
          this.reubicado,
          this.confirmado,
          this.facturar,
          this.zona
        ).then(respen => {

          let lista = res.items.concat(respen.items)
          lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)

          this.todosRemitos = lista
          this.modalService.open(modalAnalisisEvolucion, {
            size: 'xl',
            centered: true,
            windowClass: 'modal modal-primary'
          })
        })
      }
      else {
        let lista = res.items
        lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
        this.todosRemitos = lista
        this.modalService.open(modalAnalisisEvolucion, {
          size: 'xl',
          centered: true,
          windowClass: 'modal modal-primary'
        })
      }

    })

  }
  calcularTotal() {
    this._reporteService.reporteRemitos(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado === "nopen" ? "" : this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona
    ).then(res => {

      if (this.estado === "" && this.nombreProveedor == '' && this.nombreVehiculo == '' && this.nombreChofer == '') {
        //Agregar los pendientes
        this._reporteService.reporteRemitos(
          this.nroRemito,
          this.fechaIngresoDesde,
          this.fechaIngresoHasta,
          this.porFechaEntrega,
          this.fechaEntregaDesde,
          this.fechaEntregaHasta,
          this.nombreProveedor,
          this.nombreVehiculo,
          this.nombreChofer,
          this.nombreCliente,
          this.nombreDestinatario,
          this.nombreRemitente,
          this.provincia,
          this.localidad,
          this._reporteService.estadoPendiente(),
          this.formaPago,
          this.todos,
          this.reubicado,
          this.confirmado,
          this.facturar,
          this.zona
        ).then(respen => {

          let lista = res.items.concat(respen.items)
          lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
          // lo normal
          lista = lista.map(item => {
            return {
              ...item,
              observacioncorto: item.observacion.substr(0, this.maxchars)
            }
          })
          this.totales(lista)


        })
      }
      else {
        let lista = res.items.map(item => {
          return {
            ...item,
            observacioncorto: item.observacion.substr(0, this, this.maxchars)
          }
        })
        lista.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
        this.totales(lista)
      }
    })
  }
  piso(numero) {
    return Math.round(numero)
  }
  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
