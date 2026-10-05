import { Component, OnInit,Input,ViewChild } from '@angular/core';
import { ClienteService } from '../cliente.service';
import { RemitenteService } from '../../remitente/remitente.service';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-modalremitente',
  templateUrl: './modalremitente.component.html',
  styleUrls: ['./modalremitente.component.scss']
})
export class ModalremitenteComponent implements OnInit {

  @Input() cliente = ""
  public nombre = ""
  public observacion =""
  public nombreValido = false
  public guardado = false
  constructor(private _remitenteService:RemitenteService,private _clienteService:ClienteService) { }

  ngOnInit(): void {
  }
  validarRemitente() {
    if (this.nombre) {
      this.nombreValido = true
    }
    else {
      return false
    }

    return true

  }
  cambioNombreRemitente() {
    if (this.nombre) {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
    }
  }
  agregarRemitente() {
    this.guardado = true
    let valido = this.validarRemitente()
    if (!valido) {
      return
    }
    // Agregar la relacion
    this._clienteService.addRemitente(this.nombre, this.observacion,this.cliente).then(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Remitente creado exitosamente.',
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
