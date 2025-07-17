import { Component } from '@angular/core';
import { Calendar, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css'
})
export class LogoComponent {
  readonly Calendar = Calendar;
}
