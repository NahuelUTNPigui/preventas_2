import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SelectFormatService } from 'app/main/common';
import { ChequesService } from 'app/main/cheques/cheques.service';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-buscarcheque',
  templateUrl: './buscarcheque.component.html',
  styleUrls: ['./buscarcheque.component.scss']
})
export class BuscarchequeComponent implements OnInit {
  @Input() saldo = 0
  public selectedOption = 10;
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  //Lista
  public bancos = []
  public clientes = []
  public unidades = []
  public tipos = []
  //Filtros
  public nro = ""
  public fechaIngresoDesde = ""
  public fechaIngresoHasta = ""
  public fechaAcreditacionDesde = ""
  public fechaAcreditacionHasta = ""
  public conFechaAcreditacion = false
  public banco = ""
  public razonSocial = ""
  public cuit = ""
  public cliente = ""
  public tipo = 0
  public unidad = ""

  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  @Output() chequeEvent = new EventEmitter<any>();
  constructor(
    private _chequeService: ChequesService,
    private _selectService: SelectFormatService
  ) { }

  ngOnInit(): void {
    this._chequeService.getAllBancos().then(res => {
      this.bancos = res
    })
    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
    })
    this.unidades = this._selectService.getCuentas()
    this.tipos = this.tipos.concat(this._chequeService.getTipos())
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.fechaAcreditacionDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaAcreditacionHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.conFechaAcreditacion = false
    this.loadPage()
  }
  loadPage() {
    this._chequeService.getCheques(
      this.page.offset + 1,
      this.page.size,
      this.nro,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.fechaAcreditacionDesde,
      this.fechaAcreditacionHasta,
      this.conFechaAcreditacion,
      "",
      "",
      "",
      this.banco,
      this.razonSocial,
      this.cuit,
      this.cliente,
      "",
      this.tipo,
      this.unidad
    ).subscribe(res => {
      this.rows = res.items
      this.page.count = res.totalItems

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
  filterUpdate(event) {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  limpiarFiltros() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.fechaAcreditacionDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaAcreditacionHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.conFechaAcreditacion = false
    this.banco = ""
    this.razonSocial = ""
    this.cuit = ""
    this.cliente = ""
    this.tipo = 0
    this.unidad = ""
    this.filterUpdate({})
  }
  elegirCheque(cheque) {
    this.saldo -= cheque.importe
    this.chequeEvent.emit({
      ...cheque,
      id: cheque.id,
      total: cheque.importe,
      descripcion: cheque.nro,

      categoria: "Cheque"
    })

  }

}
