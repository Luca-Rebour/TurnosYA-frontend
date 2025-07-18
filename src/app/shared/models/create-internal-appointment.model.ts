export interface CreateInternalAppointment {
    clientId: string;
    professionalId: string;
    date: string; // DateTime en formato ISO string compatible con .NET
    durationMinutes: number;
    reason: string | null;
    timeSlotId?: string; // ID del time slot seleccionado (opcional)
}
