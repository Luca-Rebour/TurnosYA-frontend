import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { CreateExternalAppointment } from '../../shared/models/create-external-appointment.model';

@Injectable({
  providedIn: 'root'
})
export class ExternalAppointmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createExternalAppointment(appointmentData: CreateExternalAppointment): Observable<any> {
    return this.http.post(`${this.apiUrl}/external-appointments`, appointmentData);
  }
}
