import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { ClienteData } from 'app/main/cruds/cliente/model/cliente-model';
import { RemitoData } from '../model/remito-model';
import { RemitoService } from '../remito.service';
import { SelectFormatService } from 'app/main/common';
import { DestinatarioData } from 'app/main/cruds/destinatario/model/destinatario-model';
import { RemitenteData } from 'app/main/cruds/remitente/model/remitente-model';
import { ProveedorData } from 'app/main/proveedores/model/proveedor-model';
import { VehiculoData } from 'app/main/proveedores/model/vehiculo-model';
import { EstadoData } from 'app/main/cruds/estado/model/estado-model';
import { ChoferData } from 'app/main/proveedores/model/chofer-model';
import Stepper from 'bs-stepper';
@Component({
  selector: 'app-remito-edit',
  templateUrl: './remito-edit.component.html',
  styleUrls: ['./remito-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemitoEditComponent implements OnInit, OnDestroy {
  // public
  public breadcrumbLevels: any;
  public submitted = false;
  public success = false;
  public loading = false;
  public esAnulado = false
  public esEnTransito = false
  public error = '';
  public errorMessage;
  public localidad = ''
  currentDate: Date = new Date();
  public selectedProvincia = null
  public ColumnMode = ColumnMode;
  public tarifario = []
  public tarifarioHistorial = []
  public openTarifario = false
  public openTarifarioHistorial = false
  public idRemito: string = '';

  public remito: RemitoData = {
    nroRemito: '',
    fechaIngreso: '',
    cliente: null,
    kilos: null,
    bultos: null,
    remitente: null,
    destinatario: null,
    localidad: null,
    estado: null,
    precioUnitario: null,
    totalViaje: null,
    porcentajeCobro: null,
    valorDeclarado: null,
    fechaEntrega: '',
    proveedor: null,
    chofer: null,
    vehiculo: null,
    observacion: '',
    novedad: '',
    facturar: false,
    confirmado: false,
    etiqueta: null,
    prioridad: 0
  };
  public initialRemito: RemitoData
  public clienteOptions: ClienteData[];
  public destinatarioOptions: DestinatarioData[]
  public remitenteOptions: RemitenteData[]
  public proveedorOptions: ProveedorData[] = []
  public vehiculoOptions: VehiculoData[] = []
  public choferOptions: ChoferData[] = []
  public estadoOptions: EstadoData[] = []
  public prioridadOptions: any = [] = []

  private horizontalWizardStepper: Stepper;
  estadoNombre: string = '';

  /**
   * Constructor
   *
   * @param {RemitoService} _remitoService
   * @param {SelectFormatService} _selectFormatService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(
    private _remitoService: RemitoService,
    private _router: Router,
    private route: ActivatedRoute,
    private _selectFormatService: SelectFormatService,

  ) {
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  onSubmit(valid) {
    this.submitted = true;
    if (!valid) {
      return;
    }
    this.editar()
  }

  
  async editar() {
 
    
    if (this.esEnTransito) {
      if (
        this.remito.fechaEntrega?.length == 0 ||
        this._selectFormatService.esUndefined(this.remito.chofer) ||
        this._selectFormatService.esUndefined(this.remito.proveedor) ||
        this._selectFormatService.esUndefined(this.remito.vehiculo)

      ) {
        Swal.fire("Error datos","Para editar un remito en tránsito deben estar todos los datos del proveedor","error")
        return
      }

    }

    this.loading = true;
    this._remitoService.putRemito(this.idRemito, { ...this.remito, fechaIngreso: this.remito.fechaIngreso + ' 03:00:00.000Z', fechaEntrega: this.remito.fechaEntrega + ' 03:00:00.000Z' }, 'actualizar')
      .subscribe(
        data => {
          this.success = true;
          this.error = '';
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remito modificado exitosamente.',
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
          this.error = 'No fue posible editar remito';
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
      text: "Se modificará el remito",
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
            text: 'Remito creado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
        }
      }
    });
  }

  formatDate(fechaCompleta) {
    const fecha = new Date(fechaCompleta);
    return fecha.toISOString().split('T')[0];
  }
  onProveedorChange(proveedorId: any): void {
    this.remito.localidad = null
    this._selectFormatService.getVehiculosProveedor(proveedorId).subscribe((vehiculos) => {
      this.vehiculoOptions = vehiculos;
    });
    this._selectFormatService.getChoferesProveedor(proveedorId).subscribe((choferes) => {
      this.choferOptions = choferes;
    });
  }
  onClienteChange(clienteId: any): void {
    this.remito.remitente = null
    this._selectFormatService.getRemitentesCliente(clienteId).then((remitentes) => {
      this.remitenteOptions = remitentes;
    });
    this._selectFormatService.getTodosDestinatariosCliente(clienteId).then((destinatarios) => {
      this.destinatarioOptions = destinatarios;
    });
    this._remitoService.getTarifarioClienteVigente(clienteId).then(res => {
      this.tarifario = res
    })
    this._remitoService.getTarifarioClienteCompleto(clienteId).then(res => {
      this.tarifarioHistorial = res
    })
  }
  onDestinatarioChange(destinatarioId: string): void {
    this._selectFormatService.getLocalidadDestinatario(destinatarioId).subscribe(res => {
      this.localidad = res.expand.localidad.nombre
    })
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
  objectCompare(obj1: any, obj2: any): boolean {
    if (!obj1 || !obj2) return
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key) || !this.equalValues(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }
  equalValues(val1: any, val2: any): boolean {
    if (typeof val1 === 'string' && typeof val2 === 'number') {
      return Number(val1) === val2;
    } else if (typeof val1 === 'number' && typeof val2 === 'string') {
      return val1 === Number(val2);
    } else {
      return val1 === val2;
    }
  }
  async ngOnInit(): Promise<void> {
    this.prioridadOptions = this._selectFormatService.getPrioridades()
    this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper1'), {});
    this.idRemito = this.route.snapshot.paramMap.get('id');
    try {
      const clientesResponse = await this._selectFormatService.getTodosClientes();
      this.clienteOptions = clientesResponse;

      // const destinatariosResponse = await this._selectFormatService.getDestinatarios().toPromise();
      // this.destinatarioOptions = destinatariosResponse;

      const remitoResponse = await this._remitoService.getRemito(this.idRemito).toPromise();
      this.estadoNombre = remitoResponse.expand.estado.nombre
      this.esAnulado = this.estadoNombre == "Anulado"
      this.esEnTransito = this.estadoNombre == "Tránsito"

      this._selectFormatService.getLocalidadDestinatario(remitoResponse.destinatario).subscribe(res => {

        this.localidad = res.expand.localidad.nombre
      })
      this.remito = remitoResponse;
      this.remito.fechaIngreso = this.formatDate(remitoResponse.fechaIngreso)
      this.remito.fechaEntrega = this.remito.fechaEntrega ? this.formatDate(remitoResponse.fechaEntrega) : ''

      this._selectFormatService.getVehiculosProveedor(this.remito.proveedor).subscribe((vehiculos) => {
        this.vehiculoOptions = vehiculos;
      });
      this._selectFormatService.getChoferesProveedor(this.remito.proveedor).subscribe((choferes) => {
        this.choferOptions = choferes;
      });
      this._selectFormatService.getRemitentesCliente(remitoResponse.cliente).then((remitentes) => {
        this.remitenteOptions = remitentes;
      });
      this._selectFormatService.getTodosDestinatariosCliente(remitoResponse.cliente).then((destinatarios) => {
        this.destinatarioOptions = destinatarios;
      });
      const proveedorOptionsResponse = await this._selectFormatService.getTodosProveedores();
      this.proveedorOptions = proveedorOptionsResponse;

      this._selectFormatService.getEstados().subscribe((response) => {
        this.estadoOptions = response;
      })

      this.initialRemito = { ...this.remito }
      this._remitoService.getTarifarioClienteVigente(this.initialRemito.cliente, this.remito.fechaIngreso).then(res => {
        this.tarifario = res
      })
      this._remitoService.getTarifarioClienteCompleto(this.initialRemito.cliente).then(res => {
        this.tarifarioHistorial = res
      })
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  horizontalWizardStepperNext(data) {

    if (data.form.valid === true) {
      this.horizontalWizardStepper.next();
    }
  }

  horizontalWizardStepperPrevious() {
    this.horizontalWizardStepper.previous();
  }


  ngOnDestroy(): void {
  }
  verTarifario() {
    this.openTarifario = true
    this.openTarifarioHistorial = false
  }
  verTarifarioHistorial() {
    this.openTarifario = false
    this.openTarifarioHistorial = true
  }
  cerrarTarifario() {
    this.openTarifario = false
  }
  cerrarTarifarioHistorial() {
    this.openTarifarioHistorial = false
  }
}
