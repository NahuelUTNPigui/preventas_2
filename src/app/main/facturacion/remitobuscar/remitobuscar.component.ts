import { Component, OnInit,Input ,Output,EventEmitter  } from '@angular/core';
import { RemitoService } from 'app/main/remito/remito.service';
import { SelectFormatService } from 'app/main/common';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-remitobuscar',
  templateUrl: './remitobuscar.component.html',
  styleUrls: ['./remitobuscar.component.scss']
})
export class RemitobuscarComponent implements OnInit {
  @Input() cliente: string;
  @Input() remitosid: string;
  @Output() cerrarModalEvent = new EventEmitter<any>();
  @Output() elegirRemitoEvent = new EventEmitter<any>();
  public selectedOption = 10;
  public ColumnMode = ColumnMode;
  public estadoOptions = []
  //filtros
  
  public numeroremito = ""
  public fechaIngresoDesde = ""
  public fechaIngresoHasta = ""
  public estado = ""

  public rows = []
  private maxchars=80
  page = {
    size: 20, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  //REMITOS EN SI
  constructor(
    private _remitoService: RemitoService,
    private _selectFormatService: SelectFormatService
  ) { }

  
  ngOnInit(): void {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año,mes,1)
    let ultima_dia_mes = new Date(año,mes+1,0)
    this.fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    this._selectFormatService.getEstados().subscribe((response) => {
      this.estadoOptions = response;})
    this.filterUpdate({})
  }
  loadPage(){
    this._remitoService.getRemitosSimple(
      this.page.size, this.page.offset + 1, 
      this.numeroremito, 
      this.estado, 
      this.fechaIngresoDesde, 
      this.fechaIngresoHasta,
      this.cliente)
      .subscribe((data: any) => {
        //this.rows = data.items;
        this.rows = data.items.map((item: any) => {
          
          if (item.expand && item.expand.responsable) {
            return {
              ...item,
              numerorto: `${item.nroRemito}${item.reubicado?"*":""}`,
              observacioncorto:item.observacion?item.observacion.length > this.maxchars?item.observacion.substr(0,this.maxchars):item.observacion:"",
              nombreCompleto: `${item.expand.responsable.nombre} ${item.expand.responsable.apellido}`
            };
          } else {
            return {
              ...item,
              numerorto: `${item.nroRemito}${item.reubicado?"*":""}`,
              observacioncorto:item.observacion?item.observacion.length >this.maxchars?item.observacion.substr(0,this.maxchars):item.observacion:"",
              nombreCompleto: ''
            };
          }
          
          
        });
        this.rows = this.rows.filter(r=> !this.remitosid.includes(r.id))
        this.page.count = data.totalItems;
        
      });
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
  elegirRemito(remito:any) {
    this.elegirRemitoEvent.emit(remito)
  }
  cerrarModal(){
    this.cerrarModalEvent.emit()
  }
}
