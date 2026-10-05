

export class RemitoData {
    id?: string;
    fechaIngreso?: string;
    cliente?: string;
    nroRemito?: string;
    kilos?: number;
    bultos?: number;
    remitente?: string;
    destinatario?: string;
    localidad?: string;
    proveedor?: string;
    chofer?: string;
    vehiculo?: string;
    fechaEntrega?: string;
    confirmado?: boolean;
    reubicado?: boolean;
    facturar?: boolean;
    observacion?: string;
    novedad?: string;
    valorDeclarado?: number;
    precioUnitario?: number;
    porcentajeCobro?: number;
    totalViaje?: number;
    historial?: string;
    formaPago?: string;
    estado?: string;
    responsable?: string;
    hojaruta?: string;
    ubicacion?: string;
    observacioncorto?: string;
    etiqueta?:string;
    prioridad?:number;
    //cliente,cliente.formaPago,remitente,destinatario,destinatario.localidad,destinatario.localidad.provincia,estado,responsable
    expand?: {
        formaPago:{
                id:string,
                nombre:string
            },

        destinatario:{
                id:string,
                nombre:string,
                localidad:{
                    id:string,
                    nombre:string,
                    provincia:{
                        id:string,
                        nombre:string
                    },

                }
            },
        remitente:{
                id:string,
                nombre:string
            },
        cliente:{
            id:string,
            nombre:string,
            formaPago:{
                id:string,
                nombre:string
            }
        }
        localidad: { 
            provincia: string 
        }, 
        estado: { 
            id: string, 
            nombre: string 
        },
        responsable: { 
            id: string, 
            username: string 
        }
    }

}
