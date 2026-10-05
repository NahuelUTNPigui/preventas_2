import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { SelectFormatService } from 'app/main/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RemitoService } from 'app/main/remito/remito.service';
import { PagosService } from '../pagos.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-hr',
  templateUrl: './hr.component.html',
  styleUrls: ['./hr.component.scss']
})
export class HrComponent implements OnInit {
  public conpermisos = false
  public totalproveedores = 0


  public nro = ""
  public fechadesde = ""
  public fechahasta = ""
  public fechafindesde = ""
  public fechafinhasta = ""
  public estado = -1
  //es el nombre
  public proveedor = ""
  public chofer = ""
  public vehiculo = ""
  public conorden = -1

  //es el id
  public proveedorOption = ""
  public choferOption = ""
  public vehiculoOption = ""


  public confechafin = false

  public idhr = ""

  public total = 0
  public totalkilos = 0

  public ColumnMode = ColumnMode;
  public rows: any[] = [];
  public estados: any[] = [];
  public conordenOptions = [
    { id: -1, nombre: "Todos" },
    { id: 0, nombre: "Sin orden" },
    { id: 1, nombre: "Con orden" }
  ]
  public proveedores = []
  public vehiculos = []
  public choferes = []

  public vehiculosProv = []
  public choferesProv = []

  public selectedOption = 10;

  public hrpagar: any[] = [];

  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0, // Página actual
  };
  constructor(
    private modalService: NgbModal,
    private remitoService: RemitoService,
    private _filtroService: FiltrosService,
    private _selectService: SelectFormatService,
    private _pagoService: PagosService,
    private _router: Router
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    let filtro = this._filtroService.getFiltro(this._filtroService.PAGOS())


    let op = this._pagoService.retomarOrdenPago()
    this.hrpagar = op.hojas

    //this.estados = this.remitoService.getEstadosHR()
    this.estados = this._selectService.getEstadosHR()
    this._selectService.getTodosProveedores().then(res => {
      this.proveedores = res
      this._selectService.getTodosChoferes().then(resc => {
        this.choferes = resc
        this._selectService.getTodosVehiculos().then(resv => {
          this.vehiculos = resv
          this.vehiculosProv = this.vehiculos.map(v => v)
          this.choferesProv = this.choferes.map(c => c)
          this.getFiltros(filtro)
          this.filterUpdate({})
        })
      })

    })
  }


  onChangeChofer() {
    this.chofer = ""
    let idx_c = this.choferes.findIndex(c => c.id == this.choferOption)
    if (idx_c != -1) {
      let c = this.choferes[idx_c]
      this.chofer = c.nombre
    }
    this.filterUpdate({})
  }
  onChangeVehiculo() {
    this.vehiculo = ""
    let idx_v = this.vehiculos.findIndex(c => c.id == this.vehiculoOption)
    if (idx_v != -1) {
      let v = this.vehiculos[idx_v]
      this.vehiculo = v.nombre
    }
    this.filterUpdate({})
  }
  onChangeProveedor() {
    this.choferOption = ""
    this.vehiculoOption = ""
    let idx_prov = this.proveedores.findIndex(p => p.id == this.proveedorOption)
    if (idx_prov != -1) {
      let p = this.proveedores[idx_prov]
      this.proveedor = p.nombre
      this.vehiculosProv = this.vehiculos.filter(v => v.proveedor == this.proveedorOption)
      this.choferesProv = this.choferes.filter(v => v.proveedor == this.proveedorOption)
    }
    else {
      this.vehiculosProv = this.vehiculos
      this.choferesProv = this.choferes
      this.proveedor = ""
    }
    this.filterUpdate({})

  }
  setFiltros() {
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(), "numero", this.nro)
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(), "fechadesde", this.fechadesde)
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(), "fechahasta", this.fechahasta)
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(), "proveedor", this.proveedorOption)
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(), "vehiculo", this.vehiculoOption)
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(), "chofer", this.choferOption)
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(), "estado", this.estado)
    this._filtroService.setItemFiltro(this._filtroService.PAGOS(), "conorden", this.conorden)

  }
  //El filtro define los estaods
  getFiltros(filtro) {
    this.fechadesde = filtro.fechadesde
    this.fechahasta = filtro.fechahasta
    this.proveedorOption = filtro.proveedor
    this.vehiculoOption = filtro.vehiculo
    this.choferOption = filtro.chofer
    this.estado = filtro.estado
    this.conorden = filtro.conorden
    this.nro = filtro.numero
    let idx_prov = this.proveedores.findIndex(p => p.id == this.proveedorOption)
    if (idx_prov != -1) {
      let p = this.proveedores[idx_prov]
      this.proveedor = p.nombre
      this.vehiculosProv = this.vehiculos.filter(v => v.proveedor = this.proveedorOption)
      this.choferesProv = this.choferes.filter(v => v.proveedor = this.proveedorOption)
    }
    else {
      this.vehiculosProv = this.vehiculos
      this.choferesProv = this.choferes
      this.proveedor = ""
    }
    this.vehiculo = ""
    let idx_v = this.vehiculos.findIndex(c => c.id == this.vehiculoOption)
    if (idx_v != -1) {
      let v = this.vehiculos[idx_v]
      this.vehiculo = v.nombre
    }
    let idx_c = this.choferes.findIndex(c => c.id == this.choferOption)
    if (idx_c != -1) {
      let c = this.choferes[idx_c]
      this.chofer = c.nombre
    }
  }

  filterUpdate(event) {
    this.page.count = 0
    this.page.offset = 0
    this.setFiltros()
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
    this.rows = []
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
      this.conorden
    ).subscribe(res => {
      if (!skipTotal) {
        this.page.count = res.totalItems
      }

      this.rows = res.items


    })
  }
  cargarPagina(e) {
    this.loadPage()
  }
  cargarPaginaEdicion() {
    this.rows = []
    let skipTotal = true
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
      this.conorden
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
        FECHACREACION: this.formatDateExcel(item.created, false),
        ESTADO: item.estado == 0 ? "En tránsito" : "Finalizado",
        PROVEEDOR: item.expand.proveedor.nombre,
        VEHICULO: item.expand.vehiculo.nombre,
        CHOFER: item.expand.chofer.nombre,
        FECHAFIN: this.formatDateExcel(item.fechafin, false),
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
      XLSX.writeFile(wb, 'hojasruta.xlsx');
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
      if (!this.conpermisos) {
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

        ws['A1'] = { t: 's', v: `Chofer: ${chofer} - ${vehiculo} - Proveedor: ${proveedor} - ${this.formatearFechaHora(hr.fechaentrega)} `, s: {} };

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
      }
      else {
        let csvData = remitos.map(item => ({
          FechaIngreso: this.formatDateExcel(item.fechaIngreso, false),
          Cliente: item.expand.cliente.nombre ? item.expand.cliente.nombre : "S/D",
          RTO: item.nroRemito,
          KG: item.kilos,
          Boca_Bultos: item.bultos,
          Remitente: item.expand?.remitente?.nombre,
          Destinatario: item.expand?.destinatario?.nombre,
          Localidad: item.expand?.destinatario?.expand?.localidad?.nombre,
          Estado: item.expand?.estado?.nombre,
          Conformado: item.confirmado ? 'Sí' : 'No',
          Reubicado: item.reubicado ? 'Sí' : 'No',
          Facturar: item.facturar ? 'Sí' : 'No',
          Proveedor: proveedor,
          Chofer: chofer,
          Vehiculo: vehiculo,
          FechaEntrega: this.formatDateExcel(item.fechaEntrega, false),
          Observaciones: item.observacion,
          Novedades: item.novedad,
          PorcentajeCobro: item.porcentajeCobro + '%',
          ValorDeclarado: '$' + item.valorDeclarado,
          PrecioUnitario: '$' + item.precioUnitario,
          Total: '$' + item.totalViaje,
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(csvData);
        XLSX.utils.book_append_sheet(wb, ws, 'Remitos incluidos');

        XLSX.writeFile(wb, `${proveedor} - ${fechaentrega.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
      }

    })
  }
  cerrarModalOrdenes(modal) {
    this.hrpagar = []
    modal.dismiss('Cross click')
    this.loadPage()
  }

  detalle(id, modal) {
    this.idhr = id
    this.modalService.open(modal, {
      centered: true,
      size: "xl",
      windowClass: 'modal modal-primary'
    })
  }
  calcularTotal() {
    this.total = 0
    this.totalkilos = 0
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
      for (let i = 0; i < res.length; i++) {
        let fila = res[i]
        this.total += fila.totalproveedor

      }
    })
  }
  modalPagarOpen(modal) {
    if (this.hrpagar.length == 0) {
      Swal.fire("Error orden", "No hay hojas de ruta seleccionadas", "error")
    }
    else {
      this.modalService.open(modal, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }

  }
  agregarHR(id) {
    let hr = this.rows.filter(h => h.id == id)[0]
    let idx = this.hrpagar.findIndex(h => h.id == id)
    if (hr && idx == -1) {
      this.hrpagar.push(hr)
    }
  }
  quitarHR(id) {
    this.hrpagar = this.hrpagar.filter(h => h.id != id)

  }
  estaEnPagar(id) {
    let hr = this.hrpagar.filter(h => h.id == id)

    return hr.length > 0
  }
  agregarTodos() {
    this.hrpagar = []
    for (let i = 0; i < this.rows.length; i++) {
      this.hrpagar.push(this.rows[i])
    }
  }
  onCheckboxChange(row) {
    if (!this.estaEnPagar(row.id)) {

      this.agregarHR(row.id)
    }
    else {
      this.quitarHR(row.id)
    }
  }
  agregarLista() {
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
      for (let i = 0; i < res.length; i++) {
        let hr = res[i]
        let idx = this.hrpagar.findIndex(h => h.id == hr.id)
        if (hr && idx == -1) {
          this.hrpagar.push(hr)
        }
      }

    })
  }
  limpiarLista() {
    this.hrpagar = []
    this._pagoService.crearOrdenPago(this.hrpagar)
  }
  showHRCargadas() {
    let hrs = ""
    if (this.hrpagar.length == 0) {
      return hrs
    }
    for (let i = 0; i < this.hrpagar.length; i++) {
      hrs += " " + this.hrpagar[i].codigo
      if (i != (this.hrpagar.length - 1)) {
        hrs += ","
      }

    }
    return hrs
  }
  limpiarFiltros() {
    let filtro = this._filtroService.pagosFromZero()
    this.getFiltros(filtro)
    this.filterUpdate({})
  }
  retomarOrdenPago() {

    this._router.navigateByUrl("/pagos/liquidacion")
  }
  crearOrdenPago() {
    this._pagoService.crearOrdenPago(this.hrpagar)
    this._router.navigateByUrl("/pagos/liquidacion")
  }
  rentabilidadExcel(lista) {
    let csvdata = lista.map(item => ({
      PROVEEDOR: item.proveedor,
      CHOFER: item.chofer,
      VEHICULO: item.vehiculo,
      FECHA: new Date(item.fecha).toLocaleDateString(),
      CLIENTE: item.cliente,
      DESTINATARIO: item.destinatario,
      EGEO: item.totalegeo,
      TOTALPROVEEDOR: item.totalproveedor
    }))
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvdata);
    XLSX.utils.book_append_sheet(wb, ws, 'Rentabilidad');
    XLSX.writeFile(wb, 'rentabilidad.xlsx');
  }
  //La idea es buscar todas las hojas de ruta
  //Por cada hoja de ruta buscar los remitos
  //Comparar con el total del proveedor
  calcularRentabilidad() {
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
    ).then(async res => {
      let lista = []
      let hrs = res
      for (let h_i = 0; h_i < hrs.length; h_i++) {
        let h = hrs[h_i]
        let remitos = await this.remitoService.getRemitosHR(h.id)
        hrs[h_i].remitos = remitos
        for (let r_i = 0; r_i < remitos.length; r_i++) {
          let r = remitos[r_i]
          let fila = {
            proveedor: h.expand.proveedor.nombre,
            chofer: h.expand.chofer.nombre,
            vehiculo: h.expand.vehiculo.nombre,
            fecha: h.fechaentrega,
            cliente: r.expand.cliente.razonSocial,
            destinatario: r.expand.destinatario.nombre,
            totalegeo: r.totalViaje,
            totalproveedor: r_i == 0 ? h.totalproveedor : 0
          }
          lista.push(fila)
        }
      }
      this.rentabilidadExcel(lista)
    })

  }

  cerrarHR(id) {
    this._router.navigateByUrl("/pagos/cerrarhr/" + id)
  }
  limpiarSeleccion() {
    this.hrpagar = []
  }

}
