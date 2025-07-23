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
export class DialogNewAppointmentProfessionalComponent implements OnInit {
  readonly Calendar = Calendar;

  // Listas de clientes
  internalClients: ClientGeneric[] = [];
  externalClients: ClientGeneric[] = [];
  filteredInternalClients: ClientGeneric[] = [];
  filteredExternalClients: ClientGeneric[] = [];
  
  // IDs de clientes seleccionados
  selectedInternalClientId: string | null = null;
  selectedExternalClientId: string | null = null;

  // Time slots
  availableTimeSlots: TimeSlot[] = [];
  selectedTimeSlot: TimeSlot | null = null;
  loadingTimeSlots = false;

  // Focus tracking for dropdowns
  internalSearchFocused = false;
  externalSearchFocused = false;

  // Error messages
  errorMessage = '';
  showError = false;

  constructor(
    public dialogRef: MatDialogRef<DialogNewAppointmentProfessionalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private externalClientService: ExternalClientService,
    private externalAppointmentService: ExternalAppointmentService,
    private professionalService: ProfessionalService,
    private internalAppointmentService: InternalAppointmentService,
    private timeSlotsService: TimeSlotsService,
    private userContextService: UserContextService
  ) {
    this.internalAppointmentForm = this.formBuilder.group({
      clientId: ['', Validators.required],
      professionalId: [''],
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      notes: [''],
      durationMinutes: [0, Validators.required],
    });

    this.externalAppointmentForm = this.formBuilder.group({
      externalClientId: [''],
      professionalId: [''],
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      notes: [''],
      durationMinutes: [30],
    });

    this.newClientForm = this.formBuilder.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  appointmentType: 'internal' | 'external' = 'internal';
  createNewClient = false;

  internalAppointmentForm: FormGroup;
  externalAppointmentForm: FormGroup;
  newClientForm: FormGroup;

  async ngOnInit() {
    await this.loadAllClients();
    this.setupClientSearch();
  }

  async loadAllClients() {
    try {
      const professionalId = this.userContextService.getCurrentProfessionalId();
      if (!professionalId) {
        console.error('No professional ID found');
        return;
      }

      // Cargar todos los clientes del profesional
      const allClients = await firstValueFrom(this.professionalService.getAllClients());
      
      console.log('Raw clients response:', allClients);
      
      if (Array.isArray(allClients)) {
        console.log('All clients received:', allClients.map(c => ({ 
          name: c.name, 
          lastName: c.lastName, 
          email: c.email, 
          clientType: c.clientType 
        })));
        
        // Separar clientes por tipo (case-insensitive)
        this.internalClients = allClients.filter(client => 
          client.clientType?.toLowerCase() === 'internal'
        );
        this.externalClients = allClients.filter(client => 
          client.clientType?.toLowerCase() === 'external'
        );
        
        // Mostrar 5 clientes al azar inicialmente
        this.filteredInternalClients = this.getRandomClients(this.internalClients, 5);
        this.filteredExternalClients = this.getRandomClients(this.externalClients, 5);

        console.log('Internal clients loaded:', this.internalClients.length);
        console.log('External clients loaded:', this.externalClients.length);
        console.log('External clients:', this.externalClients);
      } else {
        console.error('Invalid response format for clients');
      }

    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  setupClientSearch() {
    // Configurar búsqueda para clientes internos
    this.internalAppointmentForm.get('clientId')?.valueChanges.subscribe(searchTerm => {
      this.filterInternalClients(searchTerm);
    });

    // Configurar búsqueda para clientes externos
    this.externalAppointmentForm.get('externalClientId')?.valueChanges.subscribe(searchTerm => {
      this.filterExternalClients(searchTerm);
    });

    // Configurar carga de time slots cuando cambia la fecha interna
    this.internalAppointmentForm.get('date')?.valueChanges.subscribe(date => {
      if (date) {
        this.loadTimeSlotsForDate(date);
      } else {
        this.availableTimeSlots = [];
        this.selectedTimeSlot = null;
      }
    });

    // Configurar carga de time slots cuando cambia la fecha externa
    this.externalAppointmentForm.get('date')?.valueChanges.subscribe(date => {
      if (date) {
        this.loadTimeSlotsForDate(date);
      } else {
        this.availableTimeSlots = [];
        this.selectedTimeSlot = null;
      }
    });
  }

  filterInternalClients(searchTerm: string) {
    // Limpiar cliente seleccionado si el usuario está escribiendo manualmente
    if (searchTerm && searchTerm.trim() !== '' && this.selectedInternalClientId) {
      // Verificar si el texto coincide exactamente con el cliente seleccionado
      const selectedClient = this.internalClients.find(c => c.id === this.selectedInternalClientId);
      if (selectedClient) {
        const expectedText = `${selectedClient.name} ${selectedClient.lastName} (${selectedClient.email})`;
        if (searchTerm !== expectedText) {
          // El usuario está escribiendo algo diferente, limpiar la selección
          this.selectedInternalClientId = null;
        }
      }
    }
    
    if (!searchTerm || searchTerm.trim() === '') {
      // Si no hay término de búsqueda, mostrar 5 clientes al azar
      this.filteredInternalClients = this.getRandomClients(this.internalClients, 5);
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredInternalClients = this.internalClients.filter(client => {
      const fullName = `${client.name} ${client.lastName}`.toLowerCase();
      return fullName.includes(term) || client.email.toLowerCase().includes(term);
    });
  }

  filterExternalClients(searchTerm: string) {
    console.log('Filtering external clients with term:', searchTerm);
    console.log('Available external clients:', this.externalClients);
    
    // Limpiar cliente seleccionado si el usuario está escribiendo manualmente
    if (searchTerm && searchTerm.trim() !== '' && this.selectedExternalClientId) {
      // Verificar si el texto coincide exactamente con el cliente seleccionado
      const selectedClient = this.externalClients.find(c => c.id === this.selectedExternalClientId);
      if (selectedClient) {
        const expectedText = `${selectedClient.name} ${selectedClient.lastName} (${selectedClient.email})`;
        if (searchTerm !== expectedText) {
          // El usuario está escribiendo algo diferente, limpiar la selección
          this.selectedExternalClientId = null;
          console.log('Cleared external client selection due to manual typing');
        }
      }
    }
    
    if (!searchTerm || searchTerm.trim() === '') {
      // Si no hay término de búsqueda, mostrar 5 clientes al azar
      this.filteredExternalClients = this.getRandomClients(this.externalClients, 5);
      console.log('No search term, showing random clients:', this.filteredExternalClients);
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredExternalClients = this.externalClients.filter(client => {
      const fullName = `${client.name} ${client.lastName}`.toLowerCase();
      const nameMatch = fullName.includes(term);
      const emailMatch = client.email.toLowerCase().includes(term);
      
      console.log(`Checking client ${fullName} (${client.email}):`, 
        `nameMatch: ${nameMatch}, emailMatch: ${emailMatch}`);
      
      return nameMatch || emailMatch;
    });
    
    console.log('Filtered external clients:', this.filteredExternalClients);
  }

  getRandomClients(clients: ClientGeneric[], count: number): ClientGeneric[] {
    if (!clients || clients.length === 0) return [];
    if (clients.length <= count) return [...clients];
    
    const shuffled = [...clients].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  selectInternalClient(client: ClientGeneric) {
    this.internalAppointmentForm.patchValue({
      clientId: `${client.name} ${client.lastName} (${client.email})`
    });
    // Guardar el ID del cliente seleccionado en una propiedad separada
    this.selectedInternalClientId = client.id;
    this.filteredInternalClients = []; // Ocultar lista después de seleccionar
    this.internalSearchFocused = false; // Ocultar dropdown
  }

  selectExternalClient(client: ClientGeneric) {
    this.externalAppointmentForm.patchValue({
      externalClientId: `${client.name} ${client.lastName} (${client.email})`
    });
    // Guardar el ID del cliente seleccionado en una propiedad separada
    this.selectedExternalClientId = client.id;
    this.filteredExternalClients = []; // Ocultar lista después de seleccionar
    this.externalSearchFocused = false; // Ocultar dropdown
  }

  // Método para mostrar sugerencias al hacer focus en el input
  onFocusInternalSearch() {
    this.internalSearchFocused = true;
    const currentValue = this.internalAppointmentForm.get('clientId')?.value;
    
    if (!currentValue) {
      // Si el campo está vacío, limpiar cualquier selección previa
      this.selectedInternalClientId = null;
      this.filteredInternalClients = this.getRandomClients(this.internalClients, 5);
    }
  }

  onFocusExternalSearch() {
    this.externalSearchFocused = true;
    const currentValue = this.externalAppointmentForm.get('externalClientId')?.value;
    
    console.log('Focus on external search');
    console.log('Current external form value:', currentValue);
    console.log('Available external clients:', this.externalClients.length);
    
    if (!currentValue) {
      // Si el campo está vacío, limpiar cualquier selección previa
      this.selectedExternalClientId = null;
      this.filteredExternalClients = this.getRandomClients(this.externalClients, 5);
      console.log('Showing random external clients on focus:', this.filteredExternalClients);
    }
  }

  // Método para ocultar sugerencias al perder focus (con delay para permitir clicks)
  onBlurInternalSearch() {
    setTimeout(() => {
      this.internalSearchFocused = false;
      this.filteredInternalClients = [];
    }, 200);
  }

  onBlurExternalSearch() {
    setTimeout(() => {
      this.externalSearchFocused = false;
      this.filteredExternalClients = [];
    }, 200);
  }

  async loadTimeSlotsForDate(date: string) {
    try {
      this.loadingTimeSlots = true;
      this.availableTimeSlots = [];
      this.selectedTimeSlot = null;

      const professionalId = this.userContextService.getCurrentProfessionalId();
      if (!professionalId) {
        console.error('No professional ID found');
        return;
      }

      const timeSlots = await firstValueFrom(
        this.timeSlotsService.getAvailableTimeSlots(professionalId, date)
      );

      this.availableTimeSlots = Array.isArray(timeSlots) ? timeSlots : [];
      console.log('Time slots loaded for date', date, ':', this.availableTimeSlots.length);

    } catch (error) {
      console.error('Error loading time slots:', error);
      this.availableTimeSlots = [];
    } finally {
      this.loadingTimeSlots = false;
    }
  }

  selectTimeSlot(timeSlot: TimeSlot) {
    this.selectedTimeSlot = timeSlot;
    
    // Actualizar el formulario correspondiente según el tipo de appointment
    if (this.appointmentType === 'internal') {
      this.internalAppointmentForm.patchValue({
        timeSlot: timeSlot.id
      });
    } else {
      this.externalAppointmentForm.patchValue({
        timeSlot: timeSlot.id
      });
    }
    
    console.log('Time slot selected:', timeSlot);
  }

  formatTimeSlot(timeSlot: TimeSlot): string {
    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  }

  calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  // Función para formatear fecha + timeSlot a DateTime de .NET (ISO 8601)
  formatDateTimeForDotNet(dateString: string, timeSlot: TimeSlot): string {
    if (!dateString || !timeSlot) return '';
    
    console.log('Formatting date time with:', { dateString, timeSlot });
    
    try {
      // Asegurar que startTime tenga el formato correcto HH:mm
      let timeString = timeSlot.startTime;
      
      // Si el tiempo no incluye segundos, agregarlos
      if (timeString && timeString.split(':').length === 2) {
        timeString = `${timeString}:00`;
      }
      
      // Combinar fecha (YYYY-MM-DD) con la hora del time slot (HH:mm:ss)
      const dateTime = `${dateString}T${timeString}`;
      
      console.log('Combined dateTime string:', dateTime);
      
      // Crear objeto Date y formatear manualmente para evitar conversión de zona horaria
      const date = new Date(dateTime);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('Invalid date created:', dateTime);
        throw new Error(`Invalid date format: ${dateTime}`);
      }
      
      // Formatear manualmente para mantener la hora local (sin conversión UTC)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      // Formato ISO pero sin conversión UTC
      const localISOString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      
      console.log('Local ISO string (no UTC conversion):', localISOString);
      
      return localISOString;
    } catch (error) {
      console.error('Error formatting date time:', error);
      console.error('Input values:', { dateString, timeSlot });
      throw error;
    }
  }

  // Método para mostrar mensajes de error
  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    
    // Ocultar el error después de 5 segundos
    setTimeout(() => {
      this.showError = false;
      this.errorMessage = '';
    }, 5000);
  }

  // Método para validar formulario interno
  validateInternalForm(): boolean {
    if (!this.selectedInternalClientId) {
      this.showErrorMessage('Please select a client');
      return false;
    }
    
    if (!this.internalAppointmentForm.get('date')?.value) {
      this.showErrorMessage('Please select an appointment date');
      return false;
    }
    
    if (!this.selectedTimeSlot) {
      this.showErrorMessage('Please select a time slot');
      return false;
    }
    
    return true;
  }

  // Método para validar formulario externo
  validateExternalForm(): boolean {
    if (!this.externalAppointmentForm.get('date')?.value) {
      this.showErrorMessage('Please select an appointment date');
      return false;
    }
    
    if (!this.selectedTimeSlot) {
      this.showErrorMessage('Please select a time slot');
      return false;
    }
    
    if (this.createNewClient) {
      if (!this.newClientForm.valid) {
        if (!this.newClientForm.get('name')?.value) {
          this.showErrorMessage('Client name is required');
          return false;
        }
        if (!this.newClientForm.get('lastName')?.value) {
          this.showErrorMessage('Client last name is required');
          return false;
        }
        if (!this.newClientForm.get('email')?.value) {
          this.showErrorMessage('Client email is required');
          return false;
        }
        if (!this.newClientForm.get('phone')?.value) {
          this.showErrorMessage('Client phone is required');
          return false;
        }
        this.showErrorMessage('Please fill in all required client information');
        return false;
      }
    } else {
      if (!this.selectedExternalClientId) {
        this.showErrorMessage('Please select an existing client');
        return false;
      }
    }
    
    return true;
  }

  async onSubmitExternalAppointment() {
    console.log('Submitting external appointment with createNewClient:', this.createNewClient);
    console.log('External appointment form values:', this.externalAppointmentForm.value);
    console.log('Selected time slot:', this.selectedTimeSlot);
    
    // Validar formulario
    if (!this.validateExternalForm()) {
      return;
    }
    
    if (this.createNewClient) {
      // Caso 1: Crear cliente nuevo + appointment
      await this.createClientAndAppointment();
    } else {
      console.log('Creating appointment with existing external client'
        + this.externalAppointmentForm.value.externalClientId
      );
      
      await this.createAppointmentWithExistingExternalClient();
    }
  }

  async createClientAndAppointment() {
    try {
      // Validar formularios - la validación ya se hizo en onSubmitExternalAppointment
      const professionalId = this.userContextService.getCurrentProfessionalId();
      if (!professionalId) {
        this.showErrorMessage('Professional ID not found. Please log in again.');
        return;
      }

      const clientData: CreateExternalClient = {
        name: this.newClientForm.value.name,
        lastName: this.newClientForm.value.lastName,
        email: this.newClientForm.value.email,
        phone: this.newClientForm.value.phone,
        createdByProfessionalId: professionalId
      };

      const createdClient: CreateExternalClientResponse = await firstValueFrom(
        this.externalClientService.createExternalClient(clientData)
      );

      // Crear el appointment con el ID del cliente creado y el time slot seleccionado
      const appointmentData: CreateExternalAppointment = {
        externalClientId: createdClient.id,
        professionalId: professionalId,
        date: this.formatDateTimeForDotNet(this.externalAppointmentForm.value.date, this.selectedTimeSlot!),
        timeSlotId: this.selectedTimeSlot!.id,
        reason: this.externalAppointmentForm.value.notes,
        durationMinutes: this.calculateDuration(this.selectedTimeSlot!.startTime, this.selectedTimeSlot!.endTime)
      };

      await firstValueFrom(
        this.externalAppointmentService.createExternalAppointment(appointmentData)
      );

      console.log('Cliente y appointment creados exitosamente');
      this.dialogRef.close({ success: true, type: 'external-new-client' });

    } catch (error: any) {
      console.error('Error creating client and appointment:', error);
      const errorMsg = error?.error?.message || error?.message || 'Error creating appointment. Please try again.';
      this.showErrorMessage(errorMsg);
    }
  }

  async createAppointmentWithExistingExternalClient() {
    try {
      const professionalId = this.userContextService.getCurrentProfessionalId();
      if (!professionalId) {
        this.showErrorMessage('Professional ID not found. Please log in again.');
        return;
      }

      console.log('Creating appointment with data:', {
        date: this.externalAppointmentForm.value.date,
        selectedTimeSlot: this.selectedTimeSlot,
        externalClientId: this.selectedExternalClientId
      });

      const appointmentData: CreateExternalAppointment = {
        externalClientId: this.selectedExternalClientId!,
        professionalId: professionalId,
        date: this.formatDateTimeForDotNet(this.externalAppointmentForm.value.date, this.selectedTimeSlot!),
        timeSlotId: this.selectedTimeSlot!.id,
        reason: this.externalAppointmentForm.value.notes,
        durationMinutes: this.calculateDuration(this.selectedTimeSlot!.startTime, this.selectedTimeSlot!.endTime)
      };

      await firstValueFrom(
        this.externalAppointmentService.createExternalAppointment(appointmentData)
      );

      console.log('Appointment con cliente existente creado exitosamente');
      this.dialogRef.close({ success: true, type: 'external-existing-client' });

    } catch (error: any) {
      console.error('Error creating appointment with existing client:', error);
      const errorMsg = error?.error?.message || error?.message || 'Error creating appointment. Please try again.';
      this.showErrorMessage(errorMsg);
    }
  }

  async onSubmitInternalAppointment() {
    try {
      // Validar formulario
      if (!this.validateInternalForm()) {
        return;
      }

      const professionalId = this.userContextService.getCurrentProfessionalId();
      if (!professionalId) {
        this.showErrorMessage('Professional ID not found. Please log in again.');
        return;
      }

      const appointmentData: CreateInternalAppointment = {
        clientId: this.selectedInternalClientId!,
        professionalId: professionalId,
        date: this.formatDateTimeForDotNet(this.internalAppointmentForm.value.date, this.selectedTimeSlot!),
        timeSlotId: this.selectedTimeSlot!.id,
        reason: this.internalAppointmentForm.value.notes,
        durationMinutes: this.calculateDuration(this.selectedTimeSlot!.startTime, this.selectedTimeSlot!.endTime)
      };

      await firstValueFrom(
        this.internalAppointmentService.createInternalAppointment(appointmentData)
      );

      console.log('Internal appointment creado exitosamente');
      this.dialogRef.close({ success: true, type: 'internal' });

    } catch (error: any) {
      console.error('Error creating internal appointment:', error);
      const errorMsg = error?.error?.message || error?.message || 'Error creating appointment. Please try again.';
      this.showErrorMessage(errorMsg);
    }
  }

}
