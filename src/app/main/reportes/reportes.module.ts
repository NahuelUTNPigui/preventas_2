import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteclientesComponent } from './reporteclientes/reporteclientes.component';
import { ReporteproveedoresComponent } from './reporteproveedores/reporteproveedores.component';
import { RouterModule,Route } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { NgbModule,NgbAccordionModule  } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ChartsModule } from 'ng2-charts';
import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';
import { ModalreporteComponent } from './modalreporte/modalreporte.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { ReporteremitosComponent } from './reporteremitos/reporteremitos.component';
import { DashboardclientesComponent } from './dashboardclientes/dashboardclientes.component';
const routes: Route[] = [
  {
    path:"reporteclientes",
    component:ReporteclientesComponent
  },
  {
    path:"reporteproveedores",
    component:ReporteproveedoresComponent
  },
  {
    path:"reporteremitos",
    component:ReporteremitosComponent
  }
]

@NgModule({
  declarations: [
    ReporteclientesComponent,
    ReporteproveedoresComponent,
    ModalreporteComponent,
    ReporteremitosComponent,
    DashboardclientesComponent
  ],
  imports: [
    CommonModule,
    NgbAccordionModule,
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
    CoreSidebarModule,
    ChartsModule,
    NgApexchartsModule
  ]
})
export class ReportesModule { }
