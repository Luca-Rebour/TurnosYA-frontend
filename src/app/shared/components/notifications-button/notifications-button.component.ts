import { Component } from '@angular/core';
import { LucideAngularModule, Bell } from 'lucide-angular';

@Component({
  selector: 'app-notifications-button',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './notifications-button.component.html',
  styleUrl: './notifications-button.component.css'
})
export class NotificationsButtonComponent {
  readonly Bell = Bell;
}
