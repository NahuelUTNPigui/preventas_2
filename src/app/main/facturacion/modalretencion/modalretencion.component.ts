import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { FacturacionService } from '../facturacion.service';
@Component({
  selector: 'app-modalretencion',
  templateUrl: './modalretencion.component.html',
  styleUrls: ['./modalretencion.component.scss']
})
export class ModalretencionComponent implements OnInit {
  @Input() saldo=0
  @Input() indice = ""
  @Input() retencion:any
  @Input() fechacobro = ""
  @Input() esVerFila = false
  public tiporetenciones = []

  public fecha = ""
  public monto = 0
  public descripcion = ""
  

  //Validador
  public botonhabilitado = false
  public malfecha = false
  public malmonto = false
  public maldescripcion = false


  @Output() retencionEvent = new EventEmitter<any>();
  constructor(
    private _factService:FacturacionService
  ) { }

  ngOnInit(): void {
    this.tiporetenciones =  this._factService.getAllRetenciones()
    if(this.indice != ""){
      this.fecha = this.retencion.fecha
      this.descripcion = this.retencion.descripcion
      this.monto = this.retencion.monto
    }
    else{
      this.fecha = this.fechacobro
    }
    this.validarBoton()
  }

  validarBoton(){
    this.botonhabilitado = true
    if(this.fecha == ""){
      this.botonhabilitado = false
    }
  }
  validarCampo(campo){
    this.validarBoton()
    if(campo == "FECHA"){
      if(this.fecha == ""){
        this.malfecha = true
      }
      else{
        this.malfecha = false
      }
    }
  }
  guardarRetencion(){
    this.retencionEvent.emit({
      fecha:this.fecha,
      monto:this.monto,
      descripcion:this.descripcion
    })
  }
  onInput(){
    this.saldo -= this.monto
  }



}
