export type GroupByOption = 'creditType' | 'incomeRange' | 'month';

export interface PivotData {
  id: string;
  applicationDate: Date;
  creditType: string;
  incomeRange: string;
  creditAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PivotResult {
  group: string;
  totalApplications: number;
  approved: number;
  rejected: number;
  pending: number;
  totalAmount: number;
}

export interface PivotGroup {
  name: string;
  totalCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  approvalRate: number;
  totalAmount: number;
}
