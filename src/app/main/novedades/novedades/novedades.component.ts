import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-novedades',
  templateUrl: './novedades.component.html',
  styleUrls: ['./novedades.component.scss']
})
export class NovedadesComponent implements OnInit {

  constructor() { }

  actualizaciones = [
    {
      fecha: "04/09/2026",
      mejoras: [
        {item:"Corrección tarifario"},
        { item: "Spinning a la hora de asociar destinatarios en clientes para saber si esta cargandose" },
        { item: "Exportar los remitos de una factura" },
        { item: "Editar remitos anulados" },
        { item: "Tabla de remitos cambiada" },
        { item: "Se comienza con el sistema de asientos contables y saldo para cliente y proveedores" },
      ]
    },

    {
      fecha: "14/08/2026",
      mejoras: [
        { item: "Hay un pequeño delay en la busqueda de remitos para que sea más dinámico" },
        { item: "Corrección de errores en la pantalla detalle de cliente" },
        { item: "Corrección de errores en la pantalla detalle de proveedor" },
        { item: "Corrección de errores en la pantalla de reportes generales" },
        { item: "En la pagina preventas se permite agregar detalles" },
        { item: "Cualquier usuario puede ver las facturas pero no puede modificarlas" },
        { item: "Corrección de calculo de totales en edición de facturas cuando agrego y quito remitos" },
      ]
    },
    {
      fecha: "20/07/2026",
      mejoras: [
        { item: "Se permite agregar provincias y localidades" },
        { item: "El historial de remitos se corrigió" },
        { item: "Mejora visual en transacciones y transferencias" },
        { item: "Corrección de edición de hojas de rutas en liquidación de hojs de ruta" },
        { item: "Corrección de vigencia de tarifas" },
        { item: "Se permite establecer remitos prioritarios" },
      ]
    },
    {
      fecha: "17/07/2026",
      mejoras: [
        { item: "Ocultar tarifas" },
        { item: "Preordenes" },
        { item: "Agregar clientes en nuevo destinatario" },
        { item: "Agregar destinatarios en nuevo cliente" },
      ]
    },
    {
      fecha: "27/06/2026",
      mejoras: [
        { item: "Anular remitos" },
        { item: "Mejorar pantalla de cerrar hojas de ruta" },
        { item: "Mejorar pantalla de detalles pagos" },
        { item: "Mejorar pantalla de detalles de orden pagos" },
        { item: "Remitos con prioridad" },
      ]
    },
    {
      fecha: "26/06/2026",
      mejoras: [
        { item: "Preventas de remitos" },
        { item: "Mejora en la pantalla de liquidacion de remitos" },
        { item: "Mejora en la pantalla de liquidacion de facturas" },
        { item: "Mejora en la pantalla de liquidacion de hojas de ruta" },
        { item: "Detalle de hoja de ruta según rol en el sistema" },
      ]
    },
    {
      fecha: "18/06/2026",
      mejoras: [
        { item: "Destinatarios importantes" },
      ]
    },
    {
      fecha: "16/04/2026",
      mejoras: [
        { item: "Tarifas programadas" },
        { item: "Agregar destinatario, en nuevo cliente" },
        { item: "Agregar remitente, en nuevo cliente" }

      ]
    },
    {
      fecha: "09/04/2026",
      mejoras: [
        { item: "Múltiple edición de estados simplificados" },
        { item: "Múltiple edición de tarifas simplificados" },
        { item: "Correccion de exportacion de HR" }
      ]
    },
    {
      fecha: "30/03/2026",
      mejoras: [
        { item: "Múltiple edición de estados" },
        { item: "Múltiple edición de tarifas" },
        { item: "Búsqueda de dirección de destinatario" }
      ]
    },
    {
      fecha: "23/02/2026",
      mejoras: [
        { item: "Rentabilidad proveedores" },
        { item: "Rentabilidad clientes" },


      ]
    },
    {
      fecha: "19/02/2026",
      mejoras: [
        { item: "Cuenta corriente de los clientes" },
        { item: "Cuenta corriente de los proveedores" },
        { item: "Editar cobros" },
        { item: "Editar pagos" },
        { item: "Se puede ver en 2 partes la tabla remitos" },

      ]
    },
    {
      fecha: "02/02/2026",
      mejoras: [
        { item: "Cuenta corriente de los clientes" },
        { item: "Edicion de remitos en facturas por linea" },

      ]
    },
    {
      fecha: "22/12/2025",
      mejoras: [
        { item: "Se pueden cobrar facturas y remitos" },
        { item: "Se pueden pagar ordenes de pago y hojas de ruta" },
        { item: "Se hace focus en el número de remito cuando se pone guardar en el múltiple rémito" }
      ]
    },
    {
      fecha: "22/12/2025",
      mejoras: [
        { item: "Corrección de cerrar hojas de rutas" },
      ]
    },

    {
      fecha: "18/12/2025",
      mejoras: [
        { item: "Cambiar el estado de remitos a la vez" },
        { item: "Cambiar el proveedor de una hoja de ruta" },
        { item: "Agregarle total a la hoja de ruta" },
        { item: "Mejor en multiples remitos" },
        { item: "Agregarles estados a la hoja de ruta" },
        { item: "El tarifario se ve en el editar remito" },
        { item: "Actualización historial" },
        { item: "Nueva pestaña para la liquidación de pagos" },
        { item: "Diferentes estadios de una factura" },
        { item: "Diferentes estadios de una oden de pago" },
        { item: "Los destinatarios tienen ubicación" }
      ]
    },
    {
      fecha: "09/05/2025",
      mejoras: [
        { item: "Nuevo módulo de pagos" },
        { item: "Se corrigio el error de hoja de ruta al ser eliminada no se actualizan los remitos" },
        { item: "Las hojas de ruta ahora tiene un costo de proveedor" },
        { item: "Se permite hacer analisis de rentabilidad de los proveedores" },


      ]

    },
    {
      fecha: "14/02/2025",
      mejoras: [
        { item: "Corrección de archivos de hoja de ruta, solo se crea 1" },
        { item: "Nueva sección de administración donde se pueden crear cheques, transferencias y transacciones" },
        { item: "Mejora en la facturación" }
      ]

    },
    {
      fecha: "30/01/2025",
      mejoras: [
        { item: "Quitar remitos de hoja de ruta" },
        { item: "Gráfico análisis de reporte remitos" },
        { item: "Gráfico análisis de reporte clientes" }
      ]

    },
    {
      fecha: "24/01/2025",
      mejoras: [
        { item: "Mejora en velocidad de reportes" },
        { item: "Corrección en la orden de pago de los proveedores" },
        { item: "Lista de hojas de ruta para tener un registro de los viajes" },
        { item: "Los archivos de facturación tiene vista previa" },
        { item: "Los remitos en facturacion se pueden filtrar por sin precio" },
        { item: "En la lista de destinatarios se pueden ver las observaciones" },
        { item: "En la sección facturación se pueden quitar los remitos facturados y los que no se deben facturar" },
        { item: "Cuando se entrega un remito se puede definir si esta conformado" },
        { item: "Corrección de errores en la facturación" },


      ]
    },
    {
      fecha: "09/12/2025",
      mejoras: [
        { item: "Exportar excel proveedores y remitentes" },
        { item: "Los clientes se le asigna un operador" },
        { item: "Buscar remitos por un campo particular" },
        { item: "Agregar varios remitos de un cliente en una fecha" },
        { item: "Reporte de proveedores" },
        { item: "Duplicación de remitos mejorada" },
        { item: "Guardar filtros de pagos y facturas" },
        { item: "Corrección de busqueda de pendientes" },
        { item: "Destinatarios tienen zonas que pueden ser filtradas en los remitos" },
        { item: "Se registran quienes modificaron un remito" },
        { item: "Se agregaron las observaciones" }
      ]

    },
    {
      fecha: "29/11/2024",
      mejoras: [
        { item: "Para filtrar se debe  cambiar de campo" },
        { item: "Marca si el remito fue desruteado" },
        { item: "Reporte de cliente por solo visible con permisos de adminitracion" },
        { item: "Exportar destinatarios y clientes" },
        { item: "Observaciones y horarios en la hoja de rutaa" },
        { item: "Mejora en el eliminar registros" },
        { item: "Columna facturar en el reporte remitos" },
      ]
    },
    {
      fecha: "28/10/2024",
      mejoras: [
        { item: "Los filtros se quedan guardados por usuario" },
        { item: "Se pueden crear reportes de remitos agrupados por cliente" }
      ]
    },
    {
      fecha: "14/10/2024",
      mejoras: [
        { item: "Correccion en el excel de facturacion" },
        { item: "Correccion en el total de facturacion" }
      ]
    },
    {
      fecha: "8/10/2024",
      mejoras: [
        { item: "Se reubico la columna total en la tabla facturacion para que los remitos sean mas fáciles de detectar cuando tengan errores" },
        { item: "Se actualiza el total en la tabla facturacion cuando se edita un remito" }
      ]
    },
    {
      fecha: "3/10/2024",
      mejoras: [
        { item: "Se corrigio el error del tarifario de clientes y proveedores" },
        { item: "Se ve el ultimo tarifario de los clientes para la creacion de remitos" },
        { item: "Los clientes ahora pueden ser responsbles inscriptos" },
        { item: "Se registra el cobro de facturas" },
        { item: "Se puede ver el detalle de cuenta corriente de los clientes" }
      ]
    },
    {
      fecha: "14/08/2024",
      mejoras: [
        { item: "Se pueden agregar detalles a las facturas" }
      ]
    },
    {
      fecha: "25/07/2024",
      mejoras: [
        {
          item: "Los usuarios tienen permisos"
        },
        {
          item: "Las hojas de ruta tienen las direcciones de los destinatarios"
        },
        {
          item: "Se puede agregar el motivo de porque se saco de la hoja de ruta a los remitos"
        },
        {
          item: "La administracion puede facturar los remitos"
        }
      ]
    },
    {
      fecha: "29/05/2024",
      mejoras: [
        {
          item: "Correccion reporte orden de pago, se utiliza la fecha de entrega"
        },
        {
          item: "Se ve el tarifario del cliente en agregar remito, habia problema con las fechas limites"
        }
      ]
    },
    {
      fecha: "28/05/2024",
      mejoras: [
        {
          item: "Tarifario de clientes"
        },
        {
          item: "Tarifario de proveedores"
        },
        {
          item: "Observaciones mas cortas"
        },
        {
          item: "Exportar remitos pendientes"
        },
        {
          item: "Campo no facturar en el reporte de facturacion y campo del nombre del estado"
        },
        {
          item: "Duplicar remito en cualquie estado"
        },
        {
          item: "Tarifario del proveedor en orden de pago"
        },
        {
          item: "Tarifario de cliente en el agregar remito"
        }
      ]
    },
    {
      fecha: "24/04/2024",
      mejoras: [
        {
          item: "En los archivos de reporte aparece el nombre del operador en vez de administrador"
        },
        {
          item: "Agregar chofer en reporte orden de pago"
        },
        {
          item: "Separar por chofer en reporte orden de pago"
        },
        {
          item: "Agregar chofer, proveedor y vehiculo en las hojas de ruta"
        },
        {
          item: "Ver localidad en agregar y modificar remito"
        }
      ]
    }
  ]
  ngOnInit(): void {
  }

}
