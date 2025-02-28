import { Component, OnInit } from '@angular/core';
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
})
export class ApplicationListComponent implements OnInit {
  applications: TreeNode[] = [];
  filter: any = {
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

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.store.select(CreditState.getApplications).subscribe((applications) => {
      this.applications = applications.map((app) =>
        this.convertToTreeNode(app)
      );
    });
  }

  onDateRangeChange(event: any): void {
    this.filter.dateRange = event;
    this.onFilterChange();
  }

  convertToTreeNode(application: any): TreeNode {
    return {
      data: {
        applicationDate: application.applicationDate,
        fullName: `${application.firstName} ${application.lastName}`,
        creditType: this.getCreditTypeLabel(application.creditType),
        creditAmount: `${application.creditAmount} ₺`,
        status: application.status,
      },
      children: [
        {
          data: {
            category: 'Başvuru Detayları',
            details: [
              { label: 'TC Kimlik No', value: application.identityNumber },
              { label: 'Telefon', value: application.phone },
              { label: 'Aylık Gelir', value: `${application.income} ₺` },
              { label: 'Başvuru No', value: application.id },
              {
                label: 'Başvuru Tarihi',
                value: new Date(application.applicationDate).toLocaleString(
                  'tr-TR'
                ),
              },
            ],
          },
        },
      ],
    };
  }

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

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  onFilterChange(): void {
    this.loadApplications();
  }

  resetFilters(): void {
    this.filter = {
      maxAmount: null,
      minAmount: null,
      status: null,
      creditType: null,
      dateRange: null,
    };
    this.loadApplications();
  }

  hasFilter(): boolean {
    return Object.values(this.filter).some((value) => value !== null);
  }
}
