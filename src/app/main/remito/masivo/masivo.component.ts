import { Component, OnDestroy, OnInit, ViewEncapsulation,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SelectFormatService } from 'app/main/common';
import { ClienteData } from 'app/main/cruds/cliente/model/cliente-model';
import { RemitoService } from '../remito.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-masivo',
  templateUrl: './masivo.component.html',
  styleUrls: ['./masivo.component.scss'],
})
export class MasivoComponent implements OnInit, OnDestroy {
  // public
  public sidebarToggleRef = false;
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';
  //Datos

  maxDate: Date = new Date();
  public errorMessage;
  public clienteOptions: ClienteData[];
  public destinatarioOptions: any[]
  public remitenteOptions: any[]
  public listaRemitos:string[] = []
  public responsable: string;
  public formhab = false
  public subirForm=false
  
  public masivo ={
    cliente:null,
    fechaIngreso: ""
  }
  constructor(
    private _remitoService: RemitoService,
    private _router: Router,
    private _selectFormatService: SelectFormatService,
  ) { 
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'User') {
      this.responsable = currentUser.record.id;
    }
  }
  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  ngOnInit(): void {
    this._selectFormatService.getTodosClientes().then((response) => {
      this.clienteOptions = response;
    });
    this.masivo.fechaIngreso = new Date().toISOString().split("T")[0]

  }
  ngOnDestroy(): void {
  }
  habilitado(){
    
    if(this.masivo.fechaIngreso == null || this.masivo.cliente == null){
      
      return false
    }
    return true
  }
  onCambioFecha(){
    
    if(this.habilitado()){
      this.formhab=true
      this._selectFormatService.getRemitentesCliente(this.masivo.cliente).then((remitentes) => {
      
        this.remitenteOptions = remitentes;      
      });
      this._selectFormatService.getTodosDestinatariosCliente(this.masivo.cliente).then((destinatarios) => {
        
        this.destinatarioOptions = destinatarios;
      });
    }
    else{
      this.formhab=false
      this.destinatarioOptions = []
      this.remitenteOptions = []
    }
  }
  onClienteChange(e){
    

    if(this.habilitado()){
      this.formhab=true
      this._selectFormatService.getRemitentesCliente(this.masivo.cliente).then((remitentes) => {
      
        this.remitenteOptions = remitentes;      
      });
      this._selectFormatService.getTodosDestinatariosCliente(this.masivo.cliente).then((destinatarios) => {
        
        this.destinatarioOptions = destinatarios;
      });
    }
    else{
      this.formhab=false
      this.destinatarioOptions = []
      this.remitenteOptions = []
    }
  }
  showRemitosCargados(){
    let rs = ""
    if(this.listaRemitos.length == 0){
      return rs
    }
    for(let i = 0;i<this.listaRemitos.length;i++){
      rs += " "+this.listaRemitos[i]
      if(i != (this.listaRemitos.length-1)){
        rs += ","
      }
      
    }
    return rs
  }
  guardarRemito(remito){
    let data = {
      ...remito,
      fechaIngreso: this.masivo.fechaIngreso + ' 03:00:00.000Z', 
      responsable: this.responsable,
      cliente:this.masivo.cliente

    }
    this._remitoService.postRemito(data)
      .subscribe(
        data => {
          this.listaRemitos.push(data.nroRemito)
          this.success = true;
          this.error = '';

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remito creado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          
        },
        error => {
          this.error = 'No fue posible crear el remito';
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

}
