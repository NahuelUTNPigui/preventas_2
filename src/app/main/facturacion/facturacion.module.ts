import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
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

import { FacturacionService } from './facturacion.service';
import { TablafacturacionComponent } from './tablafacturacion/tablafacturacion.component';
import { ModalfacturacionComponent } from './modalfacturacion/modalfacturacion.component';
import { ListafacturasComponent } from './listafacturas/listafacturas.component';
import { TablafacturasComponent } from './tablafacturas/tablafacturas.component';
import { EditremitoComponent } from './editremito/editremito.component';
import { DirectivesModule } from '../common/directives/directives.module';
import { AppIconModule } from '../common/icons/app-icons.module';

import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';
import { DetallefacturaComponent } from './detallefactura/detallefactura.component';
import { PagosComponent } from './pagos/pagos.component';
import { ModalpagoComponent } from './modalpago/modalpago.component';
import { DetallepagoComponent } from './detallepago/detallepago.component';
import { ListapagosComponent } from './listapagos/listapagos.component';
import { CuentacorrienteComponent } from './cuentacorriente/cuentacorriente.component';
import { DetallecuentacorrienteComponent } from './detallecuentacorriente/detallecuentacorriente.component';
import { ModalchequeComponent } from './modalcheque/modalcheque.component';
import { ModaltransferComponent } from './modaltransfer/modaltransfer.component';
import { ModaltransComponent } from './modaltrans/modaltrans.component';
import { ModalretencionComponent } from './modalretencion/modalretencion.component';
import { ModaldescuentoComponent } from './modaldescuento/modaldescuento.component';
import { LiquidacionComponent } from './liquidacion/liquidacion.component';
import { RemitobuscarComponent } from './remitobuscar/remitobuscar.component';
import { LiquidarcobrosComponent } from './liquidarcobros/liquidarcobros.component';
import { BuscarchequeComponent } from './buscarcheque/buscarcheque.component';
import { BuscaracuentaComponent } from './buscaracuenta/buscaracuenta.component';
import { ListaacuentaComponent } from './listaacuenta/listaacuenta.component';
import { ListanotasComponent } from './listanotas/listanotas.component';
import { ListaretencionesComponent } from './listaretenciones/listaretenciones.component';
import { ListadescuentosComponent } from './listadescuentos/listadescuentos.component';
import { TablaedicionComponent } from './tablaedicion/tablaedicion.component';
import { RentabilidadComponent } from './rentabilidad/rentabilidad.component';

const routes: Route[] = [
  {
    path:"main",
    component:MainComponent
  },
  {
    path:"lista",
    component:ListafacturasComponent
  },
  {
    path:"detalle/:id",
    component:DetallefacturaComponent
  },
  {
    path:"cobros",
    component:ListapagosComponent
  },
  {
    path:"detallecobro/:id",
    component:DetallepagoComponent
  },
  {
    path:"cuentacorriente",
    component:CuentacorrienteComponent
  },
  {
    path:"liquidacion",
    component:LiquidacionComponent
  },
  {
    path:"detallecuentacorriente/:id",
    component:DetallecuentacorrienteComponent
  },
  {
    path:"liquidacioncobro",
    component:LiquidarcobrosComponent
  },
  {
    path:"listaacuentas",
    component:ListaacuentaComponent
  }
  ,
  {
    path:"listanotas",
    component:ListanotasComponent
  },
  {
    path:"listarenteciones",
    component:ListaretencionesComponent
  }
  ,
  {
    path:"listadescuentos",
    component:ListadescuentosComponent
  },
  {
    path:"rentabilidad",
    component:RentabilidadComponent
  }

]

@NgModule({
  declarations: [
    MainComponent,
    TablafacturacionComponent,
    ModalfacturacionComponent,
    ListafacturasComponent,
    TablafacturasComponent,
    EditremitoComponent,
    DetallefacturaComponent,
    PagosComponent,
    ModalpagoComponent,
    DetallepagoComponent,
    ListapagosComponent,
    CuentacorrienteComponent,
    DetallecuentacorrienteComponent,
    ModalchequeComponent,
    ModaltransferComponent,
    ModaltransComponent,
    ModalretencionComponent,
    ModaldescuentoComponent,
    LiquidacionComponent,
    RemitobuscarComponent,
    LiquidarcobrosComponent,
    BuscarchequeComponent,
    BuscaracuentaComponent,
    ListaacuentaComponent,
    ListanotasComponent,
    ListaretencionesComponent,
    ListadescuentosComponent,
    TablaedicionComponent,
    RentabilidadComponent
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
  providers: [FacturacionService],
})
export class FacturacionModule { }
