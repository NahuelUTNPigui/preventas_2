import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import { FacturacionService } from '../facturacion.service';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-listaacuenta',
  templateUrl: './listaacuenta.component.html',
  styleUrls: ['./listaacuenta.component.scss']
})
export class ListaacuentaComponent implements OnInit {
  public conpermisos = false
  public acuentas = []
  public rows = []
  public clientes = []

  //totales
  public totalacuentas = 0
  //filtros
  public buscardescripcion = ""
  public fechaDesde = ""
  public fechaHasta = ""
  public buscarcliente = ""
  //detalle
  public idcuenta = ""
  public created = ""
  public descripcion = ""
  public monto = 0
  public cliente = ""
  public fecha = ""
  public cobrada = false

  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(
    private _selectService: SelectFormatService,
    private _factService: FacturacionService,
    private modalService: NgbModal) {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this._selectService.getTodosClientes().then(res => {
      this.clientes = res
    })
    let hoy = new Date()
    let mes = hoy.getMonth()
    let año = hoy.getFullYear()
    let primer_dia_mes = new Date(año, mes, 1)
    let ultima_dia_mes = new Date(año, mes + 1, 0)
    this.fechaDesde = primer_dia_mes.toISOString().split('T')[0]
    this.fechaHasta = ultima_dia_mes.toISOString().split('T')[0]
    this.loadPage()
  }
  getNombreCliente(idcliente) {
    let idx_cliente = this.clientes.findIndex(c => c.id == idcliente)
    if (idx_cliente != -1) {
      let c = this.clientes[idx_cliente]
      return c.nombre
    }
    else {
      return ""
    }
  }
  filterUpdate(event) {
    this.page.offset = 0
    this.loadPage()
  }
  loadPage() {
    this._factService.getAcuentas(this.page.size, this.page.offset + 1,this.buscardescripcion, this.fechaDesde, this.fechaHasta, this.buscarcliente).subscribe(res => {
      this.rows = res.items
      this.page.count = res.totalItems
    })
  }
  onPage(event) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
    this.loadPage();
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
  exportarXLX() {
    this._factService.getAcuentasTodos(this.buscardescripcion,this.fechaDesde, this.fechaHasta, this.buscarcliente).then(res => {
      let csvdata = res.map(item => ({
        FECHA: this.formatDateExcel(item.fecha, true),
        DESCRIPCION: item.descripcion,
        MONTO: item.monto,
        CLIENTE: this.getNombreCliente(item.cliente),
        COBRADA: item.cobro.length>0?"Sí":"No",
        
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `A cuenta cliente`, s: {} };
      const range = XLSX.utils.decode_range('A1:K1');
      ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'A cuenta cliente');
      XLSX.writeFile(wb, `A cuenta cliente.xlsx`, { cellStyles: true });
    })

  }
  openACuenta(modal,rowid){
    let idx_cuenta = this.rows.findIndex(r => r.id == rowid)
    if (idx_cuenta != -1) {
      let c = this.rows[idx_cuenta]
      this.idcuenta = c.id
      this.monto = c.monto
      this.descripcion = c.descripcion
      this.cliente = this.getNombreCliente(c.cliente)
      this.created = new Date(c.created).toISOString().split('T')[0]
      this.fecha = new Date(c.fecha).toISOString().split('T')[0]
      this.cobrada = c.cobro.length>0
      this.modalService.open(modal, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }
  }
  ConfirmDeleteOpen(rowid) {
    let html = `
        <p>Se va a eliminar la nota</p> 
      `
    Swal.fire({
      title: 'Cerrar?',
      //text: "Se eliminará el remito"
      html,
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
        this.eliminar(rowid)
      }
    });
  }
  eliminar(rowid) {
    this._factService.delNota(rowid).subscribe(res => {
      this.filterUpdate({})
    })
  }
  async calcularTotal(){
    this.totalacuentas = 0
    this._factService.getTotalAcuentas( 
      this.descripcion,
      this.fechaDesde,
      this.fechaHasta,
      this.cliente).then(res=>{
        this.totalacuentas = res
    })
  }

}
