import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { CsvModule } from '@ctrl/ngx-csv';

import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreSidebarModule } from '@core/components';

import { RemitoListComponent } from './remito-list/remito-list.component';
import { RemitoAddComponent } from './remito-add/remito-add.component';
import { RemitoEditComponent } from './remito-edit/remito-edit.component';

import { RemitoService } from './remito.service';
import { AuthGuard } from 'app/auth/helpers/auth.guards';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { DatePickerI18nModule } from 'app/main/components/date-time-picker/date-picker-i18n/date-picker-i18n.module';
import { DirectivesModule } from '../common/directives/directives.module';
import { AppIconModule } from '../common/icons/app-icons.module';

import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { RemitoHistoryComponent } from './remito-history/remito-history.component';
import { RemitoDeletedListComponent } from './remito-deleted-list/remito-deleted-list.component';
import { RemitoListNavbarComponent } from './remito-list-navbar/remito-list-navbar.component';
import { MasivoComponent } from './masivo/masivo.component';
import { MasivonuevoComponent } from './masivonuevo/masivonuevo.component';
import { HojasrutaComponent } from './hojasruta/hojasruta.component';
import { DetallehrComponent } from './detallehr/detallehr.component';
import { ModalhrComponent } from './modalhr/modalhr.component';
import { MultipleestadoComponent } from './multipleestado/multipleestado.component';
import { CerrarhrComponent } from './cerrarhr/cerrarhr.component';
import { MultipleeditComponent } from './multipleedit/multipleedit.component';
import { PreventasComponent } from './preventas/preventas.component';
import { PreordenComponent } from './preorden/preorden.component';

// routing
const routes: Routes = [
  {
    path: 'remitos',
    component: RemitoListNavbarComponent,
    canActivate: [AuthGuard],
    // data: { roles: [Role.Admin], animation: 'RemitoListNavbarComponent' }
  },
  {
    path: 'hojasruta',
    component: HojasrutaComponent,
    canActivate: [AuthGuard],
    // data: { roles: [Role.Admin], animation: 'RemitoListNavbarComponent' }
  },
  {
    path: 'add',
    component: RemitoAddComponent,
    canActivate: [AuthGuard],
    data: { animation: 'RemitoAddComponent' }
  },
  {
    path: 'masivo',
    component: MasivoComponent,
    canActivate: [AuthGuard],
    data: { animation: 'MasivoComponent' }
  },
  {
    path: 'preventas',
    component: PreventasComponent,
    canActivate: [AuthGuard],
    data: { animation: 'PreventasComponent' }
  },
  {
    path: 'preordenes',
    component: PreordenComponent,
    
    data: { animation: 'PreventasComponent' }
  },
  {
    path: 'multipleedit',
    component: MultipleeditComponent,
    canActivate: [AuthGuard],
    data: { animation: 'MultipleeditComponent' }
  },
  {
    path: 'edit/:id',
    component: RemitoEditComponent,
    canActivate: [AuthGuard],
    data: { animation: 'RemitoEditComponent' }
  },
  {
    path: 'history/:id',
    component: RemitoHistoryComponent,
    canActivate: [AuthGuard],
    data: { animation: 'RemitoHistoryComponent' }
  },
  {
    path: 'cerrarhr/:id',
    component: CerrarhrComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  declarations: [
    RemitoListComponent,
    RemitoAddComponent,
    RemitoEditComponent,
    RemitoHistoryComponent,
    RemitoDeletedListComponent,
    RemitoListNavbarComponent,
    MasivoComponent,
    MasivonuevoComponent,
    HojasrutaComponent,
    DetallehrComponent,
    ModalhrComponent,
    MultipleestadoComponent,
    CerrarhrComponent,
    MultipleeditComponent,
    PreventasComponent,
    PreordenComponent
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
    CsvModule,
    AppIconModule,
    CardSnippetModule
    
  ],
  providers: [RemitoService],
})
export class RemitoModule { }
