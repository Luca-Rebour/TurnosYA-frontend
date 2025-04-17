export interface appointment {
    id: string;
    date: Date;
    durationMinutes: number;
    status: string;
    cancelledBy?: string;
    customer: customerShort;
    professional: professionalShort;
}

export interface customerShort {
    name: string;
    lastName: string;
    phone: string;
}

export interface professionalShort {
    name: string;
    lastName: string;
    phone: string;
}