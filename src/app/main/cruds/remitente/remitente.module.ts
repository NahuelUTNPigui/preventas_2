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

import { RemitenteListComponent } from './remitente-list/remitente-list.component';
import { RemitenteAddComponent } from './remitente-add/remitente-add.component';
import { RemitenteEditComponent } from './remitente-edit/remitente-edit.component';

import { RemitenteService } from './remitente.service';
import { AuthGuard } from 'app/auth/helpers/auth.guards';
import { Role } from 'app/auth/models';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { TablaclientesComponent } from './tablaclientes/tablaclientes.component';
import { ModalclienteComponent } from './modalcliente/modalcliente.component';

// routing
const routes: Routes = [
  {
    path: 'remitentes',
    component: RemitenteListComponent,
    canActivate: [AuthGuard],
    // data: { roles: [Role.Admin], animation: 'RemitenteListComponent' }
  },
  {
    path: 'add',
    component: RemitenteAddComponent,
    canActivate: [AuthGuard],
    data: { animation: 'RemitenteAddComponent' }
  },
  {
    path: 'edit/:id',
    component: RemitenteEditComponent,
    canActivate: [AuthGuard],
    data: { animation: 'RemitenteEditComponent' }
  },
];

@NgModule({
  declarations: [
    RemitenteListComponent,
    RemitenteAddComponent,
    RemitenteEditComponent,
    TablaclientesComponent,
    ModalclienteComponent
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
  providers: [RemitenteService],
})
export class RemitenteModule { }
