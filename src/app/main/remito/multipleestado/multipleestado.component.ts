import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { RemitoService } from '../remito.service';
@Component({
  selector: 'app-multipleestado',
  templateUrl: './multipleestado.component.html',
  styleUrls: ['./multipleestado.component.scss']
})
export class MultipleestadoComponent implements OnInit {

  public currentPage = 1;

  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;

  @Output() limpiarListaEvent = new EventEmitter<string>();
  @Output() quitarRemitoEvent = new EventEmitter<any>();
  @Output() cerrarModalEvent = new EventEmitter<string>();
  @Output() guardarModalEvent = new EventEmitter<string>();
  
  @Input() remitos = []
  @Input() estados = []
  
  public rows = []
  public estado = ""

  public novedad = ""
  public observacion = ""
  public conformado = false


  public malestado = false
  public malremitos = false

  //paginacion
  public selectedOption = 10;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0, // Página actual
  };
  constructor(
    private _remitoService:RemitoService
  ) { }

  ngOnInit(): void {
    this.page.count = this.remitos.length
    this.loadPage()
  }
  quitarRemito(row) {
    let idx_r = this.remitos.findIndex(r=>r.id==row.id)
    if(idx_r != -1){
      this.remitos.splice(idx_r,1)
    }
    this.quitarRemitoEvent.emit(row)
    this.loadPage()
  }
  limpiarLista(){
    this.remitos = []
    this.limpiarListaEvent.emit("Cerrando")
     
  }
  onGuardar(){
    if(this.estado == "" ){
      this.malestado = true
    }
    if(this.remitos.length == 0){
      this.malremitos = true
    }
    if(this.malestado || this.malremitos ){
      return 
    }
    
    
    this._remitoService.cambioMultiple(this.remitos,this.estado,this.conformado,this.observacion,this.novedad).then(res=>{
      
      this.guardarModalEvent.emit("Cerrando")
    })
    

  }
  onChangeEstado(){
    this.malestado = false
    if(this.estado == "" ){
      this.malestado = true
    }
  }
  loadPage(){
    this.rows  = []
    let minimo = this.page.offset * this.page.size
    let maximo = Math.min((this.page.offset + 1)*this.page.size , this.page.count)
    
    for(let i = minimo;i<maximo;i++){
      this.rows.push(this.remitos[i])
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
  isInSelected(row){
    let idx_r = this.remitos.findIndex(r=>r.id == row.id)
    return idx_r != -1
  }


}
