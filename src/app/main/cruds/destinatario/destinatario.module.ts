import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
//Componentes
import { ListadestinatariosComponent } from './listadestinatarios/listadestinatarios.component';
import { DetalledestinatarioComponent } from './detalledestinatario/detalledestinatario.component';
// Demas modulos
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
import { TablaclientesComponent } from './tablaclientes/tablaclientes.component';
import { ModalclienteComponent } from './modalcliente/modalcliente.component';
import { DestinatarioxclienteComponent } from './destinatarioxcliente/destinatarioxcliente.component';


//routing
const routes:Routes=[
  {
    path:'listadestinatarios',
    component:ListadestinatariosComponent
  },
  {
    path:'detalledestinatario/ver/:id',
    component:DetalledestinatarioComponent
  },
  {
    path:'detalledestinatario/add/:id',
    component:DetalledestinatarioComponent
  },
  {
    path:'detalledestinatario/edit/:id',
    component:DetalledestinatarioComponent
  },
  {
    path:'destinatariosxclientes',
    component:DestinatarioxclienteComponent
  }

]

@NgModule({
  declarations: [
    ListadestinatariosComponent,
    DetalledestinatarioComponent,
    TablaclientesComponent,
    ModalclienteComponent,
    DestinatarioxclienteComponent
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
export class DestinatarioModule { }
