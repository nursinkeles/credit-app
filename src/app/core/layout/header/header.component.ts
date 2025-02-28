import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MenubarModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  items: MenuItem[] = [
    {
      label: 'Kredi Başvurusu',
      icon: 'pi pi-dollar ',
      routerLink: '/credit-application',
    },
    {
      label: 'Başvuru Listesi',
      icon: 'pi pi-book',
      routerLink: '/applications',
    },
    {
      label: 'Raporlar',
      icon: 'pi pi-file',
      routerLink: '/reports',
    },
  ];
}
