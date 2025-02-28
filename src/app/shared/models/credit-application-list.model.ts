import { CreditType } from '../../store/models/credit-application.model';

export interface CreditApplicationListItem {
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
  phoneNumber?: string;
}

export interface CreditApplicationFilter {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  dateRange?: Date[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  minIncome?: number;
  maxIncome?: number;
}
