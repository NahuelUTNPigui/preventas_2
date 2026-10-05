import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormUtils } from '../../common/classes/form-utils';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { FormGroup, AbstractControl, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { ProveedorService } from '../servicios/proveedor.service';
import {ChoferService} from '../servicios/chofer.service'
import {VehiculoService} from '../servicios/vehiculo.service'
@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.scss']
})
export class ProveedorComponent implements OnInit {
  // public
  public urlLastValue;
  public accion: string;
  public url = this.router.url;
  public sidebarToggleRef = false;

  public proveedor;
  public proveedorForm: FormGroup;
  public nombre = ""
  public cuit = ""
  public razonSocial = ""
  public observacion = ""
  public guardado = false
  public nombreValido = false
  public responsable = false
  public choferes = []
  public vehiculos = []
  public cuitPattern = /^\d{11}$/;

  // private
  private _unsubscribeAll: Subject<any>

  /**
   * Constructor
   *
   * @param {Router} router
   * @param {ProveedorService} _proveedorService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(
    private router: Router,
    public modalService:NgbModal,
    private _proveedorService: ProveedorService,
    private _choferService:ChoferService,
    private _vehiculoService:VehiculoService,
    private _coreSidebarService: CoreSidebarService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this._unsubscribeAll = new Subject();
    this.accion = this.url.split('/')[3]
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    if (this.urlLastValue != '0') {
      this._proveedorService.getProveedorID(this.urlLastValue).subscribe(res => {
        this.nombre = res.nombre
        this.observacion = res.observacion
        this.cuit = res.cuit
        this.razonSocial = res.razonSocial
        this.responsable = res.responsable
      })
      this.nombreValido = true
      this._proveedorService.getAllChoferesProveedor(this.urlLastValue).then(res => {
        this.choferes = res
      })
      this._proveedorService.getAllVehiculosProveedor(this.urlLastValue).then(res => {
        this.vehiculos = res
      })
    }
  }
  cambioNombreProveedor() {
    if (this.nombre != "") {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
    }
  }
  validarProveedor() {
    if (this.nombre != "") {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
      return false
    }
    return true
  }

  onSubmit(valid) {
    this.guardado = true;
    if (!valid) {
      return;
    }
    if (this.accion === 'add')
      this.agregarProveedor()
    else
      this.modificarProveedor()
  }
  modificarProveedor() {
    this._proveedorService.modificarProveedor(this.nombre, this.cuit, this.razonSocial, this.observacion, this.urlLastValue,this.responsable).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Proveedor modificado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }

      });

      this.router.navigate([`/proveedores/listaproveedores`]);
    },
      error => {
        this.guardado = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible modificar el proveedor',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
      }
    );
  }
  agregarProveedor() {
    this._proveedorService.agregarProveedor(this.nombre, this.cuit, this.razonSocial, this.observacion,this.responsable).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Proveedor creado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });

      this.router.navigate([`/proveedores/listaproveedores`]);
    },
      error => {
        this.guardado = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible crear el proveedor',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
      }
    )
  };
  ConfirmDeleteVehiculo(idVehiculo){
    let veh = this.vehiculos.filter(v=>v.id==idVehiculo)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará el vehículo ${veh.nombre}` ,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        this.eliminarVehiculo(idVehiculo)
      }
    });
  }
  ConfirmDeleteChofer(idChofer){
    let chof = this.choferes.filter(c=>c.id==idChofer)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará el Chofer ${chof.nombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        this.eliminarChofer(idChofer)
      }
    });
  }
  eliminarVehiculo(idVehiculo){
    this._vehiculoService.eliminarVehiculo(idVehiculo)
    .subscribe(
      data => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Vehículo eliminado exitosamente.',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
        this._proveedorService.getAllVehiculosProveedor(this.urlLastValue).then(res => {
          this.vehiculos = res
        })
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: "No fue posible eliminar el vehículo seleccionado",
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }

        });

      }
    );
  }
  eliminarChofer(idChofer){
    this._choferService.eliminarChofer(idChofer)
    .subscribe(
      data => {

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Chofer eliminado exitosamente.',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });         
        this._proveedorService.getAllChoferesProveedor(this.urlLastValue).then(res => {
          this.choferes = res
        })
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: "No fue posible eliminar el chofer seleccionado",
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }

        });
      }
    );
  }
  //Modal
  open(content) {
    this.modalService.open(content)
  }
  cerrarModalChofer(modal){
    modal.close('Cerrar modal')
    this._proveedorService.getAllChoferesProveedor(this.urlLastValue).then(res => {
      this.choferes = res
    })
  }
  cerrarModalVehiculo(modal){
    modal.close('Cerrar modal')
    this._proveedorService.getAllVehiculosProveedor(this.urlLastValue).then(res => {
      this.vehiculos = res
    })
    
  }
}
