import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { CreditState } from '../../store/state/credit.state';
import { CreditApplication } from '../../store/models/credit-application.model';
import { PivotData, GroupByOption } from '../models/pivot-report.model';

@Injectable({
  providedIn: 'root',
})
export class PivotReportService {
  constructor(private store: Store) {}

  // Store'dan gerçek verileri al
  getPivotData(groupBy: GroupByOption): Observable<any> {
    return this.store.select(CreditState.getApplications).pipe(
      map((applications: CreditApplication[]) => {
        // Boş uygulama listesi kontrolü
        if (!applications || applications.length === 0) {
          return [];
        }

        // Uygulamaları pivot veriye dönüştür
        const pivotData = applications.map((app) => this.toPivotData(app));

        // Gruplama işlemini gerçekleştir
        return this.groupData(pivotData, groupBy);
      })
    );
  }

  // CreditApplication'ı PivotData formatına dönüştür
  private toPivotData(app: CreditApplication): PivotData {
    // Eksik değerler için güvenli dönüşüm
    const income = typeof app.income === 'number' ? app.income : 0;
    const creditAmount =
      typeof app.creditAmount === 'number'
        ? app.creditAmount
        : parseFloat(app.creditAmount as string) || 0;
    const creditType = app.creditType || 'PERSONAL';

    return {
      id: app.id,
      applicationDate: new Date(app.applicationDate),
      creditType: creditType,
      incomeRange: this.getIncomeRangeFromValue(income),
      creditAmount: creditAmount,
      status: app.status,
    };
  }

  // Gelir değerine göre aralık belirle
  private getIncomeRangeFromValue(income: number): string {
    if (income < 10000) return 'LOW';
    if (income < 25000) return 'MEDIUM';
    if (income < 50000) return 'HIGH';
    return 'VERY_HIGH';
  }

  // Verileri gruplama
  private groupData(data: PivotData[], groupBy: GroupByOption) {
    const result: any = {};

    // Öncelikle tüm olası grupları tanımlayalım (krediler için)
    if (groupBy === 'creditType') {
      result['PERSONAL'] = this.createEmptyResultObject('İhtiyaç Kredisi');
      result['VEHICLE'] = this.createEmptyResultObject('Taşıt Kredisi');
      result['MORTGAGE'] = this.createEmptyResultObject('Konut Kredisi');
    }

    data.forEach((item) => {
      const key = this.getGroupKey(item, groupBy);

      if (!result[key]) {
        result[key] = this.createEmptyResultObject(key);
      }

      result[key].totalApplications++;

      switch (item.status) {
        case 'APPROVED':
          result[key].approved++;
          break;
        case 'REJECTED':
          result[key].rejected++;
          break;
        case 'PENDING':
          result[key].pending++;
          break;
      }

      // Güvenli sayısal dönüşüm
      const amount =
        typeof item.creditAmount === 'number'
          ? item.creditAmount
          : parseFloat(item.creditAmount as string) || 0;

      result[key].totalAmount += amount;
    });

    // Grup anahtarları yerine etiketleri kullan
    return Object.keys(result).map((key) => ({
      group: result[key].label || key,
      ...result[key],
    }));
  }

  // Boş sonuç nesnesi oluştur
  private createEmptyResultObject(label: string) {
    return {
      label,
      totalApplications: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      totalAmount: 0,
    };
  }

  // Grup anahtarı oluştur
  private getGroupKey(item: PivotData, groupBy: GroupByOption): string {
    switch (groupBy) {
      case 'creditType':
        return item.creditType || 'PERSONAL';
      case 'incomeRange':
        return item.incomeRange || 'MEDIUM';
      case 'month':
        return this.getMonthLabel(item.applicationDate) || 'Bilinmeyen Tarih';
      default:
        return 'Diğer';
    }
  }

  // Kredi türü etiketi
  private getCreditTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      PERSONAL: 'İhtiyaç Kredisi',
      VEHICLE: 'Taşıt Kredisi',
      MORTGAGE: 'Konut Kredisi',
    };
    return types[type] || 'Diğer';
  }

  // Gelir aralığı etiketi
  private getIncomeRangeLabel(range: string): string {
    const ranges: { [key: string]: string } = {
      LOW: '10.000 TL Altı',
      MEDIUM: '10.000 TL - 25.000 TL',
      HIGH: '25.000 TL - 50.000 TL',
      VERY_HIGH: '50.000 TL Üzeri',
    };
    return ranges[range] || 'Belirsiz';
  }

  // Ay etiketi
  private getMonthLabel(date: Date): string {
    if (!date) return 'Bilinmeyen Tarih';

    const months = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}
