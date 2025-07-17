import { Component } from '@angular/core';
import { HeaderComponent } from '../../../layout/header/header.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { NewAppointmentButtonComponent } from '../new-appointment-button/new-appointment-button.component';
import { NotificationsButtonComponent } from '../../../shared/components/notifications-button/notifications-button.component';
import { SummarCardsComponent } from './summar-cards/summar-cards.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, NewAppointmentButtonComponent, NotificationsButtonComponent, SummarCardsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  sidebarOpen = false;
  username: string = 'Luca';

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
