import { Component } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { DialogNewAppointmentProfessionalComponent } from '../dialog-new-appointment-professional/dialog-new-appointment-professional.component';

@Component({
  selector: 'app-new-appointment-button',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './new-appointment-button.component.html',
  styleUrl: './new-appointment-button.component.scss'
})
export class NewAppointmentButtonComponent {
  readonly Plus = Plus;

    constructor(private dialog: MatDialog) {}

  onNewAppointmentClick() {
    this.dialog.open(DialogNewAppointmentProfessionalComponent, {
      width: '500px',
      data: {
        // podés pasar info si querés, como el ID del profesional
      }
    });
    console.log('New appointment button clicked');
  }
}
