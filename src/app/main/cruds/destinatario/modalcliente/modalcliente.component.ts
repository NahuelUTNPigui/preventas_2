import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { DestinatarioService } from '../destinatario.service';
import { Router } from '@angular/router';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-modalcliente',
  templateUrl: './modalcliente.component.html',
  styleUrls: ['./modalcliente.component.scss']
})
export class ModalclienteComponent implements OnInit {

  @Input() destinatario = '';
  @Input() nuevodestinatario = false
  @Output() clienteEvent = new EventEmitter<any>();
  @Output() recargarClientesEvent = new EventEmitter<any>();
  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;
  /**
   * Constructor
   *add
   * @param {DestinatarioService} _destinatarioService
   */
  constructor(
    private router: Router,
    private _destinatarioService: DestinatarioService) {
  }
  ngOnInit(): void {
    this._destinatarioService.todosClientesDestinatario(this.destinatario, this.searchValue).then(res => {
      this.data = res;
      this.page.count = res.length
      this.loadPage();
    })

  }
  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    this.page.offset = 0;
    this._destinatarioService.todosClientesDestinatario(this.destinatario, this.searchValue).then(res => {
      this.data = res;
      this.page.count = res.length
      this.loadPage();
    })
  }
  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset + 1), this.page.count)
    this.rows = []
    for (let i = min_i; i < max_i; i++) {
      this.rows.push(this.data[i])
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
  ConfirmGuardarCliente(id) {
    Swal.fire({
      title: 'Seleccionar cliente',
      text: "¿Desea guardar el cliente?",
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
          
          this.guardarClienteNuevoDest(id)
        }
        else {
          
          this.guardarCliente(id)
        }

      }
    });
  }
  guardarClienteNuevoDest(id) {
    let idx_c = this.rows.findIndex(c => c.id == id)
    if (idx_c != -1) {
      let cliente = this.rows[idx_c]
      this.clienteEvent.emit(cliente)
    }
  }
  guardarCliente(id: string) {
    this._destinatarioService.addClienteDestinatario(this.destinatario, id)
      .subscribe(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Cliente guardado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          this._destinatarioService.todosClientesDestinatario(this.destinatario, this.searchValue).then(res => {
            this.data = res;
            this.page.count = res.length
            this.loadPage();
            this.recargarClientesEvent.emit({})
          })
          
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "No fue posible guardar el cliente seleccionado",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });

        }
      );
  }
}
