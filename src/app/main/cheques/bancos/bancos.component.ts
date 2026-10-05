import { Component, OnInit,ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { ChequesService } from '../cheques.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.scss']
})
export class BancosComponent implements OnInit {
  public conpermisos = false
  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  //datos banco
  public id:string
  public nombre:string
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private _chequeService:ChequesService,
    private modalService: NgbModal
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this.loadPage()
  }
  loadPage(){
    this._chequeService.getBancos(this.page.size, this.page.offset + 1, this.searchValue).subscribe(res=>{
      this.rows = res.items;
      this.page.count = res.totalItems;
    })
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
    let banco = this.rows.filter(b=>b.id==id)[0]
    Swal.fire({
          title: '¿Eliminar?',
          text: `Se eliminará el banco ${banco.nombre}.`,
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
            this.eliminarBanco(id)
          }
    });
  }
  eliminarBanco(id: string) {
    this._chequeService.deleteBanco(id).subscribe(res=>{
      Swal.fire("Éxito eliminar","Se pudo eliminar el banco","success")
      this.loadPage()
    })
  }
  addBanco(){
    this._chequeService.addBanco(this.nombre).subscribe(res=>{
      Swal.fire("Éxito guardar","Se pudo guardar el banco","success")
      this.modalService.dismissAll('Cross click')
      this.loadPage()
    })
  }
  modBanco(){
    this._chequeService.modBanco(this.nombre,this.id).subscribe(res=>{
      Swal.fire("Éxito modificar","Se pudo modificar el banco","success")
      this.modalService.dismissAll('Cross click')
      this.loadPage()
    })
  }
  modalOpen(modalBanco,id){
    this.id = id
    if(id=='0'){
      this.nombre = ""
    }
    else{
      let b = this.rows.filter(b=>b.id==id)[0]
      this.nombre = b.nombre
    }
    this.modalService.open(modalBanco, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  closeModal(modalBanco){
    
    this.id = ""
    this.nombre = ""
    
    this.modalService.dismissAll('Cross click')
  }
  exportarXLSX(){
    this._chequeService.getAllBancos().then(res=>{
      let csvdata = res.map(item=>({
        NOMBRE:item.nombre,
      }))
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `Bancos`, s: {} };
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'Bancos');
      XLSX.writeFile(wb, `bancos.xlsx`, { cellStyles: true });
    })
  }

}
