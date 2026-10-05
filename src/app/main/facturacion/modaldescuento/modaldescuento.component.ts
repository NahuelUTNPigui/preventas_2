import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modaldescuento',
  templateUrl: './modaldescuento.component.html',
  styleUrls: ['./modaldescuento.component.scss']
})
export class ModaldescuentoComponent implements OnInit {
  @Input() saldo = 0
  @Input() indice = ""
  @Input() descuento:any
  @Input() fechacobro = ""

  public fecha = ""
  public monto = 0
  public descripcion = ""

  //Validador
  public botonhabilitado = false
  public malfecha = false
  public malmonto = false
  public maldescripcion = false

  @Output() descuentoEvent = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
    if(this.indice != ""){
      this.fecha = this.descuento.fecha
      this.descripcion = this.descuento.descripcion
      this.monto = this.descuento.monto
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
  guardarDescuento(){
    this.descuentoEvent.emit({
      fecha:this.fecha,
      monto:this.monto,
      descripcion:this.descripcion
    })
  }
  onInput(){
    this.saldo -= this.monto
  }

}
