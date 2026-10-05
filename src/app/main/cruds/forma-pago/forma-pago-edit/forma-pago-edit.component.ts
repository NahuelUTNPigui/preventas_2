import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { FormaPagoData } from '../model/forma-pago-model';
import { FormaPagoService } from '../forma-pago.service';

@Component({
  selector: 'app-forma-pago-edit',
  templateUrl: './forma-pago-edit.component.html',
  styleUrls: ['./forma-pago-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormaPagoEditComponent implements OnInit, OnDestroy {
  // public
  public breadcrumbLevels: any;
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';
  public errorMessage;

  public idFormaPago: string;

  public formaPago: FormaPagoData;
  public nombre;
  public descripcion;

  /**
   * Constructor
   *
   * @param {FormaPagoService} _formaPagoService
   * @param {SelectFormatService} _selectFormatService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(private _formaPagoService: FormaPagoService, 
    private _router: Router,
    private route: ActivatedRoute
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
    this._formaPagoService.putFormaPago(this.idFormaPago, this.nombre, this.descripcion)
      .subscribe(
        data => {
          this.success = true;
          this.error = '';         
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Forma de pago modificada exitosamente.',
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-outline-secondary'
              }
            });
            if(this.success){
              this._router.navigate([`/formas-de-pago`])}          
        },
        error => {
          this.error = 'No fue posible editar forma de pago';
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
      text: "Se modificará la forma de pago",
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
            text: 'Forma de pago creada exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.idFormaPago = this.route.snapshot.paramMap.get('id')
    this._formaPagoService.getFormaPago(this.idFormaPago).subscribe(response => {
      this.nombre = response.nombre;
      this.descripcion = response.descripcion;
    });
  }

  ngOnDestroy(): void {
  }
}
