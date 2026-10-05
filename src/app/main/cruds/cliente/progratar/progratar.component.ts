import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { ClienteService } from '../cliente.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-progratar',
  templateUrl: './progratar.component.html',
  styleUrls: ['./progratar.component.scss']
})
export class ProgratarComponent implements OnInit {


  public cliente = ""
  public url = this.router.url;
  public clientenombre = ""
  public selectedOption = 10;
  public searchValue = '';
  public data: any[]=[];
  public rows: any[]=[];
  public seleccionados: any[]=[];
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
    private _clienteService: ClienteService
  ) {
    this.cliente = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    this._clienteService.getTarifarioClienteProgramado(this.cliente).then(res => {
      this.data = res
      this.page.count = res.length
      this.page.offset = 0;
      this.loadPage()
    })
    this._clienteService.getCliente(this.cliente).subscribe(res => {
      this.clientenombre = res.nombre
    })

  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  loadPage() {
    let min = this.page.offset * this.page.size
    let max = (this.page.offset + 1) * this.page.size <= this.page.count ? (this.page.offset + 1) * this.page.size : this.page.count
    this.rows = []
    for (let i = min; i < max; i++) {
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
  setVigente(id) {
    this._clienteService.setVigenteTarifario(id).subscribe(res => {
      Swal.fire("Éxito vigente", "Se puso vigente el tarifario", "success")
      this._clienteService.getTarifarioClienteProgramado(this.cliente).then(res => {
        this.data = res
        this.page.count = res.length
        this.page.offset = 0;
        this.loadPage()
      })
    })
  }
  setVigenteSeleccionados(){
    this._clienteService.setVigenteTarifarioLista(this.seleccionados).then(res => {
      Swal.fire("Éxito vigentes", "Se puso vigente a los tarifarios", "success")
      this._clienteService.getTarifarioClienteProgramado(this.cliente).then(res => {
        this.data = res
        this.page.count = res.length
        this.page.offset = 0;
        this.loadPage()
      })
    })
  }
  estaSeleccionado(id){
    let idx_t = this.seleccionados.findIndex(p_id=>p_id == id)
    return idx_t != -1
  }
  onCheckboxChange(id){
    let idx_t = this.seleccionados.findIndex(p_id=>p_id == id)
    if(idx_t==-1){
        this.seleccionados.push(id)
    }
    else{
      this.seleccionados.splice(idx_t,1)
    }
  }
  seleccionarTodos(){
    for(let i = 0;i<this.rows.length;i++){
      let fila = this.rows[i]
      if(!this.estaSeleccionado(fila.id)){
        this.seleccionados.push(fila.id)
      }
    }
  }
  quitarTodos(){
    this.seleccionados = []
  }
  exportarProgramado() {
    let csvData = this.data.map(item => ({
      FECHADESDE: item.fechadesde,
      FECHAHASTA: item.fechahasta,
      PRECIO: item.precio,
      UNIDAD: item.expand.unidad.nombre,
      DESCRIPCION: item.descripcion
    }))
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvData);
    XLSX.utils.book_append_sheet(wb, ws, 'Tarifario programado');
    XLSX.writeFile(wb, `Tarifario programado: ${this.clientenombre}.xlsx`);
  }

}
