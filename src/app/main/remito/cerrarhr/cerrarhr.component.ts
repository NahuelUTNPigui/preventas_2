import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RemitoService } from '../remito.service';
import { TarifarioService } from 'app/main/cruds/tarifarios/tarifario.service';
import { SelectFormatService } from 'app/main/common';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-cerrarhr',
  templateUrl: './cerrarhr.component.html',
  styleUrls: ['./cerrarhr.component.scss']
})
export class CerrarhrComponent implements OnInit {
  //tab
  public tab = 1;
  //Datos
  public estados: any[] = []

  public proveedores: any[] = []
  public choferes: any[] = []
  public vehiculos: any[] = []

  public choferesProv: any[] = []
  public vehiculosProv: any[] = []

  public modoedicion = false

  public ColumnMode = ColumnMode;
  page = {
    size: 100, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };



  public rows: any[] = []
  public data: any[] = []
  public oldata: any[] = []
  public selectedRemito: any[] = []
  public selectedEstado = ""
  public dataEstado = {}

  public idhr = ""

  public proveedor = ""
  public proveedorviejo = ""
  public chofer = ""
  public choferviejo = ""
  public vehiculo = ""
  public vehiculoviejo = ""
  public fechaentregavieja = ""

  public malproveedor = false
  public malvehiculo = false
  public malchofer = false

  public estadoelegido = { id: "", nombre: "" }
  public confirmado = false
  public reubicado = false
  public novedad = ""
  public observacion = ""


  public estadoEntregado = { id: "", nombre: "" }
  public estadoPendiente = { id: "", nombre: "" }
  public estadoCancelado = { id: "", nombre: "" }
  public estadoRechazado = { id: "", nombre: "" }
  public estadoAnulado = { id: "", nombre: "" }

  public hr
  public rentabilidadabsoluta = 0
  public rentabilidad = 0

  public totalremitos = 0
  public kilos = 0
  public total = 0

  public totalbultos = 0
  public totaldeclarado = 0
  public nombreproveedor
  public responsable = false
  public primeravuelta = false
  public nombrechofer
  public nombrevehiculo
  public nombreestado
  public fechafin
  public fechacreacion
  public fechaentrega
  public codigo

  //tarifario
  public openTarifario = false
  public totalproveedor = 0
  public totalproveedoriva = 0
  public tarifario = []

  public primeraparte = true
  public segundaparte = false
  public terceraparte = false

  //conpermisos
  public conpermisos = false

  constructor(
    private _remitoService: RemitoService,
    private _router: Router,
    private route: ActivatedRoute,
    private _selectFormatService: SelectFormatService,
    private _tarifarioService: TarifarioService

  ) {
    let user = JSON.parse(localStorage.getItem('currentUser') || "{}")
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this.idhr = this.route.snapshot.paramMap.get('id') || "";
    this._selectFormatService.getEstados().subscribe((response) => {
      this.estados = response
      this.estados.forEach(e => {
        if (e.nombre == "Entregado") {
          this.estadoEntregado = e
        }
        if (e.nombre == "Cancelado") {
          this.estadoCancelado = e
        }
        if (e.nombre == "Rechazado") {
          this.estadoRechazado = e
        }
        if (e.nombre == "Pendiente") {
          this.estadoPendiente = e
        }
        if (e.nombre == "Anulado") {
          this.estadoAnulado = e
        }
      })
    })

    this._selectFormatService.getTodosProveedores().then(res => {
      this.proveedores = res
    })
    this._selectFormatService.getTodosChoferes().then(res => {
      this.choferes = res
    })
    this._selectFormatService.getTodosVehiculos().then(res => {
      this.vehiculos = res
    })
    this.loadRemito()


  }
  formatPeso(valor) {
    return this._selectFormatService.formatPeso(valor)
  }
  loadRemito() {
    this.selectedRemito = []
    this._remitoService.detalleHR(this.idhr).then(res => {

      this.hr = res
      this.primeravuelta = this.hr.primeravuelta
      this.data = res.remitos
      this.oldata = res.remitos.map(r => r)
      this.page.count = this.data.length
      this.nombreproveedor = this.hr.expand.proveedor.nombre
      this.responsable = this.hr.expand.proveedor.responsable
      this.proveedor = this.hr.proveedor
      this.vehiculo = this.hr.vehiculo
      this.chofer = this.hr.chofer
      this.codigo = res.codigo
      this.nombrechofer = this.hr.expand.chofer.nombre
      this.nombrevehiculo = this.hr.expand.vehiculo.nombre
      this.nombreestado = this.hr.estado == 0 ? "En tránsito" : "Finalizado"
      this.fechafin = this.hr.fechafin ? new Date(this.hr.fechafin).toISOString().split('T')[0] : ""
      this.fechacreacion = new Date(this.hr.created).toISOString().split('T')[0]
      this.fechaentrega = new Date(this.hr.fechaentrega).toISOString().split('T')[0]
      this.fechaentregavieja = new Date(this.hr.fechaentrega).toISOString().split('T')[0]
      this.totalproveedor = res.totalproveedor
      this.totalproveedoriva = 1.21 * this.totalproveedor

      this.setViejo()
      this.getChoferesVehiculos()
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].estado == this.estadoAnulado.id) {
          continue
        }
        this.kilos += this.data[i].kilos
        this.total += this.data[i].totalViaje
        this.totalbultos += this.data[i].bultos
        this.totaldeclarado += this.data[i].valorDeclarado
      }
      if (this.total > 0) {
        let costo = this.responsable ? this.totalproveedoriva : this.totalproveedor
        this.rentabilidadabsoluta = this.total - costo
        this.rentabilidad = 100 * this.rentabilidadabsoluta / this.total
      }


      this._remitoService.getTarifarioProveedorVigente(this.proveedor, this.fechaentrega).then(res => {
        this.tarifario = res

      })
      this.loadPage()
    })
  }
  getChoferesVehiculos() {
    let idx_pro = this.proveedores.findIndex(p => p.id == this.proveedor)
    if (idx_pro != -1) {
      this.vehiculosProv = this.vehiculos.filter(v => v.proveedor == this.proveedor)
      this.choferesProv = this.choferes.filter(c => c.proveedor == this.proveedor)
    }
  }
  onChangeVehiculo() {
    if (this.vehiculo != "") {
      this.malvehiculo = false
      let v_idx = this.vehiculosProv.findIndex(v => v.id == this.vehiculo)
      if (v_idx != -1) {
        this.nombrevehiculo = this.vehiculosProv[v_idx].nombre
      }
    }
  }
  onChangeChofer() {
    if (this.chofer != "") {
      this.malchofer = false
      let v_idx = this.choferesProv.findIndex(v => v.id == this.chofer)
      if (v_idx != -1) {
        this.nombrechofer = this.choferesProv[v_idx].nombre
      }
    }
  }
  getNombres() {
    let idx_pro = this.proveedores.findIndex(p => p.id == this.proveedor)
    if (idx_pro != -1) {
      this.nombreproveedor = this.proveedores[idx_pro].nombre
    }

    let idx_cho = this.choferes.findIndex(p => p.id == this.chofer)
    if (idx_cho != -1) {
      this.nombrechofer = this.choferes[idx_cho].nombre
    }

    let idx_veh = this.vehiculos.findIndex(p => p.id == this.vehiculo)
    if (idx_veh != -1) {
      this.nombrevehiculo = this.vehiculos[idx_veh].nombre
    }

  }
  getViejo() {
    this.chofer = this.choferviejo
    this.proveedor = this.proveedorviejo
    this.vehiculo = this.vehiculoviejo
    this.getNombres()
  }
  setViejo() {
    this.choferviejo = this.chofer
    this.vehiculoviejo = this.vehiculo
    this.proveedorviejo = this.proveedor
    this.getNombres()

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
  exportarHR() {
    let remitos = this.hr.remitos
    const proveedor = this.nombreproveedor
    const chofer = this.nombrechofer
    const vehiculo = this.nombrevehiculo
    const fechaentrega = this.formatDateExcel(this.fechaentrega, false)
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

    ws['A1'] = { t: 's', v: `Chofer: ${chofer} - ${vehiculo} - Proveedor: ${proveedor} - ${this.formatearFechaHora(this.hr.fechaentrega)} `, s: {} };

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
  QuitarHR(id) {
    Swal.fire({
      title: '¿Quitar de hoja de ruta?',
      text: 'El remito pasará al estado "Pendiente"',
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
        this._remitoService.removeRemitoHR(id, "", "", this.idhr).subscribe(
          res => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'El remito ha sido removido de la hoja de ruta.',
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-outline-secondary'
              }
            });
            //this.data = this.data.filter(d => d.id != id)
            this.loadRemito()
            //this.loadPage()
          }
        )
      }
    })
  }
  verTarifario() {
    this.openTarifario = true
  }
  cerrarTarifario() {
    this.openTarifario = false
  }
  editarHR() {

    this._remitoService.putSimpleHR(
      this.idhr,
      this.codigo,
      this.totalproveedor,
      this.primeravuelta,
      this.proveedor,
      this.vehiculo,
      this.chofer,
      this.fechaentrega


    ).subscribe(res => {
      this.totalproveedoriva = 1.21 * this.totalproveedor
      if (this.total > 0) {
        let costo = this.responsable ? this.totalproveedoriva : this.totalproveedor
        this.rentabilidadabsoluta = this.total - costo
        this.rentabilidad = 100 * this.rentabilidadabsoluta / this.total

      }
      if (this.modoedicion) {
        let v_idx = this.vehiculosProv.findIndex(v => v.id == this.vehiculo)
        if (v_idx != -1) {
          this.nombrevehiculo = this.vehiculosProv[v_idx].nombre
        }
        let c_idx = this.choferesProv.findIndex(v => v.id == this.chofer)
        if (c_idx != -1) {
          this.nombrechofer = this.choferesProv[c_idx].nombre
        }

        this._remitoService.cambiarProveedores(this.data, this.proveedor, this.vehiculo, this.chofer).then(res => {

          Swal.fire("Éxito editar", "Exito en editar la hoja de ruta y los remitos", "success")

          this.modoedicion = false
        })


      }
      else {
        Swal.fire("Éxito editar", "Exito en editar la hoja de ruta", "success")

      }
      if (this.fechaentregavieja != this.fechaentrega) {
        this.editarFechaEntrega()
      }

    })
  }
  //Debo editar los remitos
  editProveedor() {
    this._remitoService.cambiarProveedor(this.idhr, this.proveedor, this.vehiculo, this.chofer).subscribe(res => {

      this._remitoService.cambiarProveedores(this.data, this.proveedor, this.vehiculo, this.chofer).then(res => {
        Swal.fire("Éxito editar", "Exito en editar la hoja de ruta", "success")
        this.loadRemito()
      })

    })
  }

  onChangeProveedor() {
    this.chofer = ""
    this.vehiculo = ""



    this.getChoferesVehiculos()
    let idx_pro = this.proveedores.findIndex(p => p.id == this.proveedor)
    if (idx_pro != -1) {
      this.nombreproveedor = this.proveedores[idx_pro].nombre
      this.openTarifario = false
      this._remitoService.getTarifarioProveedorVigente(this.proveedor, this.fechaentrega).then(res => {
        this.tarifario = res

      })
    }
    else {
      this.malproveedor = true
    }
    this.malchofer = false
    this.malvehiculo = false

  }

  cancelarModoEdicion() {
    this.modoedicion = false
    this.getChoferesVehiculos()
    this.getViejo()

  }
  setModoEdicion() {

    if (this.modoedicion) {
      if (this.proveedor != "" && this.chofer != "" && this.vehiculo != "") {
        this.editProveedor()
        this.setViejo()
        this.modoedicion = !this.modoedicion
      }
      else {
        if (this.proveedor == "") {
          this.malproveedor = true
        }
        if (this.vehiculo == "") {
          this.malvehiculo = true
        }
        if (this.chofer == "") {
          this.malchofer = true
        }
      }

    }
    else {
      this.modoedicion = !this.modoedicion
      this.setViejo()
    }
    this.getChoferesVehiculos()
  }
  agregarSeleccion(row) {

    this.selectedRemito.push(row.id)
    this.rows = this.rows.map(x => x)
  }
  quitarSeleccion(row) {

    let idx_r = this.selectedRemito.findIndex(rid => rid == row.id)
    if (idx_r != -1) {

      this.selectedRemito.splice(idx_r, 1)
    }
    else {

    }
    this.rows = this.rows.map(x => x)

  }
  quitarTodos() {
    this.selectedRemito = []
  }
  seleccionarTodos() {
    this.selectedRemito = this.data.map(r => r.id)
  }
  entregar() {

    this.estadoelegido = this.estadoEntregado

    let data: any = {
      estado: this.estadoelegido.id,
      confirmado: false
    }
    if (this.novedad.length > 0) {
      data.novedad = this.novedad
    }
    if (this.observacion.length > 0) {
      data.observacion = this.observacion
    }
    for (let i = 0; i < this.selectedRemito.length; i++) {
      let idremito = this.selectedRemito[i]
      let r_idx = this.data.findIndex(r => r.id == idremito)
      if (r_idx != -1) {
        let r = { ...this.data[r_idx] }
        r.expand = {
          ...r.expand,
          estado: {
            ...this.estadoelegido
          }
        }
        this.data[r_idx] = { ...r, ...data }

      }
    }

    this.loadPage()
    this.selectedRemito = []
    Swal.fire("Éxito entrega", "Ahora debe cerrar la HR para ver el impacto", "success")
  }
  entregarConf() {

    this.estadoelegido = this.estadoEntregado
    this.confirmado = true
    let data: any = {
      estado: this.estadoelegido.id,
      confirmado: this.confirmado,

    }
    if (this.novedad.length > 0) {
      data.novedad = this.novedad
    }
    if (this.observacion.length > 0) {
      data.observacion = this.observacion
    }
    for (let i = 0; i < this.selectedRemito.length; i++) {
      let idremito = this.selectedRemito[i]
      let r_idx = this.data.findIndex(r => r.id == idremito)
      if (r_idx != -1) {
        let r = { ...this.data[r_idx] }
        r.expand = {
          ...r.expand,
          estado: {
            ...this.estadoelegido
          }
        }
        this.data[r_idx] = { ...r, ...data }

      }
    }
    Swal.fire("Éxito entrega y conf", "Ahora debe cerrar la HR para ver el impacto", "success")
    this.loadPage()
    this.selectedRemito = []
  }
  conformar() {
    this.confirmado = true
    let data: any = {

      confirmado: this.confirmado,

    }
    if (this.novedad.length > 0) {
      data.novedad = this.novedad
    }
    if (this.observacion.length > 0) {
      data.observacion = this.observacion
    }
    for (let i = 0; i < this.selectedRemito.length; i++) {
      let idremito = this.selectedRemito[i]
      let r_idx = this.data.findIndex(r => r.id == idremito)
      if (r_idx != -1) {
        let r = { ...this.data[r_idx] }

        this.data[r_idx] = { ...r, ...data }

      }
    }
    Swal.fire("Éxito entrega y conf", "Ahora debe cerrar la HR para ver el impacto", "success")
    this.loadPage()
    this.selectedRemito = []
  }
  rechazar() {

    this.estadoelegido = this.estadoRechazado
    let data: any = {
      estado: this.estadoelegido.id,
      confirmado: false
    }
    if (this.novedad.length > 0) {
      data.novedad = this.novedad
    }
    if (this.observacion.length > 0) {
      data.observacion = this.observacion
    }

    for (let i = 0; i < this.selectedRemito.length; i++) {
      let idremito = this.selectedRemito[i]
      let r_idx = this.data.findIndex(r => r.id == idremito)
      if (r_idx != -1) {
        let r = { ...this.data[r_idx] }
        r.expand = {
          ...r.expand,
          estado: {
            ...this.estadoelegido
          }
        }
        this.data[r_idx] = { ...r, ...data }

      }
    }
    Swal.fire("Éxito rechazo", "Ahora debe cerrar la HR para ver el impacto", "success")
    this.loadPage()
    this.selectedRemito = []
  }
  cancelar() {

    this.estadoelegido = this.estadoCancelado
    let data: any = {
      estado: this.estadoelegido.id,
      confirmado: false,
    }
    if (this.novedad.length > 0) {
      data.novedad = this.novedad
    }
    if (this.observacion.length > 0) {
      data.observacion = this.observacion
    }
    for (let i = 0; i < this.selectedRemito.length; i++) {
      let idremito = this.selectedRemito[i]
      let r_idx = this.data.findIndex(r => r.id == idremito)
      if (r_idx != -1) {
        let r = { ...this.data[r_idx] }
        r.expand = {
          ...r.expand,
          estado: {
            ...this.estadoelegido
          }
        }
        this.data[r_idx] = { ...r, ...data }

      }
    }
    Swal.fire("Éxito cancelamiento", "Ahora debe cerrar la HR para ver el impacto", "success")
    this.loadPage()
    this.selectedRemito = []
  }
  reubicar() {

    this.estadoelegido = this.estadoPendiente
    this.reubicado = true
    let data = {
      estado: this.estadoelegido.id,
      reubicado: this.reubicado,
      confirmado: false,
    }
    for (let i = 0; i < this.selectedRemito.length; i++) {
      let idremito = this.selectedRemito[i]
      let r_idx = this.data.findIndex(r => r.id == idremito)
      if (r_idx != -1) {
        let r = { ...this.data[r_idx] }
        r.expand = {
          ...r.expand,
          estado: {
            ...this.estadoelegido
          }
        }
        this.data[r_idx] = { ...r, ...data }

      }
    }
    Swal.fire("Éxito reubicacion", "Ahora debe cerrar la HR para ver el impacto", "success")
    this.loadPage()
    this.selectedRemito = []
  }
  volverPendiente() {
    this.estadoelegido = this.estadoPendiente

    let data = {
      estado: this.estadoelegido.id,
      confirmado: false,
    }
    for (let i = 0; i < this.selectedRemito.length; i++) {
      let idremito = this.selectedRemito[i]
      let r_idx = this.data.findIndex(r => r.id == idremito)
      if (r_idx != -1) {
        let r = { ...this.data[r_idx] }
        r.expand = {
          ...r.expand,
          estado: {
            ...this.estadoelegido
          }
        }
        this.data[r_idx] = { ...r, ...data }

      }
    }
    Swal.fire("Éxito reubicacion", "Ahora debe cerrar la HR para ver el impacto", "success")
    this.loadPage()
    this.selectedRemito = []
  }
  reestablecer() {
    for (let i = 0; i < this.selectedRemito.length; i++) {
      let idremito = this.selectedRemito[i]
      let r_idx = this.data.findIndex(r => r.id == idremito)
      if (r_idx != -1) {
        let r = { ...this.oldata[r_idx] }

        this.data[r_idx] = { ...r }

      }
    }
    this.loadPage()
    this.selectedRemito = []
  }

  guardarEstado() {

    let html = `
        <p>Se van a modificar todos los remitos de la hoja de ruta.</p>
        <p>Quiere continuar?</p>

      `
    Swal.fire({
      title: 'Cerrar hoja de ruta?',
      //text: "Se eliminará el remito"
      html,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        this._remitoService.cerrarHR(this.idhr, this.data).then(res => {
          this._router.navigateByUrl('hojasruta');

        })
      }
    });

    this.selectedRemito = []
  }
  onCheckboxChange(row) {
    if (this.isInSelected(row)) {

      this.quitarSeleccion(row)
    }
    else {

      this.agregarSeleccion(row)
    }
  }
  isInSelected(row) {
    let idx_r = this.selectedRemito.findIndex(r => r == row.id)
    return idx_r != -1
  }
  formatKilo(p_value) {
    return this._selectFormatService.formatKilo(p_value)
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
  onChangeFechaEntrega() {
    if (this.proveedor.length > 0) {
      this._remitoService.getTarifarioProveedorVigente(this.proveedor, this.fechaentrega).then(res => {
        this.tarifario = res
      })
    }

  }
  onChangeEstado() {
    if (this.selectedEstado == "") {
      this.reestablecer()
    }

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
    if (this.selectedEstado == "") {
      this.reestablecer()

    }
    else if (this.selectedEstado == this.estadoEntregado.id) {
      this.entregar()
    }
    else if (this.selectedEstado == "conformadoentregado") {
      this.entregarConf()
    }
    else if (this.selectedEstado == "conformado") {
      this.conformar()
    }
    else if (this.selectedEstado == this.estadoRechazado.id) {
      this.rechazar()
    }
    else if (this.selectedEstado == this.estadoCancelado.id) {
      this.cancelar()
    }
    else if (this.selectedEstado == "reubicado") {
      this.reubicar()
    }
    else if (this.selectedEstado == this.estadoPendiente.id) {
      this.volverPendiente()
    }
    else {
      Swal.fire("Sin acción", "No hay un acción para ese estado", "error")
    }
  }
  formatNumero(valor) {
    return this._selectFormatService.redondear(valor)
  }
  editarFechaEntrega() {

    this._remitoService.editarFechaEntregaHR(this.idhr, this.fechaentrega, this.data).then(res => {
      Swal.fire("Éxito edición", "Se logró editar la fecha de entrega", "success")

    })
  }
  showCreacion() {
    return new Date(this.fechacreacion).toLocaleDateString()
  }
  hayImportante() {
    let idx = this.data.findIndex(r => r.expand?.destinatario?.importancia == 1)
    return idx != -1
  }

  onNavChange(event: any) {
    this.tab = event.nextId;
  }


}
