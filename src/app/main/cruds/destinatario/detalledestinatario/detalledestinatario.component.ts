import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormUtils } from 'app/main/common';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { FormGroup, AbstractControl, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { DestinatarioService } from '../destinatario.service';
import { ProvinciaData } from 'app/main/localidades/model/provincia-model';
import { LocalidadData } from 'app/main/localidades/model/localidad-model';
import { SelectFormatService } from 'app/main/common';
@Component({
  selector: 'app-detalledestinatario',
  templateUrl: './detalledestinatario.component.html',
  styleUrls: ['./detalledestinatario.component.scss']
})
export class DetalledestinatarioComponent implements OnInit {
  // public
  public urlLastValue;
  public accion: string;
  public url = this.router.url;
  public sidebarToggleRef = false;

  public destinatario;
  public destinatarioForm: FormGroup;
  public nombre = ""
  public direccion = ""
  public horarios = ""
  public observacion = ""
  public provincia = ""
  public zona = ""
  public ubicacion = ""
  public importancia = 0
  public provincias = []
  public localidades = []
  public importancias: any[] = []
  public guardado = false
  public nombreValido = false
  public direccionValido = false
  public horarioValido = false
  public localidad = null
  public selectedProvincia = null
  public provinciaOptions: ProvinciaData[]
  public localidadOptions: LocalidadData[] = []
  public clientesNuevoDestinatario: any[] = []

  // private
  private _unsubscribeAll: Subject<any>
  /**
   * Constructor
   *
   * @param {Router} router
   * @param {DestinatarioService} _destinatarioService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(
    private router: Router,
    private _destinatarioService: DestinatarioService,
    private _coreSidebarService: CoreSidebarService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _selectFormatService: SelectFormatService,
  ) {
    this._unsubscribeAll = new Subject();
    this.accion = this.url.split('/')[3]
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }
  onProvinciaChange(provinciaId: any): void {
    this.localidad = null
    this._selectFormatService.getTodasLocalidadesProvincia(provinciaId).then((localidades) => {
      this.localidadOptions = localidades;
    });
  }
  async ngOnInit(): Promise<void> {
    this.importancias = this._destinatarioService.importanciaDestinatario()
    this._selectFormatService.getProvincias().subscribe((response) => {
      this.provinciaOptions = response;
    });
    if (this.urlLastValue != '0') {
      this._destinatarioService.getDestinatarioID(this.urlLastValue).subscribe(async res => {
        this.nombre = res.nombre
        this.observacion = res.observacion
        this.horarios = res.horarios
        this.importancia = res.importancia
        this.direccion = res.direccion
        this.selectedProvincia = res.expand.localidad.provincia;
        this.localidad = res.expand.localidad.id

        this.zona = res.zona
        this.ubicacion = res.ubicacion
        const localidadesResponse = await this._selectFormatService.getTodasLocalidadesProvincia(res.expand.localidad.provincia);
        this.localidadOptions = localidadesResponse;
      })
      this.nombreValido = true
      this.direccionValido = true
      this.horarioValido = true

    }


  }
  cambioNombreDestinatario() {
    if (this.nombre != "") {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
    }
  }
  cambioDireccionDestinatario() {
    if (this.direccion != "") {
      this.direccionValido = true
    }
    else {
      this.direccionValido = false
    }
  }
  cambioHorariosDestinatario() {
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
  guardar() {
    this.guardado = true;
    let valid = this.validarDestinatario()
    if (!valid) {
      return;
    }
    if (this.accion === 'add')
      this.agregarDestinatario()
    else
      this.modificarDestinatario()
  }
  onSubmit(valid) {
    this.guardado = true;

    if (!valid) {
      return;
    }
    if (this.accion === 'add')
      this.agregarDestinatario()
    else
      this.modificarDestinatario()
  }
  modificarDestinatario() {
    this._destinatarioService.modDestinatario(this.nombre, this.observacion, this.horarios, this.direccion, this.urlLastValue, this.localidad, this.zona, this.ubicacion, this.importancia).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Destinatario modificado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }

      });

      this.router.navigate([`/destinatarios/listadestinatarios`]);
    },
      error => {
        this.guardado = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible modificar el destinatario',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
      }
    );
  }
  agregarDestinatario() {
    this._destinatarioService.addDestinatario(this.nombre, this.observacion, this.horarios, this.direccion, this.localidad, this.zona, this.ubicacion, this.importancia).subscribe(resdes => {
      if (this.clientesNuevoDestinatario.length > 0) {
        let clientesid = this.clientesNuevoDestinatario.map(c => c.id)
        this._destinatarioService.ponerClientesNuevoDest(clientesid, resdes.id).then(res => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Destinatario creado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          
          this.router.navigate([`/destinatarios/listadestinatarios`]);
        })
      }
      else {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Destinatario creado exitosamente.',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
        this.router.navigate([`/destinatarios/listadestinatarios`]);
      }

    },
      error => {
        this.guardado = false;
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
  cambiarProvincia() {

  }
  cambiarLocalidad() {

  }
  agregarClientes(clientes) {
    this.clientesNuevoDestinatario = clientes.map(c => ({ ...c }))

  }


}

