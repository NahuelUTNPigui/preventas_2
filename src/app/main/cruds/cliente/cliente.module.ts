import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';

import { ClienteListComponent } from './cliente-list/cliente-list.component';
import { ClienteAddComponent } from './cliente-add/cliente-add.component';
import { ClienteEditComponent } from './cliente-edit/cliente-edit.component';

import { ClienteService } from './cliente.service';
import { AuthGuard } from 'app/auth/helpers/auth.guards';
import { Role } from 'app/auth/models';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { TabladestinatariosComponent } from './tabladestinatarios/tabladestinatarios.component';
import { ModaldestinatarioComponent } from './modaldestinatario/modaldestinatario.component';
import { TablaremitentesComponent } from './tablaremitentes/tablaremitentes.component';
import { ModalremitenteComponent } from './modalremitente/modalremitente.component';
import { ModalnuevodestComponent } from './modalnuevodest/modalnuevodest.component';
import { ModalasociarremitenteComponent } from './modalasociarremitente/modalasociarremitente.component';
import { TarifarioComponent } from './tarifario/tarifario.component';
import { TarifariodetalleComponent } from './tarifariodetalle/tarifariodetalle.component';
import { TarifariohistorialComponent } from './tarifariohistorial/tarifariohistorial.component';
import { ProgratarComponent } from './progratar/progratar.component';
import { TarifarioocultoComponent } from './tarifariooculto/tarifariooculto.component';
import { AsientosComponent } from './asientos/asientos.component';


// routing
const routes: Routes = [
  {
    path: 'clientes',
    component: ClienteListComponent,
    canActivate: [AuthGuard],
    // data: { roles: [Role.Admin], animation: 'ClienteListComponent' }
  },
  {
    path: 'add',
    component: ClienteAddComponent,
    canActivate: [AuthGuard],
    data: { animation: 'ClienteAddComponent' }
  },
  {
    path: 'edit/:id',
    component: ClienteEditComponent,
    canActivate: [AuthGuard],
    data: { animation: 'ClienteEditComponent' }
  },
  {
    path:'tarcli/:cliente',
    component:TarifarioComponent
  },
  {
    path:'tarcli/:cliente/add/:id',
    component:TarifariodetalleComponent
  },
  {
    path:'tarcli/:cliente/edit/:id',
    component:TarifariodetalleComponent
  }
  ,
  {
    path:'tarcli/:cliente/actualizar/:id',
    component:TarifariodetalleComponent
  },
  {
    path:'tarcli/:cliente/programar/:id',
    component:TarifariodetalleComponent
  },
  {
    path:'historialtar/:cliente',
    component:TarifariohistorialComponent
  },
  {
    path:'ocultotar/:cliente',
    component:TarifarioocultoComponent
  },
  {
    path:'progratar/:cliente',
    component:ProgratarComponent
  },
  {
    path:'asientos/:cliente',
    component:AsientosComponent
  }

  
];

@NgModule({
  declarations: [
    ClienteListComponent,
    ClienteAddComponent,
    ClienteEditComponent,
    TabladestinatariosComponent,
    ModaldestinatarioComponent,
    TablaremitentesComponent,
    ModalremitenteComponent,
    ModalnuevodestComponent,
    ModalasociarremitenteComponent,
    TarifarioComponent,
    TarifariodetalleComponent,
    TarifariohistorialComponent,
    ProgratarComponent,
    TarifarioocultoComponent,
    AsientosComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    CoreDirectivesModule,
    Ng2FlatpickrModule,
    NgxDatatableModule,
    FormsModule,
    CorePipesModule,
    NgbModule,
    NgSelectModule,
    CoreSidebarModule,
    SweetAlert2Module.forRoot(),
    ContentHeaderModule,
  ],
  providers: [ClienteService],
})
export class ClienteModule { }
