import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const isValid = /^05[0-9]{2}[0-9]{3}[0-9]{4}$/.test(
      value.replace(/\s/g, '')
    );

    return isValid ? null : { invalidPhone: true };
  };
}
