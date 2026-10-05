import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreConfigService } from '@core/services/config.service';
import Swal from 'sweetalert2';
import { FormaPagoService } from '../forma-pago.service';

@Component({
  selector: 'app-forma-pago-list',
  templateUrl: './forma-pago-list.component.html',
  styleUrls: ['./forma-pago-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormaPagoListComponent implements OnInit, OnDestroy {
  // public
  public data: any;
  // public selectedOption = 10;
  public currentPage = 1;

  public ColumnMode = ColumnMode;

  public success = false;
  public loading = false;
  public error = '';

  public searchValue = '';

  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // private
  private tempData = [];
  private _unsubscribeAll: Subject<any>;
  public rows;
  public tempFilterData;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  currentUser: any;
  admin: boolean;
  /**
   * Constructor
   *add
   * @param {CoreConfigService} _coreConfigService
   * @param {CalendarService} _calendarService
   * @param {FormaPagoService} _formaPagoService
   */
  constructor(private _formaPagoService: FormaPagoService, private _coreConfigService: CoreConfigService,
    private _router: Router, private route: ActivatedRoute) {
    this._unsubscribeAll = new Subject();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    this.page.offset = 0;
    this.loadPage();
  }
  async eliminarRegistro(id) {
    this.loading = true;
    this._formaPagoService.deleteFormaPago(id)
      .subscribe(
        data => {
          this.success = true;
          this.error = '';
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Forma de pago eliminada exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });         
          this.loadPage() 
        },
        error => {
          this.error = error;
          this.success = false;
          this.loading = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "No fue posible eliminar la forma de pago",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });

        }
      );
  }
  ConfirmDeleteOpen(id) {
    Swal.fire({
      title: '¿Eliminar?',
      text: "Se eliminará la forma de pago",
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
        this.eliminarRegistro(id)
      }
    });
  }
  ngOnInit(): void {
    this.loadPage();
    const currentUserJSON = localStorage.getItem('currentUser');

    if (currentUserJSON) {
      this.currentUser = JSON.parse(currentUserJSON);
      this.admin = this.currentUser?.role && this.currentUser?.role === 'Admin'
    }
  }

  loadPage() {
    this._formaPagoService.getFormaPagos(this.page.size, this.page.offset + 1, this.searchValue )
      .subscribe((data: any) => {
        this.rows = data.items; 
        this.page.count = data.totalItems; 
      });
  }

  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
