import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { SelectFormatService } from 'app/main/common';
import { RemitoService } from '../remito.service';
import { FacturacionService } from 'app/main/facturacion/facturacion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-preventas',
  templateUrl: './preventas.component.html',
  styleUrls: ['./preventas.component.scss']
})
export class PreventasComponent implements OnInit {
  //tab
  public tab = 1;

  public ColumnMode = ColumnMode;
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('fechaPicker') fechaPicker;
  @ViewChild('modalState') modalState: any;
  public selectedDates: string[] = ['', ''];
  public data: any[] = [];
  public datafacturar: any[] = [];
  public rows: any[] = [];
  public estadoOptions: any[] = []
  public seleccionados: any[] = []
  public opcionesFacturar = [
    {id:"",nombre:"Todos"},
    {id:"sin",nombre:"No facturados"},
    {id:"fac",nombre:"Facturados"},
  ]
  public selectedStatus = ""
  public cliente = ""
  public nombreDestinatario = ""
  public nombreRemitente = ""
  public nro = ""
  public opcionFacturar = ""
  

  public clientes: any[] = []
  public total = 0
  public totalkilos = 0
  public secondPart = false
  //factura
  public concept = ""
  public clienteSelect = ""
  public unidadSelect = ""
  public unidades: any[] = []
  public totalViajes = 0
  //Detalles
  public detalles:any[] = []
  public totaldetalle = 0
  public descripcion = ""

  public DateRangeOptions: FlatpickrOptions = {
    altInput: true,
    mode: 'range',
    altInputClass: 'form-control flat-picker flatpickr-input invoice-edit-input',
    enableTime: false,
    
    locale: 'es',
    altFormat: 'j/m/Y',
  }
  page = {
    size: 100, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
    private _selectFormatService: SelectFormatService,
    private _remitoService: RemitoService,
    private _facturaService: FacturacionService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this._selectFormatService.getEstados().subscribe(estados => {
      this.estadoOptions = estados
    })
    this._selectFormatService.getTodosClientes().then(res => {
      this.clientes = res
    })
    this.unidades = this._facturaService.getUnidades()
    this.filterUpdate({})
  }
  clearDates() {
    this.DateRangeOptions.defaultDate = null;
    this.fechaPicker.flatpickr.clear();
  }
  onChangeFecha() {
    this.page.offset = 0;

    const selectedDateStr = this.fechaPicker.flatpickr.selectedDates;
    if (selectedDateStr[0] && !selectedDateStr[1]) {
      this.selectedDates[0] = null
      this.loadPage();

      return
    }

    this.selectedDates[0] = selectedDateStr[0] ? this.formatDate(new Date(selectedDateStr[0]), false) + ' 03:00:00.000Z' : null
    this.selectedDates[1] = selectedDateStr[1] ? this.formatDate(new Date(selectedDateStr[1]), true) + ' 02:59:59.000Z' : null
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
  exportarXLSX(facturado = false, nombrecliente = "", concepto = "") {
    let csvdata = this.seleccionados.map(item => ({
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
    this.seleccionados.forEach(r => {
      total += r.totalViaje
    })
    csvdata.sort((c1, c2) => c1.FECHAINGRESO < c2.FECHAINGRESO ? -1 : 1)
    let totalreporte = [{ TOTALFACTURACION: this.formatDinero(total) }]
    let totalreporteiva = [{ TOTALFACTURACIONIVA: this.formatDinero(total * 1.21) }]
    const wb = XLSX.utils.book_new()

    const ws = XLSX.utils.aoa_to_sheet([])

    ws['A1'] = { t: 's', v: `${facturado ? nombrecliente : "Preventa"} - Remitos: ${concepto}`, s: {} };
    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.sheet_add_json(ws, totalreporte, { origin: 'Q2' })
    XLSX.utils.sheet_add_json(ws, totalreporteiva, { origin: 'S2' })
    XLSX.utils.book_append_sheet(wb, ws, 'Remitos facturacion');
    XLSX.writeFile(wb, `${facturado ? nombrecliente : "Preventa"} - Remitos: ${concepto}.xlsx`, { cellStyles: true });
  }
  loadPage(skipTotal = false) {

    this._remitoService.getRemitosPreventas(
      this.page.size,
      this.page.offset + 1,
      this.cliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.selectedStatus,
      this.selectedDates[0],
      this.selectedDates[1],
      this.opcionFacturar,
      skipTotal,
      this.nro
    )
      .subscribe((data: any) => {
        //this.rows = data.items;
        this.rows = data.items

        this.page.count = data.totalItems;

      });
  }
  formatearFechaHora(fechaHoraString) {
    const fechaHora = new Date(fechaHoraString);

    // Obtener día de la semana
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const diaSemana = diasSemana[fechaHora.getDay()];

    // Formatear fecha
    const fechaFormateada = fechaHora.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '/');

    // Formatear hora
    const horaFormateada = fechaHora.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${fechaFormateada} ${diaSemana} ${horaFormateada} HS`;
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  formatDate(date: Date, final: boolean) {
    if (!date || isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = final ? String(date.getDate() + 1).padStart(2, '0') : String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  filterByStatus(evento) {
    this.filterUpdate({})
  }
  formatDinero(numero) {
    return this._selectFormatService.formatPeso(numero)
  }
  calcularTotal() {
    this._remitoService.getRemitosPreventasTotal(
      this.cliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.selectedStatus,
      this.selectedDates[0],
      this.selectedDates[1],

      this.nro
    )
      .then(res => {
        this.total = res.valor

        this.totalkilos = res.peso

      })
  }
  onChangeCliente() {
    this.filterUpdate({})
  }
  filterUpdate(evento) {
    this.page.offset = 0;
    this.loadPage(true);
  }
  piso(numero) {
    return Math.round(numero)
  }
  estaEnFacturar(id) {
    let r_idx = this.seleccionados.findIndex(r => r.id == id)

    return r_idx != -1
  }
  quitarRemito(id) {
    let r_idx = this.seleccionados.findIndex(r => r.id == id)
    if (r_idx != -1) {
      this.seleccionados.splice(r_idx, 1)
    }
  }
  agregarRemito(row) {
    let r_idx = this.seleccionados.findIndex(r => r.id == row.id)
    if (r_idx == -1) {
      this.seleccionados.push(row)
    }
  }
  toggleSecond() {
    this.secondPart = !this.secondPart
  }
  onCheckboxChange(row) {
    if (this.estaEnFacturar(row.id)) {
      this.quitarRemito(row.id)
    }
    else {
      this.agregarRemito(row)
    }
  }
  seleccionarTodos() {
    this.rows.forEach(r => {
      if (!this.estaEnFacturar(r.id) &&  r.factura.length == 0) {
        this.seleccionados.push(r)
      }
    })
  }
  quitarTodos() {
    this.seleccionados = []
    this.rows = this.rows.map(x => x)
  }
  openModal(modalFactura) {
    if (this.seleccionados.length == 0) {
      Swal.fire("Error factura", "Debe seleccionar al menos un remito", "error")
      return
    }
    this.descripcion = ""
    this.totaldetalle = 0
    this.totalViajes = 0
    this.seleccionados.forEach(r => {
      this.totalViajes += r.totalViaje
    })
    this.clienteSelect = this.seleccionados[0].cliente

    this.modalService.open(modalFactura, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  async facturar() {
    if (this.clienteSelect == "" || this.concept == "") {
      Swal.fire("Error facturar", "Debe seleccionar algun cliente. Debe escribir algún concepto", "error")
      return
    }
    let facid = await this._facturaService.getFacMaxId()
    let nuevocod = facid.maximo + 1
    let c_idx = this.clientes.findIndex(c => c.id == this.clienteSelect)
    let nombrecliente = ""
    if (c_idx != -1) {
      nombrecliente = this.clientes[c_idx].nombre
    }

    
    this._facturaService.facturarSimple(this.seleccionados, this.concept, this.clienteSelect, nuevocod + " - " + nombrecliente,this.detalles).then(resfact => {

      this._facturaService.updateFacMaxId(nuevocod, facid.id).then(res2 => {
        this.detalles = []
        this.descripcion=""
        this.totaldetalle = 0
        this.exportarXLSX(true, nombrecliente, this.concept)
        this.concept = ""
        this.unidadSelect = ""
        this.seleccionados = []
        this.loadPage(false)
        this.cerrarModal()
        Swal.fire("Éxito facturar", "Se logró facturar los remitos", "success")
        
      })
      
    })

  }
  cerrarModal() {
    this.modalService.dismissAll();
  }
  onNavChange(event: any) {
    this.tab = event.nextId;
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
  addDetalle(){
    if(this.descripcion.length == 0){

      return
    }
    if(this.totaldetalle == 0){

      return
    }
    let indice = this.generatePass()
    let deta = { indice, descripcion: this.descripcion, total: this.totaldetalle }
    this.descripcion = ''
    this.totaldetalle = 0
    this.detalles.push(deta)
    
    this.detalles = this.detalles.map(x=>x)

  }
  quitarDetalle(indice){
    this.detalles = this.detalles.filter(item=>item.indice != indice)
  }
}
