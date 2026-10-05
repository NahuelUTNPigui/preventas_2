import { Component, OnInit, OnDestroy, ViewChild  } from '@angular/core';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { LocalidadService } from '../localidad.service';
@Component({
  selector: 'app-listaprovincias',
  templateUrl: './listaprovincias.component.html',
  styleUrls: ['./listaprovincias.component.scss']
})
export class ListaprovinciasComponent implements OnInit {

  public selectedOption = 100;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  page = {
    size: 100, // Tamaño de la página
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
   * @param {LocalidadService} _localidadService
   */
  constructor(
    private _localidadService: LocalidadService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
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
    this._localidadService.getProvinciasPaginacion(this.page.size, this.page.offset + 1, this.searchValue)
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
  ConfirmDeleteOpen(id) {
    let provincia = this.rows.filter(p=>p.id==id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará la provincia ${provincia.nombre}.`,
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
        this.eliminarProvincia(id)
      }
    });
  }
  eliminarProvincia(id: string) {
    this._localidadService.borrarProvincia(id)
      .subscribe(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Provincia eliminada exitosamente.',
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
            text: "No fue posible eliminar el proveedor seleccionado",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });

        }
      );
  }

}
