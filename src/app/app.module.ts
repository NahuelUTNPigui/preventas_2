import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import 'hammerjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr'; // For auth after login toast

import { CoreModule } from '@core/core.module';
import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule, CoreThemeCustomizerModule } from '@core/components';

import { coreConfig } from 'app/app-config';
import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { SampleModule } from 'app/main/sample/sample.module';
import { EstadoModule } from './main/cruds/estado/estado.module';
import { FormaPagoModule } from './main/cruds/forma-pago/forma-pago.module';
import { ClienteModule } from './main/cruds/cliente/cliente.module';
import { RemitenteModule } from './main/cruds/remitente/remitente.module';
import { RemitoModule } from './main/remito/remito.module';
import { AuthGuard } from './auth/helpers';


const appRoutes: Routes = [
  // {
  //   path: 'home',
  //   loadChildren: () => import('./main/sample/sample.module').then(m => m.SampleModule)
  // },
  {
    path: 'pages',
    loadChildren: () => import('./main/pages/pages.module').then(m => m.PagesModule),
  },
  {
    path: 'proveedores',
    loadChildren: () => import('./main/proveedores/proveedores.module').then(m => m.ProveedoresModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes',
    loadChildren: () => import('./main/cruds/cliente/cliente.module').then(m => m.ClienteModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'remitentes',
    loadChildren: () => import('./main/cruds/remitente/remitente.module').then(m => m.RemitenteModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'remitos',
    loadChildren: () => import('./main/remito/remito.module').then(m => m.RemitoModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'estados',
    loadChildren: () => import('./main/cruds/estado/estado.module').then(m => m.EstadoModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'formas-de-pago',
    loadChildren: () => import('./main/cruds/forma-pago/forma-pago.module').then(m => m.FormaPagoModule),
    canActivate: [AuthGuard]
  },
  {
    path:'localidades',
    loadChildren:()=>import('./main/localidades/localidades.module').then(m=>m.LocalidadesModule),
    canActivate:[AuthGuard]
  },
  {
    path:'destinatarios',
    loadChildren:()=>import('./main/cruds/destinatario/destinatario.module').then(m=>m.DestinatarioModule)
  },
  {
    path:'novedades',
    loadChildren:()=>import('./main/novedades/novedades.module').then(m=>m.NovedadesModule)
  },
  {
    path:'tarifario',
    loadChildren:()=>import('./main/cruds/tarifarios/tarifarios.module').then(m=>m.TarifariosModule)
  },
  {
    path:'reportes',
    loadChildren:()=>import('./main/reportes/reportes.module').then(m=>m.ReportesModule)
  },
  {
    path:'unidades',
    loadChildren:()=>import('./main/cruds/unidades/unidades.module').then(m=>m.UnidadesModule),
    canActivate: [AuthGuard]
  },
  {
    path:'facturacion',
    loadChildren:()=>import('./main/facturacion/facturacion.module').then(m=>m.FacturacionModule)
  },
  {
    path:'cheques',
    loadChildren:()=>import('./main/cheques/cheques.module').then(m=>m.ChequesModule)
  },
  {
    path:'transfer',
    loadChildren:()=>import('./main/transfer/transfer.module').then(m=>m.TransferModule)
  },
  {
    path:'pagos',
    loadChildren:()=>import('./main/pagos/pagos.module').then(m=>m.PagosModule)
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',

  },
  {
    path: '**',
    redirectTo: '/pages/miscellaneous/error' //Error 404 - Page not found
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, {
      scrollPositionRestoration: 'enabled', // Add options right here
      relativeLinkResolution: 'legacy'
    }),
    TranslateModule.forRoot(),

    //NgBootstrap
    NgbModule,
    ToastrModule.forRoot(),

    // Core modules
    CoreModule.forRoot(coreConfig),
    CoreCommonModule,
    CoreSidebarModule,
    CoreThemeCustomizerModule,

    // App modules
    LayoutModule,
    SampleModule,
    EstadoModule,
    ClienteModule,
    RemitenteModule,
    RemitoModule,
    FormaPagoModule
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
