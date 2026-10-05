import { CoreMenu } from '@core/types'

export const menu: CoreMenu[] = [
  {
    id: 'home',
    title: 'Home',
    translate: 'MENU.HOME',
    type: 'item',
    icon: 'home',
    url: 'home'
  },
  {
    id:'clientes',
    title:'Clientes',
    type:'collapsible',
    icon:'box',
    children:[
      {
        id: 'listaclientes',
        title: 'Clientes',
        type: 'item',
        icon: 'box',
        url: 'clientes'
      },
      {
        id: 'destinatarios',
        title:'Destinatarios',
        type:'item',
        icon:'archive',
        url:'destinatarios/listadestinatarios'
      },
      {
        id: 'remitentes',
        title:'Remitentes',
        type:'item',
        icon:'archive',
        url:'remitentes'
      }
    ]
  },
  

  {
    id: "remitos",
    title: "Remitos",
    type: 'collapsible',
    icon: 'book',
    children: [
      {
        id: "listRemitos",
        title: "Remitos",
        type: 'item',
        icon: 'circle',
        url: '/remitos'
      },
      
      {
        id: "multipleedit",
        title: "Multiple edicion",
        type: 'item',
        icon: 'aperture',
        url: '/multipleedit'
      },
      {
        id: "hojasruta",
        title: "Hojas de ruta",
        type: 'item',
        icon: 'calendar',
        url: '/hojasruta'
      },
      {
        id: "preventas",
        title: "Preventas",
        type: 'item',
        icon: 'circle',
        url: '/preventas'
      },
      {
        id: "preordenes",
        title: "Preordenes",
        type: 'item',
        icon: 'circle',
        url: '/preordenes'
      },
      {
        id: "reporteProvs",
        title: "Reporte proveedores",
        type: 'item',
        icon: 'bar-chart',
        url: '/reportes/reporteproveedores'
      },
      {
        id: "reportec",
        title: "Reporte clientes",
        type: 'item',
        icon: 'bar-chart',
        url: '/reportes/reporteclientes'
      },
      {
        id: "reporteRem",
        title: "Reporte remitos",
        type: 'item',
        icon: 'slack',
        url: '/reportes/reporteremitos'
      }
    ]
  },
  {
    id: 'proveedores',
    title: 'Proveedores',
    type: 'collapsible',
    icon: 'tag',
    children: [
      {
        id: "listaProveedores",
        title: "Proveedores",
        type: 'item',
        icon: 'user',
        url: 'proveedores/listaproveedores'
      },
      {
        id: "listaVehiculos",
        title: "Vehículos",
        type: 'item',
        icon: 'truck',
        url: 'proveedores/listavehiculos'
      },
      {
        id: "listaChoferes",
        title: "Choferes",
        type: 'item',
        icon: 'triangle',
        url: 'proveedores/listachoferes'
      }
    ]
  },
  {
    id: 'tarifario',
    title: 'Tarifario',
    type: 'collapsible',
    icon: 'square',
    children:[
      {
        id: "tarprov",
        title: "Proveedores",
        type: 'item',
        icon: 'tag',
        url: 'tarifario/proveedores'
      },
      {
        id: "tarcli",
        title: "Clientes",
        type: 'item',
        icon: 'box',
        url: 'tarifario/clientes'
      }
    ]
  },
  {
    id: "usuarios",
    title: "Usuarios",
    type: "item",
    icon: "users",
    role: ['Admin'],
    url: "/usuarios"
  },
  {
    id: 'parametros',
    title: 'Parámetros',
    type: 'collapsible',
    icon: 'settings',
    // role: ['Admin'],
    children: [
      {
        id: 'estados',
        title: 'Estados',
        type: 'item',
        icon: 'box',
        url: 'estados'
      },
      {
        id: 'formas-de-pago',
        title: 'Formas de pago',
        type: 'item',
        icon: 'clipboard',
        url: 'formas-de-pago'
      },
      {
        id: "unidades",
        title: "Unidades",
        type: "item",
        icon: "box",
        url: "/unidades/lista"
      },
      {
        id: "localidades",
        title: "Localidades",
        type: "item",
        icon: "bookmark",
        url: "/localidades/listalocalidades"
      },
      {
        id: "provincias",
        title: "Provincias",
        type: "item",
        icon: "bookmark",
        url: "/localidades/listaprovincias"
      }

    ]
  },
  {
    id: "facturacion",
    title: "Facturacion",
    type: "collapsible",
    icon: "check",
    children:[
      //{
      //  id: "mainacuentas",
      //  title: "A cuenta",
      //  type: "item",
      //  icon: "list",
      //  url: "/facturacion/listaacuentas"
      //},
      {
        id: "mainlista",
        title: "Notas crédito",
        type: "item",
        icon: "disc",
        url: "/facturacion/listanotas"
      },
      {
        id: "mainrete",
        title: "Retenciones",
        type: "item",
        icon: "disc",
        url: "/facturacion/listarenteciones"
      },
      {
        id: "maindesc",
        title: "Descuentos",
        type: "item",
        icon: "disc",
        url: "/facturacion/listadescuentos"
      },
      {
        id: "mainfacturacion",
        title: "Liquidación remitos",
        type: "item",
        icon: "target",
        url: "/facturacion/main"
      },
      {
        id: "listafacturacion",
        title: "Lista de facturas",
        type: "item",
        icon: "columns",
        url: "/facturacion/lista"
      },
      {
        id:"listacobros",
        title:"Cobros",
        type:"item",
        icon:"briefcase",
        url:"/facturacion/cobros"
      },
      {
        id:"cuentacorriente",
        title:"Cuenta corriente",
        type:"item",
        icon:"slack",
        url:"/facturacion/cuentacorriente"
      },
      {
        id:"clienterentabilidad",
        title:"Rentabilidad",
        type:"item",
        icon:"bar-chart",
        url:"/facturacion/rentabilidad"
      }
    ]
  },
  {
    id: "pagos",
    title: "Pagos",
    type: "collapsible",
    icon: "coffee",
    children:[
      {
        id: "descuentospagos",
        title: "Descuentos",
        type: "item",
        icon: "disc",
        url: "/pagos/descuentospago"
      },
      //{
      //  id: "acuentaspagos",
      //  title: "A cuenta",
      //  type: "item",
      //  icon: "disc",
      //  url: "/pagos/acuentaspago"
      //},
      {
        id: "hrspago",
        title: "Liquidación hojas de ruta",
        type: "item",
        icon: "calendar",
        url: "/pagos/hrs"
      },
      {
        id: "ordenes",
        title: "Ordenes de Pago",
        type: "item",
        icon: "briefcase",
        url: "/pagos/ordenes"
      },
      {
        id: "pagos",
        title: "Pagos",
        type: "item",
        icon: "coffee",
        url: "/pagos/lista"
      },
      {
        id: "corriente",
        title: "Cuenta corriente",
        type: "item",
        icon: "slack",
        url: "/pagos/corriente"
      },
      {
        id:"proveedorrentabilidad",
        title:"Rentabilidad",
        type:"item",
        icon:"bar-chart",
        url:"/pagos/rentabilidad"
      }
    ]
  },
  {
    id: "admin",
    title: "Administracion",
    type: "collapsible",
    icon: "book-open",
    children:[
      {
        id: "listacheques",
        title: "Cheques",
        type: "item",
        icon: "layers",
        url: "/cheques/lista"
      },
      {
        id: "transfer",
        title: "Transferencias",
        type: "item",
        icon: "book",
        url: "/transfer/lista"
      },
      {
        id: "trans",
        title: "Transacciones",
        type: "item",
        icon: "list",
        url: "/transfer/transacciones"
      },
      {
        id: "bancos",
        title: "Bancos",
        type: "item",
        icon: "credit-card",
        url: "/cheques/bancos"
      }
    ]
  },
  {
    id: "novedades",
    title: "Actualizacion",
    type: "item",
    icon: "users",
    url: "/novedades/novedades"
  }

]
