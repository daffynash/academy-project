# Academy Manager

Σύστημα διαχείρισης αθλητικής ακαδημίας - React + Vite + Firebase PWA

## 🚀 Features

- **Team Management**: Δημιουργία και διαχείριση ομάδων με structured naming
- **Player Management**: Comprehensive player system με multi-team support
- **Events System**: Διαχείριση προπονήσεων, αγώνων και εκδηλώσεων
- **Authentication**: Firebase Auth με role-based access control
- **PWA Ready**: Εγκατάσταση σε mobile devices με offline support
- **Responsive Design**: Mobile-first με dark mode support
- **Greek Language**: Full Greek UI με Latin normalization για database
- **Production Ready**: Deployed στο Firebase Hosting

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite 7
- **Backend**: Firebase (Auth + Firestore)
- **Styling**: Tailwind CSS 3.4 με custom animations
- **PWA**: vite-plugin-pwa με Workbox
- **Routing**: React Router DOM
- **Language**: JavaScript (ES Modules)

## 📦 Installation

```bash
# Clone the repository
git clone [repository-url]
cd academy-project

# Install dependencies
npm install

# Start development server
npm run dev -- --host
```

## 🔧 Development

```bash
# Development server με network access
npm run dev -- --host

# Build for production
npm run build

# Deploy to Firebase Hosting
npx firebase deploy --only hosting

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📱 PWA Setup

Το app είναι configured ως Progressive Web App:

```bash
# Generate placeholder icons (if needed)
.\create-icons.ps1

# Convert SVG to PNG icons
node convert-icons.cjs

# Build με PWA support
npm run build
```

Για περισσότερες πληροφορίες, δες το `docs/PWA_SETUP.md`

## 📂 Project Structure

```
src/
├── contexts/          # AuthContext με Firestore integration
├── services/          # Firebase Auth & Firestore operations
├── pages/            # Main pages (Dashboard, Teams, Players)
├── components/       # Reusable components & modals
├── config/           # Color system configuration
└── styles/           # CSS με custom properties

public/
├── icons/            # PWA icons (72x72 through 512x512)
└── manifest.json     # Web App Manifest

docs/
├── DEVELOPMENT_LOG.md    # Project history
├── PROJECT_SPEC.md       # Technical specifications
└── PWA_SETUP.md          # PWA documentation
```

## 🎨 Theme & Design

- **Primary Color**: Blue (#3b82f6)
- **Dark Mode**: Full support με proper contrast
- **Animations**: Custom Tailwind animations (fadeIn, slideIn, shimmer, etc.)
- **Mobile-First**: Responsive σε όλες τις συσκευές

## 🔥 Firebase Configuration

Το project είναι configured για Firebase Hosting με project ID: `academy-manager-v114`

**Live URL**: https://academy-manager-v114.web.app

Create `.env` file με τα Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=academy-manager-v114
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Deployment Steps**:
1. `npm run build` - Build για production
2. `npx firebase deploy --only hosting` - Deploy στο Firebase Hosting
3. App είναι live στο https://academy-manager-v114.web.app

## 📖 Documentation

- **Development Log**: `docs/DEVELOPMENT_LOG.md` - Full project history
- **Project Spec**: `docs/PROJECT_SPEC.md` - Technical specifications
- **PWA Setup**: `docs/PWA_SETUP.md` - PWA configuration & testing
- **Copilot Instructions**: `.github/copilot-instructions.md` - AI assistant guidelines

## 🧪 Testing PWA

1. Build το production app: `npm run build`
2. Serve locally: `npm run preview`
3. Open σε mobile browser (https required για real device)
4. Tap "Add to Home Screen"
5. App ανοίγει σε standalone mode

## 🚧 Current Status

✅ **COMPLETED**:
- Authentication system με Firebase
- Team Management (CRUD) με Greek naming
- Player Management με multi-team support
- Events System με attendance tracking
- Navigation system με role-based access
- PWA configuration με offline support
- **Firebase Hosting Deployment** - Live στο https://academy-manager-v114.web.app
- Dashboard optimization με improved events layout

🔄 **IN PROGRESS**:
- User feedback collection
- Performance monitoring

📋 **PLANNED**:
- Push notifications
- Advanced analytics
- Language switcher (EN/GR)
- Enhanced admin features

## 📝 Notes

- Greek characters αυτόματα μετατρέπονται για database compatibility
- Team names δημιουργούνται από Ηλικιακό Γκρουπ + Όνομα Γκρουπ
- Multi-team player support μέσω `teamIds[]` arrays
- Mobile-optimized με proper scroll behavior
- Service Worker caching με smart strategies (Cache-First για images, Network-First για data)

## 📄 License

Private project - All rights reserved

---

**Version**: 1.0.0  
**Last Updated**: October 15, 2025  
**Live URL**: https://academy-manager-v114.web.app
