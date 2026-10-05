import { Component, forwardRef, Input, Injectable } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() label = 'Fecha';

  private _model: Date;
  get model(): Date {
    return this._model;
  }
  set model(value: Date) {
    this._model = value;
    this.change(value);
  }

  disabled: boolean;
  onChange: (arg0: any) => void;
  onTouched: any;
  mxDate: any;
  // #region Date picker

  @Input()
  minDate = new Date();
  @Input()
  maxDate = new Date(this.minDate.getFullYear(), 12, 31);
  @Input()
  isInvalid: boolean = false;

  private _bsValueSD: Date;
  get bsValueSD(): Date {
    return this._bsValueSD;
  }
  set bsValueSD(value: Date) {
    let correctValue = value;
    if (value && value.toString() === 'Invalid Date') {
      correctValue = null;
    }
    this._bsValueSD = correctValue;
  }
  bsRangeValueSD: any = [this.minDate, this.maxDate];

  minDateDD = new Date();
  maxDateDD = new Date(this.minDateDD.getFullYear(), 12, 31);

  bsValueDD: Date = new Date();
  bsRangeValueDD: any = [this.minDateDD, this.maxDateDD];

  // #endregion

  constructor() {}

  writeValue(obj: any): void {
    if (obj !== undefined) {
      this.model = obj;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  change(value) {
    // Angular does not know that the value has changed
    // from our component, so we need to update her with the new value.
    if (this.onChange) {
      this.onChange(value);
    }
  }

  getValidDate(value: string) {
    value = this.removeLetters(value);
    value = this.removeBadCharacters(value);
    value = value.slice(0, 10);
    if (value.length) {
      switch (value.length) {
        case 2:
          value += '/';
          break;
        case 5:
          value += '/';
      }
    }
    return value;
  }

  removeLetters(value: string): string {
    const reg = /[A-Za-z]+$/g;
    return value.replace(reg, '');
  }

  removeBadCharacters(value: string): string {
    const reg = /[!/@#\$%\^\&*\)\(+=._-]+$/g;
    return value.replace(reg, '');
  }
}

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
  }
}