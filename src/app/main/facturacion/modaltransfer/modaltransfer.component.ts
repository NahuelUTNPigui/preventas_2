import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SelectFormatService } from 'app/main/common';
@Component({
  selector: 'app-modaltransfer',
  templateUrl: './modaltransfer.component.html',
  styleUrls: ['./modaltransfer.component.scss']
})
export class ModaltransferComponent implements OnInit {
  @Input() saldo = 0
  @Input() esDetalle = true
  @Input() indice = ""
  @Input() fechacobro = ""
  @Input() transfer: any
  @Input() esVerFila = false
  //Lista
  public bancos = []
  public unidades = []
  //Valores
  public descripcion = ""
  public fecha = ""
  public importe = 0
  public bancoorigen = ""
  public bancodestino = ""
  public alias = ""
  public cbu = ""
  public unidad = ""
  //Validacion
  public malbancoori = false
  public malbancodest = false
  public malfecha = false
  public malunidad = false
  public botonhabilitado = false
  @Output() transferEvent = new EventEmitter<any>();
  constructor(
    private _selectFormatService: SelectFormatService,

  ) { }

  ngOnInit(): void {
    this._selectFormatService.getAllBancos().then(res => {
      this.bancos = res
    })
    this.unidades = this._selectFormatService.getCuentas()
    if (this.indice != "") {
      this.descripcion = this.transfer.descripcion
      this.fecha = this.transfer.fecha
      this.importe = this.transfer.importe
      this.bancoorigen = this.transfer.bancoorigen
      this.bancodestino = this.transfer.bancodestino
      this.alias = this.transfer.alias
      this.cbu = this.transfer.cbu
      this.unidad = this.transfer.unidad
      this.botonhabilitado = true
    }
    else {
      this.fecha = this.fechacobro
    }
    this.validarBoton()
  }
  validarBoton() {

    this.botonhabilitado = true
    if (this.bancodestino == "") {
      this.botonhabilitado = false
    }
    if (this.bancoorigen == "") {
      this.botonhabilitado = false
    }
    if (this.fecha == "") {
      this.botonhabilitado = false
    }
    if (this.unidad == "") {
      this.botonhabilitado = false
    }

  }
  validarCampo(campo) {
    this.validarBoton()
    if (campo == "BANCOORI") {
      if (this.bancoorigen == "") {
        this.malbancoori = true
      }
      else {
        this.malbancoori = false
      }
    }
    if (campo == "BANCODEST") {
      if (this.bancodestino == "") {
        this.malbancodest = true
      }
      else {
        this.malbancodest = false
      }
    }
    if (campo == "FECHA") {
      if (this.fecha == "") {
        this.malfecha = true
      }
      else {
        this.malfecha = false
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
  guardarTransfer() {
    this.transferEvent.emit({
      descripcion: this.descripcion,
      fecha: this.fecha,
      importe: this.importe,
      bancoorigen: this.bancoorigen,
      bancodestino: this.bancodestino,
      alias: this.alias,
      cbu: this.cbu,
      unidad: this.unidad,
      total: this.importe,
      categoria: "Transferencia"
    })
  }
  onInput(){
    this.saldo -= this.importe
  }

}
