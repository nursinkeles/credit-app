import { phoneNumberValidator } from './phone-number.validator';
import { identityNumberValidator } from './identity-number.validator';

export const FormValidators = {
  phone: phoneNumberValidator,
  identity: identityNumberValidator,
};
