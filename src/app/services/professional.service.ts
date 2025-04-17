import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CustomerShort } from 'app/models/customerShort.model';
import { environment } from 'environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {

  private customersSubject = new BehaviorSubject<CustomerShort[]>([]);
  customers$ = this.customersSubject.asObservable();
  constructor(private http: HttpClient) { }
  private apiUrl = environment.apiUrl;


  getCustomers(): Observable<CustomerShort[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get<CustomerShort[]>(`${this.apiUrl}/professional/mycustomers`, { headers }).pipe(
      tap(response => {
        this.customersSubject.next(response);
      }))
  }
  

}