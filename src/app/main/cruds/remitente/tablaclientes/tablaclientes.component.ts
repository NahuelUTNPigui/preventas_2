import { Component, OnInit,ViewChild,Input } from '@angular/core';
import { Subject } from 'rxjs';

import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';

import Swal from 'sweetalert2';

import {  NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { RemitenteService } from '../remitente.service';

@Component({
  selector: 'app-tablaclientes',
  templateUrl: './tablaclientes.component.html',
  styleUrls: ['./tablaclientes.component.scss']
})
export class TablaclientesComponent implements OnInit {

  @Input() idRemitente = ''
  @Input() accion=''

  public selectedOption = 10;
  public searchValue = '';

  public data: any[];
  public rows: any[];
  
  public ColumnMode = ColumnMode;
  public guardarCliente = false
  public clienteValido = false
  public clientes = []
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
   * @param {RemitenteService} _remitenteService
   */
   constructor(
    private _remitenteService: RemitenteService,
    public modalService: NgbModal) {
    this._unsubscribeAll = new Subject();
    
  }

  ngOnInit(): void {
    this.loadPage()
  }
  loadPage() {
    this._remitenteService.getClientesRemitente(this.page.offset + 1, this.page.size, this.idRemitente,this.searchValue)
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
  ConfirmDeleteOpen(id:string) {
    let rxc = this.rows.filter(r=>r.id==id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará al cliente del remitente ${rxc.expand.cliente.razonSocial}`,
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
        this.eliminarCliente(id)
      }
    });
  }
  eliminarCliente(id: string) {
    this._remitenteService.deleteCliente(id)
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
  cerrarModal(modal){
    this.loadPage()
    modal.close('Cerrar modal')
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
        await this.todosLosClientes()
      }
    });
  }
  async todosLosClientes(){
    this._remitenteService.ponerTodosClientes(this.idRemitente).then(res=>{
      this.onPageSizeChange()
    })
  }

}
