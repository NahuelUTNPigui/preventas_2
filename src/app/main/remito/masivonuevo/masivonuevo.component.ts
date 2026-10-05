import { Component, OnInit,Input,ViewChild,Output, EventEmitter,SimpleChanges } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { RemitoService } from '../remito.service';
import { SelectFormatService } from 'app/main/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-masivonuevo',
  templateUrl: './masivonuevo.component.html',
  styleUrls: ['./masivonuevo.component.scss']
})
export class MasivonuevoComponent implements OnInit {
  @ViewChild('nroRemito') nroRemito;

  //Eventos
  @Output() remitoEvento = new EventEmitter<any>();
  // public
  public sidebarToggleRef = false;
  public submitted = false;
  public success = false;
  public loading = false;
  public subirForm=false
  public error = '';
  @Input() cliente = ""
  @Input() fechaIngreso = ""
  @Input() destinatarioOptions = []
  @Input() remitenteOptions = []

  public prioridadOptions:any[] = []
  //Validaciones
  public nombrescampo = {
    NRO:"NRO",
    REMITENTE:"REMITENTE",
    DESTINATARIO:"DESTINATARIO",
    TOTALVIAJE:"TOTALVIAJE",
  }
  public remitovalidar={
    malnro:false,
    malremitente:false,
    maldestinatario:false,
    maltotal:false
  }

  public remito = {
      nroRemito:'', 
      kilos: null,
      bultos: null, 
      remitente: null, 
      destinatario: null, 
      localidad: null, 
      estado: null, 
      facturar: true,
      precioUnitario: null, 
      totalViaje: null, 
      porcentajeCobro: null, 
      valorDeclarado: null,
      observacion:"",
      novedad:"",
      etiqueta:"",
      prioridad:0
  }
  public nombrecliente = ""
  public nroremitorepetido = false
  estadoPendiente = ""
  public tarifario = []
  public tarifariohistorial = []
  public responsable: string;
  public localidad:string

  public ColumnMode = ColumnMode;
  public page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;
  
  constructor(
    private _remitoService: RemitoService,
    private _selectFormatService: SelectFormatService,
    private modalService: NgbModal
  ) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'User') {
      this.responsable = currentUser.record.id;
    }
  }

  ngOnInit(): void {
    this.onCambioNro()
    this.remito.remitente = null
    this.prioridadOptions = this._selectFormatService.getPrioridades()
    this._remitoService.getTarifarioClienteVigente(this.cliente,this.fechaIngreso).then(res=>{
      this.tarifario = res
      this.page.count = res.length
      this.page.size = res.length
    })
    this._remitoService.getTarifarioClienteCompleto(this.cliente).then(res=>{
      this.tarifariohistorial = res
    })
    this._selectFormatService.getEstados().subscribe((response) => {
      const estadoPendiente = response.find((estado) => estado.nombre === 'Pendiente');
      if (estadoPendiente) {
        this.remito.estado = estadoPendiente.id;
        this.estadoPendiente=estadoPendiente.id
      } else {
        console.error('Estado "Pendiente" no encontrado en la lista de estados.');
      }
    });
  }
  onCambioNro(){
    if(this.remito.nroRemito != ""){
      
      this._remitoService.getRemitoXNroCliente(this.remito.nroRemito,this.cliente).subscribe(res=>{
        this.nroremitorepetido = res.totalItems != 0
      })
    }
  }
  onDestinatarioChange(destinatarioId:any):void{
    this.onCampoChange(this.nombrescampo.DESTINATARIO)
    this._selectFormatService.getLocalidadDestinatario(destinatarioId).subscribe(res=>{
      this.localidad = res.expand.localidad.nombre
    })
    
  }
  calcularTotal(tipo){
    if(tipo == 'kilos'){
      this.remito.totalViaje = this.remito.kilos * this.remito.precioUnitario      
    }
    else if(tipo == 'bultos'){
      this.remito.totalViaje = this.remito.bultos * this.remito.precioUnitario      
    }
    else if(tipo == 'porcentaje'){
      this.remito.totalViaje = this.remito.porcentajeCobro/100.0 * this.remito.valorDeclarado
    }
    else{
      this.remito.totalViaje = this.remito.precioUnitario
    }
    this.onCampoChange(this.nombrescampo.TOTALVIAJE)
  }
  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  openHistorialModal(modal){
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  validarForm(){
    if( this.remito.nroRemito== null|| this.remito.nroRemito==""){
      Swal.fire("Error número de remito","Debe ingresar el número de remito","error")
      return false
    }
    if( this.remito.remitente== null|| this.remito.remitente==""){
      Swal.fire("Error remitente","Debe seleccionar el remitente","error")
      return false
    }
    if( this.remito.destinatario== null|| this.remito.destinatario==""){
      Swal.fire("Error destinatario","Debe seleccionar el destinatario","error")
      return false
    }
    if( this.remito.totalViaje== null|| this.remito.totalViaje==""){
      Swal.fire("Error total","Debe ingresar total del viaje o calcularlo","error")
      return false
    }
    return true
  }
  onCampoChange(campo){
    
    if(campo == this.nombrescampo.NRO){
      this.onCambioNro()
      if( this.remito.nroRemito== null|| this.remito.nroRemito==""){
        this.remitovalidar.malnro = true
      } 
      else{
        this.remitovalidar.malnro = false
      }
    }
    if(campo == this.nombrescampo.REMITENTE){
      if( this.remito.remitente== null|| this.remito.remitente==""){
        this.remitovalidar.malremitente = true
      }
      else{
        this.remitovalidar.malremitente = false
      }
    }
    if(campo == this.nombrescampo.DESTINATARIO){
      if( this.remito.destinatario== null|| this.remito.destinatario==""){
        this.remitovalidar.maldestinatario = true
      }
      else{
        this.remitovalidar.maldestinatario = false
      }
    }
    if(campo == this.nombrescampo.TOTALVIAJE){
      if( this.remito.totalViaje== null|| this.remito.totalViaje==""){
        this.remitovalidar.maltotal = true
      }
      else{
        this.remitovalidar.maltotal = false
      }
    }
  }
  guardarRemito(){
    if(!this.validarForm()){
      return
    }
    this.remitoEvento.emit(this.remito)
    this.remito={
      nroRemito:'', 
      kilos: null,
      bultos: null, 
      remitente: null, 
      destinatario: null, 
      localidad: null, 
      estado: this.estadoPendiente, 
      facturar: true,
      precioUnitario: null, 
      totalViaje: null, 
      porcentajeCobro: null, 
      valorDeclarado: null,
      observacion:"",
      novedad:"",
      etiqueta:"",
      prioridad:0
    }
    this.localidad = ""
    if(this.subirForm){
      this.nroRemito.nativeElement.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
  }
  ngOnChanges(changes:SimpleChanges){
    
    let changeCliente = changes["cliente"]
    let changeFechaIngreso = changes["fechaIngreso"]
    if(changeCliente || changeFechaIngreso){
      this._remitoService.getTarifarioClienteVigente(this.cliente,this.fechaIngreso).then(res=>{
      this.tarifario = res
      this.page.count = res.length
      this.page.size = res.length
    })
    }
  }
  capitalize(texto){
    return texto.toUpperCase()
  }  
   

}
