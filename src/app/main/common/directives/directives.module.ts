import { NgModule } from '@angular/core';
import { PositiveNumbersOnlyDirective } from './positive-numbers-only.directive';
import { IntegersDirective } from './integers-only.directive';

@NgModule({
  declarations: [PositiveNumbersOnlyDirective, IntegersDirective],
  exports: [PositiveNumbersOnlyDirective, IntegersDirective],
})
export class DirectivesModule {}
