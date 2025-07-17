import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { LucideAngularModule, CircleQuestionMark } from 'lucide-angular';
import { CreateExternalCustomer } from '../../../shared/models/create-external-customer.model';
import { ExternalCustomerService } from '../../../core/services/external-customer.service';
import { ExternalAppointmentService } from '../../../core/services/external-appointment.service';
import { CustomerGeneric } from '../../../shared/models/customer-generic.model';
import { ProfessionalService } from '../../../core/services/professional.service';
import { SummaryData } from '../../../shared/models/summary-data.model';

@Component({
  selector: 'app-dialog-new-appointment-professional',
  standalone: true,
  imports: [
    MatTooltipModule,
    ReactiveFormsModule,
    LucideAngularModule,
    NgIf,
    FormsModule,
    NgForOf,
  ],
  templateUrl: './dialog-new-appointment-professional.component.html',
  styleUrl: './dialog-new-appointment-professional.component.scss',
})
export class DialogNewAppointmentProfessionalComponent {
  appointmentForm!: FormGroup;
  readonly CircleQuestionMark = CircleQuestionMark;

  foundCustomer: any = null;
  searchFailed = false;
  clientFilter: string = '';
  registeredCustomers: CustomerGeneric[] = [];
  filteredCustomers: CustomerGeneric[] = [];
  clientSearchControl = new FormControl('');
  showSuggestions = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogNewAppointmentProfessionalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _externalCustomerService: ExternalCustomerService,
    private _externalAppointmentService: ExternalAppointmentService,
    private _professionalService: ProfessionalService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();

    this.appointmentForm = this.fb.group({
      isExternal: [false],
      selectedCustomerId: [null],
      searchEmail: [''],
      externalName: [''],
      externalLastName: [''],
      externalEmail: ['', Validators.email],
      externalPhone: [''],
      date: [null, Validators.required],
      time: ['', Validators.required],
      reason: [''],
    });
    this.clientSearchControl.valueChanges.subscribe((value) => {
      const filter = value?.toLowerCase() ?? '';
      this.filteredCustomers = this.registeredCustomers.filter((c) =>
        (c.name + ' ' + c.lastName + ' ' + c.email)
          .toLowerCase()
          .includes(filter)
      );
    });
  }

  searchCustomerByEmail(): void {
    const email = this.appointmentForm.get('searchEmail')?.value;

    // Reemplazar por llamada al backend
    if (email === 'juan@mail.com') {
      this.foundCustomer = { id: 1, name: 'Juan Pérez', email };
      this.searchFailed = false;
    } else {
      this.foundCustomer = null;
      this.searchFailed = true;
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) return;

    const values = this.appointmentForm.value;

    // Combinar fecha y hora
    const combinedDate = new Date(values.date);
    const [hours, minutes] = values.time.split(':').map(Number);
    combinedDate.setHours(hours, minutes, 0, 0);

    const basePayload = {
      professionalId: this.data.professionalId,
      date: combinedDate.toISOString(),
      durationMinutes: 60,
    };

    if (values.isExternal) {
      const customerData: CreateExternalCustomer = {
        name: values.externalName,
        email: values.externalEmail,
        phone: values.externalPhone,
        lastName: values.externalLastName,
      };

      this._externalCustomerService
        .createExternalCustomer(customerData)
        .subscribe({
          next: (res) => {
            const payload = {
              ...basePayload,
              externalCustomerId: res.id,
            };

            this._externalAppointmentService
              .createAppointment(payload)
              .subscribe({
                next: () => {
                  console.log('External appointment created successfully');
                },
                error: (err) => {
                  console.error('Error creating external appointment:', err);
                  alert(
                    'There was a problem creating the appointment. Please try again.'
                  );
                },
              });

            this.dialogRef.close(payload);
          },
          error: (err) => {
            console.error('Error creating external customer:', err);

            // Opción 1: mostrar un mensaje simple en pantalla
            alert(
              'There was a problem creating the external client. Please check the information and try again.'
            );

            // Opción 2 (mejor): mostrar un mensaje dentro del diálogo
            // this.creationError ='Error creating external client. Please try again.';
          },
        });
    } else {
      if (!this.foundCustomer) {
        alert('Please search and select a registered client first.');
        return;
      }

      const payload = {
        ...basePayload,
        customerId: this.foundCustomer.id,
      };

      this.dialogRef.close(payload);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  filterClients() {
    const filter = this.clientFilter.toLowerCase();
    this.filteredCustomers = this.registeredCustomers.filter((c) =>
      (c.name + ' ' + c.lastName).toLowerCase().includes(filter)
    );
  }

  loadCustomers() {
    this._professionalService.getAllCustomers().subscribe((customers) => {
      this.registeredCustomers = customers;
      this.filteredCustomers = [...customers];
    });
  }

  selectClient(client: any) {
    this.appointmentForm.patchValue({
      selectedCustomerId: client.id,
    });
    this.clientSearchControl.setValue(
      `${client.name} ${client.lastName} (${client.email})`,
      { emitEvent: false }
    );
    this.showSuggestions = false;
  }
  
  hideSuggestions() {
    setTimeout(() => (this.showSuggestions = false), 150); // delay para permitir seleccionar con click
  }
}
