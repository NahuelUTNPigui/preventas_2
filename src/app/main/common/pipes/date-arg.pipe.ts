import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateArg',
})
export class DateArg implements PipeTransform {
  transform(value: Date): Date {
    const result = new Date(value);
    result.setHours(result.getHours() - 3);
    return result;
  }
}