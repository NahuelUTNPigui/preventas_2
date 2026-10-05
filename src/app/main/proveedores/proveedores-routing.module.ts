import { Route, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ListaproveedoresComponent } from './listaproveedores/listaproveedores.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { ListachoferesComponent } from './listachoferes/listachoferes.component';
import { ChoferComponent } from './chofer/chofer.component';
import { ListavehiculosComponent } from './listavehiculos/listavehiculos.component';
import { VehiculoComponent } from './vehiculo/vehiculo.component';
import { TarifariodetalleComponent } from './tarifariodetalle/tarifariodetalle.component';
import { TarifarioComponent } from './tarifario/tarifario.component';
import { TarifariohistorialComponent } from './tarifariohistorial/tarifariohistorial.component';
import { ProgratarComponent } from './progratar/progratar.component';
import { TarifarioocultoComponent } from './tarifariooculto/tarifariooculto.component';
import { AsientosComponent } from './asientos/asientos.component';
const routes: Route[] = [
    {
        path:'listaproveedores',
        component:ListaproveedoresComponent
    },
    {
        path:'detalleproveedor/edit/:id',
        component:ProveedorComponent
    },
    {
        path:'detalleproveedor/ver/:id',
        component:ProveedorComponent
    },
    {
        path:'detalleproveedor/add/:id',
        component:ProveedorComponent
    },{
        path:'listachoferes',
        component:ListachoferesComponent
    },
    {
        path:'detallechofer/edit/:id',
        component:ChoferComponent
    },
    {
        path:'detallechofer/ver/:id',
        component:ChoferComponent
    }
    ,
    {
        path:'detallechofer/add/:id',
        component:ChoferComponent
    },{
        path:'listavehiculos',
        component:ListavehiculosComponent
    },
    {
        path:'detallevehiculo/edit/:id',
        component:VehiculoComponent
    },
    {
        path:'detallevehiculo/ver/:id',
        component:VehiculoComponent
    }
    ,
    {
        path:'detallevehiculo/add/:id',
        component:VehiculoComponent
    },
    {
        path:'tarpro/:prov',
        component:TarifarioComponent
    },
    {
        path:'tarpro/:prov/add/:id',
        component:TarifariodetalleComponent
    },
    {
        path:'tarpro/:prov/edit/:id',
        component:TarifariodetalleComponent
    },
    {
        path:'tarpro/:prov/actualizar/:id',
        component:TarifariodetalleComponent
    },
    {
        path:'tarpro/:prov/programar/:id',
        component:TarifariodetalleComponent
    },
    {
        path:'historialtar/:prov',
        component:TarifariohistorialComponent
    }
    ,
    {
        path:'ocultotar/:prov',
        component:TarifarioocultoComponent
    },
    {
        path:'progratar/:prov',
        component:ProgratarComponent
    },
    {
        path:'asientos/:prov',
        component:AsientosComponent
    }

]
@NgModule({
    imports: [RouterModule.forChild(routes)],
  })
  export class ProveedoresRoutingModule { }