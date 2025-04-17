import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { appointment } from 'app/models/appointment.model';
import { UserService } from 'app/services/user.service';
import { format, isThisWeek, formatDistanceToNow, isToday, isBefore } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { LucideAngularModule, User } from 'lucide-angular';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarService } from 'app/services/sidebar.service';
import { AppointmentService } from 'app/services/appointment.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-upcoming-appointments',
  standalone: true,
  imports: [NgFor, DatePipe, LucideAngularModule, NgClass, NgIf, SidebarComponent],
  templateUrl: './upcoming-appointments.component.html',
  styleUrl: './upcoming-appointments.component.css'
})
export class UpcomingAppointmentsComponent {

  readonly userIcon = User;
  appointments: Array<appointment> = [];
  upcomingAppointments: Array<appointment> = [];
  todayAppointments: Array<appointment> = [];
  pendingAppointments: Array<appointment> = [];
  showedAppointments: string = 'today';
  confirmAppointmentId: string = '';
  isModalOpen = false;
  activeTab: 'today' | 'upcoming' | 'pending' = 'today';
  constructor(private _userService: UserService, private _sidebarService: SidebarService, private _appointmentService: AppointmentService) { }

  ngOnInit() {
    this._userService.appointments$.subscribe((appointments) => {
      this.appointments = appointments;
      this.updateUpcomingAppointments();
      this.updateTodayAppointments();
      this.updatePendingAppointments();
    });
  }

  updateUpcomingAppointments() {
    this.upcomingAppointments = this.appointments.filter(appointment =>
      isThisWeek(new Date(appointment.date)) && isBefore(new Date(), new Date(appointment.date))
    );
  }

  updateTodayAppointments() {
    this.todayAppointments = this.appointments.filter(appointment =>
      isToday(new Date(appointment.date))
    );
  }

  updatePendingAppointments() {
    this.pendingAppointments = this.appointments.filter(appointment =>
      appointment.status.toLowerCase() === 'pending' && isBefore(new Date(), new Date(appointment.date))
    );
  }


  getRelativeDate(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: enUS });
  }

  getFormattedDate(date: string | Date): string {
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  }



  changeShowedAppointments(tab: 'today' | 'upcoming' | 'pending') {
    this.activeTab = tab;
    this.showedAppointments = tab;

  }

  isSidebarOpen = false;

  openSidebar() {
    this.isSidebarOpen = true;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  confirmAppointment() {
    this._appointmentService.confirmAppointment(this.confirmAppointmentId).pipe(
      switchMap(() => this._userService.getUserAppointments())
    ).subscribe(() => {
      this.updateUpcomingAppointments();
      this.updateTodayAppointments();
      this.updatePendingAppointments();
    });
    this.closeModal();
  };



  openModal(appointmentId: string) {
    this.confirmAppointmentId = appointmentId;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

}
