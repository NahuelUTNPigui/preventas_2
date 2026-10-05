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

import * as XLSX from 'xlsx';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-remito-list',
  templateUrl: './remito-list.component.html',
  styleUrls: ['./remito-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemitoListComponent implements OnInit, OnDestroy {

  //ver 2 partes y editar tarifario
  public secondPart = false


  // public
  public data: any;
  // public selectedOption = 10;
  public currentPage = 1;

  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;
  public chkBoxSelected = [];
  public exportCSVData;
  public contentHeader: object;
  public rows: any;
  public totalHR = 0;
  public totalKilos = 0;
  public totalHRLista = 0;
  public stotalHRLista = "";
  public totalKilosLista = 0;
  public stotalKilosLista = "";
  public selected = [];
  public basicSelectedOption: number = 10;
  public selectedStatus: string
  public selectedDates: string[] = ['', ''];
  public fechaEntrega = ''
  public selectedRows = [];
  public minDate: Date = new Date();

  public selectedRemitos = []
  public estadoElegido = ""

  public novedad: string;
  public observacion: string;
  public deliveryConformado: boolean = false
  public proveedorID = ''
  //Hoja de ruta
  public primeravuelta = true
  public codigo = ''
  public remito: RemitoData = { fechaEntrega: '', proveedor: null, vehiculo: null, chofer: null, estado: null };
  public fecharara = false
  //Agregar a hoja de ruta
  public idremito = ""
  public remitodatahr = { fechaEntrega: '', proveedor: null, vehiculo: null, chofer: null, estado: null };
  public remitospenhr = { nro: "", cliente: "", destinatario: "", localidad: "", fechaIngreso: "", kilos: 0, bultos: 0 }


  public facturarOriginal = true
  public reubicadoOriginal = false
  public remitoDuplicar = null

  public success = false;
  public loading = false;

  public error = '';
  public searchValue = '';
  public etiqueta = ""

  public proveedorOptions: ProveedorData[] = []
  public vehiculoOptions: VehiculoData[] = []
  public choferOptions: ChoferData[] = []
  public estadoOptions: EstadoData[] = []
  public estadoMultipleOptions: EstadoData[] = []

  public filtrosOptions: any[] = [
    { id: "", nombre: "Ninguna", },
    { id: "destinatario", nombre: "Destinatario" },
    { id: "localidad", nombre: "Localidad" },
    { id: "nro", nombre: "Numero remito" },
    { id: "cliente", nombre: "Cliente" },
    { id: "proveedor", nombre: "Provedor" },
    { id: "zona", nombre: "Zona" },
    { id: "hr", nombre: "Hoja de ruta" }
  ]
  public valores = {
    destinatario: "",
    localidad: "",
    nro: "",
    cliente: "",
    remitente: "",
    proveedor: "",
    zona: "",
    hojaruta: ""
  }
  public selectedOption = ""

  public tarifario = []
  public proveedorTarifario = ''
  public verTarifarioProveedor = false
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
  //Triggers
  private searchTrigger$ = new Subject<any>();
  private destroy$ = new Subject<any>();
  // private

  private _unsubscribeAll: Subject<any>;
  private maxchars = 80
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };

  pagetar = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  }
  pendienteID: string;
  transitoID: string;
  entregadoID: string;
  submitted: boolean;
  exportData: any;
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
  }


  filterUpdateKeyUp(event){
    this.searchTrigger$.next()
    //this.filterUpdate(event)
  }
  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    this.totalHRLista = 0
    this.totalKilosLista = 0
    this.page.offset = 0;
    this.loadPage();
  }
  formatPeso(value) {
    return value.toLocaleString('es-ar', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    });
  }
  formatKilo(value) {
    return new Intl.NumberFormat("es-ar", {
      style: "decimal",
      maximumFractionDigits: 0, minimumFractionDigits: 0
    }).format(value);
  }
  formatDate(date: Date, final: boolean) {
    if (!date || isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = final ? String(date.getDate() + 1).padStart(2, '0') : String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  formatDateExcel(fechaString: string, final: boolean) {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const dia = fecha.getUTCDate();
    const mes = fecha.getUTCMonth() + 1;
    const anio = fecha.getUTCFullYear();
    const fechaFormateada = !final ? `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}` : `${(dia - 1).toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
    return fechaFormateada;
  }
  onChangeFacturarOriginal() {
    console.log(this.facturarOriginal)
  }
  onChangeFecha() {
    this.page.offset = 0;

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
  async eliminarRegistro(id) {
    this.loading = true;
    this._remitoService.deleteRemito(id)
      .subscribe(
        data => {
          this.success = true;
          this.error = '';
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remito eliminado exitosamente.',
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
            text: "No fue posible eliminar el remito",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });

        }
      );
  }
  ConfirmDeleteOpen(id: string) {
    let remito = this.rows.filter(r => r.id == id)[0]
    let html = `
      <p>Se eliminara el remito ${remito.nroRemito}</p>
      <p>Del cliente ${remito.expand.cliente.razonSocial}</p>
    `
    Swal.fire({
      title: '¿Eliminar?',
      //text: "Se eliminará el remito"
      html,
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
  seleccionarRemito(remito: RemitoData): void {
    this._remitoStateService.seleccionarUltimoRemito(remito);
  }
  seleccionarRemitoHR(id: string, modalAddHR) {
    this.idremito = id
    let r = this.rows.filter(res => res.id == id)[0]
    this.remitospenhr = {
      nro: r.nroRemito,
      cliente: r.expand.cliente.nombre,
      destinatario: r.expand.destinatario.nombre,
      localidad: r.expand.destinatario.expand.localidad.nombre,
      fechaIngreso: new Date(r.fechaIngreso).toISOString().split('T')[0],
      kilos: r.kilos,
      bultos: r.bultos
    }
    this.modalService.open(modalAddHR, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  onReubicar(remito: RemitoData) {
    this.seleccionarRemito(remito)

    Swal.fire({
      title: '¿Reubicar?',
      text: "El remito pasará a estar pendiente de reubicación",
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

        this._remitoService.relocateRemito(remito.id, this.observacion, this.novedad)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'El remito ha sido establecido como pendiente de reubicación.',
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
                text: "No fue posible establecer el remito como pendiente de reubicación.",
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
  onConformar(remito: RemitoData) {
    this.seleccionarRemito(remito)
    Swal.fire({
      title: '¿Conformar?',
      text: "El remito se marcará como conformado",
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
        this._remitoService.confirmRemito(remito.id)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'El remito ha sido establecido como conformado.',
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
                text: "No fue posible establecer el remito como conformado.",
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
  onDesconformar(remito: RemitoData) {
    this.seleccionarRemito(remito)
    Swal.fire({
      title: '¿Quitar conformar?',
      text: "El remito se quitará el conformado",
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
        this._remitoService.desconfirmRemito(remito.id)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Al remito se ha quitado el conformado.',
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
                text: "No fue posible quitar al remito el conformado.",
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
  onQuitarHR(remito: RemitoData) {
    this.seleccionarRemito(remito)
    Swal.fire({
      title: '¿Quitar de hoja de ruta?',
      text: 'El remito pasará al estado "Pendiente"',
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

        this._remitoService.removeRemitoHR(remito.id, this.novedad, this.observacion, remito.hojaruta)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              this.novedad = ''
              this.observacion = ''
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'El remito ha sido removido de la hoja de ruta.',
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
                text: "No fue posible quitar el remito de la hoja de ruta.",
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
  onCancelar(id: string) {
    Swal.fire({
      title: '¿Cancelar?',
      text: 'Se cambiará el estado del remito a "Cancelado"',
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
        this._remitoService.cancelRemito(id, this.observacion, this.novedad)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              this.novedad = ''
              this.observacion = ''
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Remito cancelado exitosamente.',
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
              this.novedad = ''
              this.observacion = ''
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "No fue posible cancelar el remito",
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
  onAnular(id: string) {
    Swal.fire({
      title: 'Anular?',
      text: 'Se cambiará el estado del remito a "Anulado"',
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
        this._remitoService.anularRemito(id, this.observacion, this.novedad)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              this.novedad = ''
              this.observacion = ''
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Remito anulado exitosamente.',
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
              this.novedad = ''
              this.observacion = ''
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "No fue posible anular el remito",
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
  onRechazar(id: string) {
    Swal.fire({
      title: '¿Rechazar?',
      text: 'Se cambiará el estado del remito a "Rechazado"',
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
        this._remitoService.rejectRemito(id, this.observacion, this.novedad)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              this.novedad = ''
              this.observacion = ''
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Remito rechazado exitosamente.',
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
              this.novedad = ''
              this.observacion = ''
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "No fue posible rechazar el remito",
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
  onEntregar(id: string) {
    Swal.fire({
      title: '¿Confirmar entrega?',
      text: 'Se cambiará el estado del remito a "Entregado"',
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
        this._remitoService.deliverRemito(id, this.observacion, this.novedad, this.deliveryConformado)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              this.novedad = ''
              this.observacion = ''
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Entrega de remito confirmada exitosamente.',
                customClass: {
                  confirmButton: 'btn btn-primary',
                  cancelButton: 'btn btn-outline-secondary'
                }
              });
              this.deliveryConformado = false
              this.loadPage()
            },
            error => {
              this.error = error;
              this.success = false;
              this.loading = false;
              this.novedad = ''
              this.observacion = ''
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "No fue posible confirmar entrega del remito",
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
  onDuplicar(remito: RemitoData, modalDuplicar) {
    this.remitoDuplicar = remito
    this.reubicadoOriginal = remito.reubicado
    this.modalService.open(modalDuplicar, {
      centered: true,
      size: 'md',
      windowClass: 'modal modal-primary'
    });
  }

  onSubmitDuplicar() {
    //this.seleccionarRemito(remito)
    let html = `
    <p >
      El remito se duplicará
    </p>
    `
    Swal.fire({
      title: '¿Duplicar?',
      html,
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

        this._remitoService.duplicarRemito(this.remitoDuplicar, this.facturarOriginal, this.reubicadoOriginal)
          .subscribe(
            data => {
              this.success = true;
              this.error = '';
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'El remito ha duplicado.',
                customClass: {
                  confirmButton: 'btn btn-primary',
                  cancelButton: 'btn btn-outline-secondary'
                }
              });
              this.loadPage()
              this.modalService.dismissAll();
            },
            error => {
              this.error = error;
              this.success = false;
              this.loading = false;

              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "No fue posible duplicar el remito.",
                customClass: {
                  confirmButton: 'btn btn-primary',
                  cancelButton: 'btn btn-outline-secondary'
                }
              });
              this.modalService.dismissAll();

            }
          );
      }
    });
  }
  confirmActionDuplicar() {
    this.onSubmitDuplicar()
  }
  cerrarModalDuplicar() {
    this.remitoDuplicar = null
    this.facturarOriginal = true
    this.reubicadoOriginal = false
    this.modalService.dismissAll();
  }
  async ngOnInit(): Promise<void> {
    this.searchTrigger$.pipe(
      debounceTime(200),
      takeUntil(this.destroy$)
    ).subscribe(()=>{
      this.filterUpdate({})
    })
    flatpickr.localize(Spanish);
    this.loadPage();
    try {
      const proveedorOptionsResponse = await this._selectFormatService.getTodosProveedores();
      this.proveedorOptions = proveedorOptionsResponse;

      this._selectFormatService.getEstados().subscribe((response) => {
        this.estadoOptions = response;
        const estadoTransito = response.find((estado) => estado.nombre === 'Tránsito');
        const estadoPendiente = response.find((estado) => estado.nombre === 'Pendiente');
        const estadoEntregado = response.find((estado) => estado.nombre === 'Entregado');
        this.estadoMultipleOptions = response.filter(e => {
          if (e.nombre == "Entregado") {
            return true
          }
          if (e.nombre == "Cancelado") {
            return true
          }
          if (e.nombre == "Rechazado") {
            return true
          }
          return false
        })


        if (estadoTransito) {
          this.transitoID = estadoTransito.id;
        } else {
          console.error('Estado "Tránsito" no encontrado en la lista de estados.');
        }
        if (estadoPendiente) {
          this.pendienteID = estadoPendiente.id;
        } else {
          console.error('Estado "Pendiente" no encontrado en la lista de estados.');
        }
        if (estadoEntregado) {
          this.entregadoID = estadoEntregado.id;
        } else {
          console.error('Estado "Entregado" no encontrado en la lista de estados.');
        }
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  /**
 * For ref only, log selected values
 *
 * @param selected
 */


  // isSelected(rowId: string): boolean {
  //   return this.selectedRows.includes(rowId);
  // }
  // onCheckboxChange(rowId: string) {
  //   // this.selectedRows[rowId] = !this.selectedRows[rowId];
  //   const index = this.selectedRows.indexOf(rowId); 
  //   if (index === -1) {
  //     this.selectedRows.push(rowId);
  //   } else {
  //     this.selectedRows.splice(index, 1);
  //   }
  // }
  isSelected(rowId: string): boolean {
    return this.selectedRows.some(row => row.id === rowId);
  }
  changeColumna(event: any) {
    if (this.selectedOption == "") {
      this.valores = {
        destinatario: "",
        localidad: "",
        nro: "",
        cliente: "",
        remitente: "",
        proveedor: "",
        zona: "",
        hojaruta: ""
      }
      this.loadPage()
    }

  }
  onCheckboxChange(row: any): void {
    const index = this.selectedRows.findIndex(selectedRow => selectedRow.id === row.id);

    if (index === -1) {
      this.selectedRows.push(row);
      this.totalHR += row.totalViaje
      this.totalKilos += row.kilos
    } else {
      this.totalHR -= row.totalViaje
      this.totalKilos -= row.kilos
      this.selectedRows.splice(index, 1);
    }
    if (this.selectedRows.length == 0) {
      this.tarifario = []
      this.pagetar.count = 0
      this.pagetar.size = 0
    }
  }
  filterByStatus(estadoId: string) {
    this.page.offset = 0;
    this.totalHRLista = 0
    this.totalKilosLista = 0

    this.loadPage()
  }
  loadPage() {
    this._remitoService.getRemitos(this.page.size, this.page.offset + 1, this.searchValue, this.selectedStatus, this.selectedDates[0], this.selectedDates[1], this.fechaEntrega, this.selectedOption, this.valores, this.etiqueta)
      .subscribe((data: any) => {
        //this.rows = data.items;
        this.rows = data.items.map((item: any) => {

          if (item.expand && item.expand.responsable) {
            return {
              ...item,
              numerorto: `${item.nroRemito}${item.reubicado ? "*" : ""}`,
              observacioncorto: item.observacion ? item.observacion.length > this.maxchars ? item.observacion.substr(0, this.maxchars) : item.observacion : "",
              nombreCompleto: `${item.expand.responsable.nombre} ${item.expand.responsable.apellido}`
            };
          } else {
            return {
              ...item,
              numerorto: `${item.nroRemito}${item.reubicado ? "*" : ""}`,
              observacioncorto: item.observacion ? item.observacion.length > this.maxchars ? item.observacion.substr(0, this.maxchars) : item.observacion : "",
              nombreCompleto: ''
            };
          }

        });

        this.page.count = data.totalItems;

      });
  }
  calcularTotal() {
    this._remitoService.getTotales(this.searchValue, this.selectedStatus, this.selectedDates[0], this.selectedDates[1], this.fechaEntrega)
      .then(res => {
        this.totalHRLista = res.valor
        this.stotalHRLista = this.formatPeso(res.valor)
        this.totalKilosLista = res.peso
        this.stotalKilosLista = this.formatKilo(res.peso)
      })
  }
  exportarXLSX() {
    this._remitoService.getRemitosSkipTotal(this.searchValue, this.selectedStatus, this.selectedDates[0], this.selectedDates[1], this.fechaEntrega)
      .then((data: any) => {
        // this.exportCSVData = data.items;
        this.exportCSVData = data.map(item => ({
          FechaIngreso: this.formatDateExcel(item.fechaIngreso, false),
          Cliente: item.expand.cliente.nombre ? item.expand.cliente.nombre : "S/D",
          RTO: item.nroRemito,
          KG: item.kilos,
          Boca_Bultos: item.bultos,
          Remitente: item.expand?.remitente?.nombre,
          Destinatario: item.expand?.destinatario?.nombre,
          Localidad: item.expand?.destinatario?.expand?.localidad?.nombre,
          Estado: item.expand?.estado?.nombre,
          Conformado: item.confirmado ? 'Sí' : 'No',
          Reubicado: item.reubicado ? 'Sí' : 'No',
          Facturar: item.facturar ? 'Sí' : 'No',
          Proveedor: item.expand?.proveedor?.nombre,
          Chofer: item.expand?.chofer?.nombre,
          Vehiculo: item.expand?.vehiculo?.nombre,
          FechaEntrega: this.formatDateExcel(item.fechaEntrega, false),
          Observaciones: item.observacion,
          Novedades: item.novedad,
          PorcentajeCobro: item.porcentajeCobro + '%',
          ValorDeclarado: '$' + item.valorDeclarado,
          PrecioUnitario: '$' + item.precioUnitario,
          Total: '$' + item.totalViaje,
          FormaPago: item.expand?.cliente?.expand?.formaPago?.nombre,
          Responsable: item.expand?.responsable.username,
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(this.exportCSVData);

        const wsFilters = XLSX.utils.aoa_to_sheet([
          ['Filtro', 'Valor'],
          ['Valor de búsqueda', this.searchValue ?? '-'],
          ['Estado', this.selectedStatus ? this.estadoOptions.find(option => option.id === this.selectedStatus)?.nombre : '-'],
          ['Fecha inicial', this.selectedDates[0] ? this.formatDateExcel(this.selectedDates[0], false) : '-'],
          ['Fecha final', this.selectedDates[1] ? this.formatDateExcel(this.selectedDates[1], true) : '-']
        ]);

        XLSX.utils.book_append_sheet(wb, ws, 'Remitos');
        XLSX.utils.book_append_sheet(wb, wsFilters, 'Filtros aplicados');
        XLSX.writeFile(wb, 'remitos.xlsx');
      });
  }
  formatearFechaHora(fechaHoraString) {
    const fechaHora = new Date(fechaHoraString);

    // Obtener día de la semana
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const diaSemana = diasSemana[fechaHora.getDay()];

    // Formatear fecha
    const fechaFormateada = fechaHora.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '/');

    // Formatear hora
    const horaFormateada = fechaHora.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${fechaFormateada} ${diaSemana} ${horaFormateada} HS`;
  }
  exportarHR() {
    this.totalHR = 0
    this.totalKilos = 0
    const proveedor = this.proveedorOptions.find(option => option.id === this.remito.proveedor)?.nombre
    const chofer = this.choferOptions.find(option => option.id === this.remito.chofer)?.nombre
    const vehiculo = this.vehiculoOptions.find(option => option.id === this.remito.vehiculo)?.nombre
    const fechaEntrega = this.formatearFechaHora(this.remito.fechaEntrega)

    this.exportCSVData = this.selectedRows.map(item => ({
      RTO: item.nroRemito,
      KG: item.kilos,
      BULTOS: item.bultos,
      REMITENTE: item.expand.remitente?.nombre || "",
      DESTINATARIO: item.expand.destinatario?.nombre || "",
      LOCALIDAD: item.expand?.destinatario?.expand?.localidad?.nombre || "",
      DIRECCCION: item.expand?.destinatario?.direccion || "",
      HORARIOS: item.expand?.destinatario?.horarios || "",
      OBSERVACION: item.expand?.destinatario?.observacion || ""
    }));
    let filavuelta = this.exportCSVData.length + 5
    let vuelta = [
      { "1 Vuelta": "PALLETS", "Entregado x Egeo": "", "Devuelto x chofer": "" },
      { "1 Vuelta": "BANDEJAS", "Entregado x Egeo": "", "Devuelto x chofer": "" },
      { "1 Vuelta": "DEVOLUCIONES", "Entregado x Egeo": "", "Devuelto x chofer": "" }
    ]
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    ws['A1'] = { t: 's', v: `Chofer: ${chofer} - ${vehiculo} - Proveedor: ${proveedor} - ${this.formatearFechaHora(this.remito.fechaEntrega)} - Numero ${this.codigo}`, s: {} };

    const range = XLSX.utils.decode_range('A1:J1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];

    XLSX.utils.sheet_add_json(ws, this.exportCSVData, { origin: 'A2' });
    XLSX.utils.sheet_add_json(ws, vuelta, { origin: 'A' + filavuelta });

    const wsFilters = XLSX.utils.aoa_to_sheet([
      ['Fecha de entrega', fechaEntrega],
      ['Proveedor', proveedor],
      ['Chofer', chofer],
      ['Vehículo', vehiculo]
    ]);

    XLSX.utils.book_append_sheet(wb, ws, 'Remitos incluidos');
    XLSX.utils.book_append_sheet(wb, wsFilters, 'Hoja de ruta');

    XLSX.writeFile(wb, `${proveedor} - ${fechaEntrega.replace(/\//g, "-")}.xlsx`, { cellStyles: true });

  }
  exportarFormatoHojaRuta() {
    this._remitoService.getRemitosSkipTotal(this.searchValue, this.selectedStatus, this.selectedDates[0], this.selectedDates[1], this.fechaEntrega)
      .then(async (res: any) => {

        const proveedor = res[0].expand.proveedor.nombre
        const chofer = res[0].expand.chofer.nombre
        const vehiculo = res[0].expand.vehiculo.nombre
        const fechaEntrega = this.formatDateExcel(res[0].fechaEntrega, false)

        let hr = { codigo: "" }
        if (res[0].hojaruta != "") {
          hr = await this._remitoService.getHojaRuta(res[0].hojaruta)
        }

        this.exportCSVData = res.map(item => ({
          RTO: item.nroRemito,
          KG: item.kilos,
          BULTOS: item.bultos,
          REMITENTE: item.expand.remitente.nombre,
          DESTINATARIO: item.expand.destinatario.nombre,
          LOCALIDAD: item.expand?.destinatario?.expand?.localidad?.nombre,
          DIRECCCION: item.expand?.destinatario?.direccion,
          HORARIOS: item.expand?.destinatario?.expand?.horarios,
          OBSERVACION: item.expand?.destinatario?.observacion
        }));
        let filavuelta = this.exportCSVData.length + 5
        let vuelta = [
          { "1 Vuelta": "PALLETS", "Entregado x Egeo": "", "Devuelto x chofer": "" },
          { "1 Vuelta": "BANDEJAS", "Entregado x Egeo": "", "Devuelto x chofer": "" },
          { "1 Vuelta": "DEVOLUCIONES", "Entregado x Egeo": "", "Devuelto x chofer": "" }
        ]
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([]);

        ws['A1'] = { t: 's', v: `${proveedor} - ${this.formatearFechaHora(fechaEntrega)} - Hoja de ruta ${hr.codigo}`, s: {} };

        const range = XLSX.utils.decode_range('A1:G1');
        ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];

        XLSX.utils.sheet_add_json(ws, this.exportCSVData, { origin: 'A2' });
        XLSX.utils.sheet_add_json(ws, vuelta, { origin: 'A' + filavuelta });

        const wsFilters = XLSX.utils.aoa_to_sheet([
          ['Fecha de entrega', fechaEntrega],
          ['Proveedor', proveedor],
          ['Chofer', chofer],
          ['Vehículo', vehiculo]
        ]);

        XLSX.utils.book_append_sheet(wb, ws, 'Remitos incluidos');
        XLSX.utils.book_append_sheet(wb, wsFilters, 'Hoja de ruta');

        XLSX.writeFile(wb, `${proveedor} - ${fechaEntrega.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
      })

  }
  piso(x) {
    return Math.round(x)
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }

  modalOpen(modalHR) {
    this.modalService.open(modalHR, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }

  modalStateOpen(action: string, remito: RemitoData) {
    this.seleccionarRemito(remito)
    this.modalTitle = action === 'Entregar' ? 'Confirmar entrega de remito' : `${action} remito`
    this.observacion = remito.observacion
    this.novedad = remito.novedad
    // Esto define la accion de cuando apretas okey en el modal de cambiar de estado
    this.confirmFunction =
      action === 'Cancelar' ? () => this.onCancelar(remito.id)
        : action === 'Rechazar' ? () => this.onRechazar(remito.id)
          : action === 'Reubicar' ? () => this.onReubicar(remito)
            : action === 'Entregar' ? () => this.onEntregar(remito.id)
              : action === 'Anular' ? () => this.onAnular(remito.id)
                : () => this.onQuitarHR(remito);


    this.modalService.open(this.modalState, {
      centered: true,
      size: 'md',
      windowClass: 'modal modal-primary'
    });
  }
  cerrarModalObservacion() {
    this.observacion = ""
    this.novedad = ""
    this.modalService.dismissAll();
  }
  confirmAction() {
    if (this.confirmFunction) {
      this.confirmFunction();
    }
    this.modalService.dismissAll();
  }
  onProveedorChange(proveedorId: any): void {
    this.remito.localidad = null
    this.remito.chofer = null
    this.remito.vehiculo = null
    this._selectFormatService.getVehiculosProveedor(proveedorId).subscribe((vehiculos) => {
      this.vehiculoOptions = vehiculos;
    });
    this._selectFormatService.getChoferesProveedor(proveedorId).subscribe((choferes) => {
      this.choferOptions = choferes;
    });
    
    if(this.remito.proveedor?.length>0){
      this._remitoService.getTarifarioProveedorVigente(this.remito.proveedor,this.remito.fechaEntrega).then(res=>{
        this.tarifario = res
      this.pagetar.count = res.length
      this.pagetar.size = res.length
      })
    }
    /*
    this._remitoService.getTarifarioProveedor(proveedorId).subscribe(res=>{
      this.tarifario = res.items
      this.pagetar.count = res.items.length
      this.pagetar.size = res.items.length
    })
    */
  }
  async onSubmit(valid) {
    this.submitted = true;
    if (!valid) {
      return;
    }
    await this.handleTransito()
  }
  toggleTarifario(){
    this.verTarifarioProveedor = !this.verTarifarioProveedor
  }
  async handleTransito(): Promise<void> {
    this.loading = true;
    let errores = false;
    const fechaHora = new Date(this.remito.fechaEntrega);
    const fechaHoraFormateada = fechaHora.toISOString();
    if (this.codigo.trim().length == 0) {
      const proveedornombre = this.proveedorOptions.find(option => option.id === this.remito.proveedor)?.nombre
      let hrid = await this._remitoService.getHRMaxId()
      let nuevocod = hrid.maximo + 1
      
      this.codigo = nuevocod + " - " + proveedornombre
      
      this._remitoService.updateHRMaxId(nuevocod, hrid.id).then(res => {
        
        this._remitoService.postHRCodigo(
          this.codigo,
          this.remito.proveedor,
          this.remito.chofer,
          this.remito.vehiculo,
          0,
          0,
          0,
          this.remito.fechaEntrega.split("T")[0],
          "",
          this.primeravuelta
        ).then(async res => {
          for (const filaSeleccionada of this.selectedRows) {
            try {
              await this._remitoService.putRemito(filaSeleccionada.id,
                {
                  ...filaSeleccionada,
                  fechaEntrega: fechaHoraFormateada,
                  estado: this.transitoID,
                  proveedor: this.remito.proveedor,
                  vehiculo: this.remito.vehiculo,
                  chofer: this.remito.chofer,
                  //@ts-ignore
                  hojaruta: res.id
                }, 'tránsito').toPromise();
              this.primeravuelta = true

            } catch (error) {
              errores = true;

            }
          }

          this.loading = false;
          if (!errores) {
            this.exportarHR();
            this.success = true;
            this.error = '';
            this.submitted = false;
            this.loadPage();
            this.selectedRows = []
            this.codigo = ""
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Hoja de ruta creada exitosamente.',
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-outline-secondary'
              },
              onAfterClose: () => {
                this.modalService.dismissAll();
                this.remito.proveedor = null
                this.remito.vehiculo = null
                this.remito.chofer = null
                this.remito.fechaEntrega = ''
              }
            });
          } else {
            this.codigo = ""
            this.success = false;
            this.error = 'No fue posible crear hoja de ruta. Hubo remitos que no se editaron';
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
          this.tarifario = []
          this.pagetar.count = 0
          this.pagetar.size = 0
        }).catch(err => {
          this.success = false;
          this.error = 'No fue posible crear hoja de ruta, hubo un error de datos';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.error,
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          })
        })
      })

    }
    else {
      
      this._remitoService.postHRCodigo(
        this.codigo,
        this.remito.proveedor,
        this.remito.chofer,
        this.remito.vehiculo,
        0,
        0,
        0,
        this.remito.fechaEntrega.split("T")[0],
        "",
        this.primeravuelta
      ).then(async res => {
        this.codigo = ""
        for (const filaSeleccionada of this.selectedRows) {
          try {
            await this._remitoService.putRemito(filaSeleccionada.id,
              {
                ...filaSeleccionada,
                fechaEntrega: fechaHoraFormateada,
                estado: this.transitoID,
                proveedor: this.remito.proveedor,
                vehiculo: this.remito.vehiculo,
                chofer: this.remito.chofer,
                //@ts-ignore
                hojaruta: res.id
              }, 'tránsito').toPromise();
            this.primeravuelta = true

          } catch (error) {
            errores = true;

          }
        }
        this.codigo = ""
        this.loading = false;
        if (!errores) {
          this.exportarHR();
          this.success = true;
          this.error = '';
          this.submitted = false;
          this.loadPage();
          this.selectedRows = []
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Hoja de ruta creada exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            },
            onAfterClose: () => {
              this.modalService.dismissAll();
              this.remito.proveedor = null
              this.remito.vehiculo = null
              this.remito.chofer = null
              this.remito.fechaEntrega = ''
            }
          });
        } else {
          this.success = false;
          this.error = 'No fue posible crear hoja de ruta. Hubo remitos que no se editaron';
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
        this.tarifario = []
        this.pagetar.count = 0
        this.pagetar.size = 0
      }).catch(err => {
        this.success = false;
        this.error = 'No fue posible crear hoja de ruta, hubo un error de datos';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.error,
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        })
      })
    }


  }
  acortar(descripcion: string) {
    if (descripcion.length > 5) {
      return descripcion.slice(0, 5)
    }
    return descripcion
  }
  cambio(campo) {

    this.loadPage()
  }
  eventoAgregarHR(hr) {
    let data = {
      ...hr,
      estado: this.transitoID
    }
    this._remitoService.agregarHR(this.idremito, data).subscribe(res => {
      Swal.fire("Éxito agregar", "Se logró agregar el remito a la hoja de rutao", "success")
      this.loadPage()
      this.modalService.dismissAll()
    })
  }
  onChangeFechaEntrega(evento){
    this.verifyHR()
    if(this.remito.proveedor?.length>0){
      this._remitoService.getTarifarioProveedorVigente(this.remito.proveedor,this.remito.fechaEntrega).then(res=>{
        this.tarifario = res
      this.pagetar.count = res.length
      this.pagetar.size = res.length
      })
    }
  }
  verifyHR() {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let hrfecha = new Date(this.remito.fechaEntrega)
    let meshr = hrfecha.getMonth()
    let añohr = hrfecha.getFullYear()
    if (meshr != mes || año != añohr) {
      this.fecharara = true
    }
    else {
      this.fecharara = false
    }
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.destroy$.next()
    this.destroy$.complete()
  }
  limpiarRemitoEstado() {
    this.selectedRemitos = []
    this.modalService.dismissAll();
  }
  seleccionarRemitoEstado(remito) {

    this.selectedRemitos.push(remito)
  }

  quitarRemitoEstado(remito) {
    let idx_r = this.selectedRemitos.findIndex(r => r.id == remito.id)
    if (idx_r != -1) {
      this.selectedRemitos.splice(idx_r, 1)
    }

  }
  onMultiplesRemitos(modalMultipleEstado) {
    this.modalService.open(modalMultipleEstado, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  isInSelected(row) {
    let idx_r = this.selectedRemitos.findIndex(r => r.id == row.id)
    return idx_r != -1
  }
  cerrarModalMultiple() {
    this.modalService.dismissAll();
  }
  guardarMultiple() {
    this.modalService.dismissAll();
    this.selectedRemitos = []
    Swal.fire("Éxito modificar", "Se modificó con exito los remitos", "success")
    this.loadPage()
  }

  quitarRemitoRow(row) {
    this.quitarRemitoEstado(row)
  }
  toggleSecond() {
    this.secondPart = !this.secondPart
  }
  hayImportante(){
    let idx = this.selectedRows.findIndex(r=>r.expand?.destinatario?.importancia == 1)
    return idx != -1
  }
  anularRemito(row){
    this._remitoService.anularRemito(row.id,"","").subscribe(res=>{
      Swal.fire("Éxito anular","Se logró anular el remito","success")
      this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
    })
  }
}
