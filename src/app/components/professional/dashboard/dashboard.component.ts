import { Component } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { StatsComponent } from './stats/stats.component';
import { UserService } from 'app/services/user.service';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { UpcomingAppointmentsComponent } from './upcoming-appointments/upcoming-appointments.component';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';
import { CalendarComponent } from './calendar/calendar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatsComponent, LucideAngularModule, UpcomingAppointmentsComponent, RecentActivityComponent, CalendarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  readonly plusIcon = Plus;
  constructor(private _authService: AuthService, private _userService: UserService) { }
  name: string = '';

  ngOnInit(): void {
    this.name = this._userService.getUserName() || 'User';
    
  }

}
