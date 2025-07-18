import { Component } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { DialogNewAppointmentProfessionalComponent } from '../dialog-new-appointment-professional/dialog-new-appointment-professional.component';
import { UserContextService } from '../../../core/services/user-context.service';

@Component({
  selector: 'app-new-appointment-button',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './new-appointment-button.component.html',
  styleUrl: './new-appointment-button.component.scss'
})
export class NewAppointmentButtonComponent {
  readonly Plus = Plus;

  constructor(
    private dialog: MatDialog,
    private userContextService: UserContextService
  ) {}

  onNewAppointmentClick() {
    // Get the current professional ID using the user context service
    const professionalId = this.userContextService.getCurrentProfessionalId();
    
    if (!professionalId) {
      console.error('No professional ID found - user may not be a professional or not logged in');
      // You might want to show a toast or alert here
      return;
    }

    this.dialog.open(DialogNewAppointmentProfessionalComponent, {
      width: '40%',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: {
        professionalId: professionalId
      }
    });
    console.log('New appointment button clicked with professionalId:', professionalId);
  }
}
