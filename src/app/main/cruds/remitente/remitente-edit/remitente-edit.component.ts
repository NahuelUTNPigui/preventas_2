import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { ClienteData } from '../../cliente/model/cliente-model';
import { RemitenteData } from '../model/remitente-model';
import { RemitenteService } from '../remitente.service';
import { SelectFormatService } from 'app/main/common';

@Component({
  selector: 'app-remitente-edit',
  templateUrl: './remitente-edit.component.html',
  styleUrls: ['./remitente-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemitenteEditComponent implements OnInit, OnDestroy {
  // public
  public breadcrumbLevels: any;
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';
  public errorMessage;

  public idRemitente: string;

  public remitente: RemitenteData;
  public nombre: string;
  public cliente: string;
  public observacion: string = '';
  public clienteOptions: ClienteData[];


  /**
   * Constructor
   *
   * @param {RemitenteService} _remitenteService
   * @param {SelectFormatService} _selectFormatService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(private _remitenteService: RemitenteService, 
    private _router: Router,
    private route: ActivatedRoute,
    private _selectFormatService: SelectFormatService,

    ) {
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  onSubmit(valid){
    this.submitted = true;
    if (!valid) {
      return;
    }
    this.editar()   
  }

  async editar() {
    this.loading = true;
    this._remitenteService.putRemitente(this.idRemitente, this.nombre, this.observacion)
      .subscribe(
        data => {
          this.success = true;
          this.error = '';         
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Remitente modificado exitosamente.',
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-outline-secondary'
              }
            });
            if(this.success){
              this._router.navigate([`/remitentes`])}          
        },
        error => {
          this.error = 'No fue posible editar remitente';
          this.success = false;
          this.loading = false;
          this.submitted = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.error,
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }

          });
        }
      );
  }

  ConfirmTextOpen(valid) {
    if (!valid) {
      return;
    }
    Swal.fire({
      title: '¿Editar?',
      text: "Se modificará el remitente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Editar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        this.editar()
        if (this.success) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remitente creado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.idRemitente = this.route.snapshot.paramMap.get('id');
    try {
      //const clientOptionsResponse = await this._selectFormatService.getClientes().toPromise();
      //this.clienteOptions = clientOptionsResponse;

      const remitenteResponse = await this._remitenteService.getRemitente(this.idRemitente).toPromise();
      this.nombre = remitenteResponse.nombre;
      //this.cliente = remitenteResponse.cliente;
      this.observacion = remitenteResponse.observacion;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  ngOnDestroy(): void {
  }
}
