# DateTime Format Configuration

## Overview
This document explains how to configure the DateTime format for .NET backend compatibility.

## Current Implementation

The appointment creation system now correctly formats dates for .NET DateTime compatibility:

### Date Format Options

1. **ISO Format (Default)**: `"2025-07-18T14:30:00.000Z"`
   - Includes timezone information (UTC)
   - Recommended for most .NET applications
   - Automatically handles timezone conversions

2. **Local Format**: `"2025-07-18T14:30:00"`
   - No timezone information
   - Use if your backend expects local time
   - Requires careful timezone handling

### Configuration

In `dialog-new-appointment-professional.component.ts`, line ~502:

```typescript
// Configuration: Change to true if your backend needs local format
private readonly USE_LOCAL_DATETIME = false;
```

Set to `true` if your .NET backend expects local DateTime format without timezone.

## How It Works

### Date Combination Process
1. User selects a date: `"2025-07-18"`
2. User selects a time slot with startTime: `"14:30"`
3. System combines them into full DateTime
4. Formats according to `USE_LOCAL_DATETIME` setting

### Format Examples

**Input:**
- Date: `"2025-07-18"`
- Time Slot startTime: `"14:30"`

**Output:**
- ISO Format: `"2025-07-18T14:30:00.000Z"`
- Local Format: `"2025-07-18T14:30:00"`

## .NET Backend Compatibility

### Most Common .NET DateTime Formats Supported:
- `DateTime.Parse()` - Handles both formats
- `DateTime.ParseExact()` - May need specific format
- `JsonConverter` - Usually handles ISO format automatically

### Recommended .NET Controller Example:

```csharp
[HttpPost]
public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
{
    // Both formats work with DateTime.Parse
    var appointmentDateTime = DateTime.Parse(request.Date);
    
    // Or use DateTimeOffset for timezone-aware handling
    var appointmentDateTimeOffset = DateTimeOffset.Parse(request.Date);
    
    // Your appointment creation logic here
}
```

## Testing

### To verify the format is working:

1. Check browser console logs when creating appointment
2. Look for these log messages:
   ```
   Selected date: 2025-07-18
   Selected time slot start time: 14:30
   Combined appointment DateTime: 2025-07-18T14:30:00.000Z
   Creating appointment with payload: {...}
   ```

3. Verify the `date` field in the payload matches your backend expectations

## Troubleshooting

### Common Issues:

1. **Backend receives null/invalid DateTime:**
   - Check `USE_LOCAL_DATETIME` setting
   - Verify your .NET model accepts the format
   - Check timezone handling in your backend

2. **Timezone Issues:**
   - Use ISO format (`USE_LOCAL_DATETIME = false`)
   - Consider using `DateTimeOffset` in .NET
   - Ensure consistent timezone handling

3. **Parse Errors in .NET:**
   - Add culture-specific parsing: `DateTime.Parse(date, CultureInfo.InvariantCulture)`
   - Use `DateTime.TryParse()` for better error handling

### Debug Steps:

1. Enable detailed logging in frontend
2. Check network requests in browser dev tools
3. Log incoming requests in .NET backend
4. Verify DateTime parsing in .NET debugger

## Advanced Configuration

### Custom Format Function:
If you need a specific format, modify the `createAppointmentDateTime` method:

```typescript
private createAppointmentDateTime(date: string, startTime: string): string {
  const selectedDate = new Date(date);
  const [hours, minutes] = startTime.split(':').map(Number);
  
  selectedDate.setHours(hours, minutes, 0, 0);
  
  // Custom format for your specific backend needs
  return selectedDate.toISOString().replace('Z', ''); // Remove Z for some backends
}
```

## Migration from Old Format

If migrating from the old time picker system:

1. **Old format** sent separate `date` and `time` fields
2. **New format** sends combined `date` field with full DateTime
3. **Backend changes** may be needed to handle the new format

Update your .NET models accordingly:

```csharp
// Old model
public class OldAppointmentRequest 
{
    public string Date { get; set; }  // "2025-07-18"
    public string Time { get; set; }  // "14:30"
}

// New model
public class NewAppointmentRequest 
{
    public DateTime Date { get; set; }  // "2025-07-18T14:30:00.000Z"
    public string TimeSlotId { get; set; }  // "slot123"
}
```
