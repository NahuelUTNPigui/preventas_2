import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CoreConfigService } from '@core/services/config.service';
import { VehiculoService } from '../servicios/vehiculo.service';

@Component({
  selector: 'app-listavehiculos',
  templateUrl: './listavehiculos.component.html',
  styleUrls: ['./listavehiculos.component.scss']
})
export class ListavehiculosComponent implements OnInit, OnDestroy {

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
  //private
  private searchTrigger$ = new Subject<any>()
  private destroy$ = new Subject<any>()

  // private

  private _unsubscribeAll: Subject<any>;
  /**
   * Constructor
   *add
   * @param {ProductListService} _productListService
   */
  constructor(
    private _vehiculoService: VehiculoService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
     this.searchTrigger$.pipe(
      
      debounceTime(200),
      
      takeUntil(this.destroy$)
    ).subscribe(()=>{
      this.filterUpdate({})
    })
    this.loadPage();
  }

  loadPage() {
    this._vehiculoService.getVehiculos(this.page.size, this.page.offset + 1, this.searchValue)
      .subscribe((data: any) => {
        this.rows = data.items;
        this.page.count = data.totalItems;
      });
  }
filterUpdateKeyUp(event) {
  this.searchTrigger$.next()
}
  filterUpdate(event) {
    
    this.page.offset = 0;
    this.loadPage();
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
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

  ConfirmDeleteOpen(id) {
    let veh = this.rows.filter(v=>v.id==id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará el vehiculo ${veh.nombre}.`,
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
        this.eliminarVehiculo(id)
      }
    });
  }
  eliminarVehiculo(id: string) {
    this._vehiculoService.eliminarVehiculo(id)
      .subscribe(
        data => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Vehículo eliminado exitosamente.',
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
            text: "No fue posible eliminar el vehículo seleccionado",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }

          });

        }
      );
  }

}
