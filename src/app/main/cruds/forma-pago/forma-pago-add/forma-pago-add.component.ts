import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import Swal from 'sweetalert2';

import { FormaPagoData } from '../model/forma-pago-model';
import { FormaPagoService } from '../forma-pago.service';

@Component({
  selector: 'app-forma-pago-add',
  templateUrl: './forma-pago-add.component.html',
  styleUrls: ['./forma-pago-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormaPagoAddComponent implements OnInit, OnDestroy {
  // public
  public sidebarToggleRef = false;
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';

  public formaPago: FormaPagoData;
  public errorMessage;
  public nombre;
  public descripcion;


  // Private
  private _unsubscribeAll: Subject<any>;

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
    this._unsubscribeAll = new Subject();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  onSubmit(valid) {
    this.submitted = true;
    if (!valid) {
      return;
    }
    this.crearFormaPago()
  }


  async crearFormaPago() {
    this.loading = true;
    this._formaPagoService.postFormaPago(this.nombre, this.descripcion)
      .subscribe(
        data => {
          this.success = true;
          this.error = '';

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Forma de pago creada exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          if (this.success) {
            this._router.navigate([`/formas-de-pago`])}

        },
        error => {
          this.error = 'No fue posible crear forma de pago';
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
  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }
}
