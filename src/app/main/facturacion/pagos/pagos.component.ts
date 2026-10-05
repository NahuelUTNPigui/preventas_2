import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { SelectFormatService } from 'app/main/common';
import { FacturacionService } from '../facturacion.service';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss']
})
export class PagosComponent implements OnInit {
  public selectedOption = 10;
  public clientes = []
  public rows: any[];
  public data: any[];
  public ColumnMode = ColumnMode;
  public fechaCobroDesde = ''
  public fechaCobroHasta = ''
  public cliente = ''
  public nombrecliente = ''
  private IVA = 1.21

  public totalfacturas = 0
  public totaldetalles = 0
  public totalretenciones = 0
  public totaldescuentos = 0
  public totalsaldo = 0
  public totalcuentas = 0
  public totalnotas = 0
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
    private _selectService: SelectFormatService,
    private _factService: FacturacionService,
    private _filtroService: FiltrosService,

  ) { }

  ngOnInit(): void {
    let filtro = this._filtroService.getFiltro(this._filtroService.COBROS())
    
    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
      this.nombrecliente = filtro.cliente
      let c = this.clientes.filter(c => c.nombre == this.nombrecliente)[0]
      this.cliente = c ? c.id : ""
      this.fechaCobroDesde = filtro.fechadesde
      this.fechaCobroHasta = filtro.fechahasta
      this.loadPage()
    })


  }
  loadPage() {

    this._factService.getCobros(this.page.size, this.page.offset + 1, this.fechaCobroDesde, this.fechaCobroHasta, this.nombrecliente).subscribe(res => {

      this.rows = res.items
      for (let i = 0; i < this.rows.length; i++) {
        
        this.rows[i].totalfacturas = this.rows[i].expand.cliente.responsableinscripto ? this.rows[i].totalfacturas * this.IVA : this.rows[i].totalfacturas
        let fila = this.rows[i]
        let saldo = fila.totalfacturas - (fila.totaldetalles + fila.totalretenciones + fila.totaldescuentos+fila.totalacuentas+fila.totalnotas)
        this.rows[i].saldo = saldo
        
      }
      this.page.count = res.totalItems;
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
  piso(numero) {
    return Math.round(numero)
  }
  formatPeso(value) {
    return this._factService.formatPeso(value)
  }
  limpiarFiltros() {
    this.cliente = ""
    this.nombrecliente = ''
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechaCobroDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaCobroHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.filterUpdate({})

  }
  filterUpdate(event) {
    this._filtroService.setItemFiltro(this._filtroService.COBROS(), "fechadesde", this.fechaCobroDesde)
    this._filtroService.setItemFiltro(this._filtroService.COBROS(), "fechahasta", this.fechaCobroHasta)
    this._filtroService.setItemFiltro(this._filtroService.COBROS(), "cliente", this.nombrecliente)
    this.page.offset = 0;
    this.loadPage();
  }
  changeCliente() {
    let cli = this.clientes.filter(c => c.id == this.cliente)[0]
    this.nombrecliente = cli ? cli.nombre : ""
    this.filterUpdate({})
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
  exportarXLX() {
    this._factService.getTodosCobros(this.fechaCobroDesde, this.fechaCobroHasta, this.nombrecliente).then(res => {
      let csvdata = res.map(item => ({
        FECHACOBRO: this.formatDateExcel(item.fechacobro, false),
        CLIENTE: item.expand.cliente.nombre,
        TOTALFACTURAS: item.totalfacturas,
        TOTALPAGOS: item.totaldetalles,
        TOTALRETENCIONES: item.totalretenciones
      }))
      //csvdata.sort((c1,c2)=>c1.FECHACOBRO<c2.FECHACOBRO?-1:1)
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `Cobros: ${this.nombrecliente} - Desde: ${this.formatDateExcel(this.fechaCobroDesde, false)} Hasta: ${this.formatDateExcel(this.fechaCobroHasta, false)}`, s: {} };
      const range = XLSX.utils.decode_range('A1:L1');
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'Cobros');
      XLSX.writeFile(wb, `${this.nombrecliente}-${this.fechaCobroDesde.replace(/\//g, "-")}-${this.fechaCobroHasta.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
    })
  }
  ConfirmDeletePago(id) {
    Swal.fire({
      title: '¿Eliminar?',
      text: "Se eliminará el cobro",
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
        this.deletePago(id)

      }
    });
  }
  deletePago(id) {
    this._factService.eliminarCobro(id).then(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Cobro eliminado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.page.offset = 0;
      this.loadPage()
    })
  }
  calcularTotal() {
    this.totalcuentas = 0
    this.totaldescuentos = 0
    this.totaldetalles = 0
    this.totalfacturas = 0
    this.totalnotas = 0
    this.totalretenciones = 0
    this.totalsaldo = 0
    let total = 0
    this._factService.getTodosCobros(
      this.fechaCobroDesde,
      this.fechaCobroHasta,
      this.nombrecliente
    ).then(res => {
      for (let i = 0; i < res.length; i++) {
        let fila = res[i]
        
        total += fila.totalfacturas
        
        this.totalcuentas += fila.totalacuentas
        this.totaldescuentos += fila.totaldescuentos
        this.totaldetalles += fila.totaldetalles
        this.totalfacturas += fila.totalfacturas
        this.totalnotas += fila.totalnotas
        this.totalretenciones += fila.totalretenciones
        this.totalsaldo += fila.acuenta
      }


    })

  }
  redondear(num) {
    return Math.round(1000 * num) / 1000
  }
}
