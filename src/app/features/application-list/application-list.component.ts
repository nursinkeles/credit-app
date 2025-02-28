import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { Store } from '@ngxs/store';
import { CreditState } from '../../store/state/credit.state';
import { TreeNode } from 'primeng/api';
import { LabelService } from '../../shared/services/label.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApplicationFilter } from '../../store/models/application-list.model';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TreeTableModule,
    ButtonModule,
    CardModule,
    TooltipModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
  ],
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationListComponent implements OnInit, OnDestroy {
  applications: TreeNode[] = [];
  filteredApplications: TreeNode[] = [];
  private destroy$ = new Subject<void>();

  filter: ApplicationFilter = {
    maxAmount: null,
    minAmount: null,
    status: null,
    creditType: null,
    dateRange: null,
  };

  today: Date = new Date();

  statusOptions = [
    { label: 'Onaylandı', value: 'APPROVED' },
    { label: 'Reddedildi', value: 'REJECTED' },
    { label: 'Bekliyor', value: 'PENDING' },
  ];

  creditTypeOptions = [
    { label: 'Bireysel Kredi', value: 'PERSONAL' },
    { label: 'Taşıt Kredisi', value: 'VEHICLE' },
    { label: 'Konut Kredisi', value: 'MORTGAGE' },
  ];

  constructor(
    private store: Store,
    private labelService: LabelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadApplications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadApplications() {
    this.store
      .select(CreditState.getApplications)
      .pipe(takeUntil(this.destroy$))
      .subscribe((applications) => {
        this.applications = this.transformToTreeNodes(applications);
        this.applyFilters();
        this.cdr.markForCheck();
      });
  }

  private transformToTreeNodes(applications: any[]): TreeNode[] {
    return applications.map((app) => ({
      data: {
        applicationDate: app.applicationDate,
        fullName: `${app.firstName} ${app.lastName}`,
        creditType: app.creditType,
        creditAmount: app.creditAmount,
        status: app.status,
        isDetail: false,
        rawData: app,
      },
      children: [
        {
          data: {
            isDetail: true,
            rawData: app,
          },
        },
      ],
      expanded: false,
    }));
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusLabel(status: string): string {
    return this.labelService.getStatusLabel(status);
  }

  getCreditTypeLabel(type: string): string {
    return this.labelService.getCreditTypeLabel(type);
  }

  onFilterChange() {
    this.applyFilters();
    this.cdr.markForCheck();
  }

  resetFilters() {
    this.filter = {
      maxAmount: null,
      minAmount: null,
      status: null,
      creditType: null,
      dateRange: null,
    };
    this.applyFilters();
    this.cdr.markForCheck();
  }

  hasFilter(): boolean {
    return Object.values(this.filter).some((value) => value !== null);
  }

  private applyFilters() {
    if (!this.hasFilter()) {
      this.filteredApplications = [...this.applications];
      return;
    }

    this.filteredApplications = this.applications.filter((node) => {
      const app = node.data;

      if (this.filter.minAmount && app.creditAmount < this.filter.minAmount) {
        return false;
      }
      if (this.filter.maxAmount && app.creditAmount > this.filter.maxAmount) {
        return false;
      }
      if (this.filter.status && app.status !== this.filter.status) {
        return false;
      }
      if (this.filter.creditType && app.creditType !== this.filter.creditType) {
        return false;
      }
      if (
        this.filter.dateRange &&
        Array.isArray(this.filter.dateRange) &&
        this.filter.dateRange.length === 2
      ) {
        const appDate = new Date(app.applicationDate);
        const startDate = new Date(this.filter.dateRange[0]);
        const endDate = new Date(this.filter.dateRange[1]);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (appDate < startDate || appDate > endDate) {
          return false;
        }
      }
      return true;
    });
  }

  trackBy(index: number, item: any): any {
    return item.data.rawData.id;
  }
}
