import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { RemitoData } from '../model/remito-model';
import { RemitoService } from '../remito.service';
import { SelectFormatService } from 'app/main/common';
import { ClienteData } from 'app/main/cruds/cliente/model/cliente-model';
import { DestinatarioData } from 'app/main/cruds/destinatario/model/destinatario-model';
import { RemitenteData } from 'app/main/cruds/remitente/model/remitente-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-remito-add',
  templateUrl: './remito-add.component.html',
  styleUrls: ['./remito-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemitoAddComponent implements OnInit, OnDestroy {
  // public
  public sidebarToggleRef = false;
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';
  // public maxDate;
  maxDate: Date = new Date();
  public remito: RemitoData = {
    nroRemito: '',
    fechaIngreso: null,
    cliente: null,
    kilos: null,
    bultos: null,
    remitente: null,
    destinatario: null,
    localidad: null,
    estado: null,
    facturar: true,
    precioUnitario: null,
    totalViaje: null,
    porcentajeCobro: null,
    valorDeclarado: null,
    etiqueta: null,
    prioridad:0
  };
  public selectedProvincia = null
  public errorMessage;
  public clienteOptions: ClienteData[] = [];
  public destinatarioOptions: DestinatarioData[] = []
  public remitenteOptions: RemitenteData[] = []
  public prioridadOptions:  any[] = []

  public nombrecliente = ""
  public nroremitorepetido = false

  public tarifario = []
  public tarifariohistorial = []
  public responsable: string;
  public localidad: string

  
  public ColumnMode = ColumnMode;
  public page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;



  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {RemitoService} _remitoService
   * @param {SelectFormatService} _selectFormatService
   * @param {CoreSidebarService} _coreSidebarService
   * * @param {NgbModal} _modalService
   */
  constructor(
    private _remitoService: RemitoService,
    private _router: Router,
    private route: ActivatedRoute,
    private _selectFormatService: SelectFormatService,
    private modalService: NgbModal
  ) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'User') {
      this.responsable = currentUser.record.id;
    }

    this._unsubscribeAll = new Subject();
  }


  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  onSubmit(valid) {
    this.submitted = true;
    if (!valid) {
      return;
    }
    this.crearRemito()
  }


  crearRemito() {
    this.loading = true;

    this._remitoService.postRemito({ ...this.remito, fechaIngreso: this.remito.fechaIngreso + ' 03:00:00.000Z', responsable: this.responsable })
      .subscribe(
        data => {
          this.success = true;
          this.error = '';

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remito creado exitosamente.',
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
          this.error = 'No fue posible crear el remito';
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
  onCambioNro() {
    if (this.remito.nroRemito != "") {

      this._remitoService.getRemitoXNroCliente(this.remito.nroRemito, this.remito.cliente).subscribe(res => {
        this.nroremitorepetido = res.totalItems != 0
      })
    }

  }
  onClienteChange(clienteId: any): void {
    this.onCambioNro()
    this.remito.remitente = null
    this._selectFormatService.getRemitentesCliente(clienteId).then((remitentes) => {
      this.remitenteOptions = remitentes;
    });
    this._selectFormatService.getTodosDestinatariosCliente(clienteId).then((destinatarios) => {
      this.destinatarioOptions = destinatarios;
    });
    let cliente = this.clienteOptions.filter(c => c.id == clienteId)[0]
    this.nombrecliente = cliente.nombre

    this._remitoService.getTarifarioClienteVigente(clienteId, this.remito.fechaIngreso).then(res => {
      this.tarifario = res
      this.page.count = res.length
      this.page.size = res.length
    })
    this._remitoService.getTarifarioClienteCompleto(clienteId).then(res => {
      this.tarifariohistorial = res
    })
  }
  onCambioFecha() {
    if (this.remito.cliente != null && this.remito.cliente != "") {

      this._remitoService.getTarifarioClienteVigente(this.remito.cliente, this.remito.fechaIngreso).then(res => {
        this.tarifario = res
        this.page.count = res.length
        this.page.size = res.length
      })

    }
  }
  onDestinatarioChange(destinatarioId: any): void {
    this._selectFormatService.getLocalidadDestinatario(destinatarioId).subscribe(res => {
      this.localidad = res.expand.localidad.nombre
    })
  }
  ngOnInit(): void {
    this.prioridadOptions = this._selectFormatService.getPrioridades()
    this.remito.fechaIngreso = this.addDays(new Date(), -1).toISOString().split("T")[0],
      this._selectFormatService.getTodosClientes().then((response) => {
        this.clienteOptions = response;
      });
    // this._selectFormatService.getDestinatarios().subscribe((response) => {
    //   this.destinatarioOptions = response;
    // });

    this._selectFormatService.getEstados().subscribe((response) => {
      const estadoPendiente = response.find((estado) => estado.nombre === 'Pendiente');
      if (estadoPendiente) {
        this.remito.estado = estadoPendiente.id;
      } else {
        console.error('Estado "Pendiente" no encontrado en la lista de estados.');
      }
    });
    this.remito.fechaIngreso = new Date().toISOString()
  }
  ngOnDestroy(): void {
  }
  calcularTotal(tipo) {
    if (tipo == 'kilos') {
      this.remito.totalViaje = this.remito.kilos * this.remito.precioUnitario
    }
    else if (tipo == 'bultos') {
      this.remito.totalViaje = this.remito.bultos * this.remito.precioUnitario
    }
    else if (tipo == 'porcentaje') {
      this.remito.totalViaje = this.remito.porcentajeCobro / 100.0 * this.remito.valorDeclarado
    }
    else {
      this.remito.totalViaje = this.remito.precioUnitario
    }
  }
  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  openHistorialModal(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  capitalize(texto){
    return texto.toUpperCase()
  }
}
