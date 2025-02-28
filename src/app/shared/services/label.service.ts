import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LabelService {
  getCreditTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      PERSONAL: 'Bireysel Kredi',
      VEHICLE: 'Taşıt Kredisi',
      MORTGAGE: 'Konut Kredisi',
    };
    return types[type] || type;
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      APPROVED: 'Onaylandı',
      REJECTED: 'Reddedildi',
      PENDING: 'Bekliyor',
    };
    return statuses[status] || status;
  }
}
