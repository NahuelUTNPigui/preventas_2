import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import Swal from 'sweetalert2';
import { TransferService } from '../transfer.service';
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
  public accion="Nueva"
  public url = this.router.url;
  //Lista
  public bancos = []
  public clientes = []
  public unidades = []
  public proveedores = []
  //Valores
  public fecha = ""
  public importe = 0
  public bancoorigen = ""
  public bancodestino = ""
  public alias = ""
  public cbu = ""
  public cliente = ""
  public proveedor = ""
  public unidad = ""
  public esIngreso = true
  public opcionesIngreso = [{value:true,nombre:"Ingreso"},{value:false,nombre:"Egreso"}]
  //Validacion
  public malbancoori = false
  public malbancodest = false
  public malfecha = false
  public malcliente = false
  public malunidad = false
  public botonhabilitado = false
  constructor(
    private router: Router,
    private _selectFormatService: SelectFormatService,
    private _transferService:TransferService
  ) { 
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
    let user = JSON.parse(localStorage.getItem('currentUser'))
    this.conpermisos = user.record.permisos > 0
  }

  ngOnInit(): void {
    this._selectFormatService.getTodosClientes().then(res=>{
      this.clientes = res
    })
    this._selectFormatService.getTodosProveedores().then(res=>{
      this.proveedores = res
    })
    this._selectFormatService.getAllBancos().then(res=>{
      this.bancos = res
    })
    this.unidades = this._selectFormatService.getCuentas()
    if(this.urlLastValue != '0'){
      this.accion = "Editar"
      this._transferService.getTransferID(this.urlLastValue).subscribe(res=>{
        this.fecha=res.fecha.split(" ")[0]
        this.importe=res.importe
        this.bancoorigen=res.bancoorigen
        this.bancodestino=res.bancodestino
        this.alias=res.alias
        this.cbu=res.cbu
        this.cliente=res.cliente
        this.proveedor = res.proveedor
        this.unidad=res.unidad
        this.esIngreso = res.ingreso
      })
      this.botonhabilitado = true
    }
  }
  validarBoton(){
    
    this.botonhabilitado = true
    if(this.bancodestino == ""){
      this.botonhabilitado = false
    }
    if(this.bancoorigen == ""){
      this.botonhabilitado = false
    }
    if(this.fecha == ""){
      this.botonhabilitado = false
    }
    if(this.unidad == ""){
      this.botonhabilitado = false
    }

  }
  validarCampo(campo){
   this.validarBoton()
   if(campo == "BANCOORI"){
    if(this.bancoorigen == ""){
      this.malbancoori = true
    }
    else{
      this.malbancoori = false
    }
   }
   if(campo == "BANCODEST"){
    if(this.bancodestino == ""){
      this.malbancodest = true
    }
    else{
      this.malbancodest = false
    }
   }
   if(campo == "FECHA"){
    if(this.fecha == ""){
      this.malfecha = true
    }
    else{
      this.malfecha = false
    }
   }
   
   if(campo == "UNIDAD"){
    if(this.unidad == ""){
      this.malunidad = true
    }
    else{
      this.malunidad = false
    }
   }
  }
  guardarTransfer(){
    if(this.urlLastValue != '0'){
      this._transferService.modTransfer(
        this.urlLastValue,
        this.fecha,this.importe,
        this.bancoorigen,this.bancodestino,
        this.alias,
        this.cbu,this.cliente,this.proveedor,this.unidad
      ).subscribe(res=>{
        Swal.fire("Éxito modificar transferencia","Se logró modificar la transferencia","success")
        this.router.navigate(["/transfer/lista"])
      })

    }
    else{
      this._transferService.addTransfer(
        
        this.fecha,this.importe,
        this.bancoorigen,this.bancodestino,
        this.alias,
        this.cbu,this.cliente,this.proveedor,this.unidad,this.esIngreso
      ).subscribe(res=>{
        Swal.fire("Éxito guardar transferencia","Se logró guardar la transferencia","success")
        this.router.navigate(["/transfer/lista"])
      })
    }
  }
  

}
