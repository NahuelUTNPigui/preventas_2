// shared.module.ts
import { NgModule } from '@angular/core';
import { AppIconComponent } from './app-icons.component';
import { CommonModule } from '@angular/common';
@NgModule({
  declarations: [AppIconComponent],
  imports: [CommonModule],
  exports: [AppIconComponent]
})
export class AppIconModule { }
