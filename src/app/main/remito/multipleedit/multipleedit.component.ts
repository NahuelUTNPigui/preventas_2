import { Component, OnInit } from '@angular/core';

import { ColumnMode } from '@swimlane/ngx-datatable';
import { SelectFormatService } from 'app/main/common';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RemitoService } from '../remito.service';
import { ReportesService } from 'app/main/reportes/reportes.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-multipleedit',
  templateUrl: './multipleedit.component.html',
  styleUrls: ['./multipleedit.component.scss']
})
export class MultipleeditComponent implements OnInit {

  //Permisos
  public conpermisos = false
  public selectedOption = 10;
  public searchValue = '';
  public esPendienteFiltro = false
  public esTodosFiltros = true
  public data: any[] = [];
  public seleccinados = {};
  public dataprocesada: any[] = [];
  public rows: any[] = [];
  public estados: any[] = []
  public formas: any[] = []
  public provincias: any[] = []
  public localidades: any[] = []
  public proveedores: any[] = []
  public clientes: any[] = []
  public ColumnMode = ColumnMode;
  public fechaIngresoDesde = ''
  public fechaIngresoHasta = ''
  public fechaEntregaDesde = ''
  public fechaEntregaHasta = ''
  public porFechaEntrega = false
  public estado = 'zowdo68g83kwahx'
  public formaPago = ''
  public provincia = ''
  public localidad = ''
  public proveedor = ""
  public nombreProveedor = ''
  public nombreVehiculo = ''
  public nombreChofer = ''
  public nombreCliente = ''
  public cliente = ""
  public nombreDestinatario = ''
  public nombreRemitente = ''
  public nroRemito = ''
  public confirmado = false
  public reubicado = false
  public facturar = false
  public todos = true
  public conPendientes = true
  public total = 0
  public stotal = ""
  public totalkilos = 0
  public stotalkilos = ""
  public maxchars = 80
  public pendienteslen = 0
  public primeraparte = true
  public segundaparte = false
  public terceraparte = false

  


  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0, // Página actual
  };

  //Tarifas generales
  public totalgeneral = 0
  public porcgeneral = 0
  public declaradogeneral = 0
  public unidadgeneral = 0
  public kggeneral = 0
  public bultosgeneral = 0

  public totalTexto = ""

  //Editar
  public selectedTodos = false
  public selectedRows: any[] = []
  public selectedEstado: string = ""
  public seleccionadosViejos = {}
  public dataEstado = {}
  public listaOpciones = [
    { id: "vc", nombre: "Seleccionar cálculo" },
    { id: "kg", nombre: "Por Kilo" },
    { id: "pr", nombre: "Por Porcentaje" },
    { id: "bl", nombre: "Por Bulto" },
    { id: "un", nombre: "Por unidad" }
  ]
  public opcionCalcular = "vc"

  constructor(
    private _selectService: SelectFormatService,
    private _reporteService: ReportesService,
    private _remitoService: RemitoService,
    private modalService: NgbModal,
    private _filtroService: FiltrosService
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser') || "")
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this._selectService.getTodosProveedores().then(res => {
      this.proveedores = res
    })
    this._reporteService.todaslocalidades('').then(res => {
      this.localidades = res
    })
    this._reporteService.todasprovincias().then(res => {
      this.provincias = res
    })
    //this._reporteService.todosestados().then(res => {
    //  this.estados = res
    //})
    this._reporteService.todasformaspago().then(res => {
      this.formas = res
    })
    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
    })
    this._selectService.getEstados().subscribe((response) => {
      this.estados = response;
    })
    this.loadPage(false)
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
  filterUpdate(event: any) {

    this.loadPage(false)
  }
  onChangeEstadoFilter(event: any) {

    this.esPendienteFiltro = false

    if (this.estado == "0kxg8jr071yozsk") {
      this.esPendienteFiltro = true

    }
    this.loadPage(false)
  }
  loadPage(skipTotal: boolean) {
    if (this.esPendienteFiltro) {
      
      this._remitoService.getRemitoPaginacionPendientes(
        this.page.size, this.page.offset,
        skipTotal,
        this.nroRemito,
        this.fechaIngresoDesde,
        this.fechaIngresoHasta,
        this.porFechaEntrega,
        this.fechaEntregaDesde, this.fechaEntregaHasta,
        this.cliente, this.nombreDestinatario, this.nombreRemitente,
        this.provincia, this.localidad, this.estado,
        this.todos, this.reubicado, this.confirmado, this.facturar,

      ).subscribe(res => {
        if (!skipTotal) {
          this.page.count = res.totalItems
        }
      this.rows = res.items
        this.rows = this.rows.map(item => ({
          ...item,
          observacioncorto: item.observacion ? item.observacion.length > this.maxchars ? item.observacion.substr(0, this.maxchars) : item.observacion : "",
        }))
      })
    }
    else {
      
      this._remitoService.getEditRemitoPaginacion(
        this.page.size, this.page.offset,
        skipTotal,
        this.nroRemito,
        this.fechaIngresoDesde,
        this.fechaIngresoHasta,
        this.porFechaEntrega,
        this.fechaEntregaDesde, this.fechaEntregaHasta,
        this.proveedor, this.nombreVehiculo, this.nombreChofer,
        this.cliente, this.nombreDestinatario, this.nombreRemitente,
        this.provincia, this.localidad, this.estado,
        this.todos, this.reubicado, this.confirmado, this.facturar,

      ).subscribe(res => {
        if (!skipTotal) {
          this.page.count = res.totalItems
        }

        this.rows = res.items
        this.rows = this.rows.map(item => ({
          ...item,
          observacioncorto: item.observacion ? item.observacion.length > this.maxchars ? item.observacion.substr(0, this.maxchars) : item.observacion : "",
        }))
      })
    }


  }
  limpiarFiltros() {
    this.nroRemito = ''
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechaIngresoDesde = "" //primer_dia_mes.toISOString().split('T')[0]
    this.fechaEntregaDesde = ""//primer_dia_mes.toISOString().split('T')[0]
    this.fechaIngresoHasta = ""//ultima_dia_mes.toISOString().split('T')[0]
    this.fechaEntregaHasta = ""//ultima_dia_mes.toISOString().split('T')[0]
    this.porFechaEntrega = false
    this.proveedor = ""
    this.nombreProveedor = ""
    this.nombreVehiculo = ""
    this.nombreChofer = ""
    this.nombreCliente = ""
    this.cliente = ""
    this.nombreDestinatario = ""
    this.nombreRemitente = ""
    this.provincia = ""
    this.localidad = ""
    this.estado = "zowdo68g83kwahx"
    this.formaPago = ""
    this.todos = true
    this.confirmado = true
    this.reubicado = true
    this.facturar = true
    //this._filtroService.limpiarFiltro(this._filtroService.REPREMITOS())
    this.loadPage(false)
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage(true)

  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage(true)

  }
  piso(numero: number) {
    return Math.round(numero)
  }
  cantidadSeleccionados() {
    return Object.keys(this.seleccinados).length
  }
  onChangeEstado() {
    if (this.selectedEstado == "conformado") {
      this.dataEstado = {
        confirmado: true
      }
    }
    else if (this.selectedEstado == "conformadoentregado") {
      let idx_entregado = this.estados.findIndex(e => e.nombre == "Entregado")
      if (idx_entregado != -1) {
        let entregadoID = this.estados[idx_entregado].id
        this.dataEstado = {
          confirmado: true,
          estado: entregadoID
        }
      }

    }
    else {
      this.dataEstado = {
        estado: this.selectedEstado
      }
    }
  }

  guardarNuevoEstado() {

    let cantidad = Object.keys(this.seleccinados).length
    if (this.selectedEstado == "") {
      Swal.fire("Estado vacío", "Debe seleccionar un estado", "error")
      return
    }
    if (cantidad == 0) {
      Swal.fire("Sin remitos", "Debe seleccionar algún remito", "error")
      return
    }
    let estadosmodificar = this.estados
    estadosmodificar.push({ id: "conformado", nombre: "Conformado" })
    estadosmodificar.push({ id: "conformadoentregado", nombre: "Conf y entregado" })
    let e_idx = estadosmodificar.findIndex(e => e.id == this.selectedEstado)
    if (e_idx == -1) {
      return
    }
    let nombreestado = estadosmodificar[e_idx].nombre
    let html = `
    <p >
      Se van a modificar ${cantidad > 1 ? cantidad + " remitos" : cantidad + " remito"} al estado ${nombreestado}
    </p>
    `
    Swal.fire(
      {
        title: 'Edición múltiple',
        html,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      }
    ).then((result) => {
      if (result.value) {
        let remitosSeleccionados: any[] = []
        Object.values(this.seleccinados).forEach((r: any) => {
          remitosSeleccionados.push(r)
        })
        this._remitoService.editarEstadoRemitos(this.dataEstado, remitosSeleccionados).then(res => {

          Swal.fire("Éxito edicion", "Se modificaron los estados de los remitos", "success")
          this.page.offset = 0;

          this.loadPage(false)
          this.selectedEstado = ""
          this.dataEstado = {}
          this.seleccinados = {}
          this.seleccionadosViejos = {}
        })
        this.opcionCalcular = "vc"
      }
    })
  }
  seleccionarTodos() {
    this.seleccinados = {}
    this.seleccionadosViejos = {}
    this.rows.forEach(r => {
      this.seleccinados[r.id] = r
      this.seleccionadosViejos[r.id] = { ...r }
    })
  }
  quitarTodos() {
    let filas = Object.keys(this.seleccinados)
    for (let i = 0; i < filas.length; i++) {
      let fila = filas[i]
      let r_idx = this.rows.findIndex(r => r.id == fila)
      if (r_idx != -1) {
        this.rows[r_idx] = { ...this.seleccionadosViejos[fila] }
      }
    }
    this.rows = this.rows.map(x => x)
    this.seleccinados = {}
    this.seleccionadosViejos = {}
    this.totalTexto = ""
    this.totalgeneral = 0
    this.porcgeneral = 0
    this.declaradogeneral = 0
    this.unidadgeneral = 0
    this.kggeneral = 0
    this.bultosgeneral = 0
    this.opcionCalcular = "vc"
  }

  onCheckboxChange(row: any) {
    if (this.seleccinados[row.id]) {
      let r_idx = this.rows.findIndex(r => r.id == row.id)
      if (r_idx != -1) {
        this.rows[r_idx] = { ...this.seleccionadosViejos[row.id] }
      }
      delete this.seleccinados[row.id]
      delete this.seleccionadosViejos[row.id]
      this.rows = this.rows.map(x => x)
    }
    else {
      this.seleccinados[row.id] = row
      this.seleccionadosViejos[row.id] = { ...row }
    }
    let filas = Object.keys(this.seleccinados)
    if (filas.length == 0) {
      this.totalTexto = ""
      this.totalgeneral = 0
      this.porcgeneral = 0
      this.declaradogeneral = 0
      this.unidadgeneral = 0
      this.kggeneral = 0
      this.bultosgeneral = 0
      this.opcionCalcular = "vc"
    }


  }
  isSelected(row) {

    if (this.seleccinados[row.id]) {

      return true
    }
    else {

      return false
    }
  }
  verPrimeraParte() {
    this.primeraparte = true
    this.segundaparte = false
    this.terceraparte = false
  }
  verSegundaParte() {
    this.primeraparte = false
    this.segundaparte = true
    this.terceraparte = false
  }
  verTerceraParte() {
    this.primeraparte = false
    this.segundaparte = false
    this.terceraparte = true
  }
  updateValue(evento, celda, rowIndex) {
    this.rows[rowIndex][celda] = evento.target.value;
    this.rows = this.rows.map(x => x);
    let r = this.rows[rowIndex]
    this.seleccinados[r.id] = { ...r }

  }
  recalcularTotalFila(r_id, campo) {
    ///modifo el row pero no el backup
    let r_edit_idx = this.rows.findIndex(r => r.id == r_id)
    if (r_edit_idx != -1) {
      let r_edit = this.rows[r_edit_idx]
      if (campo == "PORC") {
        let porc = r_edit.porcentajeCobro / 100
        let totaldeclarado = r_edit.valorDeclarado
        let total = porc * totaldeclarado
        r_edit.totalViaje = total

      }
      else if (campo == "KILO") {
        let kilos = r_edit.kilos
        let precioUnitario = r_edit.precioUnitario
        let total = kilos * precioUnitario
        r_edit.totalViaje = total

      }
      else if (campo == "BULT") {

        let bultos = r_edit.bultos
        let precioUnitario = r_edit.precioUnitario
        let total = bultos * precioUnitario
        r_edit.totalViaje = total
      }
      else if (campo == "UNIT") {
        let precioUnitario = r_edit.precioUnitario
        let total = precioUnitario
        r_edit.totalViaje = total
      }
      this.rows[r_edit_idx] = { ...r_edit }
      this.rows = this.rows.map(x => x);

      this.seleccinados[r_edit.id] = { ...r_edit }
    }
  }
  guardarNuevasTarifas() {
    let remitosEdit = Object.values(this.seleccinados)
    if (remitosEdit.length == 0) {
      Swal.fire("Sin remitos", "Debe seleccionar algún remito", "error")
      return
    }
    let html = `
    <p >
      Se van a modificar ${remitosEdit.length > 1 ? remitosEdit.length + " remitos" : remitosEdit.length + " remito"}
    </p>
    `
    Swal.fire(
      {
        title: 'Edición múltiple',
        html,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      }
    ).then((result) => {
      if (result.value) {
        let remitosSeleccionados: any[] = []
        let remitosViejos: any[] = []
        Object.values(this.seleccinados).forEach(r => {
          remitosSeleccionados.push(r)
        })
        Object.values(this.seleccionadosViejos).forEach(r => {
          remitosViejos.push(r)
        })
        this._remitoService.editarTarifario(remitosSeleccionados, remitosViejos).then(res => {

          Swal.fire("Éxito edicion", "Se modificaron las tarifas de los remitos", "success")
          this.page.offset = 0;

          this.loadPage(false)
          this.selectedEstado = ""
          this.dataEstado = {}
          this.seleccinados = {}
          this.seleccionadosViejos = {}
          this.totalTexto = ""
          this.totalgeneral = 0
          this.porcgeneral = 0
          this.declaradogeneral = 0
          this.unidadgeneral = 0
          this.kggeneral = 0
          this.bultosgeneral = 0
          this.opcionCalcular = "vc"
        })
      }
    })

  }
  multipleInput(campo) {

    let filas = Object.keys(this.seleccinados)
    if (filas.length == 0) {
      return
    }
    if (campo == "TOTAL") {
      this.totalTexto = ""
      for (let i = 0; i < filas.length; i++) {
        let fila: any = filas[i]

        let rowIndex = this.rows.findIndex(rs => rs.id == fila)
        if (rowIndex != -1) {
          this.rows[rowIndex]['totalViaje'] = this.totalgeneral;

          let r = this.rows[rowIndex]
          this.seleccinados[r.id] = { ...r }
        }
      }
      this.rows = this.rows.map(x => x);

    }
    else if (campo == "PORC") {
      this.totalTexto = " x porc"
      for (let i = 0; i < filas.length; i++) {
        let fila: any = filas[i]
        let rowIndex = this.rows.findIndex(rs => rs.id == fila)
        if (rowIndex != -1) {
          this.rows[rowIndex]['porcentajeCobro'] = this.porcgeneral;
          this.rows = this.rows.map(x => x);
          let r = this.rows[rowIndex]
          this.seleccinados[r.id] = { ...r }
        }
      }
    }
    else if (campo == "UNIDAD") {
      this.totalTexto = " x unidad"
      for (let i = 0; i < filas.length; i++) {
        let fila: any = filas[i]
        let rowIndex = this.rows.findIndex(rs => rs.id == fila)
        if (rowIndex != -1) {
          this.rows[rowIndex]['precioUnitario'] = this.unidadgeneral;
          this.rows = this.rows.map(x => x);
          let r = this.rows[rowIndex]
          this.seleccinados[r.id] = { ...r }
        }
      }
    }
    else if (campo == "KG") {
      this.totalTexto = " x kg"
      for (let i = 0; i < filas.length; i++) {
        let fila: any = filas[i]
        let rowIndex = this.rows.findIndex(rs => rs.id == fila)
        if (rowIndex != -1) {
          this.rows[rowIndex]['kilos'] = this.kggeneral;
          this.rows = this.rows.map(x => x);
          let r = this.rows[rowIndex]
          this.seleccinados[r.id] = { ...r }
        }
      }
    }
    else if (campo == "BULT") {
      this.totalTexto = " x bulto"
      for (let i = 0; i < filas.length; i++) {
        let fila: any = filas[i]
        let rowIndex = this.rows.findIndex(rs => rs.id == fila)
        if (rowIndex != -1) {
          this.rows[rowIndex]['bultos'] = this.bultosgeneral;
          this.rows = this.rows.map(x => x);
          let r = this.rows[rowIndex]
          this.seleccinados[r.id] = { ...r }
        }
      }
    }

  }
  calcularTotalGeneral() {

    if (this.totalTexto == " x porc") {
      Object.values(this.seleccinados).forEach((r: any) => {
        this.recalcularTotalFila(r.id, 'PORC')
      })
    }
    else if (this.totalTexto == " x unidad") {
      Object.values(this.seleccinados).forEach((r: any) => {
        this.recalcularTotalFila(r.id, 'UNIT')
      })
    }
    else if (this.totalTexto == " x kg") {
      Object.values(this.seleccinados).forEach((r: any) => {
        this.recalcularTotalFila(r.id, 'KILO')
      })
    }
    else if (this.totalTexto == " x bulto") {

      Object.values(this.seleccinados).forEach((r: any) => {
        this.recalcularTotalFila(r.id, 'BULT')
      })
    }
  }
  onChangeOption(event: any) {
    if (this.opcionCalcular != "vc") {
      if (this.opcionCalcular == "pr") {
        Object.values(this.seleccinados).forEach((r: any) => {
          this.recalcularTotalFila(r.id, 'PORC')
        })
      }
      else if (this.opcionCalcular == "un") {
        Object.values(this.seleccinados).forEach((r: any) => {
          this.recalcularTotalFila(r.id, 'UNIT')
        })
      }
      else if (this.opcionCalcular == "kg") {
        Object.values(this.seleccinados).forEach((r: any) => {
          this.recalcularTotalFila(r.id, 'KILO')
        })
      }
      else if (this.opcionCalcular == "bl") {

        Object.values(this.seleccinados).forEach((r: any) => {
          this.recalcularTotalFila(r.id, 'BULT')
        })
      }
    }
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
  formatDinero(numero) {
    return this._selectService.formatPeso(numero)
  }
  exportarXLSX() {
      let lista  :any[] = Object.values(this.seleccinados)
      let csvdata = lista.map(item => ({
        ESTADO: item.expand.estado.nombre,
        FACTURAR: item.facturar ? "Facturar" : "No facturar",
        FECHAINGRESO: this.formatDateExcel(item.fechaIngreso, false),
        CLIENTE: item.expand?.cliente?.nombre,
        RTO: item.nroRemito,
        KG: item.kilos,
        BULTOS: item.bultos,
        DESTINATARIO: item.expand?.destinatario?.nombre,
        LOCALIDAD: item.expand?.destinatario?.expand?.localidad?.nombre,
        FECHAENTREGA: item.fechaEntrega ? this.formatDateExcel(item.fechaEntrega, false) : "",
        NOVEDAD: item.novedad,
        PRECIOUNITARIO: item.precioUnitario,
        VALORDECLARADO: item.valorDeclarado,
        PORCENTAJE: item.porcentajeCobro,
        TOTAL: Number(item.totalViaje)
      }))
  
      let total = 0
      lista.forEach(r => {
        total += r.totalViaje
      })
      csvdata.sort((c1, c2) => c1.FECHAINGRESO < c2.FECHAINGRESO ? -1 : 1)
      let totalreporte = [{ TOTALVIAJES: this.formatDinero(total) }]
      
      const wb = XLSX.utils.book_new()
  
      const ws = XLSX.utils.aoa_to_sheet([])
  
      ws['A1'] = { t: 's', v: `Remitos edición`, s: {} };
      const range = XLSX.utils.decode_range('A1:K1');
      ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.sheet_add_json(ws, totalreporte, { origin: 'Q2' })
        
      XLSX.utils.book_append_sheet(wb, ws, 'Remitos edición');
      XLSX.writeFile(wb, `Remitos edición.xlsx`, { cellStyles: true });
    }
    

}
