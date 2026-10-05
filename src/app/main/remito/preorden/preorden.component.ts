import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { SelectFormatService } from 'app/main/common';
import { RemitoService } from '../remito.service';
import { FacturacionService } from 'app/main/facturacion/facturacion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { PagosService } from 'app/main/pagos/pagos.service';

@Component({
  selector: 'app-preorden',
  templateUrl: './preorden.component.html',
  styleUrls: ['./preorden.component.scss']
})
export class PreordenComponent implements OnInit {
  public ColumnMode = ColumnMode;
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('fechaPicker') fechaPicker;
  @ViewChild('modalState') modalState: any;
  public selectedDates: string[] = ['', ''];
  public data: any[] = [];
  public dataordenes: any[] = [];
  public rows: any[] = [];
  public estadoOptions: any[] = []
  public seleccionados: any[] = []
  public opcionesOrdenes = [
    { id: -1, nombre: "Todos" },
    { id: 0, nombre: "Sin orden" },
    { id: 1, nombre: "Con orden" },
  ]
  public selectedStatus = ""
  public proveedor = ""
  public nombreDestinatario = ""
  public nro = ""
  public opcionOrden = -1
  public proveedores: any[] = []
  //orden
  public numero = ""
  public proveedorSelect = ""
  public unidadSelect = ""
  public unidades: any[] = []
  public totalHojas = 0
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
    private _pagoService: PagosService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.estadoOptions = this._selectFormatService.getEstadosHR()

    this._selectFormatService.getTodosProveedores().then(res => {
      this.proveedores = res
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
  exportarXLSX() {
    let csvData = this.seleccionados.map(item => ({
      NUMERO: item.codigo,
      FECHAENTREGA: this.formatDateExcel(item.fechaentrega, false),
      
      ESTADO: this.getEstadoNombre(item.estado),
      PROVEEDOR: item.expand.proveedor.nombre,
      VEHICULO: item.expand.vehiculo.nombre,
      CHOFER: item.expand.chofer.nombre,
      FECHACIERRE: this.formatDateExcel(item.fechafin, false)
    }))
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvData);

    XLSX.utils.book_append_sheet(wb, ws, 'Hojas de ruta orden');

    XLSX.writeFile(wb, 'hojas_ruta_orden.xlsx');
  }
  loadPage(skipTotal = true) {

    this._remitoService.getHROrden(
      this.page.size,
      this.page.offset,
      skipTotal,
      this.nro,
      this.selectedDates[0],
      this.selectedDates[1],
      this.selectedStatus,
      this.proveedor,
      this.opcionOrden

    ).subscribe(res => {
      if (!skipTotal) {
        this.page.count = res.totalItems
      }
      this.rows = res.items

    })
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

  filterUpdate(evento) {
    this.page.offset = 0;
    this.loadPage(false);
  }
  piso(numero) {
    return Math.round(numero)
  }
  estaEnOrden(id) {
    let r_idx = this.seleccionados.findIndex(r => r.id == id)

    return r_idx != -1
  }
  quitarHR(id) {
    let r_idx = this.seleccionados.findIndex(r => r.id == id)
    if (r_idx != -1) {
      this.seleccionados.splice(r_idx, 1)
    }
  }
  agregarHR(row) {
    let r_idx = this.seleccionados.findIndex(r => r.id == row.id)
    if (r_idx == -1) {
      this.seleccionados.push(row)
    }
  }
  onCheckboxChange(row) {
    if (this.estaEnOrden(row.id)) {
      this.quitarHR(row.id)
    }
    else {
      this.agregarHR(row)
    }
  }
  seleccionarTodos() {
    this.rows.forEach(r => {
      if (!this.estaEnOrden(r.id) && r.pago.length == 0) {
        this.seleccionados.push(r)
      }
    })
  }
  quitarTodos() {
    this.seleccionados = []
    this.rows = this.rows.map(x => x)
  }

  openModal(modalOrden) {
    if (this.seleccionados.length == 0) {
      Swal.fire("Error orden", "Debe seleccionar al menos una hoja de ruta", "error")
      return
    }
    this.proveedorSelect = this.seleccionados[0].proveedor
    this.calcularTotal()
    this.modalService.open(modalOrden, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  async crearOrden() {
    if (this.proveedorSelect == "" || this.numero == "") {
      Swal.fire("Error orden", "Debe seleccionar algun proveedor. Debe escribir algún numerp", "error")
      return
    }
    let ordenid = await this._pagoService.getOrdenMaxId()
    let nuevocod = ordenid.maximo + 1
    let c_idx = this.proveedores.findIndex(c => c.id == this.proveedorSelect)
    let nombreproveedor = ""
    if (c_idx != -1) {
      nombreproveedor = this.proveedores[c_idx].nombre
    }
    let filtro = ""
    for (let i = 0; i < this.seleccionados.length; i++) {
      filtro = `hojaruta='${this.seleccionados[i].id}'`
      if (i != this.seleccionados.length - 1) {
        filtro += "%7c%7c"
      }
    }
    this._remitoService.calculaTotalHR(filtro).subscribe(res => {
      let total = 0
      total = res.items.map(r => r.totalViaje).reduce(function (resultado, elemento) {
        return resultado + elemento;
      }, 0)
      this._pagoService.crearOrdenSimple(this.seleccionados, this.totalHojas, this.numero, this.proveedorSelect, nuevocod+" - "+nombreproveedor).then(res2 => {
        this._pagoService.updateOrdenMaxId(nuevocod, ordenid.id)
        this.exportarXLSX()
        this.numero = ""
        this.unidadSelect = ""
        this.seleccionados = []
        //this.loadPage(false)
        this.cerrarModal()
        this.filterUpdate({})
        Swal.fire("Éxito orden", "Se logró crear la orden con las hojas de ruta", "success")
      })

    })

  }
  cerrarModal() {
    this.modalService.dismissAll();
  }
  onChangeProveedor() {
    this.filterUpdate({})
  }
  getEstadoNombre(idestado) {
    let est = this.estadoOptions.filter(e => e.id == idestado)[0]
    return est.nombre
  }
  calcularTotal() {
    this.totalHojas = 0
    
    for (let i = 0; i < this.seleccionados.length; i++) {
      this.totalHojas = this.seleccionados[i].totalproveedor
    }

   
  }
}
