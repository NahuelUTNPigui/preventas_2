import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { ClienteData } from '../../cliente/model/cliente-model';
import { RemitenteData } from '../model/remitente-model';
import { RemitenteService } from '../remitente.service';
import { SelectFormatService } from 'app/main/common';

@Component({
  selector: 'app-remitente-add',
  templateUrl: './remitente-add.component.html',
  styleUrls: ['./remitente-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemitenteAddComponent implements OnInit, OnDestroy {
  // public
  public sidebarToggleRef = false;
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';

  public remitente: RemitenteData;
  public errorMessage;
  public nombre: string;
  public cliente: string;
  public observacion: string = '';
  public clienteOptions: ClienteData[];

  // Private
  private _unsubscribeAll: Subject<any>;

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
    this._unsubscribeAll = new Subject();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  onSubmit(valid) {
    this.submitted = true;
    if (!valid) {
      return;
    }
    this.crearRemitente()
  }


  async crearRemitente() {
    this.loading = true;
    this._remitenteService.postRemitente(this.nombre, this.observacion)
      .subscribe(
        data => {
          this.success = true;
          this.error = '';

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remitente creado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          if (this.success) {
            this._router.navigate([`/remitentes`])}

        },
        error => {
          this.error = 'No fue posible crear el remitente';
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
    /*
    this._selectFormatService.getClientes().subscribe((response) => {
      this.clienteOptions = response;
    });
    */
  }
  ngOnDestroy(): void {
  }
}
