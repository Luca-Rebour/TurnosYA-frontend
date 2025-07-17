import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomerGeneric } from '../../shared/models/customer-generic.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllCustomers(): Observable<CustomerGeneric[]> {
    return this.http.get<CustomerGeneric[]>(`${this.apiUrl}/professionals/my-customers`);
  }
}
