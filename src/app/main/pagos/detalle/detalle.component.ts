import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { PagosService } from '../pagos.service';
import { SelectFormatService } from 'app/main/common';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {
  //Tab
  tab = 1
  //datos
  public verhojas = true
  public verdetalles = true
  public verrevision = false
  public verliquidacion = false
  public vercerrada = false
  public verpago = false
  public vernotas = false


  public url = this.router.url;
  public idhr = ""
  public id = ""
  public numero: string = ""
  public concepto: string = ""
  public proveedor: string = ""
  public idproveedor: string = ""
  public unidad: string = ""
  public prevunidad: string = ""
  public pago: string = ""
  public fechaorden: string = ""
  public fechaliquidacion: string = ""
  public fecharevision: string = ""

  public fechacierre: string = ""
  public total = 0
  public totalhojas = 0
  public totaldetalles = 0
  public totalsumado = 0
  public pagado = false
  public enrevision = false
  public enliquidacion = false
  public escerrada = false
  public notarevision = ""
  public notacierre = ""

  public unidades = []
  public detalles = []

  public hrs = []
  public hrsid = []
  public rowhrs = []
  public numerohr = ""

  public descripciondetalle = ""
  public totaldetalle = 0

  public pagedeta = {
    size: 20, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public pagehr = {
    size: 50, // Tamaño de la página
    count: 0, // Total de elementos
    offset: 0 // Página actual
  };
  public ColumnMode = ColumnMode;
  constructor(
    private router: Router,
    private _pagosService: PagosService,
    private modalService: NgbModal,
    private _selectService: SelectFormatService

  ) {
    this.id = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  ngOnInit(): void {
    this.unidades = this._pagosService.getUnidades()
    this._pagosService.getOrden(this.id).then(res => {
      this.detalles = res.detalles
      this.hrs = res.hrs
      this.rowhrs = res.hrs
      this.numero = res.numero
      this.concepto = res.concepto
      this.total = res.total
      this.pagado = res.pagado
      this.pago = res.pago
      this.unidad = res.unidad
      this.prevunidad = res.unidad
      this.enliquidacion = res.enliquidacion
      this.enrevision = res.enrevision
      this.escerrada = res.escerrada
      this.notacierre = res.notacierre
      this.notarevision = res.notarevision
      this.fecharevision = this.formatDate(res.revisión)
      this.fechaorden = this.formatDate(res.fechaorden)
      this.fechaliquidacion = this.formatDate(res.liquidacion)
      this.fechacierre = this.formatDate(res.fechacierre)
      this.proveedor = res.expand.proveedor.nombre
      this.idproveedor = res.proveedor
      this.pagedeta.count = res.detalles.length

      this.pagehr.count = res.hrs.length
      this.hrsid = res.hrs.map(h => h.id)

      this.calcularSuma()

    })
  }
  calcularSuma() {
    this.totalhojas = 0
    this.totaldetalles = 0
    this.totalsumado = 0
    this.hrs.forEach(h => {
      this.totalhojas += h.totalproveedor

    });
    this.totalhojas = this.redondear(this.totalhojas)
    this.detalles.forEach(d => {
      this.totaldetalles += d.monto
    })
    this.totaldetalles = this.redondear(this.totaldetalles)
    this.totalsumado = this.totalhojas + this.totaldetalles
  }
  redondear(num) {
    return Math.round(1000 * num) / 1000
  }
  openModal(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  editarOrden() {
  
    if (this.enliquidacion) {
      Swal.fire("Edición denegada", "Una vez en liquidación la orden, solo se puede eliminar, pagar o cerrar", "error")
      return
    }

    this._pagosService.editOrden(this.numero, this.total, this.fechaorden + " 03:00:00", this.unidad, this.concepto, this.id).subscribe(res => {
      this.prevunidad = this.unidad
      Swal.fire("Exito editar", "Se pudo editar la orden", "success")

    })
  }
  updateHR() {
    this.rowhrs = this.hrs.filter(hr => hr.nro)

  }
  formatDate(fechaCompleta) {
    if (fechaCompleta && fechaCompleta.length > 0) {
      const fecha = new Date(fechaCompleta);
      return fecha.toISOString().split('T')[0];
    }
    else {
      return ""
    }

  }
  toggleDetalle() {
    this.verdetalles = !this.verdetalles
  }
  toggleHojas() {
    this.verhojas = !this.verhojas
  }
  toggleRevision() {
    this.verrevision = !this.verrevision
  }
  toggleLiquidacion() {
    this.verliquidacion = !this.verliquidacion
  }
  toggleCierre() {
    this.vercerrada = !this.vercerrada
  }
  togglePago() {
    this.verpago = !this.verpago
  }
  toggleNotas() {
    this.vernotas = !this.vernotas
  }

  agregarDetalle() {
    if (this.descripciondetalle.length == 0) {
      Swal.fire("Error descripcion", "Debe escribir algo de descripción", "error")
      return
    }
    let data = {
      descripcion: this.descripciondetalle,
      monto: this.totaldetalle
    }
    this._pagosService.guardarDetalles(this.id, [data]).then(res => {
      Swal.fire("Éxito agregar detalle", "Se logró agregar el detalle", "success")
      this._pagosService.getDetallesEnOrden(this.id).then(res => {
        this.detalles = res
        this.pagedeta.count = res.length
        this.calcularSuma()
      })

    })
    //this._pagosService.ad

  }
  quitarDetalle(row) {
    this._pagosService.quitarDetalleEnOrden(row.id).subscribe(resdelete => {
      Swal.fire("Éxito quitar detalle", "Se logró quitar el detalle", "success")
      this._pagosService.getDetallesEnOrden(this.id).then(res => {
        this.detalles = res
        this.pagedeta.count = res.length
        this.calcularSuma()
      })
    })
  }
  ConfirmRevisar() {
    if (this.enliquidacion) {
      Swal.fire("Revisión denegada", "En liquidación solo se puede cerrar, eliminar o cobrar", "error")
      return
    }
    if (this.fecharevision.length < 1) {
      Swal.fire("Error", "Debe seleccionar una fecha de revisión", "error")
      return
    }
    let html = `
      <p>Se cambiará el estado a "En Revisión"</p> 
    `
    Swal.fire({
      title: 'Revisar?',
      //text: "Se eliminará el remito"
      html,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        this.revisar()
      }
    });
  }
  revisar() {
    this._pagosService.revisar(this.notarevision, this.fecharevision, this.id).subscribe(res => {
      this.enrevision = true
      this.enliquidacion = false

      this.pagado = false
      this.escerrada = false
      Swal.fire("Éxito", "Se cambió a En Revisión con éxito ", "success")
    })
  }
  ConfirmLiquidar() {
    if (this.fechaliquidacion.length < 1) {
      Swal.fire("Error", "Debe seleccionar una fecha de liquidación", "error")
      return
    }
    if (this.unidad.length < 1) {
      Swal.fire("Error", "Debe seleccionar una unidad", "error")
      return
    }
    if (this.enliquidacion) {
      Swal.fire("Liquidación denegada", "En liquidación solo se puede cerrar, eliminar o cobrar", "error")
      return
    }
    let html = `
        <p>Se cambiará el estado a "Liquidación"</p> 
      `
    Swal.fire({
      title: 'Liquidar?',
      //text: "Se eliminará el remito"
      html,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        this.liquidar()
      }
    });
  }
  liquidar() {


    this._pagosService.liquidar(this.fechaliquidacion, this.id).subscribe(res => {


      let orden = {
        id: this.id,
        proveedor: this.idproveedor,
        liquidacion: this.fechaliquidacion + " 03:00:00",
        unidad: this.unidad,
        numero: this.numero,
        total: this.total
      }
      this._pagosService.crearAsientoLiquidarOrden(orden).then(res => {
        if (this.prevunidad != this.unidad) {

          this.editarOrden()
        }
        this.enrevision = false
        this.enliquidacion = true

        this.pagado = false
        this.escerrada = false
        Swal.fire("Éxito", "Se cambió a En liquidación con éxito ", "success")
      })

    })
  }
  ConfirmCerrar() {
    if (this.fechacierre.length < 1) {
      Swal.fire("Error", "Debe seleccionar una fecha de cierre", "error")
      return
    }
    let html = `
      <p>Se cambiará el estado a "Cerrada"</p> 
    `
    Swal.fire({
      title: 'Cerrar?',
      //text: "Se eliminará el remito"
      html,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary'
      }
    }).then((result) => {
      if (result.value) {
        this.cerrar()
      }
    });
  }
  cerrar() {
    this._pagosService.cerrar(this.notacierre, this.fechacierre, this.id).subscribe(res => {
      if (this.enliquidacion) {
        let orden = {
          id: this.id,
          proveedor: this.idproveedor,
          fechacierre: this.fechacierre + " 03:00:00",
          unidad: this.unidad,
          numero: this.numero,
          total: this.total
        }
        this._pagosService.crearAsientoCerrarOrden(orden).then(res => {
          this.enrevision = false
          this.enliquidacion = false

          this.pagado = false
          this.escerrada = true
          Swal.fire("Éxito", "Se cambió a Cerrada con éxito y se creó un asiento", "success")

        })
      }
      else {
        this.enrevision = false
        this.enliquidacion = false

        this.pagado = false
        this.escerrada = true
        Swal.fire("Éxito", "Se cambió a Cerrada con éxito ", "success")
      }

    })
  }
  editarHoja(row, modal) {

    this.idhr = row.id
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  quitarHoja(row) {
    this._pagosService.quitarHojaEnOrden(row.id).subscribe(res => {
      this.updateHojas()
      Swal.fire("Éxito agregar", "Se logro agregar la hoja", "success")

    })
  }

  openModalBuscarHojas(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      windowClass: 'modal modal-primary'
    });
  }
  updateHojas() {
    this._pagosService.getHojasEnOrden(this.id).then(res => {
      this.rowhrs = res
      this.hrs = res
      this.hrsid = this.hrs.map(h => h.id)
      this.calcularSuma()
    })
  }
  cerrarModalBuscar(modal, event) {
    modal.dismiss('Cross click')
  }
  cerrarEditHR(modal, event) {

    this.updateHojas()
    modal.dismiss('Cross click')
    this.idhr = ""
  }
  elegirHoja(modal, event) {

    this._pagosService.agregarHojaEnOrden(event.id, this.id).subscribe(res => {
      this.updateHojas()
      Swal.fire("Éxito agregar", "Se logro agregar la hoja", "success")
      modal.dismiss('Cross click')
    })

  }
  irPago() {
    this.router.navigateByUrl("/pagos/detallepago/" + this.pago)
  }
  onNavChange(event: any) {
    this.tab = event.nextId;
  }


}
