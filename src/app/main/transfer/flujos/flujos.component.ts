import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { TransferService } from '../transfer.service';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { SelectFormatService } from 'app/main/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-flujos',
  templateUrl: './flujos.component.html',
  styleUrls: ['./flujos.component.scss']
})
export class FlujosComponent implements OnInit {
  public conpermisos = false
  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  public total = 0
  public clientes =[]
  public proveedores =[]
  public sonIngresos = [{id:0,nombre:"Todos"},{id:1,nombre:"Ingresos"},{id:2,nombre:"Egresos"}]
  //filtros
  public fechaDesde = ""
  public fechaHasta = ""
  public cliente = ""
  public proveedor = ""
  public esIngresoId = 0
  //Transaccion
  public id = ""
  public fecha = ""
  public importe = 0
  public transcliente = ""
  public transproveedor = ""
  public esIngreso = true
  public opcionesIngreso = [{value:true,nombre:"Ingreso"},{value:false,nombre:"Egreso"}]
  //Validaciones
  public botonhabilitado = false
  public malfecha = false
  public malcliente = false

  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };

  constructor(
    public _transferService : TransferService,
    private _filtroService:FiltrosService,
    private _selectService:SelectFormatService,
    private modalService: NgbModal
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
   }

  ngOnInit(): void {
    this._selectService.getTodosClientes().then(res=>{
      this.clientes = res
    })
    this._selectService.getTodosProveedores().then(res=>{
      this.proveedores = res
    })
    let filtro = this._filtroService.getFiltro(this._filtroService.FLUJOS())
    this.fechaDesde = filtro.fechaDesde
    this.fechaHasta = filtro.fechaHasta
    this.cliente = filtro.cliente
    this.proveedor = filtro.proveedor
    this.esIngresoId = filtro.tipo
    this.loadPage()
  }
  loadPage(){
    this._transferService.getFlujos(
      this.page.offset+1,
      this.page.size,
      this.fechaDesde,
      this.fechaHasta,
      this.cliente,
      this.proveedor,
      this.esIngresoId
    ).subscribe(res=>{
      this.rows = res.items
      this.page.count = res.totalItems
    })

  }
  onPage(event:any){
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  filterUpdate(event){
    this._filtroService.setItemFiltro(this._filtroService.FLUJOS(),"fechaDesde",this.fechaDesde)
    this._filtroService.setItemFiltro(this._filtroService.FLUJOS(),"fechaHasta",this.fechaHasta)
    this._filtroService.setItemFiltro(this._filtroService.FLUJOS(),"cliente",this.cliente)
    this._filtroService.setItemFiltro(this._filtroService.FLUJOS(),"proveedor",this.proveedor)
    this._filtroService.setItemFiltro(this._filtroService.FLUJOS(),"tipo",this.esIngresoId)
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  crearArchivoXLSX(lista){
    let csvdata = lista.map(item=>({
      FECHA:new Date(item.fecha).toLocaleDateString(),
      IMPORTE:item.importe,
      CLIENTE:item.expand.cliente.nombre
    }))
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvdata);
    let c = this.clientes.filter(cl=>cl.id==this.cliente)[0]
    let p = this.proveedores.filter(pro=>pro.id==this.proveedor)[0]
    const wsFilters = XLSX.utils.aoa_to_sheet([
      ['Filtro', 'Valor'],
      ['Fecha desde', this.fechaDesde],
      ['Fecha hasta', this.fechaHasta],
      ['Cliente',c?c.nombre:""],
      ['Proveedor',p?p.nombre:""],
      ['Ingreso',[{id:0,nombre:"Todos"},{id:1,nombre:"Ingresos"},{id:2,nombre:"Egresos"}].filter(item=>item.id==this.esIngresoId)[0].nombre]
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
    XLSX.utils.book_append_sheet(wb, wsFilters, 'Filtros aplicados');
    XLSX.writeFile(wb, 'Transacciones.xlsx');
  }
  exportarXLSX(){
    this._transferService.getAllflujos(
      this.fechaDesde,
      this.fechaHasta,
      this.cliente,
      this.proveedor,
      this.esIngresoId
    ).then(res=>{
      this.crearArchivoXLSX(res)
    })
  }
  limpiarFiltros(){
    this._filtroService.limpiarFiltro(this._filtroService.FLUJOS())
    this.page.offset = 0
    let filtro = this._filtroService.getFiltro(this._filtroService.FLUJOS())
    this.fechaDesde = filtro.fechaDesde
    this.fechaHasta = filtro.fechaHasta
    this.cliente = filtro.cliente
    this.proveedor = filtro.proveedor
    this.loadPage()
  }
  calcularTotal(){
    this.total = 0
    this._transferService.getAllflujos(
      this.fechaDesde,
      this.fechaHasta,
      this.cliente,
      this.proveedor,
      this.esIngresoId
    ).then(res=>{
      this.total = res.reduce(
        (acumulador,item)=>{
          return acumulador + (item.ingreso ? 1: -1) * item.importe
        },
        0
      )
    })
  }
  ConfirmDeleteOpen(id){
    let flujo = this.rows.filter(t=>t.id==id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará la transaccion de fecha ${new Date(flujo.fecha).toLocaleDateString()}. Puede que haya cobros asociados`,
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
        this.eliminarFlujo(id)
      }
    });
  }
  eliminarFlujo(id){
    this._transferService.delFlujo(id).subscribe(res=>{
    Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Transacción eliminada exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.loadPage();
    })
  }
  validarBoton(){
    this.botonhabilitado = true
    
    if(this.fecha == ""){
      this.botonhabilitado = false
    }
  }
  validarCampo(campo){
    this.validarBoton()
    
    if(campo == "FECHA"){
      if(this.fecha == ""){
        this.malfecha = true
      }
      else{
        this.malfecha = false
      }
    }
  }
  addFlujo(){
    this._transferService.addFlujo(
      this.fecha,
      this.transcliente,
      this.transproveedor,
      this.importe,
      this.esIngreso
    ).subscribe(res=>{
      
      Swal.fire("Éxito guardar","Se logro guardar la transaccion","success")
      this.modalService.dismissAll('Cross click')
      this.loadPage()
    })
    
  }
  modFlujo(){
    this._transferService.modFlujo(this.id,this.fecha,
      this.transcliente,this.transproveedor,
      this.importe).subscribe(res=>{
        Swal.fire("Éxito modificar","Se logro modificar la transacción","success")
        this.modalService.dismissAll('Cross click')
        this.loadPage()
        
    })
    
  }
  openModal(flujoModal,id){
    this.id = id
    this.malfecha = false
    this.malcliente = false
    if(id == '0'){
      this.botonhabilitado = false
      this.transproveedor = ""
      this.transcliente = ""
      this.fecha = ""
      this.importe = 0
      this.esIngreso = true
    }
    else{
      let trans = this.rows.filter(t=>t.id==id)[0]
      this.transproveedor = trans.proveedor
      this.transcliente = trans.cliente
      this.fecha = trans.fecha.split(" ")[0]
      this.importe = trans.importe
      this.esIngreso = trans.ingreso
      this.botonhabilitado = true
    }

    this.modalService.open(flujoModal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }

}
