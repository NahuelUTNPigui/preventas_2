import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectFormatService } from 'app/main/common';
import { ProveedorService } from '../servicios/proveedor.service';
@Component({
  selector: 'app-asientos',
  templateUrl: './asientos.component.html',
  styleUrls: ['./asientos.component.scss']
})
export class AsientosComponent implements OnInit {
  public idProv: string = "";
  public nombre: string = "";
  public cuit: string = "";
  public razonSocial: string = "";
  public saldo: number = 0
  public asientodata: any[] = []
  public rows: any = []
  public opciones = [
    { id: "orden", nombre: "Orden pago" },
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
     * @param {Router} router
     * @param {ProveedorService} _proveedorService
     * @param {CoreSidebarService} _coreSidebarService
     */
  constructor(
    private router: Router,
    private _proveedorService: ProveedorService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.idProv = this.route.snapshot.paramMap.get('prov')
    this._proveedorService.getProveedorID(this.idProv).subscribe(res => {
      this.nombre = res.nombre
      this.saldo = res.saldo
      this.cuit = res.cuit
      this.razonSocial = res.razonSocial
    })
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
  filterUpdate({}){
    this._proveedorService.getAsientosFullList(this.idProv, this.fechadesde, this.fechahasta).then(res => {
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
