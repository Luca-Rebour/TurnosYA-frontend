import { appointment } from './appointment.model';
import { customer } from './customer.model';
import { professional } from './professional.model';

export interface activity {
  id: string;
  appointmentId: string;
  customerId: string;
  professionalId: string;
  type: string;
  description: string;
  createdAt: Date;
  appointment?: appointment;
  customer?: customer;
  professional?: professional;
}
