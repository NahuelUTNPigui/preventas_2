import { Component, OnDestroy, OnInit,ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { DestinatarioService } from '../destinatario.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-listadestinatarios',
  templateUrl: './listadestinatarios.component.html',
  styleUrls: ['./listadestinatarios.component.scss']
})
export class ListadestinatariosComponent implements OnInit,OnDestroy {
  //Triggers
  private searchTrigger$ = new Subject<any>();
  private destroy$ = new Subject<any>();

  public selectedOption = 10;
  public searchValue = '';
  public direccion = '';
  
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  workbook:any = null
  page = {
    size: 10, // Tamaño de la página
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
   * @param {DestinatarioService} _destinatarioService
   */
  constructor(
    private _destinatarioService: DestinatarioService,
    private modalService: NgbModal
  ) {
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
  filterUpdateKeyUp(event){
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
    this._destinatarioService.getDestinatarioPaginacion(this.page.size, this.page.offset + 1, this.searchValue,this.direccion)
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
    let dest = this.rows.filter(d=>d.id==id)[0]

    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará el destinatario ${dest.nombre}.`,
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
        this.eliminarDestinatario(id)
      }
    });
  }
  eliminarDestinatario(id: string) {
    this._destinatarioService.delDestinatario(id)
      .subscribe(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Destinatario eliminado exitosamente.',
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
            text: "No fue posible eliminar el destinatario seleccionado",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });

        }
      );
  }
  exportarXLSX(){
    this._destinatarioService.todosDestinatarios().then(dests=>{
      
      let csvdata = dests.map(item=>({
        ID:item.id,
        NOMBRE:item.nombre,
        OBSERVACION:item.observacion,
        HORARIOS:item.horarios,
        DIRECCION:item.direccion,
        LOCALIDAD:item.expand.localidad.nombre,
        ZONA:""
      }))
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `Destinatarios`, s: {} };
      const range = XLSX.utils.decode_range('A1:D1');
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'Destinatarios');
      XLSX.writeFile(wb, `destinatarios.xlsx`, { cellStyles: true });
    }) 
    
  }
  modalImportarOpen(modalImportar){
    this.modalService.open(modalImportar, {
      centered: true,
      size: 'md',
      windowClass: 'modal modal-primary'
    });
  }
  leerArchivo(event){
    
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        this.workbook = workbook
    };
    reader.readAsArrayBuffer(file);
  }
  formatoXLSX(){
    let csvdata = [
        {id:"",
          nombre:"",
          observacion:"",
          horarios:"",
          direccion:"",
          expand:{
            localidad:{
              nombre:""
            }
          }
        }
      ].map(item=>({
        ID:item.id,
        NOMBRE:item.nombre,
        OBSERVACION:item.observacion,
        HORARIOS:item.horarios,
        DIRECCION:item.direccion,
        LOCALIDAD:item.expand.localidad.nombre,
        ZONA:""
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    ws['A1'] = { t: 's', v: `Formato Destinatarios`, s: {} };
    const range = XLSX.utils.decode_range('A1:D1');
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Formato destinatario');
    XLSX.writeFile(wb, `formato-destinatarios.xlsx`, { cellStyles: true });
  }
  importarXLSX(){
    let ids = []
    let zonas = []
    let destinatarios = this.workbook.Sheets.Destinatarios
    let i = 0
    for (const [key, value ] of Object.entries(destinatarios)) {
      if(i == 0){
        i += 1
        continue
      }
      const firstLetter = key.charAt(0);  // Get the first character
      const tail = key.slice(1);
      if(firstLetter=="A" && key!="A1" && key !="A2" ){
        let fila:any = value
        ids.push(fila.v)
        zonas.push(destinatarios["G"+tail].v)
      } 
    }
    this._destinatarioService.putZonaMasivo(ids,zonas).then(res=>{
      Swal.fire({
        title: 'Zonas destinatarios',
        text: `Se pudieron guardar las zonas con éxito.`,
        icon: 'success',
        
      })
    })
  }

}
