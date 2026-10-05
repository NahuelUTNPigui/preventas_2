import { Component, OnInit,ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { FormUtils } from '../../common/classes/form-utils';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { FormGroup, AbstractControl, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import { LocalidadService } from '../localidad.service';
@Component({
  selector: 'app-provincia',
  templateUrl: './provincia.component.html',
  styleUrls: ['./provincia.component.scss']
})
export class ProvinciaComponent implements OnInit {
  // public
  public urlLastValue;
  public accion: string;
  public url = this.router.url;
  public sidebarToggleRef = false;

  public provincia;
  public provinciaForm: FormGroup;
  public nombre = ""
  public guardado = false
  public nombreValido = false

  // Para la tabla
  public selectedOption = 100;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  page = {
    size: 50, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // private
  private _unsubscribeAll: Subject<any>;


  /**
   * Constructor
   *
   * @param {Router} router
   * @param {LocalidadService} _localidadService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(
    private router: Router,
    private _localidadService: LocalidadService,
    private _coreSidebarService: CoreSidebarService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this._unsubscribeAll = new Subject();
    this.accion = this.url.split('/')[3]
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }


  ngOnInit(): void {
    if(this.urlLastValue != '0'){
      this._localidadService.getProvinciaID(this.urlLastValue).subscribe(res=>{
        this.nombre = res.nombre
      })
      this.nombreValido = true
      this.loadPage()
    }
  }

  cambioNombreProvincia() {
    if (this.nombre != "") {
      this.nombreValido = true
    }
    else {
      this.nombreValido = false
    }
  }
  onSubmit(valid) {
    this.guardado = true;
    if (!valid) {
      return;
    }
    if (this.accion === 'add')
      this.agregarProvincia()
    else
      this.modificarProvincia()
  }

  modificarProvincia() {
    this._localidadService.modProvincia(this.nombre, this.urlLastValue).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Provincia modificada exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }

      });

      this.router.navigate([`/localidades/listaprovincias`]);
    },
      error => {
        this.guardado = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible modificar el proveedor',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
      }
    );
  }
  agregarProvincia() {
    this._localidadService.addProvincia(this.nombre).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Provincia creada exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });

      this.router.navigate([`/localidades/listaprovincias`]);
    },
      error => {
        this.guardado = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible crear la provincia',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
      }
    )
  };
  
  //Para la tabla
  loadPage() {
    this._localidadService.getLocalidadProvinciaPaginacion(this.page.size, this.page.offset + 1,this.urlLastValue, this.searchValue)
      .subscribe((data: any) => {
    
        this.rows = data.items;
        this.page.count = data.totalItems;
      });
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
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
}

