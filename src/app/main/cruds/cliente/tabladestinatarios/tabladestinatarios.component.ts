import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { expand, takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CoreConfigService } from '@core/services/config.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ClienteService } from '../cliente.service';
import { SelectFormatService } from 'app/main/common';
@Component({
  selector: 'app-tabladestinatarios',
  templateUrl: './tabladestinatarios.component.html',
  styleUrls: ['./tabladestinatarios.component.scss']
})
export class TabladestinatariosComponent implements OnInit {

  @Input() idCliente = ""
  @Input() nuevocliente = false
  @Output() asociarNuevoClienteEvent = new EventEmitter<any>()
  @Output() enviarDestinatariosEvent = new EventEmitter<any>()
  public selectedOption = 10;
  public searchValue = '';

  public destinatarios: any[] = [];
  public data: any[] = [];
  public rows: any[] = [];

  public ColumnMode = ColumnMode;
  public guardarDestinatario = false
  public destinatarioValido = false
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };

  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private _clienteService: ClienteService,
    private _selectFormatService: SelectFormatService,
    public modalService: NgbModal) { }

  ngOnInit(): void {
    this.rows = []
    this.page.count = 0
    this.loadPage();
  }
  filterUpdate(event) {
    this.page.offset = 0;
    this.loadPage();
  }
  loadPage() {
    if (!this.nuevocliente) {
      this._clienteService.getDestinatariosCliente(this.page.offset + 1, this.page.size, this.idCliente, this.searchValue)
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
      text: `Se eliminará del cliente al destinatario ${dxc.expand.destinatario.nombre} `,
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
        if (this.nuevocliente) {
          let iddest = dxc.expand.destinatario.id
          this.eliminarDestinatarioNuevoCliente(iddest)
        }
        else {
          this.eliminarDestinatario(id)
        }

      }
    });
  }
  eliminarDestinatarioNuevoCliente(id: string) {
    
    this.destinatarios = this.destinatarios.filter(d => d.id != id)
    
    
    this.rows = []
    for (let i = 0; i < this.destinatarios.length; i++) {
      let d = this.destinatarios[i]
      let fila = {
        id: this._selectFormatService.getRandomId(),
        destinatario: d.id,
        expand: {
          destinatario: { ...d }
        }

      }
      this.rows.push(fila)
    }

    this.page.count = this.destinatarios.length


    this.enviarDestinatariosEvent.emit(this.destinatarios)
  }
  eliminarDestinatario(id: string) {
    this._clienteService.delDestinatarioFromCliente(id)
      .then(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Destinatario eliminado exitosamente.',
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
            text: "No fue posible eliminar el destinatario seleccionado",
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
    this.modalService.open(content,
      {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      }
    )
  }
  cerrarModal(modal) {
    this.loadPage()
    modal.close('Cerrar modal')
  }
  asociarNuevoCliente(dest) {
    this.destinatarios.push(dest)
    this.rows = []
    for (let i = 0; i < this.destinatarios.length; i++) {
      let d = this.destinatarios[i]
      let fila = {
        id: this._selectFormatService.getRandomId(),
        destinatario: d.id,
        expand: {
          destinatario: { ...d }
        }

      }
      this.rows.push(fila)
    }

    this.page.count = this.destinatarios.length


    this.asociarNuevoClienteEvent.emit(dest)
  }
}
