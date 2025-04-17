import { NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { LucideAngularModule, Calendar, Clock, User } from 'lucide-angular';
import { appointment } from 'app/models/appointment.model';
import { isToday, isThisWeek } from 'date-fns';
import { ProfessionalService } from 'app/services/professional.service';
import { CustomerShort } from 'app/models/customerShort.model';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [NgFor, NgClass, LucideAngularModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent {
  readonly calendarIcon = Calendar;
  readonly clockIcon = Clock;
  readonly userIcon = User;
  appointments: Array<appointment> = [];
  cards: Array<any> = [];
  constructor(private _userService: UserService, private _professionalServide: ProfessionalService) {}

  ngOnInit() {
    combineLatest([
      this._userService.appointments$,
      this._professionalServide.getCustomers()
    ]).subscribe(([appointments, clients]) => {
      this.appointments = appointments;
      this.updateTodayAppointments();
      this.updateThisWeekAppointments();
      this.updatePendingConfirmations();
      this.clients = clients;
      this.disctinctClients();
      this.cards = this.getCards();
    });
  }
  
  todayAppointments: Array<appointment> = [];
  thisWeekAppointments: Array<appointment> = [];
  clients: Array<CustomerShort> = []; 
  pendingConfirmations: Array<appointment> = [];;

  getCards() {
    return [
      {
        title: "Today's Appointments",
        value: this.todayAppointments.length,
        icon: Calendar,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
      },
      {
        title: "This Week",
        value: this.thisWeekAppointments.length,
        icon: Calendar,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
      },
      {
        title: "Total Clients",
        value: this.clients.length,
        icon: User,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-500",
      },
      {
        title: "Pending Confirmations",
        value: this.pendingConfirmations.length,
        icon: Clock,
        iconBg: "bg-rose-50",
        iconColor: "text-rose-500",
      },
    ];
  }
  

  updateTodayAppointments() {
    this.todayAppointments = this.appointments.filter(appointment =>
      isToday(appointment.date) && appointment.status.toLowerCase() !== 'canceled'
    );
  }
  

  updateThisWeekAppointments() {
    this.thisWeekAppointments = this.appointments.filter(appointment =>
      isThisWeek(appointment.date) && appointment.status.toLowerCase() !== 'canceled'
    );
  }

  updatePendingConfirmations() {
    this.pendingConfirmations = this.appointments.filter(appointment => 
      appointment.status.toLowerCase() === 'pending'
    );
  }
  
  disctinctClients() {
    const seen = new Set<string>();
    this.clients = this.clients.filter(client => {
      if (seen.has(client.email)) return false;
      seen.add(client.email);
      return true;
    });
  
    this.clients = this.clients.sort((a, b) => a.name.localeCompare(b.name));
  }
  
}
