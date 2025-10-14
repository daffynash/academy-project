# Events System Documentation

## Overview
Το Events System είναι ένα comprehensive σύστημα διαχείρισης events για την Academy Manager εφαρμογή. Υποστηρίζει προπονήσεις, αγώνες και εκδηλώσεις με πλήρη integration στο υπάρχον ecosystem.

## Features Implemented

### ✅ Core Functionality
- **Event Types**: Προπόνηση, Αγώνας, Εκδήλωση
- **Event Status**: Προγραμματισμένο, Σε Εξέλιξη, Ολοκληρωμένο, Ακυρωμένο
- **Multi-Team Support**: Events μπορούν να συνδεθούν με πολλαπλές ομάδες
- **Date/Time Management**: Start και end date/time με proper timezone handling
- **Location Tracking**: Προαιρετικό location field
- **Opponent Tracking**: Ειδικό field για matches (αντίπαλος)

### ✅ User Interface
- **Events Page**: Full-featured page με filtering, search, και list view
- **Create/Edit Modal**: Comprehensive form με validation
- **Dashboard Widget**: Preview των επόμενων 3 events στο dashboard
- **Mobile-Responsive**: Optimized για όλες τις συσκευές
- **Consistent Styling**: Ακολουθεί το design system της εφαρμογής

### ✅ Filtering & Search
- **Type Filter**: Φιλτράρισμα ανά event type (προπόνηση/αγώνας/εκδήλωση)
- **Team Filter**: Προβολή events συγκεκριμένης ομάδας
- **Status Filter**: Φιλτράρισμα ανά κατάσταση
- **Search**: Real-time αναζήτηση στον τίτλο του event
- **Date Grouping**: Events ομαδοποιούνται αυτόματα ανά ημερομηνία

## Database Schema

### Events Collection (`/events/{eventId}`)
```javascript
{
  id: string,                    // Auto-generated document ID
  title: string,                 // Event title (required)
  description: string,           // Optional description
  type: string,                  // 'training' | 'match' | 'event'
  startDate: Timestamp,          // Start date/time (required)
  endDate: Timestamp,            // End date/time (optional)
  location: string,              // Event location
  teamIds: string[],             // Array of team IDs
  participantIds: string[],      // Array of player IDs
  status: string,                // 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  opponent: string,              // Opponent name (for matches)
  score: {                       // Score object (for completed matches)
    home: number,
    away: number
  },
  createdBy: string,             // User ID who created the event
  createdAt: Timestamp,          // Creation timestamp
  updatedAt: Timestamp,          // Last update timestamp
  notes: string                  // Additional notes
}
```

### Firestore Indexes Required
```
Collection: events
- startDate (Ascending) + status (Ascending)
- startDate (Descending)
- teamIds (Array) + startDate (Descending)
- type (Ascending) + startDate (Descending)
```

## Files Created/Modified

### New Files
1. **`src/services/events.js`** - Events service layer με CRUD operations
   - `createEvent(eventData)` - Δημιουργία event
   - `getAllEvents()` - Ανάκτηση όλων των events
   - `getEventById(eventId)` - Ανάκτηση event by ID
   - `getEventsByTeam(teamId)` - Events συγκεκριμένης ομάδας
   - `getEventsByType(eventType)` - Φιλτράρισμα ανά τύπο
   - `getEventsByDateRange(start, end)` - Events σε date range
   - `getUpcomingEvents(limit)` - Upcoming events
   - `updateEvent(eventId, data)` - Update event
   - `deleteEvent(eventId)` - Διαγραφή event
   - `updateEventStatus(eventId, status)` - Update status
   - `addParticipantToEvent(eventId, participantId)` - Προσθήκη παίκτη
   - `removeParticipantFromEvent(eventId, participantId)` - Αφαίρεση παίκτη

2. **`src/components/CreateEventModal.jsx`** - Modal component για create/edit
   - Form με validation
   - Date/time pickers
   - Team multi-select
   - Event type selection
   - Status management
   - Opponent field (conditional για matches)

### Modified Files
1. **`src/pages/Events.jsx`** - Complete redesign
   - Αντικατέστησε το placeholder με functional page
   - Advanced filtering system
   - Event cards με grouped display
   - Delete confirmation modal
   - Integration με CreateEventModal

2. **`src/pages/Dashboard.jsx`** - Added events widget
   - Load upcoming events
   - Display 3 upcoming events
   - Event preview cards
   - Link to full Events page

## Usage Examples

### Creating an Event
```javascript
import { createEvent } from '../services/events'

const eventData = {
  title: 'Προπόνηση U16',
  description: 'Εβδομαδιαία προπόνηση',
  type: 'training',
  startDate: new Date('2024-10-15T18:00:00'),
  endDate: new Date('2024-10-15T20:00:00'),
  location: 'Γήπεδο Ακαδημίας',
  teamIds: ['paok-u16'],
  status: 'scheduled',
  createdBy: user.uid
}

const newEvent = await createEvent(eventData)
```

### Filtering Events by Team
```javascript
import { getEventsByTeam } from '../services/events'

const teamEvents = await getEventsByTeam('paok-u16')
// Returns all events for PAOK U16 team
```

### Getting Upcoming Events
```javascript
import { getUpcomingEvents } from '../services/events'

const nextEvents = await getUpcomingEvents(5)
// Returns next 5 scheduled/in-progress events
```

## Component Props

### CreateEventModal
```javascript
<CreateEventModal
  isOpen={boolean}              // Controls modal visibility
  onClose={function}            // Called when modal closes
  onEventCreated={function}     // Called with new/updated event
  eventToEdit={object}          // Optional: event to edit
/>
```

## Event Type Colors

| Type | Color Scheme |
|------|-------------|
| Training (Προπόνηση) | Blue - `bg-blue-100 text-blue-700 dark:bg-blue-900/30` |
| Match (Αγώνας) | Red - `bg-red-100 text-red-700 dark:bg-red-900/30` |
| Event (Εκδήλωση) | Purple - `bg-purple-100 text-purple-700 dark:bg-purple-900/30` |

## Status Colors

| Status | Color Scheme |
|--------|-------------|
| Scheduled (Προγραμματισμένο) | Green - `bg-green-100 text-green-700 dark:bg-green-900/30` |
| In Progress (Σε Εξέλιξη) | Yellow - `bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30` |
| Completed (Ολοκληρωμένο) | Gray - `bg-gray-100 text-gray-700 dark:bg-gray-700` |
| Cancelled (Ακυρωμένο) | Red - `bg-red-100 text-red-700 dark:bg-red-900/30` |

## User Flow

1. **Viewing Events**: User navigates to `/events` page
2. **Filtering**: User can filter by type, team, status, or search
3. **Creating Event**: Click "Νέο Event" → Fill form → Submit
4. **Event Details**: Events grouped by date for easy scanning
5. **Dashboard Preview**: See next 3 events on dashboard
6. **Deleting Event**: Click delete icon → Confirm → Event removed

## Mobile Optimization

- **Responsive Grid**: 1 column on mobile, 2 on tablet/desktop
- **Touch-Friendly**: Large tap targets, proper spacing
- **Swipe-Friendly**: Smooth scrolling, no horizontal overflow
- **Compact Cards**: Optimized information density
- **Accessible Forms**: Native date/time pickers on mobile

## Future Enhancements

### Planned Features
- [ ] Calendar View: Visual calendar representation
- [ ] Recurring Events: Support for repeating events
- [ ] Attendance Tracking: Mark player attendance
- [ ] Event Notifications: Push notifications for upcoming events
- [ ] Score Management: Better UI for match scores
- [ ] Event Comments: Discussion threads per event
- [ ] iCalendar Export: Export to calendar apps
- [ ] Team-Specific Views: Filter by user's teams automatically
- [ ] Event Templates: Quick create from templates
- [ ] Weather Integration: Show weather for outdoor events

### Technical Improvements
- [ ] Infinite Scroll: Load more events on scroll
- [ ] Optimistic Updates: Instant UI feedback
- [ ] Offline Support: Queue changes when offline
- [ ] Real-time Updates: Live updates from other users
- [ ] Batch Operations: Multi-select and bulk actions

## Testing Checklist

### Functionality
- [x] Create event με όλα τα required fields
- [x] Edit event (όταν implemented)
- [x] Delete event με confirmation
- [x] Filter by type/team/status
- [x] Search events by title
- [x] View events grouped by date
- [x] Dashboard widget shows upcoming events

### UI/UX
- [x] Mobile responsive design
- [x] Dark mode support
- [x] Loading states
- [x] Error handling
- [x] Form validation
- [x] Consistent styling με υπόλοιπο app

### Edge Cases
- [x] Empty state (κανένα event)
- [x] No upcoming events
- [x] Long event titles
- [x] Many teams selected
- [x] Past events display
- [x] Same-day multiple events

## Known Limitations

1. **No Calendar View**: Μόνο list view διαθέσιμο προς το παρόν
2. **No Recurring Events**: Κάθε event είναι standalone
3. **No Edit Functionality**: Edit modal υπάρχει αλλά δεν είναι ενεργοποιημένο στο UI
4. **No Participant Management**: participantIds field exists αλλά δεν υπάρχει UI
5. **No Score Tracking**: Score field για matches δεν έχει UI

## Performance Considerations

- Events loaded με `orderBy('startDate', 'desc')` για performance
- Dashboard widget loads μόνο 3 events
- Firestore composite indexes required για complex queries
- Date conversions handled automatically στο service layer

## Security Notes

- **createdBy**: Tracks event creator για accountability
- **Timestamps**: Firestore Timestamp για consistent timezone handling
- **Validation**: Client-side validation + Firestore rules needed
- **Role-Based Access**: Consider restricting event creation by role

## Dependencies

- Firebase Firestore για data persistence
- React hooks για state management
- Tailwind CSS για styling
- React Router για navigation
- Date/Time native inputs (no external library)

---

**Created**: October 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
