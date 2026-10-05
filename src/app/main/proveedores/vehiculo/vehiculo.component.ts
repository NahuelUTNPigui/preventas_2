import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormUtils } from '../../common/classes/form-utils';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { FormGroup, AbstractControl, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { VehiculoService } from '../servicios/vehiculo.service';
import { ProveedorService } from '../servicios/proveedor.service';
@Component({
  selector: 'app-vehiculo',
  templateUrl: './vehiculo.component.html',
  styleUrls: ['./vehiculo.component.scss']
})
export class VehiculoComponent implements OnInit {

  // public
  public urlLastValue;
  public accion: string;
  public url = this.router.url;
  public sidebarToggleRef = false;

  public proveedorForm: FormGroup;
  public nombre = ""
  public proveedor = ""
  public observacion = ""
  public nombreProveedor = ""
  public guardado = false
  public nombreValido = false
  public proveedorValido = false
  public proveedores = []
  /**
   * Constructor
   *
   * @param {Router} router
   * @param {ProveedorService} _proveedorService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(
    private router: Router,
    private _vehiculoService: VehiculoService,
    private _proveedorService: ProveedorService,
    private _coreSidebarService: CoreSidebarService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.accion = this.url.split('/')[3]
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {

    this._vehiculoService.getAllProveedores().then(res => {
      this.proveedores = res
      if (this.urlLastValue != '0') {
        this._vehiculoService.getVehiculoID(this.urlLastValue).subscribe(res => {
          this.nombre = res.nombre
          this.observacion = res.observacion
          this.proveedor = res.proveedor
          this.nombreProveedor = res.expand.proveedor.nombre
        })
        this.nombreValido = true
        this.proveedorValido = true
      }
    })

  }
  validarVehiculo() {
    if (this.nombre) {
      this.nombreValido = true

    }
    else {
      this.nombreValido = false
      return false
    }
    if (this.proveedor) {
      this.proveedorValido = true
    }
    else {
      this.proveedorValido = false
      return false
    }
    return true
  }
  cambiarProveedor() {
    if (this.guardado) {
      if (this.proveedor) {
        this.nombreProveedor = this.proveedores.filter(p => p.id == this.proveedor)[0].nombre
        this.proveedorValido = true
      }
      else {
        this.proveedorValido = false
      }

    }
  }
  cambioNombreVehiculo() {
    if (this.guardado) {
      if (this.nombre) {
        this.nombreValido = true
      }
      else {
        this.nombreValido = false
      }
    }
  }
  modificarVehiculo() {
    this.guardado = true
    let valido = this.validarVehiculo()
    if (!valido) {
      return
    }
    this._vehiculoService.modificarVehiculo(this.nombre, this.proveedor, this.observacion, this.urlLastValue).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Vehiculo modificado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });

      this.router.navigate([`/proveedores/listavehiculos`]);
    })
  }
  agregarVehiculo() {
    this.guardado = true
    let valido = this.validarVehiculo()
    if (!valido) {
      return
    }
    this._vehiculoService.agregarVehiculo(this.nombre, this.proveedor, this.observacion).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Vehiculo creado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });

      this.router.navigate([`/proveedores/listavehiculos`]);
    })
  }

}
