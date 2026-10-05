import { Component, OnInit,Input,Output, EventEmitter } from '@angular/core';
import { RemitoService } from '../remito.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
@Component({
  selector: 'app-modalhr',
  templateUrl: './modalhr.component.html',
  styleUrls: ['./modalhr.component.scss']
})
export class ModalhrComponent implements OnInit {
  public ColumnMode = ColumnMode;
  public estados:any[];
  public selectedOption = 10;
  public rows:any[] = []
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  //Buscar hoja de ruta
  public nro
  public fechadesde
  public fechahasta
  public fechafindesde
  public fechafinhasta
  public proveedor
  public chofer
  public vehiculo
  public estado
  public confechafin = false
  
  @Input() idremito:any = ""
  @Output() hojaRutaEvent = new EventEmitter<any>();

  constructor(
    private _remitoService:RemitoService
    
  ) { }

  ngOnInit(): void {
    
    this.estados = this._remitoService.getEstadosHR()
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año,mes,1)
    let ultima_dia_mes = new Date(año,mes+1,0)
    this.fechadesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    this.fechafindesde = ""
    this.fechafinhasta = ""
    this.estado = "-1"
    this.proveedor = ""
    this.vehiculo = ""
    this.chofer = ""
    this.nro = ""
    this.loadPage()
  }
  filterUpdate(event){
    this.page.count= 0
    this.page.offset = 0
    this.loadPage()
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage()
    
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage()
    
  }
  getEstadoNombre(idestado){
    let est = this.estados.filter(e=>e.id==idestado)[0]
    return est.nombre
  }
  agregarHojaRuta(hrdata){
   
    this.hojaRutaEvent.emit(hrdata)
  }
  loadPage(){
    let skipTotal = false
    if(this.page.offset>0){
      skipTotal = true
    }
    this._remitoService.getHR(
      this.page.size,
      this.page.offset,
      skipTotal,
      this.nro,
      this.fechadesde,
      this.fechahasta,
      this.fechafindesde,
      this.fechafinhasta,
      this.estado,
      this.proveedor,
      this.vehiculo,
      this.chofer,
      this.confechafin,
      -1
    ).subscribe(res=>{
      if(!skipTotal){
        this.page.count = res.totalItems
      }
      this.rows = res.items
    })
  }

}
