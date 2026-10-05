import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { TransferService } from '../transfer.service';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { SelectFormatService } from 'app/main/common';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {
  public conpermisos = false
  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  public total = 0
  public clientes =[]
  public proveedores = []
  public bancos =[]
  public unidades = []
  public sonIngresos = [{id:0,nombre:"Todos"},{id:1,nombre:"Ingresos"},{id:2,nombre:"Egresos"}]
  //filtros
  public fechaDesde = ""
  public fechaHasta = ""
  public cliente = ""
  public proveedor = ""
  public cbu = ""
  public alias = ""
  public bancoorigen = ""
  public bancodestino = ""
  public unidad = ""
  public esIngresoId = 0
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };

  constructor(
    public _transferService : TransferService,
    private _filtroService:FiltrosService,
    private _selectService:SelectFormatService
  ) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
   }

  ngOnInit(): void {
    this._selectService.getAllBancos().then(res=>{
      this.bancos = res
    })
    this._selectService.getTodosClientes().then(res=>{
      this.clientes = res
    })
    this._selectService.getTodosProveedores().then(res=>{
      this.proveedores = res
    })
    this.unidades = this._selectService.getCuentas()
    let filtro = this._filtroService.getFiltro(this._filtroService.TRANSFER())
    this.fechaDesde = filtro.fechaDesde
    this.fechaHasta = filtro.fechaHasta
    this.cliente = filtro.cliente
    this.proveedor = filtro.proveedor
    this.cbu = filtro.cbu
    this.alias = filtro.alias
    this.bancoorigen = filtro.bancoorigen
    this.bancodestino = filtro.bancodestino
    this.unidad = filtro.unidad
    this.esIngresoId = filtro.tipo
    this.loadPage()
  }
  loadPage(){
    this._transferService.getTransfers(
      this.page.offset + 1,
      this.page.size,
      this.fechaDesde,
      this.fechaHasta,
      this.cliente,
      this.proveedor,
      this.cbu,this.alias,this.bancoorigen,this.bancodestino,
      this.unidad,
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
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"fechaDesde",this.fechaDesde)
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"fechaHasta",this.fechaHasta)
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"cliente",this.cliente)
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"proveedor",this.proveedor)
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"cbu",this.cbu)
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"alias",this.alias)
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"bancoorigen",this.bancoorigen)
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"bancodestino",this.bancodestino)
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"unidad",this.unidad)
    this._filtroService.setItemFiltro(this._filtroService.TRANSFER(),"tipo",this.esIngresoId)
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  crearArchivoXLSX(lista){
    let csvdata = lista.map(item=>({
      FECHA:new Date(item.fecha).toLocaleDateString(),
      IMPORTE:item.importe,
      CLIENTE:item.expand.cliente.nombre,
      ALIAS:item.alias,
      CBU:item.cbu,
      BANCOORIGEN:item.expand.bancoorigen.nombre,
      BANCODESTINO:item.expand.bancodestino.nombre,
      UNIDAD:item.unidad
    }))
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(csvdata);
    let c = this.clientes.filter(cl=>cl.id==this.cliente)[0]
    let p = this.proveedores.filter(pro=>pro.id==this.proveedor)[0]
    let bo = this.bancos.filter(ba=>ba.id==this.bancoorigen)[0]
    let bd = this.bancos.filter(ba=>ba.id==this.bancodestino)[0]
    const wsFilters = XLSX.utils.aoa_to_sheet([
      ['Filtro', 'Valor'],
      ['Fecha desde', this.fechaDesde],
      ['Fecha hasta', this.fechaHasta],
      ['Unidad', this.unidad],
      ['Banco origen', bo?bo.nombre:""],
      ['Banco destino', bd?bd.nombre:""],
      ['Cliente',c?c.nombre:""],
      ['Proveedor',p?p.nombre:""],
      ['Alias', this.alias],
      ['CBU', this.cbu],
      ['Ingreso',[{id:0,nombre:"Todos"},{id:1,nombre:"Ingresos"},{id:2,nombre:"Egresos"}].filter(item=>item.id==this.esIngresoId)[0].nombre]

    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Transaferencias');
    XLSX.utils.book_append_sheet(wb, wsFilters, 'Filtros aplicados');
    XLSX.writeFile(wb, 'Transaferencias.xlsx');
  }
  exportarXLSX(){
    this._transferService.getAllTransfer(
      this.fechaDesde,
      this.fechaHasta,
      this.cliente,
      this.proveedor,
      this.cbu,this.alias,this.bancoorigen,this.bancodestino,
      this.unidad,
      true
    ).then(res=>{
      this.crearArchivoXLSX(res)
    })
  }
  limpiarFiltros(){
    this._filtroService.limpiarFiltro(this._filtroService.TRANSFER())
    this.page.offset = 0
    let filtro = this._filtroService.getFiltro(this._filtroService.TRANSFER())
    this.fechaDesde = filtro.fechaDesde
    this.fechaHasta = filtro.fechaHasta
    this.cliente = filtro.cliente
    this.proveedor = filtro.proveedor
    this.cbu = filtro.cbu
    this.alias = filtro.alias
    this.bancoorigen = filtro.bancoorigen
    this.bancodestino = filtro.bancodestino
    this.unidad = filtro.unidad
    this.loadPage()
  }
  calcularTotal(){
    this.total = 0
    this._transferService.getAllTransfer(
      this.fechaDesde,
      this.fechaHasta,
      this.cliente,
      this.proveedor,
      this.cbu,this.alias,this.bancoorigen,this.bancodestino,
      this.unidad,
      this.esIngresoId
    ).then(res=>{
      this.total = res.reduce(
        (acumulador,item)=>acumulador + (item.ingreso ? 1: -1) * item.importe,
        0
      )
    })
  }
  ConfirmDeleteOpen(id){
    let transfer = this.rows.filter(t=>t.id==id)[0]
    Swal.fire({
      title: '¿Eliminar?',
      text: `Se eliminará la transferencia de fecha ${new Date(transfer.fecha).toLocaleDateString()}. Puede que haya cobros asociados`,
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
        this.eliminarTransfer(id)
      }
    });
  }
  eliminarTransfer(id){
    this._transferService.delTrasfer(id).subscribe(res=>{
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Transferencia eliminada exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.loadPage();
    })
  }


}
