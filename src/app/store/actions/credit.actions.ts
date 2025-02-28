import { CreditApplication } from '../models/credit-application.model';

export class AddCreditApplication {
  static readonly type = '[Credit] Add Application';
  constructor(public payload: CreditApplication) {}
}

export class UpdateCreditApplicationStatus {
  static readonly type = '[Credit] Update Application Status';
  constructor(
    public id: string,
    public status: 'PENDING' | 'APPROVED' | 'REJECTED'
  ) {}
}
