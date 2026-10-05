import { Component, OnInit, Input, ViewChild, inject, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CoreConfigService } from '@core/services/config.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { DestinatarioService } from '../destinatario.service';
import { environment } from 'environments/environment';
import { SelectFormatService } from 'app/main/common';
@Component({
  selector: 'app-tablaclientes',
  templateUrl: './tablaclientes.component.html',
  styleUrls: ['./tablaclientes.component.scss']
})
export class TablaclientesComponent implements OnInit {

  @Input() idDestinatario = ''
  @Input() accion = ''
  @Input() nuevodestinatario = false
  @Output() clienteEvent = new EventEmitter<any>()
  public clientes: any[] = []

  public selectedOption = 10;
  public searchValue = '';

  public data: any[];
  public rows: any[];

  public ColumnMode = ColumnMode;
  public guardarCliente = false
  public clienteValido = false

  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };

  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // private
  private _unsubscribeAll: Subject<any>;
  /**
   * Constructor
   *add
   * @param {DestinatarioService} _destinatarioService
   */
  constructor(
    private _destinatarioService: DestinatarioService,
    private _selectFormatService: SelectFormatService,
    public modalService: NgbModal) {
    this._unsubscribeAll = new Subject();

  }

  ngOnInit(): void {

    //this._destinatarioService.todosClientes().then(res=>this.clientes = res)
    this.rows = []
    this.page.count = 0
    this.loadPage();
    
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    this.page.offset = 0;
    this.loadPage();
  }
  loadPage() {
    if (!this.nuevodestinatario) {
      this._destinatarioService.getClientesDestinatario(this.page.offset + 1, this.page.size, this.idDestinatario, this.searchValue)
        .subscribe((data: any) => {
          this.rows = data.items;
          this.page.count = data.totalItems;
        });
    }

  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  ConfirmDeleteOpen(id: string) {
    let dxc = this.rows.filter(d => d.id == id)[0]

    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará del destinatario al cliente ${dxc.expand.cliente.nombre}.`,
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
        if (this.nuevodestinatario) {
          
          this.eliminarClienteNuevoDestinatario(dxc.expand.cliente.id)
        }
        else {
          this.eliminarCliente(id)
        }

      }
    });
  }
  eliminarClienteNuevoDestinatario(id) {
    this.clientes = this.clientes.filter(c => c.id != id)
    this.rows = []
    for (let i = 0; i < this.clientes.length; i++) {
      let cliente = this.clientes[i]
      let fila = {
        cliente,
        expand: {
          cliente: { ...cliente }
        }
      }
      this.rows.push(fila)
    }
    this.page.count = this.clientes.length
    this.clienteEvent.emit(this.clientes)
  }
  eliminarCliente(id: string) {
    this._destinatarioService.delClienteFromDestinatario(id)
      .then(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Cliente eliminado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          this.loadPage();
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "No fue posible eliminar el cliente seleccionado",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });

        }
      );
  }
  //Modal
  open(content) {
    this.modalService.open(content)
  }
  cerrarModal(modal) {
    this.loadPage()
    modal.close('Cerrar modal')
  }
  async ConfirmTodoClientesOpen() {
    Swal.fire({
      title: '¿Asociar todos los clientes?',
      text: `Seguro que desea asociar todos los clientes`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then(async (result) => {
      if (result.value) {
        if (this.nuevodestinatario) {
          
          this.todosLosClientesNuevoDestinatario()
        }
        else {
          
          await this.todosLosClientes()
        }

      }
    });
  }
  async todosLosClientes() {
    this._destinatarioService.ponerTodosClientes(this.idDestinatario).then(res => {
      this.onPageSizeChange()
    })
  }
  todosLosClientesNuevoDestinatario() {
    this.clientes = []
    this._selectFormatService.getTodosClientes().then(res => {
      this.clientes = res
      this.rows = []
      for (let i = 0; i < this.clientes.length; i++) {
        let cliente = this.clientes[i]
        let fila = {
          cliente,
          expand: {
            cliente: { ...cliente }
          }
        }
        this.rows.push(fila)
      }
      this.page.count = this.clientes.length
      this.clienteEvent.emit(this.clientes)
    })
  }
  asociarNuevoDestinatario(c) {
    this.clientes.push(c)

    this.rows = []
    for (let i = 0; i < this.clientes.length; i++) {
      let cliente = this.clientes[i]
      let fila = {
        cliente,
        expand: {
          cliente: { ...cliente }
        }
      }
      this.rows.push(fila)
    }
    this.page.count = this.clientes.length

    this.clienteEvent.emit(this.clientes)
  }
  recargarClientes(evento){
    this.rows = []
    this.page.count = 0
    this.loadPage();
  }

}
