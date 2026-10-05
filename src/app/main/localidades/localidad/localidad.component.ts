import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { FormGroup, AbstractControl, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { LocalidadService } from '../localidad.service';

@Component({
  selector: 'app-localidad',
  templateUrl: './localidad.component.html',
  styleUrls: ['./localidad.component.scss']
})
export class LocalidadComponent implements OnInit {
  // public
  public urlLastValue;
  public accion: string;
  public url = this.router.url;
  public sidebarToggleRef = false;

  public localidad;
  public localidadForm: FormGroup;
  public provincias = []
  public nombre = ""
  public provincia = ""
  public nombreProvincia = ""
  public guardado = false
  public nombreValido = false
  public provinciaValida = false
  // private
  private _unsubscribeAll: Subject<any>

  /**
   * Constructor
   *
   * @param {Router} router
   * @param {LocalidadService} _localidadService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(
    private router: Router,
    private _localidadService: LocalidadService,
    private _coreSidebarService: CoreSidebarService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this._unsubscribeAll = new Subject();
    this.accion = this.url.split('/')[3]
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }


  ngOnInit(): void {
    this._localidadService.getProvinciasPaginacion(50,1,"").subscribe(res=>{
      this.provincias = res.items.sort((a,b)=>a.nombre.toLocaleLowerCase()<b.nombre.toLocaleLowerCase()?-1:1)
    })
    if(this.urlLastValue != '0'){
      this._localidadService.getLocalidadID(this.urlLastValue).subscribe(res=>{
        this.nombre = res.nombre
        this.nombreProvincia = res.expand.provincia.nombre
        this.provincia = res.provincia
      })
      this.nombreValido = true
    }
  }

  cambioNombreLocalidad() {
    if (this.nombre != "") {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
    }
  }
  cambiarProvincia(){
    if (this.provincia != "") {
      this.provinciaValida = true
      this.nombreProvincia = this.provincias.filter(p => p.id == this.provincia)[0].nombre
    }
    else {
      this.provinciaValida = false
    }

  }
  validarLocalidad() {
    if (this.nombre != "") {

      this.nombreValido = true

    }
    else {
      return false
    }
    if (this.provincia != "") {
      this.provinciaValida = true

    }
    else {
      return false
    }
    return true

  }
  
  onSubmit(valid) {
    this.guardado = true;
    let valido = this.validarLocalidad()
    if(!valido){
      return
    }
    if (this.accion === 'add')
      this.agregarLocalidad()
    else
      this.modificarLocalidad()
  }
  /*
  guardarLocalidad(){
    this.guardado = true
    let valid = this.validarLocalidad()
    if(!valid){
      return
    }
    else{
      if (this.accion === 'add')
      this.agregarLocalidad()
    else
      this.modificarLocalidad()
    }
  }
  */
  modificarLocalidad() {
    this._localidadService.modLocalidad(this.nombre,this.provincia, this.urlLastValue).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Localidad modificada exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }

      });

      this.router.navigate([`/localidades/listalocalidades`]);
    });
  }
  agregarLocalidad() {
    this._localidadService.addLocalidad(this.nombre,this.provincia).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Localidad creada exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });

      this.router.navigate([`/localidades/listalocalidades`]);
    })
  };
}
