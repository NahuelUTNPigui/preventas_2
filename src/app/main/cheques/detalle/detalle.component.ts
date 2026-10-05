import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChequesService } from '../cheques.service';
import { SelectFormatService } from 'app/main/common';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {
  public conpermisos = false
  // public
  public urlLastValue;
  public accion = "Nuevo"
  public url = this.router.url;

  public fechaIngreso = ""
  public fechaAcreditacion = ""
  public banco = ''
  public fechaEntrega = ''
  public nro = ''
  public razonSocial = ''
  public cuit = ''
  public cliente = ''
  public proveedor = ""
  public tipo = 1
  public importe = 0
  public unidad = ""

  public malfechaIngreso = false
  public malfechaAcreditacion = false
  public malnro = false
  public malcuit = false
  public malcliente = false
  public malbanco = false
  public malunidad = false

  public malrazonsocial = false
  public chequerepetido = false
  public botonhabilitado = false

  //Lista
  public bancos = []
  public clientes = []
  public proveedores = []
  public tipos = []
  public unidades = []

  constructor(
    private router: Router,
    private _selectFormatService: SelectFormatService,
    private _chequeService: ChequesService
  ) {
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this._selectFormatService.getTodosClientes().then(res => {
      this.clientes = res
    })
    this._selectFormatService.getTodosProveedores().then(res => {
      this.proveedores = res
    })
    this._chequeService.getAllBancos().then(res => {
      this.bancos = res
    })
    this.tipos = this._chequeService.getTipos()
    this.unidades = this._selectFormatService.getCuentas()
    if (this.urlLastValue != '0') {
      this.accion = "Editar"
      this._chequeService.getChequeId(this.urlLastValue).subscribe(res => {
        this.nro = res.nro
        this.fechaIngreso = res.fechaIngreso.split(" ")[0]
        this.fechaAcreditacion = res.fechaAcreditacion.split(" ")[0]
        this.fechaEntrega = res.fechaEntrega.split(" ")[0]
        this.banco = res.banco
        this.razonSocial = res.razonSocial
        this.cliente = res.cliente
        this.tipo = res.tipo
        this.cuit = res.cuit
        this.importe = res.importe
        this.unidad = res.unidad
        this.proveedor = res.proveedor
        this.verificarNumero()
      })
      this.botonhabilitado = true
    }

  }
  validarBoton() {
    this.botonhabilitado = true
    if (this.fechaIngreso == "") {

      this.botonhabilitado = false
    }
    if (this.fechaAcreditacion == "") {

      this.botonhabilitado = false
    }
    if (this.nro == "") {

      this.botonhabilitado = false
    }
    if (this.razonSocial == "") {

      this.botonhabilitado = false
    }
    if (this.cuit == "") {

      this.botonhabilitado = false
    }
    if (this.cliente == "") {

      this.botonhabilitado = false
    }
    if (this.banco == "") {

      this.botonhabilitado = false
    }
    if (this.unidad == "") {
      this.botonhabilitado = false
    }


  }
  validarCampo(campo) {
    this.validarBoton()
    if (campo == "FECHAINGRESO") {
      if (this.fechaIngreso == "") {
        this.malfechaIngreso = true
      }
      else {
        this.malfechaIngreso = false
      }
    }
    if (campo == "FECHAACREDITACION") {
      if (this.fechaAcreditacion == "") {
        this.malfechaAcreditacion = true
      }
      else {
        this.malfechaAcreditacion = false
      }
    }
    if (campo == "NRO") {
      if (this.nro == "") {
        this.malnro = true
      }
      else {
        this.malnro = false
      }
    }
    if (campo == "CUIT") {
      if (this.cuit == "") {
        this.malcuit = true
      }
      else {
        this.malcuit = false
      }
    }
    if (campo == "CLIENTE") {
      if (this.cliente == "") {
        this.malcliente = true
      }
      else {
        this.malcliente = false
      }
    }
    if (campo == "BANCO") {
      if (this.banco == "") {
        this.malbanco = true
      }
      else {
        this.malbanco = false
      }
    }
    if (campo == "RAZON") {
      if (this.razonSocial == "") {
        this.malrazonsocial = true
      }
      else {
        this.malrazonsocial = false
      }
    }
    if (campo == "UNIDAD") {
      if (this.unidad == "") {
        this.malunidad = true
      }
      else {
        this.malunidad = false
      }
    }
  }
  verificarNumero() {
    this._chequeService.existeCheque(this.nro).then(res => {
      this.chequerepetido = res
    })
  }
  guardarCheque() {
    if (this.urlLastValue != '0') {
      this._chequeService.modCheque(
        this.urlLastValue,
        this.nro, this.fechaIngreso,
        this.fechaAcreditacion, this.fechaEntrega,
        this.banco, this.razonSocial, this.cuit,
        this.cliente, this.proveedor, this.tipo, this.importe, this.unidad
      ).subscribe(res => {

        Swal.fire("Éxito modificar cheque", "Se logro modificar el cheque", "success")
        this.router.navigate([`/cheques/lista`])
      })
    }
    else {
      this._chequeService.addCheque(
        this.nro, this.fechaIngreso,
        this.fechaAcreditacion, this.fechaEntrega,
        this.banco, this.razonSocial, this.cuit,
        this.cliente, this.proveedor, this.tipo, this.importe, this.unidad
      ).subscribe(res => {
        this._chequeService.crearAsientoAddCheque(res).then(resasiento => {
          Swal.fire("Éxito guardar cheque", "Se logro guardar el cheque", "success")
          this.router.navigate([`/cheques/lista`])
        })

      })
    }

  }


}
