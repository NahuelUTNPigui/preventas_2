import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreConfigService } from '@core/services/config.service';
import Swal from 'sweetalert2';
import { RemitenteService } from '../remitente.service';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-remitente-list',
  templateUrl: './remitente-list.component.html',
  styleUrls: ['./remitente-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemitenteListComponent implements OnInit, OnDestroy {
  //trigger
  private searchTrigger$ = new Subject<any>();
  private destroy$ = new Subject<any>();
  // public
  public data: any;
  // public selectedOption = 10;
  public currentPage = 1;

  public ColumnMode = ColumnMode;

  public success = false;
  public loading = false;
  public error = '';

  public searchValue = '';

  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // private
  private _unsubscribeAll: Subject<any>;
  public rows;
  public tempFilterData;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  /**
   * Constructor
   *add
   * @param {CoreConfigService} _coreConfigService
   * @param {CalendarService} _calendarService
   * @param {RemitenteService} _remitenteService
   */
  constructor(private _remitenteService: RemitenteService, private _coreConfigService: CoreConfigService,
    private _router: Router, private route: ActivatedRoute) {
    this._unsubscribeAll = new Subject();
  }
  filterUpdateKeyUp(event) {
    this.searchTrigger$.next()

  }
  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    this.page.offset = 0;
    this.loadPage();
  }
  async eliminarRegistro(id) {
    this.loading = true;
    this._remitenteService.deleteRemitente(id)
      .subscribe(
        data => {
          this.success = true;
          this.error = '';
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remitente eliminado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          this.loadPage()
        },
        error => {
          this.error = error;
          this.success = false;
          this.loading = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "No fue posible eliminar el remitente",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });

        }
      );
  }
  ConfirmDeleteOpen(id) {
    let rem = this.rows.filter(r => r.id == id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará al remitente ${rem.nombre}.`,
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
        this.eliminarRegistro(id)
      }
    });
  }
  ngOnInit(): void {
    this.searchTrigger$.pipe(

      debounceTime(200),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.filterUpdate({})
    })
    this.loadPage();
  }

  loadPage() {
    this._remitenteService.getRemitentes(this.page.size, this.page.offset + 1, this.searchValue)
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
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    this.destroy$.next()
    this.destroy$.complete()
  }
  async exportarXLSX() {
    let remitentes = await this._remitenteService.getTodosRemitentes(this.searchValue)

    let csvdata = remitentes.map(item => ({
      NOMBRE: item.nombre,
      OBSERVACION: item.observacion,
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    ws['A1'] = { t: 's', v: `Remitentes`, s: {} };
    const range = XLSX.utils.decode_range('A1:D1');
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Remitentes');
    XLSX.writeFile(wb, `Remitentes.xlsx`, { cellStyles: true });
  }

}
