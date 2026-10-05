import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import { FacturacionService } from '../facturacion.service';
import { RemitoService } from 'app/main/remito/remito.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
@Component({
  selector: 'app-liquidacion',
  templateUrl: './liquidacion.component.html',
  styleUrls: ['./liquidacion.component.scss']
})
export class LiquidacionComponent implements OnInit {
  //tab
  public tab = 1;
  //Tarifario
  public openTarifario = false
  public openTarifarioHistorial = false
  public tarifario = []
  public tarifarioHistorial = []
  //filtros
  public localidades: any[] = []
  public provincias: any[] = []
  public estados: any[] = []
  public destinatarios: any[] = []


  public localidad = ""
  public destinatario = ""
  public provincia = ''
  public fechaIngresoDesde = ''
  public fechaIngresoHasta = ''
  public fechaEntregaDesde = ''
  public fechaEntregaHasta = ''
  public porFechaEntrega = false
  public nroRemito = ''
  public estado = ""
  public modoEdicion = true

  //Datos
  public seleccionados = {}
  public seleccionadosViejo = {}
  public remitosedita: any[] = []
  public editing = {}
  public datafacturar: any[] = []

  public total = 0
  public totaliva = 0
  public totalremitos = 0
  public totaldeclarado = 0
  public totalkilos = 0
  public totalbultos = 0
  public totaldetalles = 0
  public nombreCliente = ''
  public fechafacturacion = new Date().toISOString().split('T')[0]
  public cliente = ''
  public cuit = ""
  public idremito = ''
  public rows: any[] = []
  public clientes: any[] = []
  public selectedOption = 100;
  public monthyear = ''
  public nroFactura = ''
  public unidad = ''
  public datadetalles: any[] = []
  public rowsdetalles: any[] = []
  public unidades: any[] = []
  public descripciondetalle = ''
  public totaldetalle = 0
  public IVA = 1.21
  public esResponsable = false
  //Tarifas generales
  public totalgeneral = 0
  public porcgeneral = 0
  public declaradogeneral = 0
  public unidadgeneral = 0
  public kggeneral = 0
  public bultosgeneral = 0
  public opcionCalcular = "vc"

  public totalTexto = ""
  public listaOpciones = [
    { id: "vc", nombre: "Seleccionar cálculo" },
    { id: "kg", nombre: "Por Kilo" },
    { id: "pr", nombre: "Por Porcentaje" },
    { id: "bl", nombre: "Por Bulto" },
    { id: "un", nombre: "Por unidad" }
  ]
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(
    private _remitoService: RemitoService,
    private _selectService: SelectFormatService,
    private _factService: FacturacionService,
    private modalService: NgbModal,
    private _router: Router
  ) {
  }

  ngOnInit(): void {
    let factura = this._factService.retomarFactura()

    this.unidades = this._factService.getUnidades()

    this.datafacturar = factura.remitos
    this.page.count = this.datafacturar.length
    this.unidad = factura.unidad
    this.monthyear = factura.concepto
    this.nroFactura = factura.numero

    this.totaliva = this.redondear(this.IVA * Number(this.total))
    this.datadetalles = factura.detalles
    
    this.rowsdetalles = []
    for (let i = 0; i < this.datadetalles.length; i++) {
      this.rowsdetalles.push(this.datadetalles[i])
    }
    this.calcularTotal()
    this.loadPage()
    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
    })
    this.cliente = this.datafacturar[0].cliente
    this.nombreCliente = this.datafacturar[0].expand.cliente.nombre
    this.esResponsable = this.datafacturar[0].expand.cliente.responsableinscripto
    this.cuit = this.datafacturar[0].expand.cliente.cuit
    this._selectService.getProvincias().subscribe(res => {
      this.provincias = res
    })
    this._selectService.getEstados().subscribe(res => {
      this.estados = res
    })
    this._selectService.getDestinatariosCliente(this.cliente).subscribe(res => {
      this.destinatarios = res
    })
    this._remitoService.getTarifarioClienteVigente(this.cliente).then(restar => {
      this.tarifario = restar
    })
    this._remitoService.getTarifarioClienteCompleto(this.cliente).then(restar => {
      this.tarifarioHistorial = restar
    })
  }
  selectProvincia() {
    if (this.provincia.length > 0) {

      this._selectService.getLocalidadesProvincia(this.provincia).subscribe(res => {
        this.localidades = res
      })
    }
    else {
      this.localidades = []
    }
    this.filterUpdate({})

  }
  calcularTotal() {
    this.totalremitos = 0
    this.total = 0
    this.totalbultos = 0
    this.totalkilos = 0
    this.totaldeclarado = 0
    this.totaldetalles = 0
    this.datafacturar.forEach(r => {
      this.total += Number(r.totalViaje)
      this.totalremitos += Number(r.totalViaje)
      this.totalbultos += Number(r.bultos)
      this.totalkilos += Number(r.kilos)
      this.totaldeclarado += Number(r.valorDeclarado)
    })
    this.datadetalles.forEach(d => {
      this.total += Number(d.total)
      this.totaldetalles += Number(d.total)
    })
    this.total = this.redondear(this.total)
    this.totaliva = this.redondear(this.IVA * Number(this.total))
  }
  modalEditRemitoOpen(modalEdit, idremito) {
    this.idremito = idremito
    this.modalService.open(modalEdit, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  openModalDetalle(modalDeta) {
    this.modalService.open(modalDeta, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  changeCliente() {
    let c = this.clientes.filter(c => c.id == this.cliente)[0]
    this.esResponsable = c.responsableinscripto
    this.nombreCliente = c.nombre
    this.onChangeCampo()
  }
  quitarRemitos() {
    let listaSeleccionados = Object.keys(this.seleccionados)
    for (let i = 0; i < listaSeleccionados.length; i++) {
      let rid = listaSeleccionados[i]
      delete this.seleccionados[rid]
      this.cancelarRemito(rid)
    }

  }
  async guardarTarifas() {
    let seleccionados = Object.keys(this.seleccionados)
    for (let i = 0; i < seleccionados.length; i++) {
      let rid = seleccionados[i]
      //Elimino el remito back up
      let r_edit_idx = this.remitosedita.findIndex(r => r.id == rid)
      if (r_edit_idx != -1) {
        let r_idx = this.rows.findIndex(r => r.id == rid)
        if (r_idx != -1) {
          let r = this.rows[r_idx]
          this._factService.putRemito(
            rid,
            r,
            "Editar tarifario"
          ).subscribe(res => {
            this.rows[r_idx].edicion = false

            this.remitosedita.splice(r_edit_idx, 1)
            let data_idx = this.datafacturar.findIndex(fila => fila.id == rid)
            if (data_idx != -1) {
              this.datafacturar[data_idx] = {
                ...this.datafacturar[data_idx],
                ...r
              }
              this.onChangeCampo()
              this.calcularTotal()
            }
          })
        }
      }
    }

    Swal.fire("Editado", "Se logró editar", "success")
    this.toggleEdicion()
    this.seleccionados = {}
    this.seleccionadosViejo = {}

  }
  onCheckboxChange(row) {
    if (this.seleccionados[row.id]) {


      delete this.seleccionados[row.id]
      delete this.seleccionadosViejo[row.id]
      this.cancelarRemito(row.id)

    }
    else {
      this.seleccionados[row.id] = row
      this.seleccionadosViejo[row.id] = { ...row }

      this.editarRemito(row.id)
    }
    let filas = Object.keys(this.seleccionados)
    if (filas.length == 0) {
      this.totalTexto = ""
      this.totalgeneral = 0
      this.porcgeneral = 0
      this.declaradogeneral = 0
      this.unidadgeneral = 0
      this.kggeneral = 0
      this.bultosgeneral = 0
    }
  }
  isSelected(row) {

    if (this.seleccionados[row.id]) {

      return true
    }
    else {

      return false
    }
  }
  quitarRemito(id: string) {

    this.page.offset = 0;

    this.total = 0
    this.datafacturar = this.datafacturar.filter(r => r.id != id)
    this.datafacturar.forEach(r => this.total += r.totalViaje)
    this.datafacturar.forEach(r => this.total += r.totalremitos)
    this.datadetalles.forEach(d => this.total += d.total)

    this.totaliva = this.redondear(this.IVA * Number(this.total))
    this.onChangeCampo()
    this.loadPage()
    this.calcularTotal()
  }
  vistaXCL(esVistaPrevia: boolean) {
    if (this.nombreCliente == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir el cliente",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    if (this.monthyear == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir algun concepto",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }

    let csvdata = this.datafacturar.map(item => ({
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

    csvdata.sort((c1, c2) => c1.FECHAINGRESO < c2.FECHAINGRESO ? -1 : 1)
    let totalreporte = [{ TOTALFACTURACION: this.redondear(this.total) }]
    let totalreporteiva = [{ TOTALFACTURACIONIVA: this.redondear(this.totaliva) }]
    const wb = XLSX.utils.book_new()

    const ws = XLSX.utils.aoa_to_sheet([])

    if (esVistaPrevia) {
      ws['A1'] = { t: 's', v: `Vista previa - ${this.nombreCliente} - INGRESOS ${this.monthyear}`, s: {} };
    }
    else {
      ws['A1'] = { t: 's', v: `${this.nombreCliente} - INGRESOS ${this.monthyear}`, s: {} };
    }

    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.sheet_add_json(ws, totalreporte, { origin: 'Q2' })
    XLSX.utils.sheet_add_json(ws, totalreporteiva, { origin: 'S2' })
    XLSX.utils.book_append_sheet(wb, ws, 'Remitos facturacion');
    // Detalles
    const wsdetalles = XLSX.utils.aoa_to_sheet([])
    wsdetalles['A1'] = { t: 's', v: "Detalles de la factura", s: {} }
    wsdetalles['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    let csvdetalles = this.datadetalles.map(d => ({
      DESCRIPCION: d.descripcion,
      TOTAL: d.total
    }))
    XLSX.utils.sheet_add_json(wsdetalles, csvdetalles, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsdetalles, 'Detalles factura');
    if (esVistaPrevia) {
      XLSX.writeFile(wb, `${this.nombreCliente} - ${this.monthyear.replace(/\//g, "-")} - Vista previa.xlsx`, { cellStyles: true });
    }
    else {
      XLSX.writeFile(wb, `${this.nombreCliente} - ${this.monthyear.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
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
  recalcularTotal() {
    this.calcularTotal()
  }
  redondear(num) {
    return Math.round(1000 * num) / 1000
  }
  async facturar() {
    if (this.unidad == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe elegir la unidad",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    if (this.nombreCliente == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir el cliente",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    if (this.monthyear == '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Debe escribir el concepto",
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    let c_idx = this.clientes.findIndex(c => c.id == this.cliente)
    let nombrecliente = ""
    if (c_idx != -1) {
      nombrecliente = this.clientes[c_idx].nombre
    }
    let algun_no_facturar = false
    for (let i = 0; i < this.datafacturar.length; i++) {
      if (!this.datafacturar[i].facturar) {
        algun_no_facturar = true
        break
      }
    }
    let algun_facturado = false
    for (let i = 0; i < this.datafacturar.length; i++) {
      if (this.datafacturar[i].factura != "") {
        algun_facturado = true
        break
      }
    }
    if (algun_no_facturar) {
      let html = `
          <p>Hay remitos marcados de no facturar, serán facturados</p>
          <p>Desea continuar con la facturación?</p>
        
        `
      Swal.fire({
        title: "Remitos no facturar",
        html,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      }).then(async (result) => {
        if (result.value) {
          let facid = await this._factService.getFacMaxId()
          let nuevocod = facid.maximo + 1
          this._factService.facturar(this.datafacturar, this.nroFactura, this.monthyear, this.cliente, this.total, this.fechafacturacion + ' 03:00:00.000Z', this.unidad, nuevocod + " - " + nombrecliente).then(
            res => {
              this._factService.updateFacMaxId(nuevocod, facid.id).then(res2 => {

              })
              this._factService.guardarDetalles(res.id, this.datadetalles).then(res2 => {
                this.vistaXCL(false)
                this.datadetalles = []

              })
              this._factService.crearFactura([])

            }
          )
        }
      })
    }
    else if (algun_facturado) {

      let html = `
          <p>Hay remitos ya facturados que se van a omitir</p>
          <p>Desea continuar?</p>
        
        `
      Swal.fire({
        title: "Remitos facturados",
        html,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      }).then(async (result) => {
        if (result.value) {
          this.datafacturar = this.datafacturar.filter(d => d.factura == "")
          if (this.datafacturar.length != 0) {
            Swal.fire("Factura vacia", "No hay remitos para facturar", "error")
            return
          }
          let facid = await this._factService.getFacMaxId()
          let nuevocod = facid.maximo + 1
          this._factService.facturar(this.datafacturar, this.nroFactura, this.monthyear, this.cliente, this.total, this.fechafacturacion + ' 03:00:00.000Z', this.unidad, nuevocod + " - " + nombrecliente).then(

            res => {
              this._factService.updateFacMaxId(nuevocod, facid.id).then(res2 => {

              })
              this._factService.guardarDetalles(res.id, this.datadetalles).then(res2 => {
                this.vistaXCL(false)
                this.datadetalles = []
                this._factService.crearFactura([])
                this._router.navigateByUrl("/facturacion/main")
              })

            }
          )
        }
      })
    }
    else {
      let facid = await this._factService.getFacMaxId()
      let nuevocod = facid.maximo + 1
      this._factService.facturar(this.datafacturar, this.nroFactura, this.monthyear, this.cliente, this.total, this.fechafacturacion + ' 03:00:00.000Z', this.unidad, nuevocod + " - " + nombrecliente).then(
        res => {
          this._factService.updateFacMaxId(nuevocod, facid.id).then(res2 => {

          })
          this._factService.guardarDetalles(res.id, this.datadetalles).then(res2 => {
            this.vistaXCL(false)
            this.datadetalles = []
            this._factService.crearFactura([])
            this._router.navigateByUrl("/facturacion/lista")
          })

        }
      )
    }
  }
  loadPage() {

    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset + 1), this.page.count)
    this.rows = []
    for (let i = min_i; i < max_i; i++) {
      this.rows.push(this.datafacturar[i])
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
  limpiarDetalles() {
    this.datadetalles = []
    this.rowsdetalles = []
    this.totaldetalle = 0
    this.onChangeCampo()
  }
  cerrarModalEdit(modal, remito) {
    modal.dismiss('Cross click')
    let indice = this.datafacturar.findIndex(r => r.id == remito.id)
    if (indice != -1) {
      this._factService.getRemito(remito.id).subscribe((resremito: any) => {
        resremito.observacioncorto = resremito.observacion.substr(0, 80)
        this.datafacturar[indice] = resremito
        this.onChangeCampo()

        this.loadPage()
        this.calcularTotal()
      })


    }

  }
  quitarDetalle(indice) {
    let idx = this.datadetalles.findIndex(d => d.indice == indice)
    this.datadetalles.splice(idx, 1)
    this.rowsdetalles = []
    for (let i = 0; i < this.datadetalles.length; i++) {
      this.rowsdetalles.push(this.datadetalles[i])
    }
    this.calcularTotal()
    this.onChangeCampo()
  }
  generatePass() {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      'abcdefghijklmnopqrstuvwxyz0123456789@#$';

    for (let i = 1; i <= 15; i++) {
      let char = Math.floor(Math.random()
        * str.length + 1);

      pass += str.charAt(char)
    }

    return pass;
  }
  calcularConiva() {
    this.totaliva = this.redondear(this.IVA * Number(this.total))
  }
  addDetalle() {
    if(this.descripciondetalle.length ==0){
      return
    }
    let indice = this.generatePass()
    let deta = { indice, descripcion: this.descripciondetalle, total: this.totaldetalle }
    this.descripciondetalle = ''
    this.totaldetalle = 0
    this.datadetalles.push(deta)

    this.rowsdetalles = []
    for (let i = 0; i < this.datadetalles.length; i++) {
      this.rowsdetalles.push(this.datadetalles[i])

    }
    this.calcularTotal()
    this.onChangeCampo()
  }
  limpiarNoFact() {
    this.datafacturar = this.datafacturar.filter(d => d.facturar)
    this.page.count = this.datafacturar.length
    this.calcularTotal()

    this.onChangeCampo()
    this.loadPage()
  }
  limpiarFacturados() {
    this.datafacturar = this.datafacturar.filter(d => d.factura == "")
    this.page.count = this.datafacturar.length
    this.calcularTotal()

    this.onChangeCampo()
    this.loadPage()
  }
  formatPeso(value) {
    return this._selectService.formatPeso(value)
  }
  formatKilo(value) {
    return this._selectService.formatKilo(value)
  }
  onChangeCampo() {
    let factura = {
      numero: this.nroFactura,
      concepto: this.monthyear,
      total: this.total,
      unidad: this.unidad,
      remitos: this.datafacturar,
      detalles: this.datadetalles
    }
    this._factService.guardarFactura(factura)
  }
  esMenor(valor, limite) {
    if (valor.length == 0 || limite.length == 0) {
      return false
    }
    let f1 = new Date(valor)
    let f2 = new Date(limite)
    return f1 <= f2
  }

  filterUpdate(event) {

    this.rows = this.datafacturar.map(x => x)

    if (this.localidad != "") {
      this.rows = this.rows.filter(r => r.expand.destinatario.localidad == this.localidad)
    }
    if (this.fechaIngresoDesde != "") {
      this.rows = this.rows.filter(r => this.esMenor(this.fechaIngresoDesde, r.fechaIngreso))
    }
    if (this.fechaIngresoHasta != "") {
      this.rows = this.rows.filter(r => this.esMenor(r.fechaIngreso, this.fechaIngresoHasta))
    }
    if (this.porFechaEntrega && this.fechaEntregaDesde != "") {
      this.rows = this.rows.filter(r => this.esMenor(this.fechaEntregaDesde, r.fechaEntrega))
    }
    if (this.porFechaEntrega && this.fechaEntregaHasta != "") {
      this.rows = this.rows.filter(r => this.esMenor(r.fechaEntrega, this.fechaEntregaHasta))
    }
    if (this.destinatario != "") {
      this.rows = this.rows.filter(r => r.destinatario == this.destinatario)
    }
    if (this.nroRemito != "") {
      this.rows = this.rows.filter(r => r.nroRemito.includes(this.nroRemito))
    }
    if (this.estado != "") {
      this.rows = this.rows.filter(r => r.estado == this.estado)
    }
    this.page.count = this.rows.length
    this.page.offset = 0


  }
  toggleEdicion() {
    this.modoEdicion = !this.modoEdicion
  }
  estaEnEditar(r_id) {
    let r_idx = this.remitosedita.findIndex(r => r.id == r_id)
    return r_idx != -1
  }
  editarRemito(r_id) {
    //guardo el remito de backup
    let r_idx = this.rows.findIndex(r => r.id == r_id)
    if (r_idx != -1) {
      let r = { ...this.rows[r_idx] }
      this.rows[r_idx].edicion = true
      this.remitosedita.push(r)
    }
  }
  guardarRemito(r_id) {
    //Elimino el remito back up
    let r_edit_idx = this.remitosedita.findIndex(r => r.id == r_id)
    if (r_edit_idx != -1) {
      let r_idx = this.rows.findIndex(r => r.id == r_id)
      if (r_idx != -1) {
        let r = this.rows[r_idx]
        this._factService.putRemito(
          r_id,
          r,
          "Editar tarifario"
        ).subscribe(res => {
          this.rows[r_idx].edicion = false

          this.remitosedita.splice(r_edit_idx, 1)
          let data_idx = this.datafacturar.findIndex(fila => fila.id == r_id)
          if (data_idx != -1) {
            this.datafacturar[data_idx] = {
              ...this.datafacturar[data_idx],
              ...r
            }
          }
          this.onChangeCampo()
          this.calcularTotal()
          Swal.fire("Editado", "Se logró editar", "success")
        })
      }
    }

  }
  cancelarRemito(r_id) {
    //recupero el backup
    let r_edit_idx = this.remitosedita.findIndex(r => r.id == r_id)
    if (r_edit_idx != -1) {
      let r_edit = this.remitosedita[r_edit_idx]
      let r_idx = this.rows.findIndex(r => r.id == r_id)
      if (r_idx != -1) {
        let r = {
          ...this.rows[r_idx],
          ...r_edit,
          edicion: false
        }

        this.rows[r_idx] = { ...r }

        this.remitosedita.splice(r_edit_idx, 1)
        this.rows = this.rows.map(x => x)
        this.editing = {}
      }
    }

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
    }
  }
  updateValue(evento, celda, rowIndex) {

    this.editing[rowIndex + '-' + celda] = false;
    this.rows[rowIndex][celda] = evento.target.value;

    this.rows = this.rows.map(x => x);

  }

  //tarifario
  verTarifario() {
    this.openTarifario = true
    this.openTarifarioHistorial = false
  }
  cerrarTarifario() {
    this.openTarifario = false

  }
  verTarifarioHistorial() {
    this.openTarifario = false
    this.openTarifarioHistorial = true
  }
  cerrarTarifarioHistorial() {
    this.openTarifarioHistorial = false
  }
  multipleInput(campo) {

    let filas = Object.keys(this.seleccionados)
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
          this.seleccionados[r.id] = { ...r }
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
          this.seleccionados[r.id] = { ...r }
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
          this.seleccionados[r.id] = { ...r }
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
          this.seleccionados[r.id] = { ...r }
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
          this.seleccionados[r.id] = { ...r }
        }
      }
    }

  }
  calcularTotalGeneral() {

    if (this.totalTexto == " x porc") {
      Object.values(this.seleccionados).forEach((r: any) => {
        this.recalcularTotalFila(r.id, 'PORC')
      })
    }
    else if (this.totalTexto == " x unidad") {
      Object.values(this.seleccionados).forEach((r: any) => {
        this.recalcularTotalFila(r.id, 'UNIT')
      })
    }
    else if (this.totalTexto == " x kg") {
      Object.values(this.seleccionados).forEach((r: any) => {
        this.recalcularTotalFila(r.id, 'KILO')
      })
    }
    else if (this.totalTexto == " x bulto") {

      Object.values(this.seleccionados).forEach((r: any) => {
        this.recalcularTotalFila(r.id, 'BULT')
      })
    }
  }
  cantidadSeleccionados() {
    return Object.keys(this.seleccionados).length
  }
  seleccionarTodos() {
    this.seleccionados = {}
    this.seleccionadosViejo = {}
    this.rows.forEach(r => {
      this.seleccionados[r.id] = r
      this.seleccionadosViejo[r.id] = { ...r }
    })
  }
  quitarTodos() {
    let filas = Object.keys(this.seleccionados)
    for (let i = 0; i < filas.length; i++) {
      let fila = filas[i]
      let r_idx = this.rows.findIndex(r => r.id == fila)
      if (r_idx != -1) {
        this.rows[r_idx] = { ...this.seleccionadosViejo[fila] }
      }
    }
    this.rows = this.rows.map(x => x)
    this.seleccionados = {}
    this.seleccionadosViejo = {}
    this.totalTexto = ""
    this.totalgeneral = 0
    this.porcgeneral = 0
    this.declaradogeneral = 0
    this.unidadgeneral = 0
    this.kggeneral = 0
    this.bultosgeneral = 0
  }

  onChangeOption(event: any) {
    if (this.opcionCalcular != "vc") {
      if (this.opcionCalcular == "pr") {
        Object.values(this.seleccionados).forEach((r: any) => {
          this.recalcularTotalFila(r.id, 'PORC')
        })
      }
      else if (this.opcionCalcular == "un") {
        Object.values(this.seleccionados).forEach((r: any) => {
          this.recalcularTotalFila(r.id, 'UNIT')
        })
      }
      else if (this.opcionCalcular == "kg") {
        Object.values(this.seleccionados).forEach((r: any) => {
          this.recalcularTotalFila(r.id, 'KILO')
        })
      }
      else if (this.opcionCalcular == "bl") {

        Object.values(this.seleccionados).forEach((r: any) => {
          this.recalcularTotalFila(r.id, 'BULT')
        })
      }
    }
  }
  onNavChange(event: any) {
    this.tab = event.nextId;
  }

}

