import { Component, OnInit } from '@angular/core';
import { ColumnMode  } from '@swimlane/ngx-datatable';
import { Router} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FacturacionService } from '../facturacion.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-detallecuentacorriente',
  templateUrl: './detallecuentacorriente.component.html',
  styleUrls: ['./detallecuentacorriente.component.scss']
})
export class DetallecuentacorrienteComponent implements OnInit {

  public url = this.router.url;  
  public cliente = ""
  public nombrecliente = ""
  public cuentacorriente:any
  public conpermisos = false
  public ColumnMode = ColumnMode;
  public fechadesde = ""
  public fechahasta = ""
  public facturatotal = 0
  public pagostotal = 0
  public retencionestotal = 0
  public saldototal = 0
  public facturas = []
  public pagos = []
  public rowstrans = []
  private IVA = 1.21
  public pagetrans = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  
  constructor(
    private router: Router,
    private _facturacionService:FacturacionService, 
    private modalService: NgbModal
  ) { 
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
    this.cliente = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año,mes,1)
    let ultima_dia_mes = new Date(año,mes+1,0)
    this.fechadesde = ""//primer_dia_mes.toISOString().split('T')[0]
    this.fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    this._facturacionService.getrazonSocialCliente(this.cliente).then(res=>this.nombrecliente = res)
    // No me gusta esta solucion
    this._facturacionService.getCuentaCorrienteCliente(this.cliente,200,1,this.fechadesde,this.fechahasta).then(res=>{
      this.cuentacorriente = res[0]
      this.facturatotal = Math.round((this.cuentacorriente.facturatotal+Number.EPSILON)*10000)/10000
      this.pagostotal = this.cuentacorriente.pagostotal
      this.retencionestotal = this.cuentacorriente.retencionestotal
      this.saldototal = Math.round((this.cuentacorriente.saldototal + Number.EPSILON)*10000)/10000
      this.facturas = this.cuentacorriente.facturas
      this.pagos = this.cuentacorriente.pagos
      
      this.rowstrans = this.facturas.map(t=>({
        fecha:t.fechafacturacion,
        total:Math.round((this.cuentacorriente.responsableinscripto?this.IVA*t.total:t.total+Number.EPSILON)*10000)/10000,
        pago:0,
        retenciones:0,
        numero:t.numero
      }))
      this.rowstrans = this.rowstrans.concat(this.pagos.map(p=>({
        fecha:p.fechacobro,
        total:0,
        pago:p.totaldetalles,
        retenciones:p.totalretenciones,
        numero:p.numero
      })))
      this.rowstrans.sort((t1,t2)=>t1.fecha<t2.fecha?-1:1)
      this.pagetrans.count = this.rowstrans.length
      this.pagetrans.size = this.rowstrans.length
        
    })
  }
  filterUpdate(event){
    this._facturacionService.getCuentaCorrienteCliente(this.cliente,200,1,this.fechadesde,this.fechahasta).then(res=>{
      this.cuentacorriente = res[0]
      this.facturatotal = this.cuentacorriente.facturatotal
      this.pagostotal = this.cuentacorriente.pagostotal
      this.retencionestotal = this.cuentacorriente.retencionestotal
      this.saldototal = this.cuentacorriente.saldototal
      this.facturas = this.cuentacorriente.facturas
      this.pagos = this.cuentacorriente.pagos
      this.rowstrans = this.facturas.map(t=>({
        fecha:t.fechafacturacion,
        total:t.total,
        pago:0,
        retenciones:0,
        numero:t.numero
      }))
      this.rowstrans = this.rowstrans.concat(this.pagos.map(p=>({
        fecha:p.fechacobro,
        total:0,
        pago:p.totaldetalles,
        retenciones:p.totalretenciones,
        numero:p.numero
      })))
      this.rowstrans.sort((t1,t2)=>t1.fecha<t2.fecha?-1:1)
      this.pagetrans.count = this.rowstrans.length
      this.pagetrans.size = this.rowstrans.length
      
    })
  }
  exportarXLX(){
  
    let csvdata = this.rowstrans.map(item=>({
      FECHA:item.fecha,
      NUMERO:item.numero,
      TOTAL:item.total,
      PAGO:item.pago,
      RETENCIONES:item.retenciones
      
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([])
    ws['A1'] = { t: 's', v: `Cuenta corriente: ${this.nombrecliente} - Desde: ${this.fechadesde} - Hasta: ${this.fechahasta}`, s: {} };
    const range = XLSX.utils.decode_range('A1:K1');
    XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Cuenta corriente');
    XLSX.writeFile(wb, `Cuenta corriente ${this.nombrecliente} - Desde ${this.fechadesde.replace(/\//g, "-")} - Hasta ${this.fechahasta.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
  }

}
