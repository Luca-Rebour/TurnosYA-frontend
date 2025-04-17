// src/app/resolvers/appointments.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { ProfessionalService } from 'app/services/professional.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsResolver implements Resolve<any> {
  constructor(private _userService: UserService, private _professionalService: ProfessionalService) {}

  resolve(): Observable<any> {
    return this._userService.getUserAppointments();
    return this._professionalService.getCustomers();
  }
}
