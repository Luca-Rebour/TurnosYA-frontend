import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import {
  Calendar,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  LucideAngularModule,
  User,
  LogOut
} from 'lucide-angular';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    NgIf,
    LucideAngularModule,
    RouterOutlet,
    NgClass
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  readonly userIcon = User;
  sidebarOpen = false;
  activeItem = 'Agenda';

  constructor(private _authService: AuthService) {}
  

  navItems = [
    { label: 'Agenda', icon: Calendar, route: '/professional/dashboard', logout: false },
    { label: 'My Appointments', icon: ClipboardList, route: '/professional/appointments', logout: false },
    { label: 'Clients', icon: Users, route: '/professional/clients', logout: false },
    { label: 'Reports', icon: BarChart3, route: '/professional/reports', logout: false },
    { label: 'Settings', icon: Settings, route: '/professional/settings', logout: false },
    { label: 'Logout', icon: LogOut, route: '/logout', logout: true },
  ];
  setActive(label: string) {
    this.activeItem = label;
    this.sidebarOpen = false;
  }

  logout() {
    this._authService.logout();
    console.log('Logging out...');
  }

}
