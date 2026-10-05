import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { expand } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ProveedorService } from '../servicios/proveedor.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-tarifariooculto',
  templateUrl: './tarifariooculto.component.html',
  styleUrls: ['./tarifariooculto.component.scss']
})
export class TarifarioocultoComponent implements OnInit {
  public proveedor = ""
  public proveedornombre = ""
  public url = this.router.url;
  public selectedOption = 10;
  public searchValue = '';
  public data: any[];
  public rows: any[];
  public ColumnMode = ColumnMode;
  public page = {
    size: 10, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  // decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;


  constructor(
    private router: Router,
    private _proveedorService: ProveedorService
  ) {
    this.proveedor = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    this._proveedorService.getTarifarioProveedorVigente(this.proveedor).then(res => {
      let tarifas = res.filter(t => t.oculto)
      this.data = tarifas
      this.page.count = tarifas.length
      this.page.offset = 0
      this.loadPage()
    })
    this._proveedorService.getProveedorID(this.proveedor).subscribe(res => {
      this.proveedornombre = res.nombre
    })
  }
  onPageSizeChange() {
    this.page.offset = 0; // Resetear a la primera página cuando se cambia el tamaño
  }
  loadPage() {
    let min = this.page.offset * this.page.size
    let max = (this.page.offset + 1) * this.page.size <= this.page.count ? (this.page.offset + 1) * this.page.size : this.page.count
    this.rows = []
    for (let i = min; i < max; i++) {
      this.rows.push(this.data[i])
    }
  }
  onPage(event: any) {
    this.page.offset = event.offset;
    this.loadPage();
  }
  filterUpdate(event) {
    this.page.offset = 0;
    this.loadPage();
  }
  ConfirmDeleteOpen(id) {
    let tar = this.rows.filter(t => t.id == id)[0]
    let html = `
        <p>Se eliminará la tarifa del proveedor ${tar.expand.proveedor.nombre}</p>
        <p>"${tar.descripcion}"</p>
      `
    Swal.fire({
      title: '¿Eliminar?',
      //text: "Se eliminará la tarifa del proveedor",
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
        this.eliminarTarifario(id)
      }
    });
  }

  eliminarTarifario(id: string) {
    this._proveedorService.delTarifarioProveedor(id)
      .subscribe(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Tarifario proveedor eliminado exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          this._proveedorService.getTarifarioProveedorVigente(this.proveedor).then(res => {
            let tarifas = res.filter(t => t.oculto)
            this.data = tarifas
            this.page.count = tarifas.length
            this.page.offset = 0
            this.loadPage()

          })
        }
      );
  }
  exportarTarifarioOculto() {
    this._proveedorService.getTarifarioProveedorVigente(this.proveedor).then(res => {
      let tarifario = res.filter(t=>t.oculto)


      let csvData = tarifario.map((item: any) => ({
        PROVEEDOR: item.expand.proveedor.nombre,
        FECHADESDE: new Date(item.fechadesde).toLocaleDateString(),
        FECHAHASTA: new Date(item.fechahasta).toLocaleDateString(),
        PRECIO: item.precio,
        UNIDAD: item.expand.unidad.nombre,
        DESCRIPCION: item.descripcion
      }))
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(csvData);
      XLSX.utils.book_append_sheet(wb, ws, 'Tarifario oculto');
      XLSX.writeFile(wb, `Tarifario Oculto proveedores.xlsx`);
    })
  }
  ConfirmDescultarOpen(id) {

    let tarifa = this.rows.filter(t => t.id == id)[0]

    let html = `
              <p>Se desocultará la tarifa del proveedor</p>
              <p>"${tarifa.descripcion}"</p>
            `
    Swal.fire({
      title: 'Ocultar?',
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
        this.desocultarTarifario(id)

      }
    });
  }
  desocultarTarifario(id) {
    this._proveedorService.desocultarTarifario(id)
      .subscribe(
        data => {

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Tarifario proveedor desoculto exitosamente.',
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-outline-secondary'
            }
          });
          this._proveedorService.getTarifarioProveedorVigente(this.proveedor).then(res => {
            let tarifas = res.filter(t => t.oculto)
            this.data = tarifas
            this.page.count = tarifas.length
            this.page.offset = 0;
            this.loadPage()
          })
        }
      );
  }

}
