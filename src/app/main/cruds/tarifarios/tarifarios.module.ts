import { NgModule } from '@angular/core';
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
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { CommonModule } from '@angular/common';
import { TarclientesComponent } from './tarclientes/tarclientes.component';
import { TarproveedoresComponent } from './tarproveedores/tarproveedores.component';
import { RouterModule, Routes } from '@angular/router';
import { DetalletarclienteComponent } from './detalletarcliente/detalletarcliente.component';
import { DetalletarproveedorComponent } from './detalletarproveedor/detalletarproveedor.component';

const routes: Routes = [
  {
    path: 'clientes',
    component: TarclientesComponent,
  },
  {
    path:'clientes/edit/:id',
    component:DetalletarclienteComponent
  },
  {
    path:'clientes/add/:id',
    component:DetalletarclienteComponent
  },
  {
    path: 'proveedores',
    component: TarproveedoresComponent
  },
  {
    path:'proveedores/edit/:id',
    component:DetalletarproveedorComponent
  },
  {
    path:'proveedores/add/:id',
    component:DetalletarproveedorComponent
  }


]

@NgModule({
  declarations: [
    TarclientesComponent,
    TarproveedoresComponent,
    DetalletarclienteComponent,
    DetalletarproveedorComponent
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
  ]
})
export class TarifariosModule { }
