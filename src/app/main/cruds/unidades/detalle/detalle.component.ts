import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { FormGroup, AbstractControl, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { UnidadesService } from '../unidades.service';
@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {
  // public
  public urlLastValue;
  public accion: string;
  public url = this.router.url;
  public sidebarToggleRef = false;

  public nombre = ""
  public descripcion = ""
  public nombrevalido = false
  public guardado = false


  constructor(
    private router: Router,
    private _unidadService:UnidadesService
  ) {
    this.accion = this.url.split('/')[2]
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
   }

  ngOnInit(): void {
    if(this.urlLastValue != "0"){
      this._unidadService.getUnidad(this.urlLastValue).subscribe(res=>{
        this.nombre = res.nombre
        this.descripcion = res.descripcion
        this.nombrevalido = true
      })
    }
  }
  cambioNombre() {
    if (this.nombre != "") {
      this.nombrevalido = true
    }
    else {
      this.nombrevalido = false
    }
  }
  validarUnidad() {
    if (this.nombre != "") {
      this.nombrevalido = true
      return true
    }
    else {
      return false
    }
  }
  onSubmit(valid) {
    this.guardado = true;
    let valido = this.validarUnidad()
    if(!valido){
      return
    }
    if (this.accion === 'add')
      this.agregarUnidad()
    else
      this.modificarUnidad()
  }
  agregarUnidad(){
    this._unidadService.addUnidad(this.nombre,this.descripcion).subscribe(res=>{
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Unidad creada exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });

      this.router.navigate([`/unidades/lista`]);
    })
  }
  modificarUnidad(){
    this._unidadService.modUnidad(this.urlLastValue,this.nombre,this.descripcion).subscribe(res=>{
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Unidad modificada exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });

      this.router.navigate([`/unidades/lista`]);
    })
  }

}
