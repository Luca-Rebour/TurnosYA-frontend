import { availabilitySlot } from "./availabilitySlot.model";

export interface professional{
    id: string;
    name: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: Date;
    availability: availabilitySlot[];
}