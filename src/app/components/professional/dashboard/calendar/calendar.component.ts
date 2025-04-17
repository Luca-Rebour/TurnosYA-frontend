import { Component, ViewEncapsulation } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { UserService } from 'app/services/user.service';
import { appointment } from 'app/models/appointment.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  styleUrls: ['./calendar.component.css'],
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent {

  appointments: Array<appointment> = [];
  events: any[] = [];

  constructor(private _userService: UserService) { }

  ngOnInit() {
    this._userService.appointments$.subscribe((appointments) => {
      this.appointments = appointments;
      this.events = this.mapAppointmentsToEvents(appointments);
    });
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridFourDay',
    plugins: [dayGridPlugin, timeGridPlugin, bootstrap5Plugin],
    themeSystem: 'bootstrap5',
    allDaySlot: false,
    height: '70vh',
    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
    views: {
      timeGridFourDay: {
        type: 'timeGrid',
        duration: { days: 1 },
        buttonText: '1 día'
      }
    },
    events: (fetchInfo, successCallback, failureCallback) => {
      successCallback(this.events);
    },
    eventContent: (arg) => {
      const statusClass = this.getTailwindClassByStatus(arg.event.extendedProps['status']);
      
      const start = arg.event.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '';
      const end = arg.event.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '';
    
      return {
        html: `
          <div class="w-full h-full px-2 py-1 rounded text-sm font-medium flex flex-col text-black ${statusClass}">
            <div>${arg.event.title}</div>
            <div class="text-xs">${start} - ${end}</div>
          </div>
        `
      };
    }
    
    
  };

  mapAppointmentsToEvents(appointments: appointment[]): any[] {
    return appointments.map(a => {
      const start = new Date(a.date);
      const end = new Date(start.getTime() + a.durationMinutes * 60000);
      return {
        title: `${a.customer.name}`,
        start,
        end,
        status: a.status.toLowerCase()
      };      
    });
  }
  

  getTailwindClassByStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-100 border border-emerald-200 rounded-md p-2';
      case 'pending':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  }

}
