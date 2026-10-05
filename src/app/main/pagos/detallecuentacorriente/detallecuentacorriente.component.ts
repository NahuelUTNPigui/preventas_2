import { Component, OnInit } from '@angular/core';
import { ColumnMode  } from '@swimlane/ngx-datatable';
import { Router} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagosService } from '../pagos.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-detallecuentacorriente',
  templateUrl: './detallecuentacorriente.component.html',
  styleUrls: ['./detallecuentacorriente.component.scss']
})
export class DetallecuentacorrienteComponent implements OnInit {

  public url = this.router.url;  
  public proveedor = ""
  public nombreproveedor = ""
  public cuentacorriente:any
  public conpermisos = false
  public ColumnMode = ColumnMode;
  public fechadesde = ""
  public fechahasta = ""
  public ordenestotal = 0
  public pagostotal = 0
  public adicionalestotal = 0
  public saldototal = 0
  public ordenes = []
  public pagos = []
  // Trans son ordenes y pagos
  public rowstrans = []
  public pagetrans = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  constructor(
      private router: Router,
      private _pagoService:PagosService, 
      private modalService: NgbModal
    ) { 
      let user = JSON.parse(localStorage.getItem('currentUser'))
      this.conpermisos = user.record.permisos > 0
      this.proveedor = this.url.substr(this.url.lastIndexOf('/') + 1);
    }

  ngOnInit(): void {
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año,mes,1)
    let ultima_dia_mes = new Date(año,mes+1,0)
    this.fechadesde = ""//primer_dia_mes.toISOString().split('T')[0]
    this.fechahasta = ultima_dia_mes.toISOString().split('T')[0]
    this._pagoService.getNombreProveedor(this.proveedor).then(res=>this.nombreproveedor = res)
    this._pagoService.getCuentaCorrienteProveedor(this.proveedor,200,1,this.fechadesde,this.fechahasta).then(res=>{
      this.cuentacorriente = res[0]
      this.ordenestotal = Math.round((this.cuentacorriente.ordenestotal+Number.EPSILON)*10000)/10000
      this.pagostotal = this.cuentacorriente.pagostotal
      this.adicionalestotal = this.cuentacorriente.adicionales
      this.saldototal = Math.round((this.cuentacorriente.saldototal + Number.EPSILON)*10000)/10000
      this.ordenes = this.cuentacorriente.ordenes
      this.pagos = this.cuentacorriente.pagos
      
      this.rowstrans = this.ordenes.map(t=>({
        fecha:t.fechaorden,
        total:Math.round((t.total+Number.EPSILON)*10000)/10000,
        pago:0,
        adicionales:0,
        numero:t.numero
      }))
      this.rowstrans = this.rowstrans.concat(this.pagos.map(p=>({
        fecha:p.fechapago,
        total:0,
        pago:p.totalpagos,
        adicionales:p.totaladicionales,
        numero:p.numero
      })))
      this.rowstrans.sort((t1,t2)=>t1.fecha<t2.fecha?-1:1)
      this.pagetrans.count = this.rowstrans.length
      this.pagetrans.size = this.rowstrans.length
    })
  }
  filterUpdate(event){
    this._pagoService.getCuentaCorrienteProveedor(this.proveedor,200,1,this.fechadesde,this.fechahasta).then(res=>{
      this.cuentacorriente = res[0]
      this.ordenestotal = Math.round((this.cuentacorriente.ordenestotal+Number.EPSILON)*10000)/10000
      this.pagostotal = this.cuentacorriente.pagostotal
      this.adicionalestotal = this.cuentacorriente.adicionales
      this.saldototal = Math.round((this.cuentacorriente.saldototal + Number.EPSILON)*10000)/10000
      this.ordenes = this.cuentacorriente.ordenes
      this.pagos = this.cuentacorriente.pagos
      
      this.rowstrans = this.ordenes.map(t=>({
        fecha:t.fechaorden,
        total:Math.round((t.total+Number.EPSILON)*10000)/10000,
        pago:0,
        adicionales:0,
        numero:t.numero
      }))
      this.rowstrans = this.rowstrans.concat(this.pagos.map(p=>({
        fecha:p.fechapago,
        total:0,
        pago:p.totalpagos,
        adicionales:p.totaladicionales,
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
        ORDENES:item.total,
        PAGO:item.pago,
        ADICIONALES:item.adicionales
        
      }))
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `Cuenta corriente: ${this.nombreproveedor} - Desde: ${this.fechadesde} - Hasta: ${this.fechahasta}`, s: {} };
      const range = XLSX.utils.decode_range('A1:K1');
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'Cuenta corriente');
      XLSX.writeFile(wb, `Cuenta corriente ${this.nombreproveedor} - Desde ${this.fechadesde.replace(/\//g, "-")} - Hasta ${this.fechahasta.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
    }
  

}
