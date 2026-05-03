# Project Context

## What This Project Is

This is a production-oriented Hospital Management System built as a monorepo with:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Authentication: JWT
- Styling: custom responsive CSS, no Tailwind, no Bootstrap
- Architecture: MVC on the backend
- Frontend favicon is a custom SVG medical cross stored at `frontend/public/favicon.svg`

The app is designed for three roles:

- Doctor
- Staff / Reception
- Admin

## Current Product Scope

The app currently supports:

- Login and logout
- Role-based access control
- Doctor and staff registration, plus a seeded admin account for imaging management
- Doctor dashboard with admitted IPD visibility, OPD waiting patients, appointments, transactions, and operations
- Doctor profile page for uploading a signature image used in printable clinical documents
- Doctor profile page for uploading both a profile picture and signature image
- Doctor sidebar navigation now shows Doctor Profile at the top for quick access
- Doctor sidebar navigation order is Doctor Profile, Dashboard, Appointments, Patient Record, Operations, Admitted Patients, Medical Images, then Pricing & Transactions
- Medical Imaging module for upload, viewing, reporting, printing, and management of scans
- Public patient imaging access page for read-only scan lookup using patient ID and phone
- Staff dashboard with patient registration, payments, appointments, and operations access
- Patient registration and search
- OPD / IPD patient workflow
- IPD admission and discharge flow
- Prescription editing and printable prescription layout
- Prescription editing now includes a required tests / investigations field for lab work and imaging requests
- Doctor profile signature image support for prescription and operation printouts
- Doctor profile picture support with header/avatar preview
- Medical imaging upload stores files on disk under `backend/uploads/medical-images` and references them from MongoDB
- Medical imaging reports support draft and final states; finalized reports are read-only
- Scan deletion is restricted to admin in the current role model
- Doctor pricing setup for billing
- Payment collection for OPD and IPD
- Doctor UPI ID / payee details for UPI collection
- Operation records and printable surgery sheet

## Important Business Rules

- IPD patients are treated as `Admitted` by default when created.
- Doctor can configure pricing for:
  - OPD fee
  - Consultation fee
  - IPD AC fee
  - IPD Non-AC fee
  - UPI ID
  - UPI payee name
- Staff can collect payments using doctor pricing.
- If payment method is UPI, staff should see the doctor’s UPI details.
- Doctor and staff can create and review operation records.
- Only IPD patients can be discharged.
- Discharge changes patient status to `Discharged` and stores discharge summary data.

## Current Backend Structure

Root backend folder:

- `backend/server.js` - Express bootstrap and route registration
- `backend/config/` - env loading and MongoDB connection
- `backend/controllers/` - business logic for auth, patient, appointment, pricing, payments, operations, dashboard, users
- `backend/models/` - Mongoose schemas
- `backend/routes/` - REST API route definitions
- `backend/middleware/` - auth, role checks, error handling
- `backend/seed.js` - demo user seeding

### Current Main Models

- `User`
- `Patient`
- `Appointment`
- `DoctorPricing`
- `Payment`
- `Operation`

### Current Main API Groups

- `/api/auth`
- `/api/users`
- `/api/dashboard`
- `/api/patients`
- `/api/appointments`
- `/api/pricing`
- `/api/payments`
- `/api/operations`

## Current Frontend Structure

Root frontend folder:

- `frontend/src/App.jsx` - route map
- `frontend/src/main.jsx` - app bootstrap
- `frontend/src/context/AuthContext.jsx` - auth state and session bootstrap
- `frontend/src/services/api.js` - API client wrapper
- `frontend/src/components/` - reusable layout, modal, route guard, header, cards
- `frontend/src/pages/` - login, register, dashboards, patient list, payments, operations, print views, discharge page
- `frontend/src/styles.css` - all UI styling

## UX / UI Direction

The current UI direction is:

- modern medical theme
- clean responsive layout
- soft green/teal palette
- no utility CSS framework
- dashboards should feel operational and clinical, not generic

Auth pages were intentionally redesigned with:

- split hero + form layout
- stronger branding
- demo credential cards
- a more polished login surface
- matching modern login and registration screens
- professional auth hero content and elevated form cards
- login page now has a distinct premium hero layout with metrics, demo cards, and a compact form card
- login hero title "Hospital Management System" / main hero text should remain white for contrast on the dark gradient background
- the subtitle text directly below the HMS logo on the login hero ("Hospital Management System") should stay bright/white for contrast
- the login hero eyebrow/subtitle color should now be black on the current login layout
- the login hero card background is now a light medical gradient, with dark heading/subtitle text and lighter supporting cards for contrast
- the login hero card should use the original dark green/teal gradient style, with white hero text and glassy supporting cards

## Routing / Access Rules

- Unauthenticated users must go to `/login`
- After login:
  - doctor routes to `/doctor/dashboard`
  - staff routes to `/staff/dashboard`
- Doctor-only routes are guarded
- Staff-only routes are guarded
- Shared doctor/staff routes are guarded

## Doctor Portal Behaviors

The doctor portal currently includes:

- dashboard summary cards
- today’s appointments
- admitted IPD patient list
- OPD waiting patient queue
- pricing and transactions page
- prescription editing
- printable prescription view
- operation record list
- operation print page

Doctor name display is prefixed in UI as `Dr.` using a display helper, without mutating the stored user record.

## Staff Portal Behaviors

The staff portal currently includes:

- patient registration
- patient list and search
- appointment list
- payment collection
- operation access
- UPI-aware payment guidance

## Print Flows

There are two important print layouts:

- Prescription print view
- Prescription print view includes requested tests / investigations
- Operation / surgery sheet print view

Both use dedicated print-friendly pages with:

- hospital header
- patient details
- clinical details
- notes
- date
- signature area

## Demo Credentials

These are the seed/demo accounts currently documented:

- Doctor: `doctor@hospital.com` / `Doctor@123`
- Staff: `staff@hospital.com` / `Staff@123`
- Admin: `admin@hospital.com` / `Admin@123`

If login fails for these accounts, reseed the database because earlier seed data may have stale password hashes.

## Setup Expectations

From the repo root:

1. `npm install`
2. Copy env examples:
   - `backend/.env.example` to `backend/.env`
   - `frontend/.env.example` to `frontend/.env`
3. Set `MONGO_URI` in backend env
4. Run `npm run seed`
5. Run `npm run dev`

## Local Dev Networking Notes

- The frontend now uses a Vite proxy for `/api`, so browser requests stay same-origin during local development.
- The backend CORS setup allows local `localhost` and `127.0.0.1` origins on any port during development.
- The frontend API base defaults to `/api` instead of hardcoding `http://localhost:5000/api`.

## Doctor Signature Workflow

- Doctors can open `Doctor Profile` from the sidebar after login.
- The profile page lets doctors upload a signature image.
- The signature is stored on the `User` record and is reused in printable prescription and operation sheets.
- If no signature image is uploaded, print layouts fall back to the existing signature line.

## Implementation Conventions

- Use `apply_patch` for file edits.
- Keep ASCII unless the existing file already uses non-ASCII.
- Do not revert user changes unless explicitly asked.
- Avoid destructive git operations.
- Prefer adding reusable helpers instead of duplicating formatting logic.
- Keep backend logic in controllers and route files thin.
- Keep UI state in page components and shared API calls in `frontend/src/services/api.js`.

## Notes For Future Codex Sessions

If you are a future Codex instance working in this repo:

- Read this file first.
- Check `README.md` for setup and runtime instructions.
- Check `backend/server.js` for route registration.
- Check `frontend/src/App.jsx` for route guarding and page mapping.
- If login is broken for demo users, rerun the seed script before debugging auth logic.
- If you add a new business module, wire it through:
  - backend model
  - backend controller
  - backend route
  - frontend API helper
  - frontend page
  - sidebar/navigation
  - README
- Whenever you make changes in this project without asking the user first, update this `project_context.md` file with the new modules, rules, routes, or implementation notes so the next session has accurate context.
