import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import { FacturacionService } from '../facturacion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-cuentacorriente',
  templateUrl: './cuentacorriente.component.html',
  styleUrls: ['./cuentacorriente.component.scss']
})
export class CuentacorrienteComponent implements OnInit {
  public conpermisos = false
  public fechadesde = ""
  public fechahasta = ""
  public unidad = ""
  public unidades = []
  public clientes = []
  public cuentas = []
  public cliente = ""
  //filtros factura
  public nroFactura = ""
  public todos = true
  public cobrados = false
  public enliquidacion = false
  public enrevision = false
  public aceptadocliente = false
  public cerrada = false
  private IVA = 1.21
  //filtros cobros
  public todoscobro = true
  public cobrocompleto = true
  //saldos
  public saldofinal = 0
  public saldoinicial = 0
  // totales
  public totalfacturas = 0
  public totaliva = 0
  public totalpagos = 0
  public totalretenciones = 0
  public totaldescuentos = 0
  public totalnotas = 0
  public totalacuentas = 0
  public acuenta = 0

  private HOY = new Date()
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(private _factService: FacturacionService, private _select: SelectFormatService) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechadesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechahasta = ultima_dia_mes.toISOString().split('T')[0]


    this._select.getTodosClientes().then(res => {
      this.clientes = res
      this.page.count = res.length
    })
    this.filterUpdate({})
  }
  toPesoString(value) {
    return this._select.formatPeso(value)
  }

  filterUpdate($event) {
    this.totalfacturas = 0
    this.totaliva = 0
    this.totalpagos = 0
    this.totalretenciones = 0
    this.totaldescuentos = 0
    this.totalnotas = 0
    this.totalacuentas = 0

    this.page.offset = 0
    this.cuentas = []
    this._factService.getCuentaCorrienteCliente(this.cliente, this.page.size, this.page.offset + 1, this.fechadesde, this.fechahasta).then(res => {
      this.cuentas = res
      let saldo_o = this.saldoinicial
      for (let i = 0; i < this.cuentas.length; i++) {
        let fila = this.cuentas[i]

        saldo_o += fila.total
        saldo_o += fila.iva
        saldo_o += fila.acuenta
        saldo_o -= fila.pagos
        saldo_o -= fila.retenciones
        saldo_o -= fila.descuentos
        saldo_o -= fila.acuentas
        saldo_o -= fila.notas

        this.totalfacturas += fila.total
        this.totaliva += fila.iva
        this.totalpagos += fila.pagos
        this.totalretenciones += fila.retenciones
        this.totaldescuentos += fila.descuentos
        this.totalnotas += fila.notas
        this.totalacuentas += fila.acuentas

        this.cuentas[i].saldo = saldo_o
      }
      this.saldofinal = saldo_o
      if (this.cuentas.length == 1) {
        this.page.count = 1
      }
      else {
        this.page.count = this.cuentas.length
      }
    })
  }
  loadPage() {
    this.cuentas = []
    this._factService.getCuentaCorrienteCliente(this.cliente, this.page.size, this.page.offset + 1, this.fechadesde, this.fechahasta).then(res => {
      this.cuentas = res
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
  async exportarXLX() {
    let csv = []
    csv = this.cuentas.map(c => ({
      NUMERO: c.numero,
      CLIENTE: c.razonSocial,
      FACTURACION: c.total,
      PAGOS: c.pagos,
      RETENCIONES: c.retenciones,
      SALDO: c.saldo
    }))
    const wb = XLSX.utils.book_new()

    const ws = XLSX.utils.aoa_to_sheet([])
    let vs = `${this.fechadesde} - ${this.fechahasta}`
    if (this.cliente != "") {
      let nombrecliente = this.clientes.filter(c => c.id == this.cliente)[0].razonSocial
      vs = `${vs} ${nombrecliente}`
    }
    ws['A1'] = { t: 's', v: vs, s: {} };
    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csv, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Cuentas corrientes');
    XLSX.writeFile(wb, `${vs}.xlsx`, { cellStyles: true });

  }

  formatPeso(value) {
    return this._factService.formatPeso(value)
  }

}
