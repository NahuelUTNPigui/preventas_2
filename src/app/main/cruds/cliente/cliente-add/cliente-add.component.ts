import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import Swal from 'sweetalert2';

import { ClienteData } from '../model/cliente-model';
import { ClienteService } from '../cliente.service';
import { FormaPagoData } from '../../forma-pago/model/forma-pago-model';
import { SelectFormatService } from 'app/main/common';
@Component({
  selector: 'app-cliente-add',
  templateUrl: './cliente-add.component.html',
  styleUrls: ['./cliente-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClienteAddComponent implements OnInit, OnDestroy {
  // public
  public sidebarToggleRef = false;
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';

  public cliente: ClienteData;
  public allUsers: any[] = []
  public errorMessage;
  public nombre: string;
  public cuit: string;
  public razonSocial: string;
  public formaPago: string;
  public observacion: string = '';
  public cuitPattern = /^\d{11}$/;
  public formaPagoOptions: FormaPagoData[];
  public responsableinscripto = false;
  public operador: string = ""


  //listas
  public destinatarios: any[] = []
  public remitentes: any[] = []

  // Private
  private _unsubscribeAll: Subject<any>;

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
    this._unsubscribeAll = new Subject();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  onSubmit(valid) {
    this.submitted = true;
    if (!valid) {
      return;
    }
    this.crearCliente()
  }


  async crearCliente() {
    this.loading = true;
    this._clienteService.postCliente(this.nombre, this.cuit, this.razonSocial, this.observacion, this.formaPago, this.responsableinscripto, this.operador)
      .subscribe(
        (data:any) => {
          this.success = true;
          this.error = '';
          if (this.destinatarios.length > 0) {
            //Inicio asociar destinataios y remitentes
            let id_destinatarios = this.destinatarios.map(d => d.id)
            this._clienteService.addNuevoClienteDestinatarios(id_destinatarios, data.id).then(res3 => {
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Cliente creado exitosamente.',
                customClass: {
                  confirmButton: 'btn btn-primary',
                  cancelButton: 'btn btn-outline-secondary'
                }
              });
              if (this.success) {
                this._router.navigate([`/clientes`])
              }
            })
            //fin

          }
          else {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Cliente creado exitosamente.',
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-outline-secondary'
              }
            });
            if (this.success) {
              this._router.navigate([`/clientes`])
            }
          }


        },
        error => {
          this.error = 'No fue posible crear el cliente';
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
    this._selectFormatService.getFormaPagos().subscribe((response) => {
      this.formaPagoOptions = response;
    });
    this._selectFormatService.getTodosUsuarios().subscribe(res => {
      this.allUsers = [{ id: "", username: "Ninguno" }].concat(res.items)
    })

  }

  ngOnDestroy(): void {
  }
  asociarDestinatarios(dest) {
    this.destinatarios.push(dest)
    
  }
  setDestinatarios(dests){
    this.destinatarios = dests
  }
}
