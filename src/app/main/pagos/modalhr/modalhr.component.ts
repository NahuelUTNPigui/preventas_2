import { Component, OnInit,Input,Output, EventEmitter  } from '@angular/core';
import { ColumnMode  } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagosService } from '../pagos.service';

@Component({
  selector: 'app-modalhr',
  templateUrl: './modalhr.component.html',
  styleUrls: ['./modalhr.component.scss']
})
export class ModalhrComponent implements OnInit {
  @Input() datapagar = []
  public totalordenes = 0
  
  public totalpagos = 0
  public totaladicionales = 0
  public saldo = 0
  public nombreprov = ""
  public proveedor = ""
  public idhr = ""
  public fechapago = new Date().toISOString().split('T')[0]
  public nropago = ""
  public unidad = ""
  public unidades = []
  public indicefila = ""
  public fila:any
  public tabactivo = 0
  @Output() pagoEvent = new EventEmitter<string>();
  @Output() cerrarModalEvent = new EventEmitter<string>();
  @Output() quitarOrdenEvent = new EventEmitter<string>();
  @Output() editarHREvent = new EventEmitter<any>();
  @Output() quitarHREvent = new EventEmitter<string>();
  public rows = []
  public proveedores = []
  public selectedOption = 10;
  
  public pagos = []
  public adicionales = []
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  pagepagos = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  pageadicionales = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(
    private _selectService: SelectFormatService,
    private _pagoService:PagosService, 
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.unidades = this._pagoService.getUnidades()
    this.page.count = this.datapagar.length
    this.datapagar.forEach(hr=>{
      this.totalordenes += hr.total
    })
    this.pagos = []
    this.adicionales = []
    this.saldo =  - this.totalordenes
    //this._selectService.getTodosProveedores().then(res=>{
    //  this.proveedores = res
    //})
    this.proveedor = this.datapagar[0].proveedor
    this.nombreprov =this.datapagar[0].expand.proveedor.nombre
  }
  loadPage(){
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset +1 ) , this.page.count)
    this.rows = []
    for(let i = min_i ;i<max_i;i++){
      this.rows.push(this.datapagar[i])
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
  generatePass() {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789@#$';

    for (let i = 1; i <= 15; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);

        pass += str.charAt(char)
    }

    return pass;
  }
  quitarHR(id){
    this.datapagar = this.datapagar.filter(h=>h.id != id)
    this.quitarOrdenEvent.emit(id)
  }
  
  formatPeso(value){
    return this._selectService.formatPeso(value)
  }
  redondear(num){
    return Math.round(1000*num)/1000
  }
  vistaXCL(esVistaPrevia:boolean){
    let csvdatahr = this.datapagar.map(item=>({
      FECHAORDEN:item.fechaorden,
      CONCEPTO:item.concepto,
      PROVEEDOR:item.expand.proveedor.nombre,
      NUMERO:item.numero,
      TOTAL:item.total
    }))
    let csvpagos = this.pagos.map(item=>({
      DESCRIPCION:item.descripcion,
      MONTO:"$"+item.total,
      CATEGORIA:item.categoria
    }))
    let csvadicionales = this.adicionales.map(item=>({
      DESCRIPCION:item.descripcion,
      MONTO:"$"+item.total,
      CATEGORIA:item.categoria
    }))
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([])
    if(esVistaPrevia){
      ws['A1'] = { t: 's', v: `VISTA PREVIA PAGOS - FECHA PAGO: ${this.fechapago}`, s: {} };
    }
    else{
      ws['A1'] = { t: 's', v: `FACTURAS - FECHA PAGO: ${this.fechapago}`, s: {} };
    }

    const range = XLSX.utils.decode_range('A1:K1');
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdatahr, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Hojas de ruta');
    // Detalles pagos
    const wsdetalles = XLSX.utils.aoa_to_sheet([])
    wsdetalles['A1'] = {t:'s',v:"Detalles de pagos",s:{}}
    wsdetalles['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsdetalles, csvpagos, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsdetalles, 'Pagos');
    // Adicionales
    const wsretenciones = XLSX.utils.aoa_to_sheet([])
    wsretenciones['A1'] = {t:'s',v:"Adicionales",s:{}}
    wsretenciones['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsretenciones, csvadicionales, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsretenciones, 'Retenciones');
    if(esVistaPrevia){
      XLSX.writeFile(wb, `VISTA PREVIA - PAGO_${this.datapagar[0].expand.proveedor.nombre}_${this.fechapago}.xlsx`, { cellStyles: true });
    }
    else{
      XLSX.writeFile(wb, `PAGO_${this.datapagar[0].expand.proveedor.nombre}_${this.fechapago}.xlsx`, { cellStyles: true });
    }
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
  pagar(){
    if(this.fechapago ==""){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Falta seleccionar la fecha.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    if(this.datapagar.length == 0){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay hoja de rutas seleccionadas.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    this._pagoService.pagar(
      this.nropago,
      this.proveedor,
      this.fechapago,
      this.totalordenes,
      this.totalpagos,
      this.totaladicionales,
      this.pagos,
      this.adicionales,
      this.datapagar
    ).then(res=>{
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Pago creado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.vistaXCL(false)
      this.pagoEvent.emit(res.id)
    })
  }
  calcularSaldo(){
    this.saldo = 0
    this.totalordenes = 0
    this.datapagar.forEach(d=>{
      this.saldo += d.total
      this.totalordenes += d.total

    })
    this.saldo = - Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
    this.totaladicionales = 0
    this.totalpagos = 0
    for(let i = 0;i<this.pagos.length;i++){
      this.totalpagos += this.pagos[i].total
      this.saldo += this.pagos[i].total
    }
    for(let i = 0;i<this.adicionales.length;i++){
      this.totaladicionales += this.adicionales[i].total
      this.saldo += this.adicionales[i].total
    }
    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
  }
  quitarPago(indice){
    this.pagos = this.pagos.filter(a=>a.indice!=indice)
    this.calcularSaldo()
  }
  quitarAdicional(indice){
    this.adicionales = this.adicionales.filter(a=>a.indice!=indice)
    this.calcularSaldo()
  }
  clickTab(t){
    this.tabactivo = t
  }
  openModal(modal){
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  verFila(indice,modalcheque,modaltrans,modaltransfer,esAdicional){
    this.indicefila = indice
    if(esAdicional){
      this.fila = this.adicionales.filter(a=>a.indice == indice)[0]
    }
    else{
      this.fila = this.pagos.filter(a=>a.indice == indice)[0]
    }
    
    if(this.fila.categoria == "Transferencia"){
      
      this.modalService.open(modaltransfer, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }
    else{
      
      this.modalService.open(modaltrans, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }
  }
  guardarFila(e,modal){
    if(this.indicefila == ""){
      if(e.esAdicional){
        let indice = this.generatePass()
        let adi = {...e,indice}
        this.adicionales.push(adi)
      }
      else{
        let indice = this.generatePass()
        let deta = {...e,indice}
        this.pagos.push(deta)
      }
    }
    else{
      if(e.esAdicional){
        let index = this.adicionales.findIndex(d=>d.indice == this.indicefila)
        if(index !== -1){
          this.adicionales[index] = {...e,indice:this.indicefila}
        }
      }
      else{
        let index = this.pagos.findIndex(d=>d.indice == this.indicefila)
        if(index !== -1){
          this.pagos[index] = {...e,indice:this.indicefila}
        }
      }

    }
    this.calcularSaldo()
    //Hacer el truquito de los saldos
    modal.dismiss('Cross click')
  }
  

}
