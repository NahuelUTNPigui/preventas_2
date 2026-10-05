import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { TarifarioService } from '../tarifario.service';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-tarproveedores',
  templateUrl: './tarproveedores.component.html',
  styleUrls: ['./tarproveedores.component.scss']
})
export class TarproveedoresComponent implements OnInit,OnDestroy {
  //triggers
    private searchTrigger$ = new Subject<any>();
  private destroy$ = new Subject<any>();
  
  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  public page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private _tarifarioService:TarifarioService
  ) { 
    if(localStorage.getItem("pagtarprov")==null){
      localStorage.setItem("pagtarprov",JSON.stringify(this.page)) 
    }
    else{
      let stringpage = localStorage.getItem("pagtarprov")
      this.page = JSON.parse(stringpage)
    }

    if(localStorage.getItem("searchtarprov")==null){
      localStorage.setItem("searchtarprov",JSON.stringify(this.searchValue)) 
    }
    else{
      let stringpage = localStorage.getItem("searchtarprov")
      this.searchValue = JSON.parse(stringpage)
    }
  }

  ngOnInit(): void {
    this.searchTrigger$.pipe(
      
      debounceTime(200),
      takeUntil(this.destroy$)
    ).subscribe(()=>{
      this.filterUpdate({})
    })
    this.loadPage()
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    localStorage.setItem("pagtarprov",JSON.stringify(this.page)) 
    this.loadPage()
  }
  loadPage() {
    this._tarifarioService.getTarifariosProveedores(this.page.size,this.page.offset + 1,this.searchValue).subscribe(res=>{
      this.rows = res.items
      this.page.count = res.totalItems
    })
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    localStorage.setItem("pagtarprov",JSON.stringify(this.page)) 
    this.loadPage();
  }
  filterUpdateKeyUp(event){
    this.searchTrigger$.next()

  }
  filterUpdate(event) {
    this.page.offset = 0;
    localStorage.setItem("searchtarprov",JSON.stringify(this.searchValue)) 
    this.loadPage();
  }
  ConfirmDeleteOpen(id) {
    let tar = this.rows.filter(t=>t.id == id)[0]
    let html = `
    <p>Se eliminará la tarifa de cliente ${tar.expand.proveedor.nombre}</p>
    <p>${tar.descripcion}</p>
  `
    Swal.fire({
      title: '¿Eliminar?',
      //text: `Se eliminará la tarifa del proveedor ${tar.expand.proveedor.nombre}`,
      html,
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
        this.eliminarTarifario(id)
      }
    });
  }

  eliminarTarifario(id:string){
    this._tarifarioService.delTarifarioProveedor(id)
      .subscribe(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Tarifario proveedor eliminado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          this.loadPage();
        }
      );
  }
  exportarTarifarioVigente(){
    this._tarifarioService.getTodosTarifariosProveedores(this.searchValue).then(res=>{
      let tarifariocompleto = res
      let tarifario = []
      let tarifariomap = {}
      for(let i = 0;i<tarifariocompleto.length;i++){
        let fila = tarifariocompleto[i]
        let proveedor = fila.expand.proveedor.nombre
        let unidad  = fila.expand.unidad.nombre
        let desc = fila.descripcion
        if(tarifariomap[proveedor]){
          if(tarifariomap[proveedor][unidad]){
            if(!tarifariomap[proveedor][unidad][desc]){
              tarifario.push(fila)
              tarifariomap[proveedor][unidad][desc]={fila}
            }
          }
          else{
            tarifariomap[proveedor][unidad] = {}
            tarifariomap[proveedor][unidad][desc]={
              fila
            }
            tarifario.push(fila)
          }
        }
        else{
          tarifariomap[proveedor] = {}
          tarifariomap[proveedor][unidad] = {}
          tarifariomap[proveedor][unidad][desc]={
              fila
          }
          tarifario.push(fila)
        }  
      }

      let csvData = tarifario.map(item=>({
        PROVEEDOR : item.expand.proveedor.nombre,
        FECHADESDE:item.fechadesde,
        FECHAHASTA:item.fechahasta,
        PRECIO:item.precio,
        UNIDAD:item.expand.unidad.nombre,
        DESCRIPCION:item.descripcion
      }))
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(csvData);
      XLSX.utils.book_append_sheet(wb, ws, 'Tarifario vigente');
      XLSX.writeFile(wb, `Tarifario Vigente proveedores.xlsx`);
    })
    
  }
ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
