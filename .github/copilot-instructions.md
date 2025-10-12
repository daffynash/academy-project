# Copilot instructions for this repository

This is an **Academy Manager** React + Vite + Firebase app for sports academy management. The goal of these instructions is to help an AI coding assistant be productive quickly by pointing out the project's structure, important files, common workflows, and project-specific conventions.

Note: ο χρήστης προτιμά να επικοινωνούμε στα ελληνικά. Επιτρέπεται η χρήση τεχνικών όρων στα αγγλικά όπου είναι φυσικό.

## Project Type & Tech Stack
- **Frontend**: React 19 + Vite (ESM) + Tailwind CSS + react-router-dom
- **Backend**: Firebase Auth + Firestore  
- **Language**: JavaScript (not TypeScript), Greek UI language preferred
- **Theme**: Blue color system with dark mode support

## Quick Development Commands
- Dev server: `npm run dev` (HMR enabled)
- Build: `npm run build` 
- Lint: `npm run lint`

## Project Structure & Key Files
```
src/
├── contexts/
│   ├── AuthContext.jsx     # Enhanced auth with Firestore user data
│   └── useAuth.js         # Auth hook
├── services/
│   ├── auth.js           # Firebase Auth wrapper
│   ├── db.js             # Firestore CRUD operations  
│   └── firebase.js       # Firebase config
├── pages/
│   ├── Login.jsx         # Authentication
│   ├── Signup.jsx        # User registration  
│   ├── Dashboard.jsx     # Main dashboard
│   └── Teams.jsx         # Team management (CRUD)
├── components/
│   ├── CreateTeamModal.jsx    # Team creation with Greek validation
│   ├── ProtectedRoute.jsx     # Auth route guard
│   └── PublicRoute.jsx        # Public route guard
├── config/colors.js      # Color system definitions
└── styles/colors.css     # CSS custom properties
```

## Architecture & Patterns
- **State Management**: React Context for auth, simple state for data
- **Database**: Firestore with custom document IDs (normalized team names)
- **Authentication**: Firebase Auth + custom Firestore user documents
- **Routing**: Protected routes with role-based access
- **Styling**: Tailwind + CSS custom properties, mobile-first design

## Current Implementation Status
✅ **COMPLETED**: Authentication system, Team Management (CRUD), Dashboard  
🔄 **IN PROGRESS**: Player Management System  
📋 **PLANNED**: Language System (EN/GR), Event System, Role-based Auth

## UI/UX Guidelines (ALWAYS FOLLOW)
- **Responsivity**: All components work on desktop/tablet/mobile using Tailwind responsive classes (sm:, md:, lg:, xl:)
- **Dark Mode**: Full support using Tailwind `dark:` prefix with proper contrast ratios
- **Greek Language**: All user-facing text in Greek (placeholders, labels, messages)
- **Mobile-First**: Design for mobile first, enhance for larger screens
- **Blue Theme**: Use custom color system defined in `src/config/colors.js`

## Database Schema Patterns
- **Teams**: `/teams/{normalized-name}` - Uses Greek-to-Latin conversion for IDs
- **Users**: `/users/{uid}` - Enhanced with custom fields (name, role, teamIds)
- **Players**: `/players/{id}` - Multi-team support, optional user assignment

## Key Implementation Details
- **Greek Character Support**: `normalizeTeamName()` converts "ΠΑΟΚ U16" → "paok-u16"
- **AuthContext Enhancement**: Merges Firebase Auth with Firestore user documents
- **Mobile Optimization**: Fixed iOS scroll bounce with `overscrollBehavior: 'none'`
- **Team Management**: Complete CRUD with Greek language forms and confirmation dialogs

## Development Workflow
1. Check `docs/DEVELOPMENT_LOG.md` for comprehensive project history
2. Follow mobile-first responsive design patterns
3. Use Greek language for all user-facing content
4. Implement proper error handling and loading states
5. Test on mobile devices for scroll/touch behavior

## Firebase Integration Notes
- Teams use custom document IDs (normalized names)
- Auth context merges Firebase user with Firestore document
- Greek characters automatically converted for database compatibility
- Multi-team player support through `teamIds[]` arrays

## Common Patterns to Follow
- Modal components with Greek confirmation dialogs
- Responsive card layouts with hover effects
- Dark mode support for all components  
- Protected routes with proper loading states
- Database operations with error handling

## What NOT to change without confirmation
- Switch from JavaScript to TypeScript
- Modify Firebase configuration or schema
- Change Greek language preferences
- Remove mobile optimization code
- Alter color system without updating theme

For detailed project history and implementation decisions, see `docs/DEVELOPMENT_LOG.md` and `docs/PROJECT_SPEC.md`.

End of instructions
