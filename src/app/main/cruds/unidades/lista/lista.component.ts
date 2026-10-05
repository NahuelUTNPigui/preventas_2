import { Component, OnInit,ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreConfigService } from '@core/services/config.service';
import Swal from 'sweetalert2';
import { UnidadesService } from '../unidades.service';
@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {
  // public
  public data: any;
  // public selectedOption = 10;
  public currentPage = 1;

  public ColumnMode = ColumnMode;

  public success = false;
  public loading = false;
  public error = '';

  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;
  
  // private
  public rows;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };


  constructor(
    private _unidadesService:UnidadesService
  ) { }

  ngOnInit(): void {
    this.loadPage()
  }
  loadPage(){
    this._unidadesService.getUnidades().subscribe(res=>{
      this.rows = res.items
      this.page.count = res.items.length
      this.page.size = res.items.length
    })
  }
  ConfirmDeleteOpen(id) {
    let unidad = this.rows.filter(u => u.id == id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará la unidad ${unidad.nombre}.`,
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
  async eliminarRegistro(id) {
    this.loading = true;
    this._unidadesService.delUnidad(id)
      .subscribe(
        data => {
          this.success = true;
          this.error = '';
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Unidad eliminada exitosamente.',
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
            text: "No fue posible eliminar la unidad",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });

        }
      );
  }
  

}
