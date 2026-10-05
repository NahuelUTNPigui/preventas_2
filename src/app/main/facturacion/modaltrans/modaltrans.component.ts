import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modaltrans',
  templateUrl: './modaltrans.component.html',
  styleUrls: ['./modaltrans.component.scss']
})
export class ModaltransComponent implements OnInit {
  @Input() saldo = 0
  @Input() esDetalle = true
  @Input() indice = ""
  @Input() fechacobro = ""
  @Input() trans:any 
  @Input() esVerFila=false
  public descripcion = ""
  public fecha = ""
  public importe = 0
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
      this.botonhabilitado = true
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
  addFlujo(){
    this.transEvent.emit({
      fecha:this.fecha,
      importe:this.importe,
      descripcion:this.descripcion,
      total:this.importe,
      categoria:"Efectivo"
    })
  }
  onInput(){
    this.saldo -= this.importe
  }

}
