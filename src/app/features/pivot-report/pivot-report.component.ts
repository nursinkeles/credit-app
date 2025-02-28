import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Store } from '@ngxs/store';
import { CreditState } from '../../store/state/credit.state';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  takeUntil,
  take,
  debounceTime,
  switchMap,
  tap,
  finalize,
} from 'rxjs/operators';

@Component({
  selector: 'app-pivot-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    SelectButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './pivot-report.component.html',
  styleUrls: ['./pivot-report.component.scss'],
  providers: [CurrencyPipe],
})
export class PivotReportComponent implements OnInit, OnDestroy {
  groupByOptions = [
    { label: 'Kredi Türüne Göre', value: 'creditType' },
    { label: 'Duruma Göre', value: 'status' },
    { label: 'Aylara Göre', value: 'month' },
  ];

  selectedGroupBy = 'creditType';
  pivotData: any[] = [];
  rawApplications: any[] = [];
  isLoading = true;
  isFiltering = false;
  totals = {
    totalApplications: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  };

  // RxJS Subjectler
  private destroy$ = new Subject<void>();
  private filterChange$ = new BehaviorSubject<string>('creditType');

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.loadApplicationData();

    this.filterChange$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(50),
        tap(() => {
          this.isFiltering = true;
          this.cdr.detectChanges();
        }),
        switchMap((filterType) => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              this.applyFilter(filterType);
              resolve();
            }, 10);
          });
        }),
        finalize(() => {
          this.isFiltering = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.isFiltering = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Filtreleme hatası:', err);
          this.isFiltering = false;
          this.cdr.detectChanges();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadApplicationData(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.store
      .select(CreditState.getApplications)
      .pipe(
        take(1),
        tap((applications) => {
          console.log('Ham veriler:', applications);
          this.rawApplications = applications;
          this.generatePivotData();
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  generatePivotData(): void {
    if (!this.rawApplications?.length) {
      this.pivotData = [];
      return;
    }

    try {
      switch (this.selectedGroupBy) {
        case 'creditType':
          const creditTypeGroups = this.groupByField(
            this.rawApplications,
            'creditType',
            {
              PERSONAL: 'Bireysel Kredi',
              VEHICLE: 'Taşıt Kredisi',
              MORTGAGE: 'Konut Kredisi',
            }
          );
          this.pivotData = this.mapToArray(creditTypeGroups);
          break;
        case 'status':
          const statusGroups = this.groupByField(
            this.rawApplications,
            'status',
            {
              APPROVED: 'Onaylandı',
              REJECTED: 'Reddedildi',
              PENDING: 'Bekliyor',
            }
          );
          this.pivotData = this.mapToArray(statusGroups);
          break;
        case 'month':
          this.pivotData = this.groupByMonth(this.rawApplications);
          break;
      }

      console.log('Pivot veriler:', this.pivotData);
      this.calculateTotals();
    } catch (error) {
      console.error('Pivot veri oluşturma hatası:', error);
      this.pivotData = [];
    }
  }

  onGroupByChange(): void {
    if (this.isFiltering) return;
    this.filterChange$.next(this.selectedGroupBy);
  }

  applyFilter(filterType: string): void {
    const applications = [...this.rawApplications];
    let result: any[] = [];

    try {
      if (filterType === 'creditType') {
        const groupMap = this.groupByField(applications, 'creditType', {
          PERSONAL: 'İhtiyaç Kredisi',
          VEHICLE: 'Taşıt Kredisi',
          MORTGAGE: 'Konut Kredisi',
          UNKNOWN: 'Bilinmeyen',
        });
        result = this.mapToArray(groupMap);
      } else if (filterType === 'status') {
        const groupMap = this.groupByField(applications, 'status', {
          PENDING: 'Bekleyen',
          APPROVED: 'Onaylanan',
          REJECTED: 'Reddedilen',
          UNKNOWN: 'Bilinmeyen',
        });
        result = this.mapToArray(groupMap);
      } else if (filterType === 'month') {
        result = this.groupByMonth(applications);
      }

      this.pivotData = result;
      this.calculateTotals();
    } catch (error) {
      console.error('Filtreleme sırasında hata:', error);
      this.pivotData = this.pivotData.length ? this.pivotData : [];
    }
  }

  groupByField(
    applications: any[],
    field: string,
    labels: Record<string, string>
  ): Map<string, any> {
    const groupMap = new Map<string, any[]>();

    applications.forEach((app) => {
      const value = app[field] || 'UNKNOWN';
      if (!groupMap.has(value)) {
        groupMap.set(value, []);
      }
      groupMap.get(value)?.push(app);
    });

    const result = new Map<string, any[]>();
    groupMap.forEach((apps, key) => {
      const label = labels[key] || key;
      result.set(label, apps);
    });

    return result;
  }

  mapToArray(groupMap: Map<string, any[]>): any[] {
    return Array.from(groupMap.entries()).map(([group, apps]) =>
      this.createPivotGroup(group, apps)
    );
  }

  groupByMonth(applications: any[]): any[] {
    const monthGroups = new Map<string, any[]>();

    applications.forEach((app) => {
      if (!app.applicationDate) return;

      const date = new Date(app.applicationDate);
      if (isNaN(date.getTime())) return;

      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, []);
      }
      monthGroups.get(monthKey)?.push(app);
    });

    return Array.from(monthGroups.entries())
      .map(([month, apps]) => this.createPivotGroup(month, apps))
      .sort((a, b) => {
        const [aMonth, aYear] = a.group.split('/').map(Number);
        const [bMonth, bYear] = b.group.split('/').map(Number);
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
      });
  }

  createPivotGroup(name: string, applications: any[]): any {
    let approved = 0;
    let rejected = 0;
    let pending = 0;

    for (const app of applications) {
      if (app.status === 'APPROVED') approved++;
      else if (app.status === 'REJECTED') rejected++;
      else if (app.status === 'PENDING') pending++;
    }

    return {
      group: name,
      totalApplications: applications.length,
      approved,
      rejected,
      pending,
    };
  }

  calculateTotals() {
    let totalApplications = 0;
    let approved = 0;
    let rejected = 0;
    let pending = 0;

    for (const item of this.pivotData) {
      totalApplications += item.totalApplications || 0;
      approved += item.approved || 0;
      rejected += item.rejected || 0;
      pending += item.pending || 0;
    }

    return { totalApplications, approved, rejected, pending };
  }

  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) {
      console.warn('Boş tutar değeri formatlanmaya çalışıldı');
      return '0,00 ₺';
    }

    try {
      const formatted = this.currencyPipe.transform(
        amount,
        'TRY',
        'symbol',
        '1.2-2',
        'tr-TR'
      );
      console.log(`Formatlanan tutar: ${amount} -> ${formatted}`);
      return formatted || '0,00 ₺';
    } catch (e) {
      console.error('Para birimi formatlanırken hata:', e);
      return amount.toLocaleString('tr-TR') + ' ₺';
    }
  }

  getApprovalRate(item: any): number {
    if (!item.totalApplications) return 0;
    return Math.round((item.approved / item.totalApplications) * 100);
  }

  hasData(): boolean {
    return this.pivotData.length > 0;
  }
}
