import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { ChequesService } from '../cheques.service';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { SelectFormatService } from 'app/main/common';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {
  public conpermisos = false
  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  public total = 0
  public clientes = []
  public proveedores = []
  public bancos = []

  public tipos = []
  public unidades = []
  //Filtros
  public nro = ""
  public fechaIngresoDesde = ""
  public fechaIngresoHasta = ""
  public fechaAcreditacionDesde = ""
  public fechaAcreditacionHasta = ""
  public conFechaAcreditacion = false
  public fechaEntregaDesde = ""
  public fechaEntregaHasta = ""
  public conFechaEntrega = false
  public banco = ""
  public razonSocial = ""
  public cuit = ""
  public cliente = ""
  public proveedor = ""
  public tipo = 0
  public unidad = ""
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
    private _chequeService: ChequesService,

    private _filtroService: FiltrosService,
    private _selectService: SelectFormatService
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this._chequeService.getAllBancos().then(res => {
      this.bancos = res
    })
    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
    })
    this._selectService.getTodosProveedores().then(res => {
      this.proveedores = res
    })
    this.unidades = this._selectService.getCuentas()
    this.tipos = this.tipos.concat(this._chequeService.getTipos())
    let filtro = this._filtroService.getFiltro(this._filtroService.CHEQUES())
    this.nro = filtro.nro
    this.fechaIngresoDesde = filtro.fechaIngresoDesde
    this.fechaIngresoHasta = filtro.fechaIngresoHasta
    this.fechaAcreditacionDesde = filtro.fechaAcreditacionDesde
    this.fechaAcreditacionHasta = filtro.fechaAcreditacionHasta
    this.conFechaAcreditacion = filtro.conFechaAcreditacion
    this.fechaEntregaDesde = filtro.fechaEntregaDesde
    this.fechaEntregaHasta = filtro.fechaEntregaHasta
    this.conFechaEntrega = filtro.conFechaEntrega
    this.banco = filtro.banco
    this.razonSocial = filtro.razonSocial
    this.cuit = filtro.cuit
    this.cliente = filtro.cliente
    this.tipo = filtro.tipo
    this.unidad = filtro.unidad
    this.proveedor = filtro.proveedor
    this.loadPage()
  }
  loadPage() {
    this._chequeService.getCheques(
      this.page.offset + 1,
      this.page.size,
      this.nro,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.fechaAcreditacionDesde,
      this.fechaAcreditacionHasta,
      this.conFechaAcreditacion,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.conFechaEntrega,
      this.banco,
      this.razonSocial,
      this.cuit,
      this.cliente,
      this.proveedor,
      this.tipo,
      this.unidad
    ).subscribe(res => {
      this.rows = res.items
      this.page.count = res.totalItems

    })
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
  filterUpdate(event) {
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "nro", this.nro)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "fechaIngresoDesde", this.fechaIngresoDesde)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "fechaIngresoHasta", this.fechaIngresoHasta)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "fechaAcreditacionDesde", this.fechaAcreditacionDesde)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "fechaAcreditacionHasta", this.fechaAcreditacionHasta)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "conFechaAcreditacion", this.conFechaAcreditacion)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "fechaEntregaDesde", this.fechaEntregaDesde)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "fechaEntregaHasta", this.fechaEntregaHasta)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "conFechaEntrega", this.conFechaEntrega)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "banco", this.banco)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "razonSocial", this.razonSocial)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "cuit", this.cuit)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "cliente", this.cliente)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "proveedor", this.proveedor)
    this._filtroService.setItemFiltro(this._filtroService.CHEQUES(), "tipo", this.tipo)
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  crearArchivoXLSX(lista) {

    let csvdata = lista.map(item => ({
      NUMERO: item.nro,
      IMPORTE: item.importe,
      FECHA_INGRESO: new Date(item.fechaIngreso).toLocaleDateString(),
      FECHA_ACREDITACION: new Date(item.fechaAcreditacion).toLocaleDateString(),
      FECHA_ENTREGA: item.fechaEntrega.length == 0 ? "" : new Date(item.fechaEntrega).toLocaleDateString(),
      BANCO: item.expand.banco.nombre,
      RAZON_SOCIAL: item.razonSocial,
      CUIT: item.cuit,
      CLIENTE: item.expand.cliente.nombre,
      TIPO: item.tipo == 1 ? "Físico" : "Electrónico",
      UNIDAD: item.unidad
    }))
    let c = this.clientes.filter(cl => cl.id == this.cliente)[0]
    let b = this.bancos.filter(ba => ba.id == this.banco)[0]
    let u = this.unidades.filter(un => un.id == this.unidad)[0]
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvdata);
    const wsFilters = XLSX.utils.aoa_to_sheet([
      ['Filtro', 'Valor'],
      ['Numero', this.nro],
      ['Fecha ingreso desde', this.fechaIngresoDesde],
      ['Fecha ingreso hasta', this.fechaIngresoHasta],
      ['Fecha acreditación desde', this.fechaAcreditacionDesde],
      ['Fecha acreditación hasta', this.fechaAcreditacionHasta],
      ["Con fecha acreditación", this.conFechaAcreditacion ? "Si" : "No"],
      ['Fecha entrega desde', this.fechaEntregaDesde],
      ['Fecha entrega hasta', this.fechaEntregaHasta],
      ["Con fecha entrega", this.conFechaEntrega ? "Si" : "No"],
      ['Banco', b ? b.nombre : "Todos"],
      ['Razón social', this.razonSocial],
      ['CUIT', this.cuit],
      ['Cliente', c ? c.nombre : "Todos"],
      ['Tipo', this.tipo == 1 ? "Físico" : "Electrónico"],
      ['Unidad', u ? u.nombre : "Todas"],

    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Cheques');
    XLSX.utils.book_append_sheet(wb, wsFilters, 'Filtros aplicados');
    XLSX.writeFile(wb, 'Cheques.xlsx');
  }
  exportarXLSX() {
    this._chequeService.getAllCheques(
      this.nro,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.fechaAcreditacionDesde,
      this.fechaAcreditacionHasta,
      this.conFechaAcreditacion,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.conFechaEntrega,
      this.banco,
      this.razonSocial,
      this.cuit,
      this.cliente,
      this.tipo,
      this.unidad
    ).then(res => {

      this.crearArchivoXLSX(res)
    })
  }
  limpiarFiltros() {
    this._filtroService.limpiarFiltro(this._filtroService.CHEQUES())
    let filtro = this._filtroService.getFiltro(this._filtroService.CHEQUES())
    this.nro = filtro.nro
    this.fechaIngresoDesde = filtro.fechaIngresoDesde
    this.fechaIngresoHasta = filtro.fechaIngresoHasta
    this.fechaAcreditacionDesde = filtro.fechaAcreditacionDesde
    this.fechaAcreditacionHasta = filtro.fechaAcreditacionHasta
    this.conFechaAcreditacion = filtro.conFechaAcreditacion
    this.fechaEntregaDesde = filtro.fechaEntregaDesde
    this.fechaEntregaHasta = filtro.fechaEntregaHasta
    this.conFechaEntrega = filtro.conFechaEntrega
    this.banco = filtro.banco
    this.razonSocial = filtro.razonSocial
    this.cuit = filtro.cuit
    this.cliente = filtro.cliente
    this.tipo = filtro.tipo
    this.filterUpdate({})
  }
  calcularTotal() {
    this.total = 0
    this._chequeService.getAllCheques(
      this.nro,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.fechaAcreditacionDesde,
      this.fechaAcreditacionHasta,
      this.conFechaAcreditacion,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.conFechaEntrega,
      this.banco,
      this.razonSocial,
      this.cuit,
      this.cliente,
      this.tipo,
      this.unidad
    ).then(res => {

      this.total = res.reduce(
        (acumulador, item) => acumulador + item.importe,
        0
      )

    })
  }
  ConfirmDeleteOpen(id) {
    let cheque = this.rows.filter(c => c.id == id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará el cheque ${cheque.nro}.`,
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
        this.eliminarCheque(id)
      }
    });
  }
  eliminarCheque(id) {
    let idx_cheque = this.rows.findIndex(che => che.id == id)
    if (idx_cheque! - 1) {
      let che = this.rows[idx_cheque]


      this._chequeService.delCheque(id).subscribe(res => {
        this._chequeService.crearAsientoDelCheque(che).then(resche => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Cheque eliminado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          this.loadPage();
        })

      })
    }

  }

}
