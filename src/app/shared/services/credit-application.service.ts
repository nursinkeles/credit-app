import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreditApplicationListItem } from '../models/credit-application-list.model';

@Injectable({
  providedIn: 'root',
})
export class CreditApplicationService {
  private apiUrl = 'api/credit-applications';

  constructor(private http: HttpClient) {}

  getApplications(): Observable<CreditApplicationListItem[]> {
    return this.http.get<CreditApplicationListItem[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('API hatası:', error);
        return of([]);
      })
    );
  }

  // Diğer servis metodları...
}
