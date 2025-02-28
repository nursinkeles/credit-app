import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function identityNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const isValid = /^[0-9]{11}$/.test(value);

    return isValid ? null : { invalidIdentityNumber: true };
  };
}
