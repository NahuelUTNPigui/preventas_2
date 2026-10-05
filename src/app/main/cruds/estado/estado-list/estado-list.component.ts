import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreConfigService } from '@core/services/config.service';

import { EstadoListService } from '../estado.service';

@Component({
  selector: 'app-estado-list',
  templateUrl: './estado-list.component.html',
  styleUrls: ['./estado-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EstadoListComponent implements OnInit, OnDestroy {
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
  private tempData = [];
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
   * @param {EstadoListService} _estadoListService
   */
  constructor(private _estadoListService: EstadoListService, private _coreConfigService: CoreConfigService,
    private _router: Router, private route: ActivatedRoute) {
    this._unsubscribeAll = new Subject();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------
  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    // const val = event.target.value.toLowerCase();

    // const temp = this.tempData.filter(function (d) {
    //   return d.nombre.toLowerCase().indexOf(val) !== -1 || !val;
    // });

    // this.rows = temp;
    this.page.offset = 0;
    this.loadPage();
  }

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage() {
    this._estadoListService.getEstados(this.page.size, this.page.offset + 1, this.searchValue )
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
  }

}
