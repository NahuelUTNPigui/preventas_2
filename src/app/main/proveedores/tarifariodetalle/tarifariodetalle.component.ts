import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormGroup } from '@angular/forms';
import { SelectFormatService } from 'app/main/common';
import { ProveedorService } from '../servicios/proveedor.service';
@Component({
  selector: 'app-tarifariodetalle',
  templateUrl: './tarifariodetalle.component.html',
  styleUrls: ['./tarifariodetalle.component.scss']
})
export class TarifariodetalleComponent implements OnInit {

  // public
  public submitted = false;
  public success = false;
  public loading = false;
  public error = '';
  public urlLastValue;
  public accion: string;
  public url = this.router.url;
  public sidebarToggleRef = false;

  public tarifario;
  public tarifarioForm: FormGroup;
  public proveedores = []
  public unidades = []


  public precio = 0;
  public fechadesde = "";
  public fechahasta = "";
  public descripcion = "";
  public proveedor = "";
  public unidad = "";

  public guardado = false
  public preciovalido = true
  public fechadesdevalido = false
  public fechahastavalido = false
  public proveedorvalido = false
  public unidadvalida = false

  constructor(
    private router: Router,
    private _selectService: SelectFormatService,
    private _proveedorService: ProveedorService
  ) {
    this.proveedor = this.url.split('/')[3]
    this.accion = this.url.split('/')[4]
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    this._selectService.getTodasUnidades().subscribe(res => this.unidades = res.items)
    this._selectService.getTodosProveedores().then(res => this.proveedores = res)
    if (this.urlLastValue != '0') {
      if (this.accion == 'edit') {
        this._proveedorService.getTarifarioProveedor(this.urlLastValue).subscribe(res => {
          let fechadesde = new Date(res.fechadesde)
          let fechahasta = new Date(res.fechahasta)
          this.precio = res.precio
          this.descripcion = res.descripcion
          this.fechadesde = fechadesde.toISOString().split('T')[0]
          this.fechahasta = fechahasta.toISOString().split('T')[0]
          this.proveedor = res.proveedor
          this.unidad = res.unidad
        })
      }
      else {
        this._proveedorService.getTarifarioProveedor(this.urlLastValue).subscribe(res => {
          let fechadesde = new Date(res.fechahasta)

          this.precio = res.precio
          this.descripcion = res.descripcion
          this.fechadesde = fechadesde.toISOString().split('T')[0]
          this.fechahasta = ""
          this.proveedor = res.proveedor
          this.unidad = res.unidad
        })
      }

    }
  }
  guardar() {
    this.guardado = true
    let valid = this.validarTarifaProveedor()
    if (!valid) {
      return
    }
    if (this.accion === 'add')
      this.crearTarifaProveedor();
    else if (this.accion == 'edit')
      this.modificarTarifaProveedor()
    else if (this.accion == 'programar')
      this.programarTarifarioProveedor()
    else
      this.actualizarTarifa()
  }
  validarTarifaProveedor() {
    if (this.fechadesde != "") {
      this.fechadesdevalido = true
    }
    else {
      this.fechadesdevalido = false

    }
    if (this.fechahasta != "") {
      this.fechahastavalido = true
    }
    else {
      this.fechahastavalido = false
    }

    if (this.proveedor != "") {
      this.proveedorvalido = true
    }
    else {
      this.proveedorvalido = true
    }

    if (this.unidad != "") {
      this.unidadvalida = true
    }
    else {
      this.unidadvalida = false
    }
    if (this.unidadvalida && this.proveedorvalido && this.fechadesdevalido && this.fechahastavalido) {
      return true
    }
    else {
      return false
    }
  }
  cambioFechaDesde() {
    if (this.fechadesde != "") {
      this.fechadesdevalido = true
    }
    else {
      this.fechadesdevalido = false

    }
  }
  cambioFechaHasta() {
    if (this.fechahasta != "") {
      this.fechahastavalido = true
    }
    else {
      this.fechahastavalido = false
    }
  }
  onSubmit(valid) {
    this.submitted = true
    if (!valid) {
      return;
    }
    this.crearTarifaProveedor();
  }
  programarTarifarioProveedor() {
    this._proveedorService.programarTarifarioProveedor(this.precio, this.descripcion, this.proveedor, this.unidad, this.fechadesde, this.fechahasta).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Tarifario de Proveedor programado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.router.navigate([`/proveedores/tarpro/${this.proveedor}`]);
    })
  }
  crearTarifaProveedor() {
    this._proveedorService.addTarifarioProveedor(this.precio, this.descripcion, this.proveedor, this.unidad, this.fechadesde, this.fechahasta).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Tarifario de Proveedor creado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.router.navigate([`/proveedores/tarpro/${this.proveedor}`]);
    })
  }
  modificarTarifaProveedor() {
    this._proveedorService.modTarifarioProveedor(this.urlLastValue, this.precio, this.descripcion, this.proveedor, this.unidad, this.fechadesde, this.fechahasta).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Tarifario de proveedor modificado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }

      });

      this.router.navigate([`/proveedores/tarpro/${this.proveedor}`]);
    })
  }
  actualizarTarifa() {
    this._proveedorService.addTarifarioProveedor(this.precio, this.descripcion, this.proveedor, this.unidad, this.fechadesde, this.fechahasta).subscribe(res => {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Tarifario de Proveedor actualizado exitosamente.',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-secondary'
        }
      });
      this.router.navigate([`/proveedores/tarpro/${this.proveedor}`]);
    })
  }

}
