import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormGroup} from '@angular/forms';
import { SelectFormatService } from 'app/main/common';
import { TarifarioService } from '../tarifario.service';
@Component({
  selector: 'app-detalletarproveedor',
  templateUrl: './detalletarproveedor.component.html',
  styleUrls: ['./detalletarproveedor.component.scss']
})
export class DetalletarproveedorComponent implements OnInit {
 // public
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
  public proveedores = []
  public unidades = []


  public precio = 0;
  public fechadesde="";
  public fechahasta="";
  public descripcion = "";
  public proveedor="";
  public unidad = "";
  public programado = false

  public guardado = false
  public preciovalido = true
  public fechadesdevalido = false
  public fechahastavalido = false
  public proveedorvalido = false
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
    this._selectService.getTodasUnidades().subscribe(res=>this.unidades = res.items)
    this._selectService.getTodosProveedores().then(res=>this.proveedores=res)
    if(this.urlLastValue != '0'){
      this._tarifarioService.getTarifarioProveedor(this.urlLastValue).subscribe(res=>{
        let fechadesde = new Date(res.fechadesde)
        let fechahasta = new Date(res.fechahasta)
        this.precio = res.precio
        this.descripcion = res.descripcion
        this.fechadesde = fechadesde.toISOString().split('T')[0]
        this.fechahasta = fechahasta.toISOString().split('T')[0]
        this.proveedor = res.proveedor
        this.unidad = res.unidad
        this.programado = res.programado
      })
    }
  }
  guardar(){
    this.guardado = true
    let valid = this.validarTarifaProveedor()
    if(!valid){
      return
    }
    if (this.accion === 'add')
      this.crearTarifaProveedor();
    else
      this.modificarTarifaProveedor()
  }
  validarTarifaProveedor(){
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

    if(this.proveedor !=""){
      this.proveedorvalido = true
    }
    else{
      this.proveedorvalido = true
    }

    if(this.unidad !=""){
      this.unidadvalida = true
    }
    else{
      this.unidadvalida = false
    }
    if(this.unidadvalida && this.proveedorvalido && this.fechadesdevalido && this.fechahastavalido){
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
  onSubmit(valid){
    this.submitted=true
    if(!valid){
      return;
    }
    this.crearTarifaProveedor();
  }
  crearTarifaProveedor(){
    this._tarifarioService.addTarifarioProveedor(this.precio,this.descripcion,this.proveedor,this.unidad,this.fechadesde,this.fechahasta).subscribe(res=>{
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Tarifario de Proveedor creado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.router.navigate([`/tarifario/proveedores`]);
    })
  }
  modificarTarifaProveedor(){
    this._tarifarioService.modTarifarioProveedor(this.urlLastValue,this.precio,this.descripcion,this.proveedor,this.unidad,this.fechadesde,this.fechahasta).subscribe(res=>{
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Tarifario de proveedor modificado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }

      });

      this.router.navigate([`/tarifario/proveedores`]);
    })
  }
  esProgramado(){
    return this.programado?"Sí":"No"
  }

}
