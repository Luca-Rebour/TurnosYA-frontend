import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TimeSlot } from '../../shared/models/time-slot.model';

@Injectable({
  providedIn: 'root'
})
export class TimeSlotsService {
    private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAvailableTimeSlots(professionalId: string, date: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.apiUrl}/availabilities/${professionalId}/${date}`);
  }

}
