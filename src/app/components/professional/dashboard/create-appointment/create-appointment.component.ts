import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.css'
})
export class CreateAppointmentComponent {
  appointmentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.appointmentForm = this.fb.group({
      customerId: [''],
      date: ['', Validators.required],
      time: ['', Validators.required],
      duration: [60],
      notes: ['']
    });
  }

isExistingCustomer = true;


minDate = new Date().toISOString().split('T')[0];

selectTab(existing: boolean) {
  this.isExistingCustomer = existing;
  if (!existing) this.appointmentForm.get('customerId')?.reset();
}

onSubmit() {
  if (this.appointmentForm.valid) {
    const data = this.appointmentForm.value;
    console.log('Submit:', data);
    
  }
}


}
