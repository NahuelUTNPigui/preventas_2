import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ClienteService } from '../cliente.service';
import { RemitenteService } from '../../remitente/remitente.service';
@Component({
  selector: 'app-tablaremitentes',
  templateUrl: './tablaremitentes.component.html',
  styleUrls: ['./tablaremitentes.component.scss']
})
export class TablaremitentesComponent implements OnInit {

  @Input() idCliente = ""
  @Input() nuevocliente = false

  public selectedOption = 10;
  public searchValue = '';

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
    private _remitenteService: RemitenteService,
    public modalService: NgbModal) { }

  ngOnInit(): void {
    this.loadPage();
  }
  filterUpdate(event) {
    this.page.offset = 0;
    this.loadPage();
  }
  loadPage() {
    this._clienteService.getRemitentesCliente(this.page.offset + 1, this.page.size, this.idCliente, this.searchValue)
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
  ConfirmDeleteOpen(id: string) {
    let rxc = this.rows.filter(r => r.id == id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará al cliente el remitente ${rxc.expand.remitente.nombre}`,
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
        this.eliminaRemitente(id)
      }
    });
  }
  eliminaRemitente(id: string) {
    //No es eliminar remitente, es eliminar remitente por destinatario
    this._clienteService.delRemitenteFromCliente(id)
      .then(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remitente eliminado exitosamente.',
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
            text: "No fue posible eliminar el Remitente seleccionado",
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
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    })
  }
  cerrarModal(modal) {
    this.loadPage()
    modal.close('Cerrar modal')
  }

}
