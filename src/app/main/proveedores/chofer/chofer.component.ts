import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormUtils } from '../../common/classes/form-utils';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { FormGroup, AbstractControl, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { VehiculoService } from '../servicios/vehiculo.service';
import { ChoferService } from '../servicios/chofer.service';
@Component({
  selector: 'app-chofer',
  templateUrl: './chofer.component.html',
  styleUrls: ['./chofer.component.scss']
})
export class ChoferComponent implements OnInit {

  // public
  public urlLastValue;
  public accion: string;
  public url = this.router.url;
  public sidebarToggleRef = false;

  public nombre = ""
  public proveedor = ""
  public nombreProveedor = ""
  public guardado = false
  public nombreValido = false
  public proveedorValido = false
  public proveedores = []

  constructor(
    private router: Router,
    private _vehiculoService: VehiculoService,
    private _choferService: ChoferService,
    private _coreSidebarService: CoreSidebarService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.accion = this.url.split('/')[3]
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    this._choferService.getAllProveedores().then(res => {
      this.proveedores = res
      if (this.urlLastValue != '0') {
        this._choferService.getChoferID(this.urlLastValue).subscribe(res => {
          this.nombre = res.nombre
          this.proveedor = res.proveedor
          this.nombreProveedor = res.expand.proveedor.nombre
        })
        this.proveedorValido = true
        this.nombreValido = true
      }
    })
  }
  cambiarProveedor() {
    if (this.proveedor) {
      this.proveedorValido = true
      this.nombreProveedor = this.proveedores.filter(p => p.id == this.proveedor)[0].nombre
    }
    else {
      this.proveedorValido = false
    }


  }
  cambioNombreChofer(event) {
    if (this.nombre) {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
    }
  }
  validarChofer() {
    if (this.nombre) {
      this.nombreValido = true
    }
    else {
      return false
    }
    if (this.proveedor) {
      this.proveedorValido = true

    }
    else {
      return false
    }
    return true

  }
  modificarChofer() {
    this.guardado = true
    let valido = this.validarChofer()
    if (!valido) {
      return
    }
    this._choferService.modificarChofer(this.nombre, this.proveedor, this.urlLastValue).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Chofer modificado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });

      this.router.navigate([`/proveedores/listachoferes`]);
    })
  }
  agregarChofer() {
    this.guardado = true
    let valido = this.validarChofer()
    if (!valido) {
      return
    }

    this._choferService.agregarChofer(this.nombre, this.proveedor).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Chofer creado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });

      this.router.navigate([`/proveedores/listachoferes`]);
    })
  }


}
