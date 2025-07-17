import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SummaryData } from '../../shared/models/summary-data.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfessionalSummary(): Observable<SummaryData> {
    return this.http.get<SummaryData>(`${this.apiUrl}/professionals/summary`);
  }
}
