import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectFormatService } from 'app/main/common';
import { ClienteService } from '../cliente.service';

@Component({
  selector: 'app-asientos',
  templateUrl: './asientos.component.html',
  styleUrls: ['./asientos.component.scss']
})
export class AsientosComponent implements OnInit {

  public idCliente: string = "";
  public nombre: string = "";
  public cuit: string = "";
  public razonSocial: string = "";
  public saldo: number = 0
  public asientodata: any[] = []
  public rows: any = []

  public opciones = [
    { id: "fact", nombre: "Factura" },
    { id: "nota", nombre: "Nota crédito" }
  ]

  //filtros
  public fechadesde: string = ""
  public fechahasta: string = ""

  //asientos
  public page = {
    size: 25, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;


  /**
   * Constructor
   *
   * @param {ClienteService} _clienteService
   * @param {SelectFormatService} _selectFormatService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(private _clienteService: ClienteService,
    private _router: Router,
    private route: ActivatedRoute,
    private _selectFormatService: SelectFormatService,
  ) {
  }

  ngOnInit(): void {
    this.idCliente = this.route.snapshot.paramMap.get('cliente')
    this._clienteService.getCliente(this.idCliente).subscribe(response => {

      this.nombre = response.nombre;
      this.cuit = response.cuit;
      this.razonSocial = response.razonSocial;
      this.saldo = response.saldo

    });
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    let fechadesde = primer_dia_mes.toISOString().split('T')[0]
    let fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    this.fechadesde = fechadesde
    this.fechahasta = fechahasta
    this.filterUpdate({})
  }
  filterUpdate(event) {
    this._clienteService.getAsientosFullList(this.idCliente, this.fechadesde, this.fechahasta).then(res => {
      this.asientodata = res
      this.page.count = this.asientodata.length
      this.loadPage()
    })
  }
  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset + 1), this.page.count)
    this.rows = []
    for (let i = min_i; i < max_i; i++) {
      this.rows.push(this.asientodata[i])
    }
  }
  onPageSizeChange() {
    this.page.offset = 0
    this.loadPage()
  }
  onPage(event) {
    this.page.offset = event.offset;
    this.loadPage()
  }


}
