import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { ClienteService } from '../cliente.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-tarifariohistorial',
  templateUrl: './tarifariohistorial.component.html',
  styleUrls: ['./tarifariohistorial.component.scss']
})
export class TarifariohistorialComponent implements OnInit {

  public cliente=""
  public url = this.router.url;
  public clientenombre = ""
  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  public page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private router: Router,
    private _clienteService:ClienteService
  ) { 
    this.cliente = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    this._clienteService.getTarifarioCliente(this.cliente).then(res=>{
      this.data = res
      this.page.count = res.length
      this.page.offset = 0; 
      this.loadPage()      
    })
    this._clienteService.getCliente(this.cliente).subscribe(res=>{
      this.clientenombre = res.nombre
    })
    
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  loadPage() {
    let min = this.page.offset * this.page.size
    let max  = (this.page.offset+1) * this.page.size <= this.page.count? (this.page.offset+1) * this.page.size : this.page.count
    this.rows = []
    for(let i = min;i<max;i++){
      this.rows.push(this.data[i])
    }
    
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  filterUpdate(event) {
    this.page.offset = 0;
    this.loadPage();
  }
  exportarHistorial(){
    let csvData = this.data.map(item=>({
      FECHADESDE:new Date(item.fechadesde).toLocaleDateString(),
      FECHAHASTA:new Date(item.fechahasta).toLocaleDateString(),
      PRECIO:item.precio,
      UNIDAD:item.expand.unidad.nombre,
      DESCRIPCION:item.descripcion
    }))
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvData);
    XLSX.utils.book_append_sheet(wb, ws, 'Tarifario historial');
    XLSX.writeFile(wb, `Tarifario Historial: ${this.clientenombre}.xlsx`);
  }

}
