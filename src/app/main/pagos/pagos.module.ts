import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Route } from '@angular/router';
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
import { DatePickerI18nModule } from 'app/main/components/date-time-picker/date-picker-i18n/date-picker-i18n.module';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { DirectivesModule } from '../common/directives/directives.module';
import { AppIconModule } from '../common/icons/app-icons.module';
//Componentes
import { HrComponent } from './hr/hr.component';
import { ListaComponent } from './lista/lista.component';
import { DetalleComponent } from './detalle/detalle.component';
import { ModalhrComponent } from './modalhr/modalhr.component';
import { DetallehrComponent } from './detallehr/detallehr.component';
import { ModalchequeComponent } from './modalcheque/modalcheque.component';
import { ModaltransferComponent } from './modaltransfer/modaltransfer.component';
import { ModalflujoComponent } from './modalflujo/modalflujo.component';
import { OrdenpagosComponent } from './ordenpagos/ordenpagos.component';
import { ModelordenesComponent } from './modelordenes/modelordenes.component';
import { CuentacorrienteComponent } from './cuentacorriente/cuentacorriente.component';
import { DetallepagoComponent } from './detallepago/detallepago.component';
import { DetallecuentacorrienteComponent } from './detallecuentacorriente/detallecuentacorriente.component';
import { LiquidacionComponent } from './liquidacion/liquidacion.component';
import { HojasbuscarComponent } from './hojasbuscar/hojasbuscar.component';
import { LiquidacionordenesComponent } from './liquidacionordenes/liquidacionordenes.component';
import { DetallechequeComponent } from './detallecheque/detallecheque.component';
import { ModaldescuentoComponent } from './modaldescuento/modaldescuento.component';
import { BuscarcuentaComponent } from './buscarcuenta/buscarcuenta.component';
import { ListadescuentosComponent } from './listadescuentos/listadescuentos.component';
import { ListacuentasComponent } from './listacuentas/listacuentas.component';
import { RentabilidadComponent } from './rentabilidad/rentabilidad.component';
import { CerrarhrComponent } from './cerrarhr/cerrarhr.component';


const routes: Route[] = [
  {
    path:"lista",
    component:ListaComponent
  },
  {
    path:"detalle/:id",
    component:DetalleComponent
  },
  {
    path:"ordenes",
    component:OrdenpagosComponent
  },
  {
    path:"corriente",
    component:CuentacorrienteComponent
  },
  {
    path:"hrs",
    component:HrComponent
  },
  {
    path:"liquidacion",
    component:LiquidacionComponent
  },
  {
    path:"detallepago/:id",
    component:DetallepagoComponent
  }
  ,
  {
    path:"detallecuentacorriente/:id",
    component:DetallecuentacorrienteComponent
  },
  {
    path:"liquidacionordenes",
    component:LiquidacionordenesComponent
  },
  {
    path:"descuentospago",
    component:ListadescuentosComponent
  },
  {
    path:"acuentaspago",
    component:ListacuentasComponent
  },
  {
    path:"rentabilidad",
    component:RentabilidadComponent
  }
  ,
  {
    path:"cerrarhr/:id",
    component:CerrarhrComponent
  }

]

@NgModule({
  declarations: [
    HrComponent,
    ListaComponent,
    DetalleComponent,
    ModalhrComponent,
    DetallehrComponent,
    ModalchequeComponent,
    ModaltransferComponent,
    ModalflujoComponent,
    OrdenpagosComponent,
    ModelordenesComponent,
    CuentacorrienteComponent,
    DetallepagoComponent,
    DetallecuentacorrienteComponent,
    LiquidacionComponent,
    HojasbuscarComponent,
    LiquidacionordenesComponent,
    DetallechequeComponent,
    ModaldescuentoComponent,
    BuscarcuentaComponent,
    ListadescuentosComponent,
    ListacuentasComponent,
    RentabilidadComponent,
    CerrarhrComponent
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
  ]
})
export class PagosModule { }
