import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ChoferService } from '../servicios/chofer.service';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listachoferes',
  templateUrl: './listachoferes.component.html',
  styleUrls: ['./listachoferes.component.scss']
})

export class ListachoferesComponent implements OnInit,OnDestroy {

  //Trigers
  
  private searchTrigger$ = new Subject<any>();
  private destroy$ = new Subject<any>();
  choferes = []
  public searchValue = '';
  public ColumnMode = ColumnMode;
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(private _choferService : ChoferService) { }

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
    this._choferService.getChoferes(this.page.size, this.page.offset + 1, this.searchValue )
      .subscribe((data: any) => {
        this.choferes = data.items; 
        this.page.count = data.totalItems; 
      });
  }
  filterUpdateKeyUp(event){
    this.searchTrigger$.next()
    //this.filterUpdate(event)
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
  
  ConfirmDeleteOpen(id) {
    let chof = this.choferes.filter(c=>c.id==id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará el chofer ${chof.nombre}`,
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
        this.eliminarChofer(id)
      }
    });
  }
  eliminarChofer(id:string){
    this._choferService.eliminarChofer(id)
    .subscribe(
      data => {

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Chofer eliminado exitosamente.',
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
          text: "No fue posible eliminar el chofer seleccionado",
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }

        });
      }
    );
  }
  ngOnDestroy(): void {

    this.destroy$.next()
    this.destroy$.complete()
  }
}
