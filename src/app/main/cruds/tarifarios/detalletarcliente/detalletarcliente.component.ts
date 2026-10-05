import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { FormGroup, AbstractControl, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { SelectFormatService } from 'app/main/common';
import { TarifarioService } from '../tarifario.service';
@Component({
  selector: 'app-detalletarcliente',
  templateUrl: './detalletarcliente.component.html',
  styleUrls: ['./detalletarcliente.component.scss']
})
export class DetalletarclienteComponent implements OnInit {

  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';
  public urlLastValue;
  public accion: string;
  public url = this.router.url;
  public sidebarToggleRef = false;

  public tarifario;
  public tarifarioForm:FormGroup;
  public clientes = []
  public unidades = []


  public precio = 0;
  public fechadesde="";
  public fechahasta="";
  public descripcion = "";
  public cliente="";
  public unidad = "";
  public programado = false;

  public guardado = false
  public preciovalido = true
  public fechadesdevalido = false
  public fechahastavalido = false
  public clientevalido = false
  public unidadvalida = false



  constructor(
    private router: Router,
    private _selectService:SelectFormatService,
    private _tarifarioService:TarifarioService
  ) {
    this.accion = this.url.split('/')[3]
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    
    //this.unidades = this.fakeunidades
    this._selectService.getTodosClientes().then(res=>this.clientes=res)
    this._selectService.getTodasUnidades().subscribe(res=>this.unidades = res.items)
    if(this.urlLastValue != '0'){
      this._tarifarioService.getTarifarioCliente(this.urlLastValue).subscribe(res=>{
        let fechadesde = new Date(res.fechadesde)
        let fechahasta = new Date(res.fechahasta)
        this.precio = res.precio
        this.descripcion = res.descripcion
        this.fechadesde = fechadesde.toISOString().split('T')[0]
        this.fechahasta = fechahasta.toISOString().split('T')[0]
        this.cliente = res.cliente
        this.unidad = res.unidad
        this.programado = res.programado
      })
    }
  }
  guardar(){
    this.guardado = true
    let valid = this.validarTarifaCliente()
    if(!valid){
      return
    }
    if (this.accion === 'add')
      this.crearTarifaCliente();
    else
      this.modificarTarifaCliente()
  }
  onSubmit(valid){
    this.submitted=true
    if(!valid){
      return;
    }
    if (this.accion === 'add')
      this.crearTarifaCliente();
    else
      this.modificarTarifaCliente()

  }
  validarTarifaCliente(){
    if(this.fechadesde !=""){
      this.fechadesdevalido = true
    }
    else{
      this.fechadesdevalido = false
      
    }
    if(this.fechahasta !=""){
      this.fechahastavalido = true
    }
    else{
      this.fechahastavalido = false
    }

    if(this.cliente !=""){
      this.clientevalido = true
    }
    else{
      this.clientevalido = true
    }

    if(this.unidad !=""){
      this.unidadvalida = true
    }
    else{
      this.unidadvalida = false
    }
    if(this.unidadvalida && this.clientevalido && this.fechadesdevalido && this.fechahastavalido){
      return true
    }
    else{
      return false
    }
  }
  cambioFechaDesde(){
    if(this.fechadesde !=""){
      this.fechadesdevalido = true
    }
    else{
      this.fechadesdevalido = false
      
    }
  }
  cambioFechaHasta(){
    if(this.fechahasta !=""){
      this.fechahastavalido = true
    }
    else{
      this.fechahastavalido = false
    }
  }
  
  crearTarifaCliente(){
    this._tarifarioService.addTarifarioCliente(this.precio,this.descripcion,this.cliente,this.unidad,this.fechadesde,this.fechahasta).subscribe(res=>{
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Tarifario Cliente creado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.router.navigate([`/tarifario/clientes`]);
    })
  }
  modificarTarifaCliente(){
    this._tarifarioService.modTarifarioCliente(this.urlLastValue,this.precio,this.descripcion,this.cliente,this.unidad,this.fechadesde,this.fechahasta).subscribe(res=>{
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Tarifario de cliente modificado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }

      });

      this.router.navigate([`/tarifario/clientes`]);
    })
  }
  esProgramado(){
    return this.programado?"Sí":"No"
  }


}
