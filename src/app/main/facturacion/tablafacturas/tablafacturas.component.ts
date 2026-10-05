import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import { FacturacionService } from '../facturacion.service';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tablafacturas',
  templateUrl: './tablafacturas.component.html',
  styleUrls: ['./tablafacturas.component.scss']
})
export class TablafacturasComponent implements OnInit {
  public conpermisos = false
  public data: any[] = []
  public rows: any[] = []
  public clientes = []
  public facturas = []
  public opciones = [
    { id: "todo", nombre: "Todos" },
    { id: "revi", nombre: "En revisión" },
    { id: "liqi", nombre: "En liquidación" },
    { id: "acep", nombre: "Acepta cliente" },
    { id: "cobr", nombre: "Cobrada" },
    { id: "cerr", nombre: "Cerrada" },
  ]
  public opcionSeleccionada = "todo"
  public listafacturas = ''

  public monthyear = ''
  public nroFactura = ''
  public identidad = ''

  public cliente = ''
  public nombreCliente = ''
  public fechaDesde = ''
  public fechaHasta = ""
  public fechaCreacionDesde = ''
  public fechaCreacionHasta = ""
  //Nota credito
  public facturaid = ''
  public notadescripcion = ''
  public notamonto = 0
  public notanumero = ''
  public total = 0

  public ColumnMode = ColumnMode;
  public todos = true
  public cobrados = false
  public enliquidacion = false
  public enrevision = false
  public aceptadocliente = false
  public cerrada = false
  private IVA = 1.21
  private HOY = new Date()
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
    private _selectService: SelectFormatService,
    private _factService: FacturacionService,
    private _filtroService: FiltrosService,
    private modalService: NgbModal,
    private _router: Router) {
    let user = JSON.parse(localStorage.getItem('currentUser') || "{}")
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    let filtro = this._filtroService.getFiltro(this._filtroService.FACTURAS())


    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
      this.getFiltro(filtro)
    })
    let localcobro = this._factService.retomarCobro()
    this.facturas = []
    this.facturas = localcobro.datafacturas
    this.filterUpdate({})

  }

  setFiltro() {

    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "todos", this.todos)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "cobrados", this.cobrados)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "cliente", this.cliente)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "enliquidacion", this.enliquidacion)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "enrevision", this.enrevision)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "aceptadocliente", this.aceptadocliente)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "cerrada", this.cerrada)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "concepto", this.monthyear)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "nro", this.nroFactura)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "identidad", this.identidad)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "fechadesde", this.fechaDesde)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "fechahasta", this.fechaHasta)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "fechacreaciondesde", this.fechaCreacionDesde)
    this._filtroService.setItemFiltro(this._filtroService.FACTURAS(), "fechacreacionhasta", this.fechaCreacionHasta)
    this.onChangeEstado()
  }
  getFiltro(filtro) {
    this.todos = filtro.todos
    this.cobrados = filtro.cobrados
    this.enliquidacion = filtro.enliquidacion
    this.enrevision = filtro.enrevision
    this.aceptadocliente = filtro.aceptadocliente
    this.cerrada = filtro.cerrada
    this.monthyear = filtro.concepto
    this.cliente = filtro.cliente
    this.nroFactura = filtro.nro
    this.identidad = filtro.identidad
    this.fechaDesde = filtro.fechadesde
    this.fechaHasta = filtro.fechahasta
    this.fechaCreacionDesde = filtro.fechacreaciondesde
    this.fechaCreacionHasta = filtro.fechacreacionhasta
    this.clienteNombre()
    this.onChangeEstado()

  }
  clienteNombre() {
    let c = this.clientes.filter(c => c.id == this.cliente)[0]
    this.nombreCliente = c ? c.nombre : ""
  }
  changeCliente() {
    this.clienteNombre()
    this.filterUpdate({})
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
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
  seleccionarTodos() {
    this.facturas = []
    for (let i = 0; i < this.rows.length; i++) {
      this.agregarFactura(this.rows[i].id)
    }
  }
  onCheckboxChange(row) {
    if (!this.inFacturas(row.id)) {
      this.agregarFactura(row.id)
    }
    else {
      this.quitarFactura(row.id)
    }
  }
  exportarXLX() {
    let csvdata = this.data.map(item => ({
      FECHAFACTURACION: item.fechafacturacion,
      COBRADO: item.cobrado ? "Si" : "No",
      CONCEPTO: item.monthyear,
      CLIENTE: item.expand.cliente.nombre,
      NUMERO: item.numero,
      TOTAL: item.total
    }))
    csvdata.sort((c1, c2) => c1.FECHAFACTURACION < c2.FECHAFACTURACION ? -1 : 1)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    ws['A1'] = { t: 's', v: `FACTURAS: ${this.nombreCliente} - ${this.monthyear.replace(/\//g, "-")}`, s: {} };
    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
    XLSX.writeFile(wb, `${this.nombreCliente} - ${this.monthyear.replace(/\//g, "-")}.xlsx`, { cellStyles: true });

  }
  recuperarCobro() {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para crear cobros", "error")
      return
    }
    this._router.navigateByUrl("/facturacion/liquidacioncobro")
  }
  abrirCobro() {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para crear cobros", "error")
      return
    }
    this._factService.crearCobro(this.facturas)
    this._router.navigateByUrl("/facturacion/liquidacioncobro")
  }
  openPagoModal(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  openNuevaNotaModal(modal, factid) {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para agregar notas", "error")
      return
    }
    this.facturaid = factid
    this.modalService.open(modal, {
      centered: true,
      size: 'md',
      windowClass: 'modal modal-primary'
    });
  }
  cerrarModalPago(modal) {
    modal.dismiss('Cross click')
  }
  agregarFactura(id) {
    let fact = this.data.filter(f => f.id == id)[0]
    this.facturas.push(fact)

    this.loadPage()
  }
  showFacturasCargados() {
    let fs = ""
    if (this.facturas.length == 0) {
      return fs
    }
    for (let i = 0; i < this.facturas.length; i++) {
      fs += " " + this.facturas[i].monthyear
      if (i != (this.facturas.length - 1)) {
        fs += ","
      }
    }

    return fs
  }
  limpiarLista() {
    this.facturas = []
    this._factService.crearCobro(this.facturas)
    this.loadPage()
  }
  quitarFactura(id) {

    this.facturas = this.facturas.filter(f => f.id != id)
    this.loadPage()
  }
  inFacturas(id) {
    for (let i = 0; i < this.facturas.length; i++) {
      if (this.facturas[i].id == id) {
        return true
      }
    }
    return false
  }
  ConfirmDeleteOpen(id) {
    if (!this.conpermisos) {
      Swal.fire("Sin permisos", "No tienes permisos para eliminar facturas", "error")
      return
    }
    Swal.fire({
      title: '¿Eliminar?',
      text: "Se eliminará la factura",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        let f_eliminar = this.rows.find((fa: any) => fa.id == id)

        if (f_eliminar.aceptacliente) {
          let factura = {
            id: f_eliminar.id,
            cliente: f_eliminar.cliente,

            unidad: f_eliminar.unidad,
            monthyear: f_eliminar.periodo,
            total: f_eliminar.total
          }
          this._factService.crearAsientoFacturaEliminada(factura).then(res => {

            this.eliminarFactura(id)
          })
        }
        else {

          this.eliminarFactura(id)
        }



      }
    });
  }
  eliminarFactura(id) {
    this._factService.deleteFactura(id).then(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Factura eliminado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.filterUpdate({})
    })
  }
  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset + 1), this.page.count)
    this.rows = []
    for (let i = min_i; i < max_i; i++) {
      this.rows.push(this.data[i])
    }
  }
  filterUpdate(event) {
    this.setFiltro()
    this.page.offset = 0
    this.total = 0
    this._factService.getFacturas(
      this.nombreCliente,
      this.nroFactura,
      this.identidad,
      this.monthyear,
      this.todos,
      this.enrevision,
      this.enliquidacion,
      this.aceptadocliente,
      this.cobrados,
      this.cerrada,
      this.fechaDesde,
      this.fechaHasta,
      this.fechaCreacionDesde,
      this.fechaCreacionHasta
    ).then(res => {
      this.data = res
      for (let i = 0; i < this.data.length; i++) {

        this.data[i].total = this.data[i].expand.cliente.responsableinscripto ? this.data[i].total * this.IVA : this.data[i].total
        this.data[i].total = Math.round((this.data[i].total + Number.EPSILON) * 10000) / 10000
        let diff = this.HOY.getTime() - new Date(this.data[i].fechafacturacion).getTime()
        this.data[i].diaspasados = this.data[i].cobrado ? 0 : Math.round(diff / (1000 * 3600 * 24));
        this.total += this.data[i].total
      }
      this.page.count = this.data.length
      this.loadPage()
    })
  }
  onPage(event) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  cobrarFacturas(modal) {
    modal.dismiss('Cross click')
    this.facturas = []
    this.filterUpdate({})

  }

  ConfirmCobrarFact(id) {
    Swal.fire({
      title: 'Cobrar Factura',
      text: "Se indicará a la factura como cobrada",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        this.cobrarFactura(id)
      }
    });
  }
  cobrarFactura(id) {
    this._factService.cobrarFactura(id).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Factura en estado cobrada.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.filterUpdate({})
    })
  }
  cerrarModalNota(modal) {
    this.notadescripcion = ''
    this.facturaid = ''
    this.notamonto = 0
    this.notanumero = ''
    modal.dismiss('Cross click')
  }
  ConfirmNota(modal) {
    Swal.fire({
      title: 'Crear Nota de crédito',
      text: "Se va a crear una nota de crédito asociada a la factura",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      this.crearNota(modal)
    });
  }
  crearNota(modal) {
    if (this.facturaid == '') {
      return
    }
    let f_nota = this.data.find(f => f.id == this.facturaid)
    if (f_nota) {
      if (f_nota.unidad.length < 1) {
        Swal.fire("Error unidad", "Debe seleccionar una unidad para crear notas de crédito", "error")
        return
      }
      if (f_nota.cerrada) {
        this.facturaid = ''
        this.notanumero = ''
        this.notamonto = 0
        this.notadescripcion = ''
        modal.dismiss('Cross click')
        Swal.fire("Nota denegada", "No se le pueden agregar notas a una factura cerrada", "error")
        return
      }

      this._factService.crearNotaCredito(this.facturaid, this.notanumero, this.notamonto, this.notadescripcion).subscribe(res => {
        let factura = {
          id: f_nota.id,
          cliente: f_nota.cliente,

          unidad: f_nota.unidad,
          monthyear: f_nota.periodo,
          total: this.total
        }
        let nota = res
        this._factService.crearAsientoNota(factura, nota).then(res_asiento => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Nota de Crédito creada.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          this.facturaid = ''
          this.notanumero = ''
          this.notamonto = 0
          this.notadescripcion = ''
          modal.dismiss('Cross click')
        })

      })
    }

  }
  formatPeso(value) {
    return this._factService.formatPeso(value)
  }
  limpiarFiltros() {

    let filtro = this._filtroService.facturasFromZero()
    this.getFiltro(filtro)

    this.filterUpdate({})
  }
  onChangeOpcion(e) {
    this.todos = false
    this.cobrados = false
    this.enliquidacion = false
    this.enrevision = false
    this.aceptadocliente = false
    this.cerrada = false
    if (this.opcionSeleccionada == "revi") {
      this.enrevision = true
    }
    else if (this.opcionSeleccionada == "liqi") {
      this.enliquidacion = true
    }
    else if (this.opcionSeleccionada == "acep") {
      this.aceptadocliente = true
    }
    else if (this.opcionSeleccionada == "cobr") {
      this.cobrados = true
    }
    else if (this.opcionSeleccionada == "cerr") {
      this.cerrada = true
    }
    else {
      this.todos = true
    }
    this.filterUpdate(e)
  }
  onChangeEstado() {
    this.opcionSeleccionada = "todo"
    if (this.cobrados) {
      this.opcionSeleccionada = "cobr"
    }
    else if (this.enliquidacion) {
      this.opcionSeleccionada = "liqi"
    }
    else if (this.enrevision) {
      this.opcionSeleccionada = "revi"
    }
    else if (this.aceptadocliente) {
      this.opcionSeleccionada = "acep"
    }
    else if (this.cerrada) {
      this.opcionSeleccionada = "cerr"
    }

  }

}
