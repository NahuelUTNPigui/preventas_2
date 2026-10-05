import { Component, OnInit,Input ,Output,EventEmitter  } from '@angular/core';
import { SelectFormatService } from 'app/main/common';
import { PagosService } from '../pagos.service';
import { ColumnMode  } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-hojasbuscar',
  templateUrl: './hojasbuscar.component.html',
  styleUrls: ['./hojasbuscar.component.scss']
})
export class HojasbuscarComponent implements OnInit {
  @Input() proveedor:string;
  @Input() hojasid=[];
  @Output() cerrarModalEvent = new EventEmitter<any>()
  @Output() elegirHojasEvent = new EventEmitter<any>()
  public selectedOption = 10;
  public ColumnMode = ColumnMode;
  public estadoOptions = []
  //filtros
  
  public numeroHoja = ""
  public fechaEntregaDesde = ""
  public fechaEntregaHasta = ""
  public estado = -1

  public rows = []

  private maxchars=80
  page = {
    size: 5, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
    private _pagosService:PagosService,
    private _selectFormatService:SelectFormatService
  ) { }

  ngOnInit(): void {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año,mes,1)
    let ultima_dia_mes = new Date(año,mes+1,0)
    this.fechaEntregaDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaEntregaHasta = ultima_dia_mes.toISOString().split('T')[0]
    
    this.estadoOptions  = this._selectFormatService.getEstadosHR()
    this.filterUpdate({})
  }
  loadPage(){
    this._pagosService.getHojasSimple(this.page.size,this.page.offset,this.numeroHoja,this.estado,this.fechaEntregaDesde,this.fechaEntregaHasta,this.proveedor).subscribe(res=>{
      this.page.count = res.totalItems
      //this.rows = res.items.filter(h=>!this.hojasid.includes(h.id))
      this.rows = res.items
      
      

    })
  }
  piso(x){
    return Math.round(x)
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  filterUpdate(evento){
    this.page.offset = 0;
    this.loadPage()
  }
  elegirHoja(hoja:any) {
    this.elegirHojasEvent.emit(hoja)
  }
  cerrarModal(){
    this.cerrarModalEvent.emit()
  }
  getEstadoNombre(idestado){
    let est = this.estadoOptions.filter(e=>e.id==idestado)[0]
    return est.nombre
  }

}
