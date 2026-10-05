import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CoreConfigService } from '@core/services/config.service';
import { ProveedorService } from '../servicios/proveedor.service';

@Component({
  selector: 'app-listaproveedores',
  templateUrl: './listaproveedores.component.html',
  styleUrls: ['./listaproveedores.component.scss']
})
export class ListaproveedoresComponent implements OnInit, OnDestroy {

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
  //triggers
  private searchTrigger$ = new Subject<any>();
  private destroy$ = new Subject<any>();
  // private
  private _unsubscribeAll: Subject<any>;
  /**
   * Constructor
   *add
   * @param {ProductListService} _productListService
   */
  constructor(
    private _proveedorService: ProveedorService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.searchTrigger$.pipe(
      debounceTime(200),
      takeUntil(this.destroy$),

    ).subscribe(() => {
      this.filterUpdate({})
    })
    this.loadPage();
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.destroy$.next()
    this.destroy$.complete()
  }

  filterUpdateKey(event) {
    this.searchTrigger$.next()
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
    this._proveedorService.getProveedores(this.page.size, this.page.offset + 1, this.searchValue)
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
    let prov = this.rows.filter(p => p.id == id)[0]

    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará el proveedor ${prov.nombre}.`,
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
        this.eliminarProveedor(id)
      }
    });
  }
  async exportarXLSX() {
    let proveedores = await this._proveedorService.getTodosProveedores(this.searchValue)

    let csvdata = proveedores.map(item => ({
      ID: item.id,
      NOMBRE: item.nombre,
      RESPONSABLE: item.responsable ? "Sí" : "No",
      CUIT: item.cuit,
      RAZONSOCIAL: item.razonSocial,
      OBSERVACION: item.observacion,

    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    ws['A1'] = { t: 's', v: `Proveedores`, s: {} };
    const range = XLSX.utils.decode_range('A1:D1');
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    XLSX.writeFile(wb, `Proveedores.xlsx`, { cellStyles: true });
  }
  eliminarProveedor(id: string) {
    this._proveedorService.eliminarProveedor(id)
      .subscribe(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Proveedor eliminado exitosamente.',
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
