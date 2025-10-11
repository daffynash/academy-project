# Project Spec — Academy Manager (σύντομο)

## UI/UX Guidelines & Visual Rules

### Οπτικοί Κανόνες (Πάντα να τηρούνται)
- **Responsivity**: Όλα τα UI components πρέπει να φαίνονται σωστά σε:
  - Desktop (μεγάλες οθόνες)
  - Tablet (μεσαίες οθόνες) 
  - Mobile (μικρές οθόνες)
- **Dark Mode Support**: Πλήρης υποστήριξη dark theme με:
  - Κατάλληλα χρώματα που λειτουργούν σε dark backgrounds
  - Proper contrast ratios για accessibility
  - Text που είναι ευανάγνωστο σε dark themes
- **Tailwind Responsive Design**: Χρήση Tailwind responsive classes (sm:, md:, lg:, xl:)
- **Dark Mode Classes**: Χρήση Tailwind dark: prefix για dark mode styling

## Σκοπός
- Εφαρμογή για ακαδημίες ποδοσφαίρου για τη διαχείριση παικτών, προπονήσεων και αγώνων.
- Χρήστες: Administrators (προπονητές, υπεύθυνος ακαδημίας / super-admin) και Parents (γονείς — regular users).

Κύριοι ρόλοι & δικαιώματα
- Super Admin: πλήρη δικαιώματα, δημιουργεί άλλους admin, διαχειρίζεται ομάδες και ρυθμίσεις ακαδημίας.
- Coach (Admin): πρόσβαση μόνο στις ομάδες/τμήματα που του έχουν ανατεθεί (π.χ. Κ8-Α). Μπορεί να:
  - Προσθέτει/επεξεργάζεται/αφαιρεί παίκτες στο τμήμα του.
  - Δημιουργεί/τροποποιεί προπονήσεις και αγώνες (ημερομηνία, ώρα, τοποθεσία).
  - Ανακοινώνει ποιοι παίκτες θα παίξουν/προπονηθούν.
- Parent (User): βλέπει το παιδί(ά) του/τους, απαντάει "παρών/απουσία" σε προπόνηση ή αγώνα.

Βασικά features (MVP)
1. Authentication (basic): login/register για Parents, login για Admins (MVP: email + password).
2. Ομαδοποίηση: μοντέλο Team/Section (π.χ. Κ8-Α). Κάθε Coach έχει ένα ή περισσότερα Teams.
3. Players: CRUD για παίκτες (όνομα, έτος γέννησης ή ηλικιακή ομάδα, σημειώσεις, parentId link).
4. Events: CRUD για events τύπου "Training" ή "Match" (date, time, location, team, roster).
5. Attendance: Parents μπορούν να δηλώσουν συμμετοχή (Yes/No/Maybe) για κάθε event του παιδιού τους.
6. Authorization: Coaches βλέπουν/διαχειρίζονται μόνο τα teams τους.

Προτεινόμενο data model (ελάχιστο)
- User { id, name, email, passwordHash, role: ['parent','coach','superadmin'], teamIds: [] }
- Team { id, name, coachId }
- Player { id, name, birthYear, teamId, parentId }
- Event { id, teamId, type: 'training'|'match', title, date, time, location, createdBy }
- Attendance { id, eventId, playerId, status: 'yes'|'no'|'maybe', answeredAt }

API - ενδεικτικά endpoints (REST)
- POST /auth/login  -> { email, password } => token
- GET /teams (coach sees μόνο δικά του)
- GET /teams/:id/players
- POST /players
- GET /events?teamId=...
- POST /events
- POST /events/:id/attendance  { playerId, status }

Interface & Pages (frontend)
- /login
- /dashboard (coach view): upcoming events, team roster, quick attendance summary
- /teams/:id (team page): players list, add player
- /events/:id (event page): details, attendance controls
- /profile (parent): linked children, RSVP management

Μηχανισμοί και τεχνολογικές αποφάσεις
- Frontend: React + Vite (παρόν project) + Tailwind CSS (ήδη εγκατεστημένο) + react-router για routing.
- State: αρχικά React Context για auth + simple data fetching; αν χρειαστεί complex state, Redux/RTK.
- Backend: αρχικά mock API (in-memory / JSON file) για MVP. Επιλογή για REST API σε Node/Express ή Firebase/Firestore για ταχύτερο PoC.
- Επιλογή του χρήστη: Firebase Firestore (C) + JavaScript για το frontend.
- Persistence: για offline-friendly λειτουργία, PWA + local cache (IndexedDB) — optional σε επόμενη φάση.
- Auth: JWT-based auth (server) ή Firebase Auth για ταχύτερο integration.

Acceptance Criteria (MVP)
- Coach μπορεί να κάνει login και να δει μόνο τις ομάδες του.
- Coach μπορεί να δημιουργήσει ένα event και να ορίσει ημερομηνία/ώρα/τοποθεσία.
- Parent μπορεί να login και να δηλώσει "παρών/απουσία" για το παιδί του σε ένα event.
- Οι αλλαγές αποθηκεύονται σε mock backend και ανακτώνται σωστά στο UI.

Edge cases / Σημεία προσοχής
- Multi-parent players (ένα παιδί με δύο γονείς): support multiple parentIds ή separate user accounts linked στο ίδιο player.
- Timezones: events πρέπει να αποθηκεύονται με ISO timestamps.
- Authorization: ασφαλής server-side checks απαραίτητοι (coaches δεν μπορούν να τροποποιήσουν άλλες ομάδες).

MVP scope & Priorities
- Πρώτο deliverable (MVP): Authentication, Team listing, Player CRUD, Event create/list, Parent RSVP flow.
- Μετά (Phase 2): Notifications (email/push), offline sync (PWA), multi-team coaches, analytics.

Προτεινόμενα αμέσως επόμενα βήματα που μπορώ να κάνω τώρα
1. Δημιουργώ `docs/PROJECT_SPEC.md` (έγινε).
2. Scaffold frontend routes + minimal mock API (file `src/mock/api.js`) και basic auth flow.
3. Implement MVP vertical slice: coach creates event + parent RSVPs (UI + mock persistence).

Αν συμφωνείς, ξεκινάω αμέσως το step 2 (scaffold + mock API) — πες μου αν προτιμάς να χρησιμοποιήσω:
- Local mock server (Express) ή
- In-app mock (mock functions + localStorage) ή
- Firebase Firestore (πιο δοκιμασμένο backend out-of-the-box)

Επίσης πες αν θέλεις TypeScript ή να συνεχίσουμε με JavaScript.