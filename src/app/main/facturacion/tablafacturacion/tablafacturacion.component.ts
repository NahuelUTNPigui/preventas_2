import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { SelectFormatService } from 'app/main/common';
import { FacturacionService } from '../facturacion.service';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tablafacturacion',
  templateUrl: './tablafacturacion.component.html',
  styleUrls: ['./tablafacturacion.component.scss']
})
export class TablafacturacionComponent implements OnInit {
 

  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public datafacturar: any[] = [];
  public rows: any[];
  public estados: any[]
  public formas: any[]
  public provincias: any[]
  public localidades: any[]
  public proveedores: any[]
  public clientes: any[]
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
  public cliente = ""
  public nombreDestinatario = ''
  public nombreRemitente = ''
  public nroRemito = ''
  public confirmado = true
  public reubicado = false
  public facturar = true
  public conFactura = false
  public totalCero = false
  public todos = true
  public total = 0
  public totalkilos = 0
  public maxchars = 80
  public pendienteslen = 0
  public idremito = ''
  public fechafacturacion = new Date()
  public listaRemitos: string[] = []
  public partedos = false
  //opciones
  public opciones = [
    {id:"todo",nombre:"Todos"},
    {id:"todo",nombre:"Todos"},
    {id:"todo",nombre:"Todos"},
  ]

  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
    private _selectService: SelectFormatService,
    private _factService: FacturacionService,
    private modalService: NgbModal,
    private _filtroService: FiltrosService,
    private _router: Router

  ) { }

  ngOnInit(): void {
    let filtro = this._filtroService.getFiltro(this._filtroService.FACTURACION())

    this._selectService.getTodosClientes().then(res => {

      this.clientes = res
      this.setNombres()
    })

    this._selectService.getTodosProveedores().then(res => {
      this.proveedores = res
    })
    this._factService.todaslocalidades('').then(res => {
      this.localidades = res
    })
    this._factService.todasprovincias().then(res => {
      this.provincias = res
    })
    this._factService.todosestados().then(res => {
      this.estados = res
    })
    this._factService.todasformaspago().then(res => {
      this.formas = res
    })

    this.getFiltro(filtro)

    this.filterUpdate({})
    let factura = this._factService.retomarFactura()
    let listaremitos = factura.remitos

    for (let i = 0; i < listaremitos.length; i++) {
      this.listaRemitos.push(listaremitos[i].nroRemito)
      this.datafacturar.push(listaremitos[i])
    }
  }
  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset + 1), this.page.count)
    this.rows = []
    for (let i = min_i; i < max_i; i++) {
      this.rows.push(this.data[i])
    }
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  piso(numero) {
    return Math.round(numero)
  }
  calcularTotal() {
    let temptotal = 0
    let tempkilos = 0
    for (let i = 0; i < this.data.length; i++) {
      temptotal += this.data[i].totalViaje
      tempkilos += this.data[i].kilos
    }
    this.total = temptotal
    this.totalkilos = tempkilos

  }
  getFiltro(filtro) {
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
    this.cliente = filtro.cliente
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
    this.conFactura = filtro.conFactura
    this.totalCero = filtro.totalCero
  }
  setFiltros() {
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "nroRemito", this.nroRemito)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "fechaIngresoDesde", this.fechaIngresoDesde)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "fechaEntregaHasta", this.fechaEntregaHasta)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "fechaIngresoHasta", this.fechaIngresoHasta)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "fechaEntregaDesde", this.fechaEntregaDesde)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "porFechaEntrega", this.porFechaEntrega)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "nombreProveedor", this.nombreProveedor)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "nombreVehiculo", this.nombreVehiculo)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "nombreChofer", this.nombreChofer)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "nombreCliente", this.nombreCliente)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "cliente", this.cliente)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "nombreDestinatario", this.nombreDestinatario)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "nombreRemitente", this.nombreRemitente)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "provincia", this.provincia)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "localidad", this.localidad)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "estado", this.estado)

    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "formaPago", this.formaPago)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "todos", this.todos)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "confirmado", this.confirmado)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "reubicado", this.reubicado)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "facturar", this.facturar)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "conFactura", this.conFactura)
    this._filtroService.setItemFiltro(this._filtroService.FACTURACION(), "totalCero", this.totalCero)
  }
  setNombres() {
    this.nombreCliente = ""

    if (this.cliente != "") {
      let idx_cliente = this.clientes.findIndex(c => c.id == this.cliente)
      if (idx_cliente != -1) {
        let c = this.clientes[idx_cliente]
        this.nombreCliente = c.nombre
      }
    }


  }
  onChangeCliente() {
    this.setNombres()
    this.filterUpdate({})
  }
  filterUpdate(event) {

    this.setFiltros()

    this.page.offset = 0;
    this.page.count = 0
    this._factService.facturaRemitos(
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
      this.conFactura,
      this.totalCero
    ).then(res => {
      if (this.estado == "") {
        this._factService.facturaRemitos(
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
          this._factService.estadoPendiente(),
          this.formaPago,
          this.todos,
          this.reubicado,
          this.confirmado,
          this.facturar,
          this.conFactura,
          this.totalCero
        ).then(resdepe => {

          this.data = res.concat(resdepe)
          this.data.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
          this.data = this.data.map(item => {
            return {
              ...item,
              observacioncorto: item.observacion.substr(0, this.maxchars)
            }
          })
          this.page.count = this.data.length
          this.calcularTotal()
          this.loadPage();
        })
      }
      else {
        this.data = res
        this.data.sort((r1, r2) => new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1 : -1)
        this.data = this.data.map(item => {
          return {
            ...item,
            observacioncorto: item.observacion.substr(0, this.maxchars)
          }
        })
        this.page.count = this.data.length
        this.calcularTotal()
        this.loadPage();
      }

    })
  }
  estaEnFacturar(id) {
    let rs = this.datafacturar.filter(r => r.id == id)
    return rs.length > 0
  }
  quitarRemito(id: string) {
    this.datafacturar = this.datafacturar.filter(r => r.id != id)
    this.listaRemitos = []
    for (let i = 0; i < this.datafacturar.length; i++) {
      this.listaRemitos.push(this.datafacturar[i].nroRemito)
    }

    this.loadPage()
  }

  agregarRemito(id) {
    let rem = this.rows.filter(r => r.id == id)[0]
    let idx = this.datafacturar.findIndex(df => df.id == id)
    if (rem && idx == -1) {

      this.datafacturar.push(rem)
      this.listaRemitos.push(rem.nroRemito)
    }
  }
  onCheckboxChange(row) {
    if (this.estaEnFacturar(row.id)) {
      this.quitarRemito(row.id)
    }
    else {
      this.agregarRemito(row.id)
    }
  }
  cerrarModalFact(modal) {
    modal.dismiss('Cross click')
    this.filterUpdate({})
    //Un cerrar para facturar un cerrar para cerrar normal
    this.listaRemitos = []
  }
  modalFactOpen(modalFact) {
    this.modalService.open(modalFact, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  modalEditRemitoOpen(modalEdit, idremito) {
    this.idremito = idremito
    this.modalService.open(modalEdit, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  finEditarRemito(remito) {
    //Swal.fire("Debes limpiar la lista de remitos")
    let indice = this.data.findIndex(r => r.id == remito.id)
    this.total -= Number(this.data[indice].totalViaje)
    this.totalkilos -= Number(this.data[indice].kilos)
    this.data[indice] = remito
    this.total += Number(this.data[indice].totalViaje)
    this.totalkilos += Number(this.data[indice].kilos)

    this.filterUpdate({})
  }
  cerrarModalEdit(modal, remito) {
    modal.dismiss('Cross click')
    this.finEditarRemito(remito)
  }
  eventoEditarRemito(remito) {

    this.finEditarRemito(remito)

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
  agregarLista() {

    for (let i = 0; i < this.data.length; i++) {
      let idx = this.datafacturar.findIndex(df => df.id == this.data[i].id)
      if (idx == -1) {
        this.datafacturar.push(this.data[i])
        this.listaRemitos.push(this.data[i].nroRemito)
      }
    }
  }
  limpiarLista() {
    this.datafacturar = []
    this.listaRemitos = []
    this._factService.crearFactura(this.datafacturar)
  }


  showRemitosCargados() {
    let rs = ""
    if (this.listaRemitos.length == 0) {
      return rs
    }
    for (let i = 0; i < this.listaRemitos.length; i++) {
      rs += " " + this.listaRemitos[i]
      if (i != (this.listaRemitos.length - 1)) {
        rs += ","
      }

    }
    return rs
  }
  limpiarFiltros() {
    let filtro = this._filtroService.facturacionFromZero()
    this.getFiltro(filtro)
    this.filterUpdate({})

  }
  crearFactura() {

    this._factService.crearFactura(this.datafacturar)
    this._router.navigateByUrl("/facturacion/liquidacion")
  }
  retomarFactura() {


    this._router.navigateByUrl("/facturacion/liquidacion")
  }
  toggleSecond() {
    this.partedos = !this.partedos
  }

  

}
