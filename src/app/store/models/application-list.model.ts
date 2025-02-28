export interface ApplicationFilter {
  maxAmount: number | null;
  minAmount: number | null;
  status: string | null;
  creditType: string | null;
  dateRange: Date[] | null;
}
