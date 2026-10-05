import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ChequesService } from 'app/main/cheques/cheques.service';
import { SelectFormatService } from 'app/main/common';
@Component({
  selector: 'app-detallecheque',
  templateUrl: './detallecheque.component.html',
  styleUrls: ['./detallecheque.component.scss']
})
export class DetallechequeComponent implements OnInit {
  @Input() saldo=0
  @Input() cheque: any
  public esVerFila = true
  public indice = ""
  //Datos
  public fechaIngreso = ""
  public fechaAcreditacion = ""
  public banco = ''
  public fechaEntrega = ''
  public nro = ''
  public razonSocial = ''
  public cuit = ''
  public cliente = ''
  public tipo = 1
  public importe = 0
  public unidad = ""
  public descripcion = ""
  //Lista
  public bancos:any[] = []
  public tipos:any[] = []
  public unidades:any[] = []
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
    this.indice = this.cheque.indice
    this.fechaIngreso = this.cheque.fechaIngreso.split(" ")[0]
    this.fechaAcreditacion = this.cheque.fechaAcreditacion.split(" ")[0]
    
    this.banco = this.cheque.banco
    this.fechaEntrega = this.cheque.fechaEntrega.split(" ")[0]
    this.nro = this.cheque.nro
    this.razonSocial = this.cheque.razonSocial
    this.cuit = this.cheque.cuit
    this.tipo = this.cheque.tipo
    this.importe = this.cheque.importe
    this.unidad = this.cheque.unidad
    this.descripcion = this.cheque.descripcion
  }
  onInput(){
    this.saldo -= this.cheque.importe
  }

}
