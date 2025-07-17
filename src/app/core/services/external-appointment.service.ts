import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExternalAppointmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createAppointment(appointmentData: any) {
    return this.http.post(`${this.apiUrl}/external-appointments`, appointmentData);
  }
}
