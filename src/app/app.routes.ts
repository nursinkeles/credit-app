import { Routes } from '@angular/router';
import { ApplicationListComponent } from './features/application-list/application-list.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'credit-application',
  },
  {
    path: 'credit-application',
    loadComponent: () =>
      import('./features/credit-application/credit-application.component').then(
        (c) => c.CreditApplicationComponent
      ),
  },
  {
    path: 'applications',
    component: ApplicationListComponent,
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/pivot-report/pivot-report.component').then(
        (c) => c.PivotReportComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'credit-application',
  },
];
