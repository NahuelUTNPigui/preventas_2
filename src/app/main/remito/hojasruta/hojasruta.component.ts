import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RemitoService } from '../remito.service';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-hojasruta',
  templateUrl: './hojasruta.component.html',
  styleUrls: ['./hojasruta.component.scss']
})
export class HojasrutaComponent implements OnInit {
  public conpermisos = false
  public nro
  public fechadesde
  public fechahasta
  public fechafindesde
  public fechafinhasta
  public proveedor
  public chofer
  public vehiculo
  public estado
  public confechafin

  public idhr

  public ColumnMode = ColumnMode;
  public rows: any[];
  public estados: any[];
  public selectedOption = 10;

  public proveedores = []
  public vehiculos = []
  public choferes = []

  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0, // Página actual
  };
  constructor(
    private modalService: NgbModal,
    private remitoService: RemitoService,
    private _filtroService: FiltrosService,
    private _selectFormatService: SelectFormatService,
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser') || "{}")
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this._selectFormatService.getTodosProveedores().then(res => {
      this.proveedores = res
    })
    this._selectFormatService.getTodosChoferes().then(res => {
      this.choferes = res
    })
    this._selectFormatService.getTodosVehiculos().then(res => {
      this.vehiculos = res
    })
    this.estados = this._selectFormatService.getEstadosHR()
    let filtro = this._filtroService.getFiltro(this._filtroService.HR())
    this.fechadesde = filtro.fechadesde
    this.fechahasta = filtro.fechahasta
    this.fechafindesde = filtro.fechafindesde
    this.fechafinhasta = filtro.fechafinhasta
    this.estado = filtro.estado
    this.proveedor = filtro.proveedor
    this.vehiculo = filtro.vehiculo
    this.chofer = filtro.chofer
    this.nro = filtro.nro
    this.confechafin = filtro.confechafin
    this.loadPage()
  }
  filterUpdate(event) {
    this._filtroService.setItemFiltro(this._filtroService.HR(), "nro", this.nro)
    this._filtroService.setItemFiltro(this._filtroService.HR(), "estado", this.estado)
    this._filtroService.setItemFiltro(this._filtroService.HR(), "fechadesde", this.fechadesde)
    this._filtroService.setItemFiltro(this._filtroService.HR(), "fechahasta", this.fechahasta)
    this._filtroService.setItemFiltro(this._filtroService.HR(), "fechafindesde", this.fechafindesde)
    this._filtroService.setItemFiltro(this._filtroService.HR(), "fechafinhasta", this.fechafinhasta)
    this._filtroService.setItemFiltro(this._filtroService.HR(), "proveedor", this.proveedor)
    this._filtroService.setItemFiltro(this._filtroService.HR(), "vehiculo", this.vehiculo)
    this._filtroService.setItemFiltro(this._filtroService.HR(), "chofer", this.chofer)
    this._filtroService.setItemFiltro(this._filtroService.HR(), "confechafin", this.confechafin)
    this.page.count = 0
    this.page.offset = 0
    this.loadPage()
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage()
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage()

  }
  loadPage() {
    let skipTotal = false
    if (this.page.offset > 0) {
      skipTotal = true
    }
    this.remitoService.getHR(
      this.page.size,
      this.page.offset,
      skipTotal,
      this.nro,
      this.fechadesde,
      this.fechahasta,
      this.fechafindesde,
      this.fechafinhasta,
      this.estado,
      this.proveedor,
      this.vehiculo,
      this.chofer,
      this.confechafin,
      -1
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
  formatDateExcel(fechaString: string, final: boolean) {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const dia = fecha.getUTCDate();
    const mes = fecha.getUTCMonth() + 1;
    const anio = fecha.getUTCFullYear();
    const fechaFormateada = !final ? `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}` : `${(dia - 1).toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
    return fechaFormateada;
  }
  getEstadoNombre(idestado) {
    let est = this.estados.filter(e => e.id == idestado)[0]
    return est.nombre
  }
  limpiarFiltros() {
    this._filtroService.limpiarFiltro(this._filtroService.HR())
    let filtro = this._filtroService.getFiltro(this._filtroService.HR())
    this.fechadesde = filtro.fechadesde
    this.fechahasta = filtro.fechahasta
    this.fechafindesde = filtro.fechafindesde
    this.fechafinhasta = filtro.fechafinhasta
    this.estado = filtro.estado
    this.proveedor = filtro.proveedor
    this.vehiculo = filtro.vehiculo
    this.chofer = filtro.chofer
    this.nro = filtro.nro
    this.loadPage()
  }

  exportarXLSX() {
    this.remitoService.getAllHR(
      this.nro,
      this.fechadesde,
      this.fechahasta,
      this.fechafindesde,
      this.fechafinhasta,
      this.estado,
      this.proveedor,
      this.vehiculo,
      this.chofer,
      this.confechafin
    ).then(res => {
      let csvData = res.map(item => ({
        NUMERO: item.codigo,
        FECHAENTREGA: this.formatDateExcel(item.fechaentrega, false),
        ESTADO: item.estado == 0 ? "En tránsito" : "Finalizado",
        PROVEEDOR: item.expand.proveedor.nombre,
        VEHICULO: item.expand.vehiculo.nombre,
        CHOFER: item.expand.chofer.nombre,
        FECHACIERRE: this.formatDateExcel(item.fechafin, false),
      }))
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(csvData);
      const wsFilters = XLSX.utils.aoa_to_sheet([
        ['Filtro', 'Valor'],
        ['Código', this.nro],
        ['Estado', this.estado == -1 ? "Todos" : this.estado == 0 ? "En tránsito" : "Finalizado"],
        ['Proveedor', this.proveedor],
        ['Vehículo', this.vehiculo],
        ['Chofer', this.chofer],
        ['Fecha desde', this.formatDateExcel(this.fechadesde, true)],
        ['Fecha hasta', this.formatDateExcel(this.fechahasta, true)],
        ['Con fecha fin', this.confechafin ? "SI" : "NO"],
        ['Fecha fin desde', this.formatDateExcel(this.fechafindesde, true)],
        ['Fecha fin hasta', this.formatDateExcel(this.fechafinhasta, true)]

      ]);
      XLSX.utils.book_append_sheet(wb, ws, 'Hojas de ruta');
      XLSX.utils.book_append_sheet(wb, wsFilters, 'Filtros aplicados');
      XLSX.writeFile(wb, 'hojas_ruta.xlsx');
    })
  }
  exportarHR(id) {
    this.remitoService.detalleHR(id).then(res => {
      let hr = res
      let remitos = res.remitos
      const proveedor = hr.expand.proveedor.nombre
      const chofer = hr.expand.chofer.nombre
      const vehiculo = hr.expand.vehiculo.nombre
      const fechaentrega = this.formatDateExcel(hr.fechaentrega, false)
      let csvData = remitos.map(item => ({
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
      let filavuelta = csvData.length + 5
      let vuelta = [
        { "1 Vuelta": "PALLETS", "Entregado x Egeo": "", "Devuelto x chofer": "" },
        { "1 Vuelta": "BANDEJAS", "Entregado x Egeo": "", "Devuelto x chofer": "" },
        { "1 Vuelta": "DEVOLUCIONES", "Entregado x Egeo": "", "Devuelto x chofer": "" }
      ]
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      ws['A1'] = { t: 's', v: `Chofer: ${chofer} - ${vehiculo} - Proveedor: ${proveedor} - ${this.formatearFechaHora(hr.fechaentrega)} - Numero ${hr.codigo}`, s: {} };

      const range = XLSX.utils.decode_range('A1:J1');
      ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];

      XLSX.utils.sheet_add_json(ws, csvData, { origin: 'A2' });
      XLSX.utils.sheet_add_json(ws, vuelta, { origin: 'A' + filavuelta });

      const wsFilters = XLSX.utils.aoa_to_sheet([
        ['Fecha de entrega', fechaentrega],
        ['Proveedor', proveedor],
        ['Chofer', chofer],
        ['Vehículo', vehiculo]
      ]);

      XLSX.utils.book_append_sheet(wb, ws, 'Remitos incluidos');
      XLSX.utils.book_append_sheet(wb, wsFilters, 'Hoja de ruta');

      XLSX.writeFile(wb, `${proveedor} - ${fechaentrega.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
    })



  }
  detalle(id, modal) {
    this.idhr = id
    this.modalService.open(modal, {
      centered: true,
      size: "xl",
      windowClass: 'modal modal-primary'
    })
  }
  eliminar(id) {
    this.remitoService.eliminarHR(id).then(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Hoja de ruta eliminada exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.page.offset = 0;
      this.loadPage()
    })
  }
  cambiarTotal(data) {
    this.loadPage()
  }
  cambiarProveedor(data) {
    this.loadPage()
  }

}
