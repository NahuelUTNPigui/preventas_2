import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { FacturacionService } from '../facturacion.service';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-rentabilidad',
  templateUrl: './rentabilidad.component.html',
  styleUrls: ['./rentabilidad.component.scss']
})
export class RentabilidadComponent implements OnInit {
  //Permisos
  public conpermisos = false
  public data = []
  public datafiltrada = []
  public rows = []
  public selectedOption = 10;
  public fechadesde = ""
  public fechahasta = ""
  public nro = ""
  public cliente = ""
  public estadoremito = ""
  public remitente = ""
  public destinatario = ""
  public estadoOptions = []
  pendienteID: string;
  transitoID: string;
  entregadoID: string;
  public remitentes = []
  public destinatarios = []
  public clientes = []
  //totales
  public totalIngreso = 0
  public totalCosto = 0
  public totalBeneficio = 0
  public rentabilidadTotal = 0


  public ColumnMode = ColumnMode;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0, // Página actual
  };
  constructor(
    private _selectService: SelectFormatService,
    private _factService: FacturacionService,
    private _filtroService: FiltrosService,
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    let filtro = this._filtroService.getFiltro(this._filtroService.RENTABILIDADCLIENTE())
    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
    })
    this._selectService.getEstados().subscribe((response) => {
      this.estadoOptions = response;
      const estadoTransito = response.find((estado) => estado.nombre === 'Tránsito');
      const estadoPendiente = response.find((estado) => estado.nombre === 'Pendiente');
      const estadoEntregado = response.find((estado) => estado.nombre === 'Entregado');
      if (estadoTransito) {
        this.transitoID = estadoTransito.id;
      } else {
        console.error('Estado "Tránsito" no encontrado en la lista de estados.');
      }
      if (estadoPendiente) {
        this.pendienteID = estadoPendiente.id;
      } else {
        console.error('Estado "Pendiente" no encontrado en la lista de estados.');
      }
      if (estadoEntregado) {
        this.entregadoID = estadoEntregado.id;
      } else {
        console.error('Estado "Entregado" no encontrado en la lista de estados.');
      }
    })
    this.onChangeCliente()

    this.loadFiltro(filtro)
    this.filterUpdate({})

  }
  onChangeCliente() {
    this.destinatarios = []
    this.remitentes = []
    if (this.cliente != "") {
      this._selectService.getTodosDestinatariosCliente(this.cliente).then(res => {
        this.destinatarios = res
      })
      this._selectService.getRemitentesCliente(this.cliente).then(res => {
        this.remitentes = res
      })
    }
    else {
      this.destinatario = ""
      this.remitente = ""
    }
    this.filterUpdateLocal({})

  }
  loadFiltro(filtro) {
    this.fechadesde = filtro.fechadesde.split("T")[0]
    this.fechahasta = filtro.fechahasta.split("T")[0]
    this.nro = filtro.nro
    this.cliente = filtro.cliente
    this.estadoremito = filtro.estadoremito
    this.remitente = filtro.remitente
    this.destinatario = filtro.destinatario
  }
  saveFiltro() {
    this._filtroService.setItemFiltro(this._filtroService.RENTABILIDADCLIENTE(), "nro", this.nro)
    this._filtroService.setItemFiltro(this._filtroService.RENTABILIDADCLIENTE(), "fechadesde", this.fechadesde)
    this._filtroService.setItemFiltro(this._filtroService.RENTABILIDADCLIENTE(), "fechahasta", this.fechahasta)
    this._filtroService.setItemFiltro(this._filtroService.RENTABILIDADCLIENTE(), "cliente", this.cliente)
    this._filtroService.setItemFiltro(this._filtroService.RENTABILIDADCLIENTE(), "estadoremito", this.estadoremito)
    this._filtroService.setItemFiltro(this._filtroService.RENTABILIDADCLIENTE(), "remitente", this.remitente)
    this._filtroService.setItemFiltro(this._filtroService.RENTABILIDADCLIENTE(), "destinatario", this.destinatario)
  }
  procesarFilas(hojas) {
    this.data = hojas.map(h => h.remitos).reduce((total, fila) => total.concat(fila), [])
    this.filterUpdateLocal({})
  }
  filterUpdate(evento) {
    this.saveFiltro()

    this.page.offset = 0;
    this._factService.getRentabilidad(this.fechadesde, this.fechahasta, this.nro).then(res => {
      this.procesarFilas(res)

    })
  }
  filterUpdateLocal(evento) {
    
    this.datafiltrada = this.data
    if (this.cliente != "") {
      this.datafiltrada = this.datafiltrada.filter(r => r.cliente == this.cliente)
    }
    if (this.destinatario != "") {
      this.datafiltrada = this.datafiltrada.filter(r => r.destinatario == this.destinatario)
    }
    if (this.remitente != "") {
      this.datafiltrada = this.datafiltrada.filter(r => r.remitente == this.remitente)

    }
    if (this.estadoremito != "" && this.estadoremito != null) {
      this.datafiltrada = this.datafiltrada.filter(r => r.estado == this.estadoremito)
    }
    this.calcularTotal()
    this.page.count = this.datafiltrada.length
    this.loadPage()
  }
  calcularTotal() {
    this.totalBeneficio = 0
    this.totalCosto = 0
    this.totalIngreso = 0
    this.rentabilidadTotal = 0
    this.datafiltrada.forEach(fila => {
      this.totalBeneficio += fila.beneficioViaje
      this.totalCosto += fila.costoViaje
      this.totalIngreso += fila.totalViaje
    })
    this.rentabilidadTotal = this.totalCosto > 0 ? this.totalBeneficio / this.totalCosto : 0

  }
  limpiarFiltros() {
    let filtro = this._filtroService.rentabilidadClienteFromZero()
    this.loadFiltro(filtro)
    this.filterUpdate({})
  }
  loadPage() {
    let minimo = this.page.offset * this.page.size
    let maximo = Math.min((this.page.offset + 1) * this.page.size, this.page.count)
    this.rows = []
    for (let i = minimo; i < maximo; i++) {
      let fila = this.datafiltrada[i]
      this.rows.push(fila)
    }
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage()

  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage()

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
    let csv = []
    csv = this.datafiltrada.map(r => ({
      FECHA: new Date(r.fechaIngreso).toLocaleDateString(),
      CLIENTE: r.expand.cliente.nombre,
      NUMERO: r.nroRemito,
      ESTADO:r.expand.estado.nombre,
      INGRESO: r.totalViaje,
      COSTO: r.costoViaje,
      BENEFICIO: r.beneficioViaje,
      RENTABILIDAD: r.rentabilidadViaje,
      REMITENTE: r.expand.remitente.nombre,
      DESTINATARIO: r.expand.destinatario.nombre
    }))
    let totalIngreso = [{ TOTALINGRESO: this.formatKilo(this.totalIngreso) }]
    let totalCosto = [{ TOTALCOSTO: this.formatKilo(this.totalCosto) }]
    let totalBeneficio = [{ TOTALBENEFICIO: this.formatKilo(this.totalBeneficio) }]
    let totalRentabilidad = [{ TOTALRENTABILIDAD: this.formatKilo(this.rentabilidadTotal) }]
    const wb = XLSX.utils.book_new()

    const ws = XLSX.utils.aoa_to_sheet([])
    let vs = `Rentabilidad clientes: ${this.fechadesde} - ${this.fechahasta}`

    ws['A1'] = { t: 's', v: vs, s: {} };
    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csv, { origin: 'A2' });
    XLSX.utils.sheet_add_json(ws, totalIngreso, { origin: 'M2' })
    XLSX.utils.sheet_add_json(ws, totalCosto, { origin: 'O2' })
    XLSX.utils.sheet_add_json(ws, totalBeneficio, { origin: 'Q2' })
    XLSX.utils.sheet_add_json(ws, totalRentabilidad, { origin: 'S2' })
    XLSX.utils.book_append_sheet(wb, ws, 'Rentabilidad');
    XLSX.writeFile(wb, `${vs}.xlsx`, { cellStyles: true });
  }
  formatPeso(peso) {
    return this._selectService.formatPeso(peso)
  }
  formatKilo(kilo) {
    return this._selectService.formatKilo(kilo)
  }

}
