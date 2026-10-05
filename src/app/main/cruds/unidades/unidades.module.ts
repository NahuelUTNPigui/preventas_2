import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';


import { DetalleComponent } from './detalle/detalle.component';
import { ListaComponent } from './lista/lista.component';

// routing
const routes: Routes = [
  {
    path: 'lista',
    component: ListaComponent
  },
  {
    path: 'add/:id',
    component: DetalleComponent
  },
  {
    path: 'edit/:id',
    component: DetalleComponent
  },
]

@NgModule({
  declarations: [
    DetalleComponent,
    ListaComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Ng2FlatpickrModule,
    NgxDatatableModule,
    FormsModule,
    NgbModule,
    SweetAlert2Module.forRoot(),
    CoreCommonModule,
    CoreDirectivesModule,
    CorePipesModule,
    NgSelectModule,
    CoreSidebarModule
  ]
})
export class UnidadesModule { }
