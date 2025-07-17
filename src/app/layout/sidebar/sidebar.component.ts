import { Component } from '@angular/core';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { LucideAngularModule, Calendar, Users, ChartColumn, ClipboardList, Settings, LogOut} from 'lucide-angular';
import { Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LogoComponent, LucideAngularModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly ChartColumn = ChartColumn;
  readonly ClipboardList = ClipboardList;
  readonly Settings = Settings;
  readonly LogOut = LogOut;

  constructor(private route: Router) {}

  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  closeSidebar() {
    this.closed.emit();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');

    this.route.navigate(['/auth']);

  }

}
