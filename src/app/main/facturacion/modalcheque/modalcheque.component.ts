import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ChequesService } from 'app/main/cheques/cheques.service';
import { SelectFormatService } from 'app/main/common';

@Component({
  selector: 'app-modalcheque',
  templateUrl: './modalcheque.component.html',
  styleUrls: ['./modalcheque.component.scss']
})
export class ModalchequeComponent implements OnInit {
  @Input() saldo = 0
  @Input() esDetalle = true
  @Input() indice = ""
  @Input() public cuit = ""
  @Input() fechacobro = ""
  @Input() cheque: any
  @Input() esVerFila = false

  public fechaIngreso = ""
  public fechaAcreditacion = ""
  public banco = ''
  public fechaEntrega = ''
  public nro = ''
  public razonSocial = ''
  
  public cliente = ''
  public tipo = 1
  public importe = 0
  public unidad = ""
  public descripcion = ""

  public malfechaIngreso = false
  public malfechaAcreditacion = false
  public malnro = false
  public malcuit = false
  public malbanco = false
  public malunidad = false
  public malrazonsocial = false
  public botonhabilitado = false
  public chequerepetido = false
  //Lista
  public bancos = []
  public tipos = []
  public unidades = []

  @Output() chequeEvent = new EventEmitter<any>();
  constructor(
    private _selectFormatService: SelectFormatService,
    private _chequeService: ChequesService
  ) { }

  ngOnInit(): void {
    this._chequeService.getAllBancos().then(res => {
      this.bancos = res
    })
    this.tipos = this._chequeService.getTipos()
    this.unidades = this._selectFormatService.getCuentas()
    if (this.indice != "") {
      this.fechaIngreso = this.cheque.fechaIngreso
      this.fechaAcreditacion = this.cheque.fechaAcreditacion
      this.banco = this.cheque.banco
      this.fechaEntrega = this.cheque.fechaEntrega
      this.nro = this.cheque.nro
      this.razonSocial = this.cheque.razonSocial
      this.cuit = this.cheque.cuit
      this.tipo = this.cheque.tipo
      this.importe = this.cheque.importe
      this.unidad = this.cheque.unidad
      this.descripcion = this.cheque.descripcion
      this.validarNumero()
      this.botonhabilitado = true
    }
    else {
      this.fechaIngreso = this.fechacobro
    }
    this.validarBoton()
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
  guardarCheque() {
    this.chequeEvent.emit({
      fechaIngreso: this.fechaIngreso,
      fechaAcreditacion: this.fechaAcreditacion,
      banco: this.banco,
      fechaEntrega: this.fechaEntrega,
      nro: this.nro,
      razonSocial: this.razonSocial,
      cuit: this.cuit,
      tipo: this.tipo,
      importe: this.importe,
      unidad: this.unidad,
      descripcion: this.descripcion,
      total: this.importe,
      nuevo:this.cheque.nuevo,
      categoria: "Cheque"
    })
  }
  validarNumero() {
    if (this.cheque.nuevo) {
      this._chequeService.existeCheque(this.nro).then(res => {
        this.chequerepetido = res
      })
    }

  }
  onInput(){
    this.saldo -= this.importe
  }

}
