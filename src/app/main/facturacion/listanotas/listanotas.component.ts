import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SelectFormatService } from 'app/main/common';
import { FacturacionService } from '../facturacion.service';
import { FiltrosService } from 'app/main/common/services/filtros.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-listanotas',
  templateUrl: './listanotas.component.html',
  styleUrls: ['./listanotas.component.scss']
})
export class ListanotasComponent implements OnInit {
  public data = []
  public rows = []
  public clientes = []
  public cliente = ''

  public fechaDesde = ''
  public fechaHasta = ""

  public ColumnMode = ColumnMode;

  public totalnotas = 0
  //Detalle nota
  public monto = 0
  public descripcion = ""
  public numero = ""
  public facturanota = ""
  public clientenota = ""
  public idnota = ""
  public creatednota = ""

  page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public conpermisos = false


  constructor(
    private _selectService: SelectFormatService,
    private _factService: FacturacionService,

    private modalService: NgbModal


  ) {
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
    this._factService.getNotas(this.page.size, this.page.offset + 1, this.fechaDesde, this.fechaHasta, this.cliente).subscribe(res => {
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
    this._factService.getNotasTodos(this.fechaDesde, this.fechaHasta, this.cliente).then(res => {
      let csvdata = res.map(item => ({
        
        NUMERO: item.numero,
        MONTO: item.monto,
        FACTURA: item.expand?.factura?.monthyear,
        CLIENTE: this.getNombreCliente(item.expand?.factura?.cliente)
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([])
      ws['A1'] = { t: 's', v: `Notas`, s: {} };
      const range = XLSX.utils.decode_range('A1:K1');
      ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
      XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
      XLSX.utils.book_append_sheet(wb, ws, 'Notas');
      XLSX.writeFile(wb, `Notas.xlsx`, { cellStyles: true });
    })

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
  
  openNota(modal, rowid) {
    let idx_nota = this.rows.findIndex(r => r.id == rowid)
    if (idx_nota != -1) {
      let n = this.rows[idx_nota]
      this.idnota = n.id
      this.monto = n.monto
      this.descripcion = n.descripcion
      this.numero = n.numero
      this.facturanota = n.expand?.factura.monthyear
      this.clientenota = this.getNombreCliente(n.expand?.factura.cliente)
      this.creatednota = new Date(n.created).toISOString().split('T')[0]



      this.modalService.open(modal, {
        centered: true,
        size: 'xl',
        windowClass: 'modal modal-primary'
      });
    }

  }
  calcularTotal(){

    this.totalnotas = 0
    this._factService.getTotalNotas(this.fechaDesde, this.fechaHasta, this.cliente).then(res => {
      this.totalnotas = res
    })
  }


}
