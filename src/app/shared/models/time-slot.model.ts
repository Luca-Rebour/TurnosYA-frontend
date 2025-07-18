export interface TimeSlot {
    id: string;
    dayOfWeek: number;
    startTime: string; 
    endTime: string;
    professionalId: string;
    professional?: any;
    slotStatus: number;
}