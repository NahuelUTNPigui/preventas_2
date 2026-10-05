import { Component, OnInit,Input,Output, EventEmitter } from '@angular/core';
import { ColumnMode  } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { FacturacionService } from '../facturacion.service';
import { SelectFormatService } from 'app/main/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-modalpago',
  templateUrl: './modalpago.component.html',
  styleUrls: ['./modalpago.component.scss']
})
export class ModalpagoComponent implements OnInit {
  @Input() datafacturas = []


  public esDetalle = true

  //Filas
  public rows = []
  public retencioneslabels =[]

  public retenciones = []
  public rowretenciones = []

  public descuentos = []
  public rowdescuentos = []

  public detallespago = []
  public rowdetallespago = []

  //Valores 
  public selectedOption = 10
  public responsableinscripto = false
  private IVA=1.21
  public fechacobro = ""
  public numero=""
  public tabactivo = 0
  public completo = true
  //Totales
  public totalfact = 0
  public totalfactiva = 0
  public totalretenciones = 0
  public totaldescuentos = 0 
  public totalpagos = 0
  public acuenta = 0
  public saldo = 0
  //Detalles y retenciones
  public descripciondetalle = ""
  public totaldetalle=0
  public descripcionretencion = ""
  
  public totaldetarete = 0
  public partes = 0
  //Ver detalles y retenciones

  public indicefila = ""
  public indiceretencion = ""
  public indicedescuento = ""

  //Detalles, descuentos y retenciones
  public fila:any
  public descuento:any
  public retencion:any
  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  @Output() cobroModalEvent = new EventEmitter<string>();
  @Output() quitarFacturaEvent = new EventEmitter<string>();


  constructor(  
    private _factService:FacturacionService, 
    private _selectService:SelectFormatService,
    private modalService: NgbModal
  ) {
  }
  ngOnInit(): void {
    
    this.page.count = this.datafacturas.length
    this.retencioneslabels = this._selectService.getRetenciones()
    this.loadPage()
    if(this.datafacturas[0].expand.cliente.responsableinscripto){
      this.responsableinscripto = true
    }
    this.datafacturas.forEach(f=>{
      this.totalfact += f.expand.cliente.responsableinscripto?f.total/this.IVA:f.total
      this.totalfactiva += f.total
      this.saldo += f.total
    })
    this.saldo = -Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
  }
  formatPeso(value){
    return this._factService.formatPeso(value)
  }
  limpiarLista(){
    this.datafacturas = []
    this.rows = []
    this.totalfact = 0
    this.totalretenciones = 0
    this.retenciones = []
    this.detallespago = []
    this.saldo = 0
    this.page = {
      size: 10, // Tamaño de la página
      count: 0, // Total de elementos
      offset: 0 // Página actual
    };
  }
  openModalRetenciones(modal){
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  openModalDecuento(modal){
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  openModalDetalles(modal){

    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  openModal(modal,esDetalle){
    this.esDetalle = esDetalle
    this.indicefila = ""
    this.fila = {}
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  quitarFactura(id:string){
    this.quitarFacturaEvent.emit(id)
    this.datafacturas = this.datafacturas.filter(f=>f.id != id)
    this.loadPage()
    this.saldo = 0
    this.totalfact = 0
    this.totalfactiva = 0
    this.datafacturas.forEach(f=>{
      this.totalfact += f.expand.cliente.responsableinscripto?f.total/this.IVA:f.total
      this.totalfactiva += f.total
      this.saldo += f.expand.cliente.responsableinscripto?f.total/this.IVA:f.total
    })
    this.saldo = - Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
    this.totalpagos = 0
    this.totalretenciones = 0
    this.rowdetallespago = []
    for(let i = 0;i<this.detallespago.length;i++){
      this.rowdetallespago.push(this.detallespago[i])
      this.totalpagos += this.detallespago[i].total
      this.saldo +=this.detallespago[i].total
    }
    this.rowretenciones = []
    for(let i = 0;i<this.retenciones.length;i++){
      this.rowretenciones.push(this.retenciones[i])
      this.totalretenciones += this.retenciones[i].total
      this.saldo += this.retenciones[i].total
    }
    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
    
  }
  onChangeAcuenta(){
    this.calcularTotal()
  }
  loadPage(){
    let min_i = this.page.offset * this.page.size
    let max_i = Math.min(this.page.size * (this.page.offset +1 ) , this.page.count)
    this.rows = []
    for(let i = min_i ;i<max_i;i++){
      this.rows.push(this.datafacturas[i])
    }
  }
  onPageSizeChange(){
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
  }
  onPage(event){
    this.page.offset = event.offset;
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
  verFilaDescuento(indice,modal){
    this.indicedescuento = indice
    let idx_des = this.descuentos.findIndex(d=>d.indice == this.indicedescuento)
    if(idx_des != -1){
      this.descuento = this.descuentos[idx_des]
      
    }

    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  verFilaRetencion(indice,modal){
    this.indiceretencion = indice
    let r_idx = this.retenciones.findIndex(r=>r.indice)
    if(r_idx != -1){
      this.retencion = this.retenciones[r_idx]
    }
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal modal-primary'
    });
  }
  verFila(indice,modalcheque,modaltrans,modaltransfer,esDetalle){
    this.indicefila = indice
    this.esDetalle = esDetalle
    if(esDetalle){
      this.fila = this.detallespago.filter(d=>d.indice==indice)[0]
    }
    else{
      this.fila = this.retenciones.filter(d=>d.indice==indice)[0]
    }
    if(this.fila.categoria == "Cheque"){
        
      this.modalService.open(modalcheque, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }
    else if(this.fila.categoria == "Transferencia"){
      
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
  guardarDescuento(e,modal){
    if(this.indicedescuento == ""){
      let indice = this.generatePass()
      let descuento = {...e,indice}
      this.descuentos.push(descuento)
    }
    else{
      let d_idx = this.descuentos.findIndex(d=>d.indice==this.indicedescuento)
      if(d_idx != -1){
        this.descuentos[d_idx] = {
          ...this.descuentos[d_idx],
          ...e
        }
      }
      
    }
    
    this.calcularTotal()
    modal.dismiss('Cross click')
  }
  guardarRetencion(e,modal){
    if(this.indiceretencion ==""){
      let indice = this.generatePass()
      let retencion = {...e,indice}
      this.retenciones.push(retencion)
    }
    else{
      let r_idx = this.retenciones.findIndex(r=>r.indice == this.indiceretencion)
      if(r_idx != -1){
        this.retenciones[r_idx] = {
          ...this.retenciones[r_idx],
          ...e
        }
      }
    }
    
    this.calcularTotal()
    modal.dismiss('Cross click')
  }
  calcularTotal(){
    this.saldo = 0
    this.totaldescuentos = 0
    this.totalretenciones = 0
    this.totalpagos = 0
    this.datafacturas.forEach(f=>{
      this.saldo += f.expand.cliente.responsableinscripto?f.total/this.IVA:f.total
    })
    this.saldo += this.acuenta
    this.saldo -=  Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
    this.totalpagos = 0
    this.totalretenciones = 0

    this.rowdetallespago = []
    for(let i = 0;i<this.detallespago.length;i++){
      this.rowdetallespago.push(this.detallespago[i])
      this.totalpagos += this.detallespago[i].total
      this.saldo +=this.detallespago[i].total
    }
    this.rowretenciones = []
    for(let i = 0;i<this.retenciones.length;i++){
      this.rowretenciones.push(this.retenciones[i])
      this.totalretenciones += this.retenciones[i].monto
      this.saldo += this.retenciones[i].monto
    }
    this.rowdescuentos = []
    for(let i = 0;i<this.descuentos.length;i++){
      this.rowdescuentos.push(this.descuentos[i])
      this.totaldescuentos += this.descuentos[i].monto
      this.saldo += this.descuentos[i].monto
    }

    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
  }
  guardarFila(e,modal){
    
    if(this.indicefila == ""){
      if(this.esDetalle){
        let indice = this.generatePass()
        let deta = {...e,indice}
        this.detallespago.push(deta)
      }
      else{
        let indice = this.generatePass()
        let rete = {...e,indice}
        this.retenciones.push(rete)
      }
    }
    else{
      if(this.esDetalle){
        let index = this.detallespago.findIndex(d=>d.indice == this.indicefila)
        if(index !== -1){
          this.detallespago[index] = {...e,indice:this.indicefila}
        }
      }
      else{
        let index = this.retenciones.findIndex(d=>d.indice == this.indicefila)
        if(index !== -1){
          this.retenciones[index] = {...e,indice:this.indicefila}
        }
      }
    }
    
    this.calcularTotal()
    modal.dismiss('Cross click')
    
  }
  
  addDetalle(){
    let indice = this.generatePass()
    let deta = {indice,descripcion:this.descripciondetalle,total:this.totaldetalle}
    this.descripciondetalle = ""
    this.totaldetalle = 0
    this.totalpagos = 0
    this.detallespago.push(deta)
    this.rowdetallespago = []

    for(let i = 0;i<this.detallespago.length;i++){
      this.rowdetallespago.push(this.detallespago[i])
      this.totalpagos += this.detallespago[i].total
      this.saldo +=this.detallespago[i].total
      
    }
    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000

  }
  quitarDetalle(iddeta){
    let idx = this.detallespago.findIndex(d=>d.indice==iddeta)
    this.detallespago.splice(idx,1)
    this.rowdetallespago = []
    this.totalpagos = 0
    for(let i = 0;i<this.detallespago.length;i++){
      this.rowdetallespago.push(this.detallespago[i])
      this.totalpagos -= this.detallespago[i].total
      this.saldo -=this.detallespago[i].total
    }
    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
  }
  addRetencion(){
    let indice = this.generatePass()
    let rete = {indice,descripcion:this.descripcionretencion,total:this.totaldetarete}
    this.descripcionretencion = ""
    this.totaldetarete = 0
    this.totalretenciones = 0
    this.retenciones.push(rete)
    this.rowretenciones = []
    for(let i = 0;i<this.retenciones.length;i++){
      this.rowretenciones.push(this.retenciones[i])
      this.totalretenciones += this.retenciones[i].total
      this.saldo +=this.retenciones[i].total
    }
    this.saldo = Math.round((this.saldo + Number.EPSILON) * 10000) / 10000
  }
  quitarDescuento(idesc){
    let idx = this.descuentos.findIndex(r=>r.indice==idesc)
    if(idx != -1){
      this.descuentos.splice(idx,1)
      this.calcularTotal()
    }
  }
  quitarRetencion(idrete){
    let idx = this.retenciones.findIndex(r=>r.indice==idrete)
    if(idx != -1){
      this.retenciones.splice(idx,1)
      this.calcularTotal()
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
  vistaPrevia(esVistaPrevia:boolean){

    let csvcobro = [
      {
        ACUENTA:this.acuenta ,
        COMPLETO:this.completo,
        NUMERO:this.numero,
        FECHACOBRO:this.fechacobro,
        CLIENTE:this.datafacturas[0].cliente,
        FACTURAS:this.totalfact,
        PAGOS:this.totalpagos,
        RETENCIONES:this.totalretenciones,
        DESCUENTOS:this.totaldescuentos
      }
    ]

    let csvdatafact = this.datafacturas.map(item=>({
      FECHAFACTURACION:this.formatDateExcel(item.fechafacturacion,true),
      COBRADO:item.cobrado?"Si":"No",
      PERIODO:item.monthyear,
      CLIENTE:item.expand.cliente.nombre,
      NUMERO:item.numero,
      TOTAL:"$"+item.total,
    }))  
    let csvdatadetalles = this.detallespago.map(item=>({
      DESCRIPCION:item.descripcion,
      MONTO:"$"+item.total,
      CATEGORIA:item.categoria
    }))
    let csvdatareten = this.retenciones.map(item=>({
      DESCRIPCION:item.descripcion,
      MONTO:"$"+item.monto
    }))
    let csvdatadesc = this.descuentos.map(item=>({
      DESCRIPCION:item.descripcion,
      MONTO:"$"+item.total
    }))


    const wb = XLSX.utils.book_new();
    const range = XLSX.utils.decode_range('A1:K1');
    //Cobro
    const wscobro = XLSX.utils.aoa_to_sheet([])
    if(esVistaPrevia){
      wscobro['A1'] = { t: 's', v: `VISTA PREVIA COBRO - FECHA COBRO: ${this.fechacobro}`, s: {} };
    }
    else{
      wscobro['A1'] = { t: 's', v: `COBRO - FECHA COBRO: ${this.fechacobro}`, s: {} };
    }
    wscobro['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wscobro, csvcobro, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wscobro, 'Cobro');
    //Facturas
    const ws = XLSX.utils.aoa_to_sheet([])
    ws['A1'] = {t:'s',v:"Facturas",s:{}}
    ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(ws, csvdatafact, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Faturas');
    // Detalles pagos
    const wsdetalles = XLSX.utils.aoa_to_sheet([])
    wsdetalles['A1'] = {t:'s',v:"Detalles de pagos",s:{}}
    wsdetalles['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsdetalles, csvdatadetalles, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsdetalles, 'Pagos');
    // Retenciones
    const wsretenciones = XLSX.utils.aoa_to_sheet([])
    wsretenciones['A1'] = {t:'s',v:"Retenciones",s:{}}
    wsretenciones['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsretenciones, csvdatareten, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsretenciones, 'Retenciones');
    // Retenciones
    const wsdescuentos = XLSX.utils.aoa_to_sheet([])
    wsdescuentos['A1'] = {t:'s',v:"Descuentos",s:{}}
    wsdescuentos['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
    XLSX.utils.sheet_add_json(wsdescuentos, csvdatadesc, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, wsdescuentos, 'Descuentos');

    if(esVistaPrevia){
      XLSX.writeFile(wb, `VISTA PREVIA - COBRO_${this.datafacturas[0].expand.cliente.nombre}_${this.fechacobro}.xlsx`, { cellStyles: true });
    }
    else{
      XLSX.writeFile(wb, `COBRO_${this.datafacturas[0].expand.cliente.nombre}_${this.fechacobro}.xlsx`, { cellStyles: true });
    }
    
  }
  cobro(){
    if(this.fechacobro==""){
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
    if(this.datafacturas.length == 0){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay facturas seleccionadas.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      return
    }
    this._factService.cobrar(
      this.acuenta,
      this.completo,
      this.numero,
      this.fechacobro,
      this.datafacturas[0].cliente,
      this.totalfact,
      this.totalpagos,
      this.totalretenciones,
      this.totaldescuentos,
      this.datafacturas,
      this.retenciones,
      this.descuentos,
      this.detallespago
    ).then(res=>{
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Cobro creado exitosamente.',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary'
          }
        });
        this.vistaPrevia(false)
        this.cobroModalEvent.emit(res.id)
      })
      
    

  }
  clickTab(t){
    this.tabactivo = t
  }
}
