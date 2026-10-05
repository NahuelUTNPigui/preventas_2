import { Component, Input, OnInit, ViewEncapsulation,Output,EventEmitter } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { RemitoService } from 'app/main/remito/remito.service';
import { ClienteData } from 'app/main/cruds/cliente/model/cliente-model';
import { RemitoData } from 'app/main/remito/model/remito-model';
import { SelectFormatService } from 'app/main/common';
import { FacturacionService } from '../facturacion.service';
import { DestinatarioData } from 'app/main/cruds/destinatario/model/destinatario-model';
import { RemitenteData } from 'app/main/cruds/remitente/model/remitente-model';
import { ProveedorData } from 'app/main/proveedores/model/proveedor-model';
import { VehiculoData } from 'app/main/proveedores/model/vehiculo-model';
import { EstadoData } from 'app/main/cruds/estado/model/estado-model';
import { ChoferData } from 'app/main/proveedores/model/chofer-model';


@Component({
  selector: 'app-editremito',
  templateUrl: './editremito.component.html',
  styleUrls: ['./editremito.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditremitoComponent implements OnInit {

  

  // public
  public ColumnMode = ColumnMode;
  public breadcrumbLevels: any;
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';
  public errorMessage;
  public localidad = ''
  currentDate: Date = new Date();
  public selectedProvincia = null

  @Input() idremito: string;
  @Output() cerrarModalEvent = new EventEmitter<any>();
  @Output() editarRemitoEvent = new EventEmitter<any>();
  public remito: RemitoData = {
    nroRemito: '',
    fechaIngreso: '',
    cliente: null,
    kilos: null,
    bultos: null,
    remitente: null,
    destinatario: null,
    localidad: null,
    estado: null,
    precioUnitario: null,
    totalViaje: null,
    porcentajeCobro: null,
    valorDeclarado: null,
    fechaEntrega: '',
    proveedor: null,
    chofer: null,
    vehiculo: null,
    observacion: '',
    novedad: '',
    facturar: false,
    confirmado:false
  };
  public initialRemito: RemitoData
  public clienteOptions: ClienteData[];
  public destinatarioOptions: DestinatarioData[]
  public remitenteOptions: RemitenteData[]
  public proveedorOptions: ProveedorData[] = []
  public vehiculoOptions: VehiculoData[] = []
  public choferOptions: ChoferData[] = []
  public estadoOptions: EstadoData[] = []
  public tarifario = []
  public tarifarioHistorial = []
  public openTarifario = false
  public openTarifarioHistorial = false
  public page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  
  estadoNombre: string = '';
  constructor(
    private _remitoService: RemitoService,
    private _facturacionService: FacturacionService,
    private _selectFormatService: SelectFormatService,

  ) {
  }

  ngOnInit(): void {
    this._selectFormatService.getTodosClientes().then(res=>{
      this.clienteOptions = res
    })
    this._selectFormatService.getTodosProveedores().then(res=>{
      this.proveedorOptions = res
    })
    this._selectFormatService.getEstados().subscribe((response) => {
      this.estadoOptions = response;})

   
    this._facturacionService.getRemito(this.idremito).subscribe(res=>{
      this.remito = res
      this.estadoNombre = res.expand.estado.nombre
      this._selectFormatService.getLocalidadDestinatario(res.destinatario).subscribe(res=>{
        this.localidad = res.expand.localidad.nombre
      })
      this.remito.fechaIngreso = this.formatDate(res.fechaIngreso)
      this.remito.fechaEntrega = this.remito.fechaEntrega ? this.formatDate(res.fechaEntrega) : ''
      this._selectFormatService.getVehiculosProveedor(this.remito.proveedor).subscribe((vehiculos) => {
        this.vehiculoOptions = vehiculos;
      });
      this._selectFormatService.getChoferesProveedor(this.remito.proveedor).subscribe((choferes) => {
        this.choferOptions = choferes;
      });
      this._selectFormatService.getRemitentesCliente(res.cliente).then((remitentes) => {
        this.remitenteOptions = remitentes;
      });
      this._selectFormatService.getTodosDestinatariosCliente(res.cliente).then((destinatarios) => {
        this.destinatarioOptions = destinatarios;
      });
      this.initialRemito = {...res}
      this._remitoService.getTarifarioClienteVigente(res.cliente).then(restar=>{
        this.tarifario = restar
        this.page.count = restar.length
        this.page.size = restar.length
      })
      this._remitoService.getTarifarioClienteCompleto(res.cliente).then(restar=>{
        this.tarifarioHistorial = restar
      })
    })
  }
  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  onSubmit(valid) {
    this.submitted = true;
    if (!valid) {
      return;
    }
    this.editar()
  }
  async editar() {
    this.loading = true;
    this._facturacionService.putRemito(this.idremito, { ...this.remito, fechaIngreso: this.remito.fechaIngreso + ' 03:00:00.000Z',  fechaEntrega: this.remito.fechaEntrega + ' 03:00:00.000Z' }, 'actualizar')
      .subscribe(
        data => {
          this.success = true;
          this.error = '';
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remito modificado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          if (this.success) {
            //Cerrar el modal
            this.editarRemitoEvent.emit(data)
            this.cerrarModalEvent.emit(data)
            
          }
        },
        error => {
          this.error = 'No fue posible editar remito';
          this.success = false;
          this.loading = false;
          this.submitted = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.error,
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }

          });
        }
      );
  }
  ConfirmTextOpen(valid) {
    if (!valid) {
      return;
    }
    let html = `
      <p>Se modificará el remito ${this.remito.nroRemito}</p>
      <p>¿Está seguro</p>
    `
    Swal.fire({
      title: 'Editar remito',
      //text: "Se modificará el remito",
      html,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Editar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        this.editar()
        if (this.success) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remito modificado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
        }
      }
    });
  }

  formatDate(fechaCompleta) {
    const fecha = new Date(fechaCompleta);
    return fecha.toISOString().split('T')[0];
  }
  onProveedorChange(proveedorId: any): void {
    this.remito.localidad = null
    this._selectFormatService.getVehiculosProveedor(proveedorId).subscribe((vehiculos) => {
      this.vehiculoOptions = vehiculos;
    });
    this._selectFormatService.getChoferesProveedor(proveedorId).subscribe((choferes) => {
      this.choferOptions = choferes;
    });
  }
  onClienteChange(clienteId: any): void {
    this.remito.remitente = null
    this._selectFormatService.getRemitentesCliente(clienteId).then((remitentes) => {
      this.remitenteOptions = remitentes;
    });
    this._selectFormatService.getTodosDestinatariosCliente(clienteId).then((destinatarios) => {
      this.destinatarioOptions = destinatarios;
    });
    this._remitoService.getTarifarioClienteVigente(clienteId).then(res=>{
      this.tarifario = res
      this.page.count = res.length
      this.page.size = res.length
    })
    this._remitoService.getTarifarioClienteCompleto(clienteId).then(res=>{
      this.tarifarioHistorial = res
    })
  }
  onDestinatarioChange(destinatarioId:string):void{
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
  }
  objectCompare(obj1: any, obj2: any): boolean {
    if(!obj1 || !obj2) return
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key) || !this.equalValues(obj1[key], obj2[key])) {
        return false;
      }
    }
  
    return true;
  }
  equalValues(val1: any, val2: any): boolean {
    if (typeof val1 === 'string' && typeof val2 === 'number') {
      return Number(val1) === val2;
    } else if (typeof val1 === 'number' && typeof val2 === 'string') {
      return val1 === Number(val2);
    } else {
      return val1 === val2;
    }
  }
  verTarifario(){
    this.openTarifario = true
    this.openTarifarioHistorial = false
  }
  verTarifarioHistorial(){
    this.openTarifario = false
    this.openTarifarioHistorial = true
  }
  cerrarTarifario(){
    this.openTarifario = false
  }
  cerrarTarifarioHistorial(){
    this.openTarifarioHistorial = false
  }
  

}
