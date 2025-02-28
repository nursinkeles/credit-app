export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'currency'
    | 'phone'
    | 'identityNumber'
    | 'dropdown';
  validators: any[];
  errorMessages: { [key: string]: string };
  placeholder?: string;
  class?: string;
}
