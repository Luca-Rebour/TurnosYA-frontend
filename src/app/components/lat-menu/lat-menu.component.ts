import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  Calendar,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  LucideAngularModule
} from 'lucide-angular';

@Component({
  selector: 'app-lat-menu',
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    NgIf,
    LucideAngularModule
  ],
  templateUrl: './lat-menu.component.html',
  styleUrls: ['./lat-menu.component.css']
})
export class LatMenuComponent {
  readonly calendar = Calendar;
  readonly clipboardList = ClipboardList;
  readonly users = Users;
  readonly barChart3 = BarChart3;
  readonly settings = Settings;
  sidebarOpen = false;
  activeItem = 'Agenda';

  navItems = [
    { label: 'Agenda', icon: Calendar },
    { label: 'My Appointments', icon: ClipboardList },
    { label: 'Clients', icon: Users },
    { label: 'Reports', icon: BarChart3 },
    { label: 'Settings', icon: Settings }
  ];
  setActive(label: string) {
    this.activeItem = label;
    this.sidebarOpen = false;
  }
}
