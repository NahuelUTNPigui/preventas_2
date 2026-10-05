import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

import { ProveedorComponent } from './proveedor/proveedor.component';
import { ChoferComponent } from './chofer/chofer.component';
import { VehiculoComponent } from './vehiculo/vehiculo.component';
import { ListaproveedoresComponent } from './listaproveedores/listaproveedores.component';

import { ProveedoresRoutingModule } from './proveedores-routing.module';
import { ListachoferesComponent } from './listachoferes/listachoferes.component';
import { ListavehiculosComponent } from './listavehiculos/listavehiculos.component';
import { ModalchoferComponent } from './modalchofer/modalchofer.component';
import { ModalvehiculoComponent } from './modalvehiculo/modalvehiculo.component';
import { TarifarioComponent } from './tarifario/tarifario.component';
import { TarifariodetalleComponent } from './tarifariodetalle/tarifariodetalle.component';
import { TarifariohistorialComponent } from './tarifariohistorial/tarifariohistorial.component';
import { ProgratarComponent } from './progratar/progratar.component';
import { TarifarioocultoComponent } from './tarifariooculto/tarifariooculto.component';
import { AsientosComponent } from './asientos/asientos.component';


@NgModule({
  declarations: [
    ProveedorComponent,
    ChoferComponent,
    VehiculoComponent,
    ListaproveedoresComponent,
    ListachoferesComponent,
    ListavehiculosComponent,
    ModalchoferComponent,
    ModalvehiculoComponent,
    TarifarioComponent,
    TarifariodetalleComponent,
    TarifariohistorialComponent,
    ProgratarComponent,
    TarifarioocultoComponent,
    AsientosComponent
  ],
  imports: [
    CommonModule,
    ProveedoresRoutingModule,
    RouterModule,
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
export class ProveedoresModule { }
