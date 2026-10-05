import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export class FormUtils {
  static markAsDirty(formGroup: FormGroup) {
    if (!formGroup) {
      return;
    }

    (<any>Object).values(formGroup.controls).forEach((control) => {
      if (control.controls) {
        this.markAsDirty(control);
      } else {
        control.markAsDirty();
      }
    });
  }

  static hasErrors(formGroup: FormGroup | AbstractControl, formControlName: string): boolean {
    if (!formGroup || formGroup.pristine) {
      return null;
    }
    return formGroup.get(formControlName).dirty && !formGroup.get(formControlName).valid;
  }

  static hasRequiredError(formGroup: FormGroup | AbstractControl, formControlName: string) {
    if (!formGroup) {
      return null;
    }
    const control = formGroup.get(formControlName);
    return control?.dirty && control?.errors?.required;
  }

  static updateValueAndValidityOfArray(formArray: AbstractControl[]): void {
    if (!formArray?.length) {
      return;
    }
    formArray.forEach((control) => control.updateValueAndValidity());
  }
}