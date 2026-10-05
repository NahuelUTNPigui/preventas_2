import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { ClienteData } from '../model/cliente-model';
import { ClienteService } from '../cliente.service';
import { FormaPagoData } from '../../forma-pago/model/forma-pago-model';
import { SelectFormatService } from 'app/main/common';


@Component({
  selector: 'app-cliente-edit',
  templateUrl: './cliente-edit.component.html',
  styleUrls: ['./cliente-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClienteEditComponent implements OnInit, OnDestroy {

  // public
  
  public breadcrumbLevels: any;
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';
  public errorMessage;

  public idCliente: string;
  public cuitPattern = /^\d{11}$/;

  public cliente: ClienteData;
  public nombre: string;
  public cuit: string;
  public razonSocial: string;
  public observacion: string = '';
  public formaPago: string = null;
  public formaPagoOptions: FormaPagoData[];
  public responsableinscripto=false
  public allUsers:any[] = []
  public operador:string

  /**
   * Constructor
   *
   * @param {ClienteService} _clienteService
   * @param {SelectFormatService} _selectFormatService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(private _clienteService: ClienteService, 
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
    this._clienteService.putCliente(this.idCliente, this.nombre, this.cuit, this.razonSocial, this.observacion, this.formaPago,this.responsableinscripto,this.operador)
      .subscribe(
        data => {
          this.success = true;
          this.error = '';         
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Cliente modificado exitosamente.',
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-outline-secondary'
              }
            });
            if(this.success){
              this._router.navigate([`/clientes`])}          
        },
        error => {
          this.error = 'No fue posible editar cliente';
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
      text: "Se modificará el cliente",
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
            text: 'Cliente creado exitosamente.',
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
    this.idCliente = this.route.snapshot.paramMap.get('id')
    this._selectFormatService.getFormaPagos().subscribe((response) => {
      this.formaPagoOptions = response;
    });
    this._selectFormatService.getTodosUsuarios().subscribe(res=>{
      this.allUsers = [{id:"",username:"Ninguno"}].concat(res.items)
    })
    this._clienteService.getCliente(this.idCliente).subscribe(response => {
      this.nombre = response.nombre;
      this.cuit = response.cuit;
      this.razonSocial = response.razonSocial;
      this.observacion = response.observacion;
      this.formaPago = response.formaPago
      this.responsableinscripto=response.responsableinscripto
      this.operador = response.operador
      
    });
  }

  ngOnDestroy(): void {
  }


}
