import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateExternalCustomer } from '../../shared/models/create-external-customer.model';

@Injectable({
  providedIn: 'root'
})
export class ExternalCustomerService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createExternalCustomer(customerData: CreateExternalCustomer): Observable<any> {

    return this.http.post(`${this.apiUrl}/external-customers`, customerData);
  }
}
