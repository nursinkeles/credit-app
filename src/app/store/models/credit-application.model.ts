export type CreditType = 'PERSONAL' | 'VEHICLE' | 'MORTGAGE';

export interface CreditApplication {
  id: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  phone: string;
  income: number;
  creditAmount: number;
  applicationDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  creditType: CreditType;
}
