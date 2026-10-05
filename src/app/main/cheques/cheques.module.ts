import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule,Route } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';

import { DirectivesModule } from '../common/directives/directives.module';
import { AppIconModule } from '../common/icons/app-icons.module';

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
import { DatePickerI18nModule } from 'app/main/components/date-time-picker/date-picker-i18n/date-picker-i18n.module';

import { ChequesService } from './cheques.service';
import { ListaComponent } from './lista/lista.component';
import { DetalleComponent } from './detalle/detalle.component';
import { BancosComponent } from './bancos/bancos.component';

const routes:Route[] = [
  {
    path:"lista",
    component:ListaComponent
  },
  {
    path:"detalle/:id",
    component:DetalleComponent
  },
  {
    path:"bancos",
    component:BancosComponent
  }
]

@NgModule({
  declarations: [
    ListaComponent,
    DetalleComponent,
    BancosComponent
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
    DatePickerI18nModule,
    DirectivesModule,
    AppIconModule,
    CardSnippetModule
  ],
  providers:[ChequesService]
})
export class ChequesModule { }
