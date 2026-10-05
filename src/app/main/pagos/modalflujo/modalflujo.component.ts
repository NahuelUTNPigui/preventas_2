import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
@Component({
  selector: 'app-modalflujo',
  templateUrl: './modalflujo.component.html',
  styleUrls: ['./modalflujo.component.scss']
})
export class ModalflujoComponent implements OnInit {
  @Input() saldo = 0
  @Input() indice = ""
  @Input() trans:any 
  public descripcion = ""
  public fecha = ""
  public importe = 0
  public proveedor = ""
  public esAdicional = false
  //Validaciones
  public botonhabilitado = false
  public malfecha = false
  @Output() transEvent = new EventEmitter<any>();
  constructor(
  ) { }

  ngOnInit(): void {
    if(this.indice !=""){
      this.descripcion = this.trans.descripcion 
      this.fecha = this.trans.fecha 
      this.importe = this.trans.importe
      this.esAdicional = this.trans.esAdicional
      this.botonhabilitado = true
      
    }
  }
  validarBoton(){
    this.botonhabilitado = true
    if(this.fecha == ""){
      this.botonhabilitado = false
    }
  }
  validarCampo(campo:any){
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
  addFlujo(){
    this.transEvent.emit({
      fecha:this.fecha,
      importe:this.importe,
      descripcion:this.descripcion,
      total:this.importe,
      esAdicional:this.esAdicional,
      categoria:"Efectivo"
    })
  }
  onInput(){
    this.saldo -= this.importe
  }
}
