import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListalocalidadesComponent } from './listalocalidades/listalocalidades.component';
import { ListaprovinciasComponent } from './listaprovincias/listaprovincias.component';
import { LocalidadComponent } from './localidad/localidad.component';
import { ProvinciaComponent } from './provincia/provincia.component';
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


// routing
const routes: Routes = [
  {
    path:'listalocalidades',
    component:ListalocalidadesComponent
  },
  {
    path:'listaprovincias',
    component:ListaprovinciasComponent
  },
  {
    path:'detallelocalidad/ver/:id',
    component:LocalidadComponent
  },
  {
    path:'detallelocalidad/add/:id',
    component:LocalidadComponent
  },
  {
    path:'detallelocalidad/edit/:id',
    component:LocalidadComponent
  },
  {
    path:'detalleprovincia/ver/:id',
    component:ProvinciaComponent
  },
  {
    path:'detalleprovincia/add/:id',
    component:ProvinciaComponent
  },
  {
    path:'detalleprovincia/edit/:id',
    component:ProvinciaComponent
  }
]

@NgModule({
  declarations: [
    ListalocalidadesComponent,
    ListaprovinciasComponent,
    LocalidadComponent,
    ProvinciaComponent
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
export class LocalidadesModule { }
