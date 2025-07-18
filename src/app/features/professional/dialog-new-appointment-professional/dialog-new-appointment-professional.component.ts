import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgForOf, NgIf } from '@angular/common';
import { LucideAngularModule, CircleQuestionMark, Calendar } from 'lucide-angular';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { CreateExternalClient } from '../../../shared/models/create-external-client.model';
import { ExternalClientService } from '../../../core/services/external-clients.service';
import { ExternalAppointmentService } from '../../../core/services/external-appointment.service';
import { ClientGeneric } from '../../../shared/models/client-generic.model';
import { ProfessionalService } from '../../../core/services/professional.service';
import { CreateExternalAppointment } from '../../../shared/models/create-external-appointment.model';
import { InternalAppointmentService } from '../../../core/services/internal-appointment.service';
import { CreateInternalAppointment } from '../../../shared/models/create-internal-appointment.model';
import { CreateExternalClientResponse } from '../../../shared/models/create-external-client-response.mode';
import { TimeSlotsService } from '../../../core/services/time-slots.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { TimeSlot } from '../../../shared/models/time-slot.model';

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
export class DialogNewAppointmentProfessionalComponent implements OnInit, OnDestroy {
  appointmentForm!: FormGroup;
  readonly CircleQuestionMark = CircleQuestionMark;
  readonly Calendar = Calendar;

  // Client properties
  foundClient: any = null;
  searchFailed = false;
  registeredClients: ClientGeneric[] = [];
  filteredClients: ClientGeneric[] = [];
  clientSearchControl = new FormControl('');
  showSuggestions = false;
  
  // Available time slots
  availableTimeSlots: any[] = [];
  selectedTimeSlot: any = null;
  isLoadingSlots = false;
  
  // UI state
  error: string | null = null;
  isLoading = false;
  
  // Subscription management
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogNewAppointmentProfessionalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _externalClientService: ExternalClientService,
    private _externalAppointmentService: ExternalAppointmentService,
    private _professionalService: ProfessionalService,
    private _internalAppointmentService: InternalAppointmentService,
    private _timeSlotsService: TimeSlotsService,
    private _userContextService: UserContextService
  ) { }

  ngOnInit(): void {
    // Validate that we have a professional ID - try data first, then fallback to user context
    const professionalId = this.data?.professionalId || this._userContextService.getCurrentProfessionalId();
    
    if (!professionalId) {
      console.error('No professionalId provided to the dialog and no professional found in user context');
      this.error = 'Unable to load appointment form. Professional ID is missing.';
      return;
    }

    // Ensure the data object has the professional ID
    if (!this.data) {
      this.data = {};
    }
    this.data.professionalId = professionalId;

    console.log('Dialog initialized with professionalId:', professionalId);

    this.initializeForm();
    this.loadClients();
    this.setupClientSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.appointmentForm = this.fb.group({
      isExternal: [false],
      selectedClientId: [null],
      searchEmail: [''],
      externalName: ['', [Validators.required]],
      externalLastName: ['', [Validators.required]],
      externalEmail: ['', [Validators.required, Validators.email]],
      externalPhone: ['', [Validators.required]],
      date: [null, Validators.required],
      selectedTimeSlot: [null, Validators.required],
      reason: [''],
    });

    this.appointmentForm.get('isExternal')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isExternal => this.updateValidators(isExternal));

    this.appointmentForm.get('date')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(date => {
        if (date) {
          this.loadAvailableTimeSlots(date);
        } else {
          this.availableTimeSlots = [];
          this.selectedTimeSlot = null;
        }
      });
  }

  private updateValidators(isExternal: boolean): void {
    const externalFields = ['externalName', 'externalLastName', 'externalEmail', 'externalPhone'];
    
    externalFields.forEach(field => {
      const control = this.appointmentForm.get(field);
      if (control) {
        if (isExternal) {
          control.setValidators([Validators.required, ...(field === 'externalEmail' ? [Validators.email] : [])]);
        } else {
          control.clearValidators();
        }
        control.updateValueAndValidity();
      }
    });
  }

  private setupClientSearch(): void {
    this.clientSearchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const filter = value?.toLowerCase() ?? '';
        this.filteredClients = this.registeredClients.filter((c) =>
          (c.name + ' ' + c.lastName + ' ' + c.email)
            .toLowerCase()
            .includes(filter)
        );
      });
  }

  async onSubmit(): Promise<void> {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const values = this.appointmentForm.value;
      const appointment = await this.createAppointment(values);
      this.dialogRef.close(appointment);
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private async createAppointment(values: any): Promise<any> {
    if (!values.selectedTimeSlot) {
      throw new Error('Please select an available time slot.');
    }

    const professionalId = this.professionalId;
    if (!professionalId) {
      throw new Error('Professional ID is missing.');
    }

    // Crear el DateTime completo combinando la fecha seleccionada con la hora del slot
    const appointmentDateTime = this.createAppointmentDateTime(values.date, values.selectedTimeSlot.startTime);
    
    console.log('Selected date:', values.date);
    console.log('Selected time slot start time:', values.selectedTimeSlot.startTime);
    console.log('Combined appointment DateTime:', appointmentDateTime);
    
    const basePayload = {
      professionalId: professionalId,
      date: appointmentDateTime, // DateTime en formato ISO compatible con .NET
      durationMinutes: this.calculateDurationMinutes(values.selectedTimeSlot.startTime, values.selectedTimeSlot.endTime),
      reason: values.reason || null,
      timeSlotId: values.selectedTimeSlot.id, // Incluir el ID del slot
    };

    console.log('Creating appointment with payload:', basePayload);

    console.log('Creating appointment with payload:', basePayload);

    if (values.isExternal) {
      return await this.createExternalAppointmentFlow(basePayload, values);
    } else {
      return await this.createInternalAppointmentFlow(basePayload);
    }
  }

  private calculateDurationMinutes(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  }

  // Método alternativo para crear DateTime sin zona horaria (si tu backend lo prefiere)
  private createAppointmentDateTimeLocal(date: string, startTime: string): string {
    // Parsear la fecha como string para evitar problemas de zona horaria
    const dateParts = date.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2], 10);
    
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Crear fecha usando el constructor con parámetros individuales
    const selectedDate = new Date(year, month, day, hours, minutes, 0, 0);
    
    // Formato local sin zona horaria: "2025-07-18T14:30:00"
    const yearStr = selectedDate.getFullYear();
    const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const hourStr = String(selectedDate.getHours()).padStart(2, '0');
    const minuteStr = String(selectedDate.getMinutes()).padStart(2, '0');
    const secondStr = String(selectedDate.getSeconds()).padStart(2, '0');
    
    return `${yearStr}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:${secondStr}`;
  }

  private async loadAvailableTimeSlots(date: string): Promise<void> {
    console.log('Loading available time slots for date:', date);
    console.log('Professional ID:', this.data?.professionalId);
    
    if (!this.data?.professionalId) {
      console.error('No professionalId available');
      this.error = 'Unable to load time slots. Professional ID is missing.';
      return;
    }

    this.isLoadingSlots = true;
    this.availableTimeSlots = [];
    this.selectedTimeSlot = null;
    this.appointmentForm.patchValue({ selectedTimeSlot: null });

    try {
      // Se obtienen los slots disponibles usando el servicio de TimeSlotsService
      const slots: TimeSlot[] = await firstValueFrom(
        this._timeSlotsService.getAvailableTimeSlots(this.data.professionalId, date)
      );
      console.log('Available time slots loaded:', slots);
      
      this.availableTimeSlots = slots;
      
      if (this.availableTimeSlots.length === 0) {
        this.error = 'No available time slots for the selected date.';
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    } catch (error) {
      console.error('Error loading available time slots:', error);
      this.error = 'Unable to load available time slots. Please try again.';
      setTimeout(() => {
        this.error = null;
      }, 3000);
    } finally {
      this.isLoadingSlots = false;
    }
  }

  private async createExternalAppointmentFlow(basePayload: any, values: any): Promise<any> {
    const clientData: CreateExternalClient = {
      name: values.externalName,
      email: values.externalEmail,
      phone: values.externalPhone,
      lastName: values.externalLastName,
    };

    const client = await this.createExternalClient(clientData);
    const payload: CreateExternalAppointment = {
      ...basePayload,
      externalClientId: client.id,
    };

    await this.createExternalAppointment(payload);
    return payload;
  }

  private async createInternalAppointmentFlow(basePayload: any): Promise<any> {
    if (!this.foundClient?.id) {
      throw new Error('Please select a client before creating the appointment.');
    }

    if (this.foundClient.clientType?.toLowerCase() === 'external') {
      const payload: CreateExternalAppointment = {
        ...basePayload,
        externalClientId: this.foundClient.id,
      };
      await this.createExternalAppointment(payload);
      return payload;
    } else {
      const payload: CreateInternalAppointment = {
        ...basePayload,
        clientId: this.foundClient.id,
      };
      await this.createInternalAppointment(payload);
      return payload;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.appointmentForm.controls).forEach(key => {
      const control = this.appointmentForm.get(key);
      control?.markAsTouched();
    });
  }

  private handleError(error: any): void {
    console.error('Error during appointment submission:', error);
    this.error = error.message || 'An error occurred while creating the appointment. Please try again.';
    
    setTimeout(() => {
      this.error = null;
    }, 5000);
  }


  private async createExternalClient(payload: CreateExternalClient): Promise<CreateExternalClientResponse> {
    try {
      const res = await firstValueFrom(this._externalClientService.createExternalClient(payload));
      if (!res?.id) {
        throw new Error('External client was not created correctly.');
      }
      return res;
    } catch (err) {
      console.error('Error creating external client:', err);
      throw new Error('Error creating external client.');
    }
  }

  private async createExternalAppointment(payload: CreateExternalAppointment): Promise<void> {
    try {
      await firstValueFrom(this._externalAppointmentService.createExternalAppointment(payload));
      console.log('External appointment created successfully');
    } catch (err) {
      console.error('Error creating external appointment:', err);
      throw new Error('Unable to create external appointment.');
    }
  }

  private async createInternalAppointment(payload: CreateInternalAppointment): Promise<void> {
    try {
      await firstValueFrom(this._internalAppointmentService.createInternalAppointment(payload));
      console.log('Internal appointment created successfully');
    } catch (err) {
      console.error('Error creating internal appointment:', err);
      throw new Error('Unable to create internal appointment.');
    }
  }

  private loadClients(): void {
    this._professionalService.getAllClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clients) => {
          this.registeredClients = clients;
          this.filteredClients = [...clients];
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          this.error = 'Unable to load clients. Please try again.';
        }
      });
  }

  selectClient(client: ClientGeneric): void {
    this.foundClient = client;
    this.appointmentForm.patchValue({
      selectedClientId: client.id,
    });
    this.clientSearchControl.setValue(
      `${client.name} ${client.lastName} (${client.email})`,
      { emitEvent: false }
    );
    this.showSuggestions = false;
  }

  hideSuggestions(): void {
    setTimeout(() => (this.showSuggestions = false), 150);
  }

  setClientType(isExternal: boolean): void {
    this.appointmentForm.patchValue({
      isExternal: isExternal,
      selectedClientId: null,
      externalName: '',
      externalLastName: '',
      externalEmail: '',
      externalPhone: '',
    });
    this.foundClient = null;
    this.searchFailed = false;
    this.clientSearchControl.setValue('');
    this.showSuggestions = false;
  }

  selectTimeSlot(timeSlot: any): void {
    this.selectedTimeSlot = timeSlot;
    this.appointmentForm.patchValue({
      selectedTimeSlot: timeSlot
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Helper methods for template
  get isExternalClient(): boolean {
    return this.appointmentForm.get('isExternal')?.value ?? false;
  }

  get isFormValid(): boolean {
    return this.appointmentForm.valid && 
           (!this.isExternalClient ? !!this.foundClient : true) &&
           !!this.selectedTimeSlot;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.appointmentForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
    }
    return null;
  }

  // Esta funcion formatea el time slot para mostrarlo en el formato "HH:MM AM/PM - HH:MM AM/PM" en el HTML
formatTimeSlot(timeSlot: TimeSlot): string {
  if (!timeSlot?.startTime || !timeSlot?.endTime) return '';

  const today = new Date().toISOString().split('T')[0];

  const startDate = new Date(`${today}T${timeSlot.startTime}`);
  const endDate = new Date(`${today}T${timeSlot.endTime}`);

  const startTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const endTime = endDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${startTime} - ${endTime}`;
}


  // Helper method to get minimum date (today)
  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Helper method to get the current professional ID
  get professionalId(): string | null {
    return this.data?.professionalId || this._userContextService.getCurrentProfessionalId();
  }
  private readonly USE_LOCAL_DATETIME = true;

  // Método principal para crear DateTime - usa la configuración para elegir formato
  private createAppointmentDateTime(date: string, startTime: string): string {
    return this.USE_LOCAL_DATETIME 
      ? this.createAppointmentDateTimeLocal(date, startTime)
      : this.createAppointmentDateTimeISO(date, startTime);
  }

  // Método para crear DateTime en formato ISO (con zona horaria)
  private createAppointmentDateTimeISO(date: string, startTime: string): string {
    // Parsear la fecha como string para evitar problemas de zona horaria
    const dateParts = date.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Crear fecha usando el constructor con parámetros individuales
    const selectedDate = new Date(year, month, day, hours, minutes, 0, 0);
    
    const isoString = selectedDate.toISOString();
    
    return isoString;
  }
}
