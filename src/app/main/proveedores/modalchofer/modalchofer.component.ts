import { Component, OnInit,Input } from '@angular/core';
import Swal from 'sweetalert2';
import { ChoferService } from '../servicios/chofer.service';
@Component({
  selector: 'app-modalchofer',
  templateUrl: './modalchofer.component.html',
  styleUrls: ['./modalchofer.component.scss']
})
export class ModalchoferComponent implements OnInit {

  @Input() proveedor = ""
  public nombre = ""
  public nombreValido = false
  public guardado = false
  constructor(
    private _choferService : ChoferService
  ) { }

  ngOnInit(): void {
  }
  validarChofer() {
    if (this.nombre) {
      this.nombreValido = true
    }
    else {
      return false
    }

    return true

  }
  cambioNombreChofer(event) {
    if (this.nombre) {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
    }
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
      this.nombre = ""
      this.guardado = false
    })
  }
}
