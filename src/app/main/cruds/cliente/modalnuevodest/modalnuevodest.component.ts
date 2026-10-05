import { Component, OnInit,Input } from '@angular/core';
import Swal from 'sweetalert2';
import { FormGroup, AbstractControl, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { ProvinciaData } from 'app/main/localidades/model/provincia-model';
import { LocalidadData } from 'app/main/localidades/model/localidad-model';
import { SelectFormatService } from 'app/main/common';
import { ClienteService } from '../cliente.service';
@Component({
  selector: 'app-modalnuevodest',
  templateUrl: './modalnuevodest.component.html',
  styleUrls: ['./modalnuevodest.component.scss']
})
export class ModalnuevodestComponent implements OnInit {

  @Input() cliente=""
  public nombre = ""
  public localidad = ""
  public direccion = ""
  public horarios = ""
  public observacion = ""
  public zona = ""
  public selectedProvincia = null
  public provinciaOptions: ProvinciaData[]
  public localidadOptions: LocalidadData[] = []
  public guardado = false
  public nombreValido = false
  public direccionValido = false
  public horarioValido = false
  public provincias = []
  public localidades = []
  constructor(
    private _clienteService : ClienteService,
    private _selectFormatService: SelectFormatService,
  ) { }
  onProvinciaChange(provinciaId: any): void {
    this.localidad = null
    this._selectFormatService.getLocalidadesProvincia(provinciaId).subscribe((localidades) => {
      this.localidadOptions = localidades;
    });
  }
  ngOnInit(): void {
    this._selectFormatService.getProvincias().subscribe((response) => {
      this.provinciaOptions = response;
    });
  }
  cambioNombreDestinatario() {
    if (this.nombre != "") {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
    }
  }
  cambioDireccionDestinatario(){
    if (this.direccion != "") {
      this.direccionValido = true
    }
    else {
      this.direccionValido = false
    }
  }
  cambioHorariosDestinatario(){
    if (this.horarios != "") {
      this.horarioValido = true
    }
    else {
      this.horarioValido = false
    }
  }
  validarDestinatario() {
    if (this.nombre != "") {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
      return false
    }
    
    if (this.direccion != "") {
      this.direccionValido = true
    }
    else {
      this.direccionValido = false
      return false
    }
    if (this.horarios != "") {
      this.horarioValido = true
    }
    else {
      this.horarioValido = false
      return false
    }
    return true
  }
  onSubmit(valid) {
    this.guardado = true;
    
    if (!valid) {
      return;
    }
    this.agregarDestinatario()

  }
  agregarDestinatario() {
    
    this._clienteService.addDestinatario(this.nombre, this.localidad, this.direccion, this.horarios, this.observacion,this.cliente,this.zona).then(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Destinatario creado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.nombre = ""
      this.localidad = ""
      this.direccion = ""
      this.horarios = ""
      this.observacion = ""
      this.selectedProvincia = ""
      this.zona = ""
      this.localidadOptions = []
    },
      error => {
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible crear el destinatario',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
      }
    )
  };

}
