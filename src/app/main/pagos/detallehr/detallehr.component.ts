import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RemitoService } from 'app/main/remito/remito.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { PagosService } from '../pagos.service';
import { SelectFormatService } from 'app/main/common';
import { TarifarioService } from 'app/main/cruds/tarifarios/tarifario.service';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detallehr',
  templateUrl: './detallehr.component.html',
  styleUrls: ['./detallehr.component.scss']
})
export class DetallehrComponent implements OnInit {
  public ColumnMode = ColumnMode;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public rows = []
  public data = []
  public tarifario = []
  @Input() idhr = ""
  public hr
  public kilos = 0
  public total = 0
  public totaldeclarado = 0
  public totalbultos = 0
  public totalproveedor = 0
  public totalproveedoriva = 0
  public rentabilidadabsoluta = 0
  public rentabilidad = 0
  public nombreproveedor = ""
  public responsable = false
  public primeravuelta = false
  public nombrechofer = ""
  public nombrevehiculo = ""
  public nombreestado = ""
  public fechafin = ""
  public fechacreacion = ""
  public fechaentrega = ""
  public fechaentregavieja = ""
  public codigo = ""
  public openTarifario = false
  public anulado = ""
  @Output() cerrarModalEvent = new EventEmitter<string>();
  @Output() editarModalEvent = new EventEmitter<string>();
  constructor(
    private _remitoService: RemitoService,
    private _pagoService: PagosService,
    private _tarifarioService: TarifarioService,
    private _selectService: SelectFormatService
  ) { }

  ngOnInit(): void {
    this.anulado = this._selectService.getAnulado()
    this._remitoService.detalleHR(this.idhr).then(res => {
      
      this.hr = res
      this.data = res.remitos
      this.page.count = this.data.length
      this.nombreproveedor = this.hr.expand.proveedor.nombre
      this.responsable = this.hr.expand.proveedor.responsable
      this.primeravuelta = this.hr.primeravuelta
      this.codigo = res.codigo
      this.nombrechofer = this.hr.expand.chofer.nombre
      this.nombrevehiculo = this.hr.expand.vehiculo.nombre
      this.nombreestado = this.hr.estado == 0 ? "En tránsito" : "Finalizado"
      this.fechafin = this.hr.fechafin ? new Date(this.hr.fechafin).toISOString().split('T')[0] : ""
      this.fechacreacion = new Date(this.hr.created).toISOString().split('T')[0]
      this.fechaentrega = new Date(this.hr.fechaentrega).toISOString().split('T')[0]
      this.fechaentregavieja = new Date(this.hr.fechaentrega).toISOString().split('T')[0]
      this.totalproveedor = this.hr.totalproveedor
      this.totalproveedoriva = 1.21 * this.totalproveedor
      for (let i = 0; i < this.data.length; i++) {
        if(this.data[i].estado == this.anulado){
          continue
        }
        this.kilos += this.data[i].kilos
        this.total += this.data[i].totalViaje
        this.totalbultos += this.data[i].bultos
        this.totaldeclarado += this.data[i].valorDeclarado
      }

      this.rentabilidadabsoluta = this.total - this.totalproveedor
      this.rentabilidad = 100 * (this.rentabilidadabsoluta / this.total)
      this._tarifarioService.getTodosTarifariosProveedores(this.nombreproveedor).then(res => {
        this.tarifario = res

      })

      this.loadPage()
    })
  }
  loadPage() {
    this.rows = []
    let minimo = this.page.offset * this.page.size
    let maximo = Math.min((this.page.offset + 1) * this.page.size, this.page.count)
    for (let i = minimo; i < maximo; i++) {
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
  verTarifario() {
    this.openTarifario = true
  }
  cerrarTarifario() {
    this.openTarifario = false
  }
  editarHR() {
    this._pagoService.putHR(this.idhr, this.codigo, this.totalproveedor, this.primeravuelta).subscribe(res => {
      this.totalproveedoriva = this.totalproveedor * 1.21
      this.rentabilidadabsoluta = this.total - this.totalproveedor
      this.rentabilidad = 100 * (this.rentabilidadabsoluta / this.total)
      if (this.fechaentregavieja != this.fechaentrega) {
        this.editarFechaEntrega()
      }
      else {
        Swal.fire("Éxito editar", "Exito en editar la hoja de ruta", "success")
      }
      this.editarModalEvent.emit(this.idhr)

    })

  }
  formatPeso(num) {
    return this._selectService.formatPeso(num)
  }
  redondear(num) {
    return Math.floor(num * 1000) / 1000
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
  exportarHR() {
    let totalHR = this.total
    let totalKilos = this.kilos
    const proveedor = this.nombreproveedor
    const chofer = this.nombrechofer
    const vehiculo = this.nombrevehiculo
    const fechaEntrega = this.formatDateExcel(this.fechaentrega, false)

    let exportCSVData = this.data.map(item => ({
      RTO: item.nroRemito,
      KG: item.kilos,
      BULTOS: item.bultos,
      REMITENTE: item.expand.remitente.nombre,
      DESTINATARIO: item.expand.destinatario.nombre,
      LOCALIDAD: item.expand?.destinatario?.expand?.localidad?.nombre,
      DIRECCCION: item.expand?.destinatario?.direccion,
      HORARIOS: item.expand?.destinatario?.horarios,
      OBSERVACION: item.expand?.destinatario?.observacion
    }));
    let filavuelta = exportCSVData.length + 5
    let vuelta = [
      { "1 Vuelta": "PALLETS", "Entregado x Egeo": "", "Devuelto x chofer": "" },
      { "1 Vuelta": "BANDEJAS", "Entregado x Egeo": "", "Devuelto x chofer": "" },
      { "1 Vuelta": "DEVOLUCIONES", "Entregado x Egeo": "", "Devuelto x chofer": "" }
    ]
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    ws['A1'] = { t: 's', v: `Chofer: ${chofer} - ${vehiculo} - Proveedor: ${proveedor} - ${this.formatDateExcel(fechaEntrega, false)} - Numero ${this.codigo}`, s: {} };

    const range = XLSX.utils.decode_range('A1:J1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];

    XLSX.utils.sheet_add_json(ws, exportCSVData, { origin: 'A2' });
    XLSX.utils.sheet_add_json(ws, vuelta, { origin: 'A' + filavuelta });

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
  showCreacion() {
    return new Date(this.fechacreacion).toLocaleDateString()
  }
  editarFechaEntrega() {

    this._remitoService.editarFechaEntregaHR(this.idhr, this.fechaentrega, this.data).then(res => {
      Swal.fire("Éxito edición", "Se logró editar la fecha de entrega", "success")

    })
  }

}
