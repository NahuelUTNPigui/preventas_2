import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreConfigService } from '@core/services/config.service';
import Swal from 'sweetalert2';
import { RemitoService } from '../remito.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProveedorData } from 'app/main/proveedores/model/proveedor-model';
import { VehiculoData } from 'app/main/proveedores/model/vehiculo-model';
import { ChoferData } from 'app/main/proveedores/model/chofer-model';
import { SelectFormatService } from 'app/main/common';
import { RemitoData } from '../model/remito-model';
import { EstadoData } from 'app/main/cruds/estado/model/estado-model';
import flatpickr from 'flatpickr';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { RemitoStateService } from 'app/main/common/services/remito-state.service';

@Component({
  selector: 'app-remito-history',
  templateUrl: './remito-history.component.html',
  styleUrls: ['./remito-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemitoHistoryComponent implements OnInit, OnDestroy {
  // public
  public data: any;
  // public selectedOption = 10;
  public currentPage = 1;

  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;
  public chkBoxSelected = [];
  public exportCSVData;
  public contentHeader: object;
  public rows: any[];
  public selected = [];
  public basicSelectedOption: number = 10;
  public selectedStatus: string
  public selectedDates: string[] = ['', ''];
  public selectedRows = [];
  public minDate: Date = new Date();
  public remito: RemitoData = { fechaEntrega: '', proveedor: null, vehiculo: null, chofer: null, estado: null };
  public lastVersion: RemitoData
  public success = false;
  public loading = false;
  public error = '';
  public searchValue = '';

  public proveedorOptions: ProveedorData[] = []
  public vehiculoOptions: VehiculoData[] = []
  public choferOptions: ChoferData[] = []
  public estadoOptions: EstadoData[] = []

  public DateRangeOptions: FlatpickrOptions = {
    altInput: true,
    mode: 'range',
    altInputClass: 'form-control flat-picker flatpickr-input invoice-edit-input',
    enableTime: false,
    maxDate: "today",
    locale: 'es',
    altFormat: 'j/m/Y',
  }
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('fechaPicker') fechaPicker;
  @ViewChild('modalState') modalState: any;
  modalTitle: string = '';
  confirmFunction: Function | undefined;
  // private
  private _unsubscribeAll: Subject<any>;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  pendienteID: string;
  transitoID: string;
  submitted: boolean;
  idRemito: string;
  /**
   * Constructor
   *add
   * @param {CoreConfigService} _coreConfigService
   * @param {CalendarService} _calendarService
   * @param {RemitoService} _remitoService
   */
  constructor(private _remitoService: RemitoService, private _coreConfigService: CoreConfigService, private _remitoStateService: RemitoStateService,
    private _router: Router, private route: ActivatedRoute, private modalService: NgbModal, private _selectFormatService: SelectFormatService) {
    this._unsubscribeAll = new Subject();
    const self = this;
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
  formatDate(date: Date, final: boolean) {
    if (!date || isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = final ? String(date.getDate() + 1).padStart(2, '0') : String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  onChangeFecha() {
    const selectedDateStr = this.fechaPicker.flatpickr.selectedDates;
    if (selectedDateStr[0] && !selectedDateStr[1]) {
      this.selectedDates[0] = null
      this.loadPage();

      return
    }

    this.selectedDates[0] = selectedDateStr[0] ? this.formatDate(new Date(selectedDateStr[0]), false) + ' 03:00:00.000Z' : null
    this.selectedDates[1] = selectedDateStr[1] ? this.formatDate(new Date(selectedDateStr[1]), true) + ' 02:59:59.000Z' : null
    this.loadPage();
  }
  clearDates() {
    this.DateRangeOptions.defaultDate = null;
    this.fechaPicker.flatpickr.clear();
  }

  seleccionarRemito(remito: RemitoData): void {
    this._remitoStateService.seleccionarUltimoRemito(remito);
  }


  getRowClass(row: any): any {
    if (this.rows && this.rows.length > 0) {
      return { 'last-version': true }
    }
    return {};
  }

  async ngOnInit(): Promise<void> {
    this.idRemito = this.route.snapshot.paramMap.get('id');

    this._selectFormatService.getEstados().subscribe((response) => {
      this.estadoOptions = response;
    });
    this._remitoService.getHistorialRemito(this.idRemito, this.page.size, this.page.offset + 1, this.searchValue, this.selectedStatus, this.selectedDates[0], this.selectedDates[1])
      .subscribe((data: any) => {
        this.rows = data.items;
        this.lastVersion = data.items[0]
        this.exportCSVData = this.rows;
        this.page.count = data.totalItems;
      });
    flatpickr.localize(Spanish);
    this.loadPage();
  }

  capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async onRestore(versionRemito: any) {
    const idVersion = versionRemito.id
    delete versionRemito.created;
    delete versionRemito.updated;
    delete versionRemito.id;
    delete versionRemito.operacion;
    Swal.fire({
      title: '¿Restaurar?',
      text: 'Se restaurará la versión del remito seleccionada"',
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
        this.loading = true;
        this._remitoService.putRemito(versionRemito.remito, versionRemito, `restaurar ${idVersion}`)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Versión restaurada exitosamente.',
                customClass: {
                  confirmButton: 'btn btn-primary',
                  cancelButton: 'btn btn-outline-secondary'
                }
              });
              if (this.success) {
                this._router.navigate([`/remitos`])
              }
            },
            error => {
              this.error = error;
              this.success = false;
              this.loading = false;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "No fue posible restaurar versión",
                customClass: {
                  confirmButton: 'btn btn-primary',
                  cancelButton: 'btn btn-outline-secondary'
                }
              });

            }
          );
      }
    });
  }

  filterByStatus(estadoId: string) {
    this.loadPage()
  }
  loadPage() {
    this._remitoService.getHistorialRemito(this.idRemito, this.page.size, this.page.offset + 1, this.searchValue, this.selectedStatus, this.selectedDates[0], this.selectedDates[1])
      .subscribe((data: any) => {
        this.rows = data.items;
        this.exportCSVData = this.rows;
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
