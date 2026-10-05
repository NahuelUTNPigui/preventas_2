import { Component, OnInit,Input } from '@angular/core';
import { VehiculoService } from '../servicios/vehiculo.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-modalvehiculo',
  templateUrl: './modalvehiculo.component.html',
  styleUrls: ['./modalvehiculo.component.scss']
})
export class ModalvehiculoComponent implements OnInit {

  @Input() proveedor = ""
  public nombre = ""
  public observacion = ""
  public guardado = false
  public nombreValido = false
  constructor(private _vehiculoService:VehiculoService) { }

  ngOnInit(): void {
  }
  validarVehiculo() {
    if (this.nombre) {
      this.nombreValido = true
      return true
    }
    else {
      this.nombreValido = false
      return false
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
      this.nombre = ""
      this.observacion = ""
      this.guardado = false
    })
  }
  
}
