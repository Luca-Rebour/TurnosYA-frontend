import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { appointment } from 'app/models/appointment.model';
import { UserService } from 'app/services/user.service';
import { isThisMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen: boolean = false;
  @Output() closed = new EventEmitter<void>();
  appointments: Array<appointment> = [];
  monthAppointments: Array<appointment> = [];

  constructor(private _userService: UserService) { }
  ngOnInit() {
    this._userService.appointments$.subscribe((appointments) => {
      this.appointments = appointments;
      this.updateMonthAppointments();
    });

  }

  closeSidebar() {
    this.closed.emit();
  }

  updateMonthAppointments() {
    this.monthAppointments = this.appointments.filter(appointment =>
      isThisMonth(appointment.date)
    );
  }
  

  getFormattedDate(date: string | Date): string {
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  }

}
