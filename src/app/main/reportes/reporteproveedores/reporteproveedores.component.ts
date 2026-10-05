import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../reportes.service';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { SelectFormatService } from 'app/main/common';
import { AGRUPARPOR,SEPARARPOR } from '../reportes.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-reporteproveedores',
  templateUrl: './reporteproveedores.component.html',
  styleUrls: ['./reporteproveedores.component.scss']
})
export class ReporteproveedoresComponent implements OnInit {
  //Permisos
  public conpermisos = false
  // lo demas
  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public dataprocesada : any[];
  public rows: any[];
  public allremitos :any[];
  public estados:any[]
  public formas:any[]
  public provincias:any[]
  public localidades:any[]
  public proveedores:any[]
  public nroRemito = ''
  public ColumnMode = ColumnMode;
  public fechaIngresoDesde = ''
  public fechaIngresoHasta = ''
  public fechaEntregaDesde = ''
  public fechaEntregaHasta = ''
  public porFechaEntrega = false
  public estado = ''
  public formaPago = ''
  public provincia = ''
  public localidad = ''
  public nombreProveedor = ''
  public nombreVehiculo = ''
  public nombreChofer = ''
  public nombreCliente = ''
  public nombreDestinatario = ''
  public nombreRemitente = ''
  
  public confirmado = false
  public reubicado = false
  public facturar = false
  public todos = true
  public total = 0
  public stotal = ""
  public totalkilos = 0
  public stotalkilos = ""
  public maxchars = 80
  public pendienteslen = 0
  public zona = ""
  public agrupador:AGRUPARPOR = AGRUPARPOR.VIAJES
  public separador:SEPARARPOR = SEPARARPOR.DIA
  // Para el reporte
  // Una lista que tenga la siguiente info
  // {name:nombre del cliente, data:el valor}
  public series = []
  // Una lista de fechas con la siguiente info MM/dd/yyyy GMT
  public categories = []
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
    public modalService:NgbModal,
    private _filtroService:FiltrosService,
    private _selectService:SelectFormatService,
    private _reporteService: ReportesService) {
      let user = JSON.parse(localStorage.getItem('currentUser'))
      this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    let filtro = this._filtroService.getFiltro(this._filtroService.REPREMITOSPROVS())
    this._selectService.getTodosProveedores().then(res=>{
      this.proveedores = res
    })
    this._reporteService.todaslocalidades('').then(res=>{
      this.localidades = res
    })
    this._reporteService.todasprovincias().then(res=>{
      this.provincias = res
    })
    this._reporteService.todosestados().then(res=>{
      this.estados = res
    })
    this.nroRemito = filtro.nroRemito
    //Fechas
    this.fechaIngresoDesde = filtro.fechaIngresoDesde
    this.fechaEntregaDesde = filtro.fechaEntregaDesde
    this.fechaIngresoHasta = filtro.fechaIngresoHasta
    // Lo demas
    this.porFechaEntrega = filtro.porFechaEntrega;
    this.nombreProveedor = filtro.nombreProveedor
    this.nombreVehiculo = filtro.nombreVehiculo
    this.nombreChofer = filtro.nombreChofer
    this.nombreCliente =filtro.nombreCliente
    this.nombreDestinatario = filtro.nombreDestinatario
    this.nombreRemitente = filtro.nombreRemitente
    this.provincia = filtro.provincia
    this.localidad = filtro.localidad
    this.estado = filtro.estado
    this.formaPago = filtro.formaPago
    this.todos = filtro.todos
    this.confirmado = filtro.confirmado
    this.reubicado = filtro.reubicado
    this.facturar = filtro.facturar
    this.zona = filtro.zona
    //Reporte
    this._reporteService.reporteRemitos(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona
    ).then(resremitos=>{
        this.data = resremitos.items
        
        this.data.sort((r1,r2)=>new Date(r1.fechaIngreso) < new Date(r2.fechaIngreso) ? 1:-1)
        
        this.calcularTotal()
        this.agruparDatos()
        this.loadPage();
      
    })
    
  }
  formatPeso(value){
    return value.toLocaleString('es-ar', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    });
  }
  formatKilo(value){
    return new Intl.NumberFormat("es-ar", {
      style: "decimal",
      maximumFractionDigits: 0, minimumFractionDigits: 0
    }).format(value);
  }
  limpiarFiltros(){
    this.nroRemito=''
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año,mes,1)
    let ultima_dia_mes = new Date(año,mes+1,0)
    this.fechaIngresoDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaEntregaDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaIngresoHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.fechaEntregaHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.porFechaEntrega =  false
    this.nombreProveedor = ""
    this.nombreVehiculo = ""
    this.nombreChofer = ""
    this.nombreCliente = ""
    this.nombreDestinatario = ""
    this.nombreRemitente = ""
    this.provincia = ""
    this.localidad = ""
    this.estado = ""
    this.formaPago = ""
    this.todos = true
    this.confirmado = false
    this.reubicado = false
    this.facturar = false
    //this._filtroService.limpiarFiltro(this._filtroService.REPREMITOS())
    this.filterUpdate({})
  }
  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"nroRemito",this.nroRemito)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"fechaIngresoDesde",this.fechaIngresoDesde)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"fechaEntregaHasta",this.fechaEntregaHasta)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"fechaIngresoHasta",this.fechaIngresoHasta)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"fechaEntregaDesde",this.fechaEntregaDesde)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"porFechaEntrega",this.porFechaEntrega)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"nombreProveedor",this.nombreProveedor)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"nombreVehiculo",this.nombreVehiculo)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"nombreChofer",this.nombreChofer)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"nombreCliente",this.nombreCliente)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"nombreDestinatario",this.nombreDestinatario)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"nombreRemitente",this.nombreRemitente)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"provincia",this.provincia)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"localidad",this.localidad)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"estado",this.estado)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"formaPago",this.formaPago)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"todos",this.todos)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"confirmado",this.confirmado)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"reubicado",this.reubicado)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"facturar",this.facturar)
    this._filtroService.setItemFiltro(this._filtroService.REPREMITOSPROVS(),"zona",this.zona)
    this.page.offset = 0;
    this.pendienteslen = 0
    this._reporteService.reporteRemitos(
      this.nroRemito,
      this.fechaIngresoDesde,
      this.fechaIngresoHasta,
      this.porFechaEntrega,
      this.fechaEntregaDesde,
      this.fechaEntregaHasta,
      this.nombreProveedor,
      this.nombreVehiculo,
      this.nombreChofer,
      this.nombreCliente,
      this.nombreDestinatario,
      this.nombreRemitente,
      this.provincia,
      this.localidad,
      this.estado==="nopen"?"":this.estado,
      this.formaPago,
      this.todos,
      this.reubicado,
      this.confirmado,
      this.facturar,
      this.zona
    ).then(res=>{
      this.data = res.items
      this.calcularTotal()
      this.agruparDatos()
      this.loadPage();
    })
  }

  loadPage() {
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset +1 ) , this.page.count)
    this.rows = []
    for(let i = min_i ;i<max_i;i++){
      this.rows.push(this.dataprocesada[i])
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
  calcularTotal(){
    let temptotal = 0
    let tempkilos = 0
    for(let i = 0;i<this.data.length;i++){
      temptotal += this.data[i].totalViaje
      tempkilos += this.data[i].kilos
    }
    this.total = temptotal
    this.stotal = this.formatPeso(this.total)
    this.totalkilos = tempkilos
    this.stotalkilos = this.formatKilo(this.totalkilos)

  }
  agruparDatos(){
    
    let contador = {}
    for(let i = 0;i<this.data.length;i++){
      let fila = this.data[i]
      let proveedor = fila.expand.proveedor
      if(!proveedor){
        continue 
      }
      let proveedornombre = proveedor.nombre
      if(contador[proveedornombre]){
        contador[proveedornombre].total+=fila.totalViaje
        contador[proveedornombre].kilos+=fila.kilos
        contador[proveedornombre].bultos+=fila.bultos
      }
      else{
        contador[proveedornombre]={
          nombre:proveedornombre,
          total:fila.totalViaje,
          kilos:fila.kilos,
          bultos:fila.bultos
        }
      }
    }
    //let temp = []  
    this.dataprocesada = []
    Object.entries(contador).forEach(fila=>{
      this.dataprocesada.push(fila[1])
    })
    this.page.count = this.dataprocesada.length
    this.dataprocesada.sort((c1,c2)=>c1.nombre.toUpperCase()>c2.nombre.toUpperCase()?1:-1)
    this.loadPage()
    
  }
  //Modal
  open(content) {
    this.modalService.open(content,{size:'lg'})
  }
  cerrarModal(modal){
    modal.close('Cerrar modal')
    
  }
  piso(numero){
    return Math.round(numero)
  }
  formatDateExcel(fechaString: string, final: boolean) {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const dia = fecha.getUTCDate();
    const mes = fecha.getUTCMonth() + 1;
    const anio = fecha.getUTCFullYear();
    const fechaFormateada = !final ? `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}` : `${(dia - 1).toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
    return fechaFormateada;
  }
  exportarXLX(){
    let csvdata = this.dataprocesada.map(item=>({
      PROVEEDOR:item.nombre,
      TOTAL:item.total,
      KILOS:item.kilos,
      BULTOS:item.bultos
    }))
    let totalreporte = [{TOTALREPORTE:this.total}]
    let totalkilos = [{TOTALKILOS:this.piso(this.totalkilos)}]
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([])
    ws['A1'] = { t: 's', v: `Reporte proveedores`, s: {} };
    const range = XLSX.utils.decode_range('A1:D1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.sheet_add_json(ws,totalreporte,{origin:'F1'})
    XLSX.utils.sheet_add_json(ws,totalkilos,{origin:'H1'})
    
    const wsFilters = XLSX.utils.aoa_to_sheet([
      ['Filtro', 'Valor'],
      ['Fecha ingreso desde ', this.formatDateExcel(this.fechaIngresoDesde, false)],
      ['Fecha ingreso hasta ', this.formatDateExcel(this.fechaIngresoHasta, false)],
      ['Por fecha egreso',this.porFechaEntrega?"Si":"no"],
      ['Fecha entrega desde ', this.formatDateExcel(this.fechaEntregaDesde, false)],
      ['Fecha entrega hasta ', this.formatDateExcel(this.fechaEntregaHasta, false)],
      ['Estado',this.estado? this.estados.find(e=> e.id === this.estado)?.nombre:"-"],
      ['Forma de cobro',this.formaPago? this.formas.find(f=> f.id === this.formaPago)?.nombre:"-"],
      ['Provincia',this.provincia],
      ['Localidad',this.localidad],
      ['Proveedor',this.nombreProveedor],
      ['Chofer',this.nombreChofer],
      ['Vehiculo',this.nombreVehiculo],
      ['Cliente',this.nombreCliente],
      ['Destinatario',this.nombreDestinatario],
      ['Remitente',this.nombreRemitente],
      ['Por reubicado o conformado?',this.todos?"No":"Si"],
      ['Conformado',this.confirmado?"Si":"No"],
      ["Reubicado",this.reubicado?"Si":"No"]
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    XLSX.utils.book_append_sheet(wb, wsFilters, 'Filtros aplicados');

    XLSX.writeFile(wb, 'Reporte proveedores.xlsx');
  }

  
}
