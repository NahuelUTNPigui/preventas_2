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

import { EstadoListComponent } from './estado-list/estado-list.component';
import { EstadoListService } from './estado.service';

import { AuthGuard } from 'app/auth/helpers/auth.guards';
// import { Role } from 'app/auth/models';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
// routing
const routes: Routes = [
  {
    path: 'estados',
    component: EstadoListComponent,
    canActivate: [AuthGuard],
    data: { animation: 'EstadoListComponent' }
  },
];

@NgModule({
  declarations: [
    EstadoListComponent,
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
  providers: [EstadoListService],
  exports: [EstadoListComponent]
})
export class EstadoModule {}
