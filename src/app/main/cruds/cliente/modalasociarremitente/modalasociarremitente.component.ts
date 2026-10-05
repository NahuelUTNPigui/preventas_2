import { Component, OnInit,Input,ViewChild } from '@angular/core';
import { ClienteService } from '../cliente.service';
import { ColumnMode, DatatableComponent, id } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-modalasociarremitente',
  templateUrl: './modalasociarremitente.component.html',
  styleUrls: ['./modalasociarremitente.component.scss']
})
export class ModalasociarremitenteComponent implements OnInit {
  @Input() cliente = '';
  @Input() nuevocliente = false
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

  constructor(private _clienteService:ClienteService) { }

  ngOnInit(): void {
    //this._clienteService.todosRemitentesNoCliente(this.cliente,this.searchValue).then(res=>{
    //  this.data = res;
    //  this.page.count = res.length
    //  this.loadPage();
    //})
  }
  filterUpdate(event) {
    this.page.offset = 0;
    this._clienteService.todosRemitentesNoCliente(this.cliente,this.searchValue).then(res=>{
      this.data = res;
      this.page.count = res.length
      this.loadPage();
    })
  }
  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset +1 ) , this.page.count)
    this.rows = []
    for(let i = min_i ;i<max_i;i++){
      this.rows.push(this.data[i])
    }
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  ConfirmarGuardarRemitente(id) {
    Swal.fire({
      title: ' Seleccionar remitente',
      text: "¿Desea guardar el remitente?",
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
        this.guardarCliente(id)
      }
    });
  }
  guardarCliente(id: string) {
    this._clienteService.addClienteRemitente(id,this.cliente)
      .subscribe(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Remitente guardado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          this._clienteService.todosRemitentesNoCliente(this.cliente,this.searchValue).then(res=>{
            this.data = res;
            this.page.count = res.length
            this.loadPage();
          })
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "No fue posible guardar el cliente seleccionado",
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });

        }
      );
  }



  

}
