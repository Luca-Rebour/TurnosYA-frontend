import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAvailableSlots(professionalId: string, date: string) {
    return this.http.get(`${this.apiUrl}/availability/${professionalId}/${date}`);
  }

}
