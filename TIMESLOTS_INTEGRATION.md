# Time Slots Integration Guide

## Overview
This document explains how to integrate the time slots functionality with your backend API.

## Backend API Requirements

### 1. Get Available Time Slots Endpoint

**Endpoint:** `GET /api/professionals/{professionalId}/available-slots`

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `duration` (optional): Duration in minutes (default: 30)

**Example Request:**
```
GET /api/professionals/123/available-slots?date=2025-07-20&duration=30
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "slot_001",
      "dateTime": "2025-07-20T09:00:00Z",
      "duration": 30,
      "available": true
    },
    {
      "id": "slot_002", 
      "dateTime": "2025-07-20T09:30:00Z",
      "duration": 30,
      "available": true
    }
  ]
}
```

### 2. Reserve Time Slot Endpoint

**Endpoint:** `POST /api/professionals/{professionalId}/reserve-slot`

**Request Body:**
```json
{
  "slotId": "slot_001",
  "clientId": "client_123", // for internal clients
  "externalClientId": "ext_client_456", // for external clients
  "reason": "Regular checkup" // optional
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "appointmentId": "apt_789",
    "reservationId": "res_012",
    "status": "confirmed"
  }
}
```

## Frontend Integration Steps

### 1. Update ProfessionalService

Add the following method to your `ProfessionalService`:

```typescript
getAvailableTimeSlots(professionalId: string, date: string): Observable<TimeSlot[]> {
  return this.http.get<ApiResponse<TimeSlot[]>>(
    `${this.apiUrl}/professionals/${professionalId}/available-slots`,
    { params: { date } }
  ).pipe(
    map(response => response.data)
  );
}
```

### 2. Update Appointment Services

Update your appointment creation services to handle time slot reservations:

```typescript
// In ExternalAppointmentService
createExternalAppointment(payload: CreateExternalAppointment): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/professionals/${payload.professionalId}/reserve-slot`,
    {
      slotId: payload.slotId,
      externalClientId: payload.externalClientId,
      reason: payload.reason
    }
  );
}

// In InternalAppointmentService  
createInternalAppointment(payload: CreateInternalAppointment): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/professionals/${payload.professionalId}/reserve-slot`,
    {
      slotId: payload.slotId,
      clientId: payload.clientId,
      reason: payload.reason
    }
  );
}
```

### 3. Update Models

Create or update the following models:

```typescript
// time-slot.model.ts
export interface TimeSlot {
  id: string;
  dateTime: string;
  duration: number;
  available: boolean;
  professionalId?: string;
}

// Update appointment models to include slotId
export interface CreateExternalAppointment {
  professionalId: string;
  slotId: string; // Add this field
  externalClientId: string;
  reason?: string;
}

export interface CreateInternalAppointment {
  professionalId: string;
  slotId: string; // Add this field
  clientId: string;
  reason?: string;
}
```

### 4. Remove Mock Service

Once your backend is ready:

1. Remove the `TimeSlotsService` from `core/services/time-slots.service.ts`
2. Update the component to use `ProfessionalService.getAvailableTimeSlots()`
3. Update the appointment payload to include `slotId` instead of `date`

## Testing

### 1. Test Available Slots
- Select different dates and verify slots are loaded
- Test with dates that have no available slots
- Test with past dates (should show no slots)

### 2. Test Slot Selection
- Select different time slots
- Verify only one slot can be selected at a time
- Test form validation with and without slot selection

### 3. Test Appointment Creation
- Create appointments with selected time slots
- Verify the correct slot ID is sent to backend
- Test error handling for slot conflicts

## Error Handling

The system handles the following error cases:
- No available slots for selected date
- Network errors when loading slots
- Slot conflicts (slot becomes unavailable)
- Invalid slot selections

## Notes

- All times are handled in ISO format for consistency
- The system prevents selection of past time slots
- Loading states are shown while fetching slots
- Error messages are displayed to users for better UX
