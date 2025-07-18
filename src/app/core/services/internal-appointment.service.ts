import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateInternalAppointment } from '../../shared/models/create-internal-appointment.model';

@Injectable({
  providedIn: 'root'
})
export class InternalAppointmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createInternalAppointment(appointmentData: CreateInternalAppointment): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, appointmentData);
  }
}
