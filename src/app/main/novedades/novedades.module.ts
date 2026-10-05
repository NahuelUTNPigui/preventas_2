import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NovedadesComponent } from './novedades/novedades.component';
import { RouterModule, Routes } from '@angular/router';

// routing
const routes: Routes = [
  {
    path: 'novedades',
    component: NovedadesComponent,
  }
]

@NgModule({
  declarations: [
    NovedadesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class NovedadesModule { }
