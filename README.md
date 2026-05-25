# Meditrack

Production-ready hospital management app built with:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT
- Styling: responsive CSS
- Architecture: MVC

## Features

- Login/logout with role-based access
- Doctor/staff registration page
- Doctor dashboard with summary cards and today's appointments
- Staff dashboard with patient registration and scheduling
- Staff payment collection with doctor-based pricing for OPD/IPD
- Doctor UPI ID entry for UPI collections
- Doctor pricing setup and transaction ledger
- Admitted IPD patients module for doctors
- Operation module for doctor and staff workflows
- Medical imaging module for scan upload, viewing, reporting, printing, and management
- IPD discharge flow
- Printable surgery sheet for operations
- Patient list with search
- Prescription editor and printable prescription layout
- Public patient imaging access page for read-only scan lookup
- Protected routes and role redirects

## Project Structure

- `backend/` contains the Express API, MVC controllers, models, routes, middleware, config, and seed script
- `frontend/` contains the React app, pages, components, context, services, and styles

## Demo Credentials

- Doctor: `doctor@hospital.com` / `Doctor@123`
- Staff: `staff@hospital.com` / `Staff@123`
- Admin: `abhi@gmail.com` / `123456`

## Setup

1. Install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Create environment files:

   ```bash
   copy backend\.env.example backend\.env
   copy frontend\.env.example frontend\.env
   ```

3. Update `backend/.env` with your MongoDB connection string.

4. Start MongoDB locally or point `MONGO_URI` at your hosted cluster.

5. Seed demo users:

   ```bash
   npm run seed
   ```

   If you previously seeded the database before the auth fix, rerun this command to refresh the demo doctor, staff, and admin passwords.

6. Start the app:

   ```bash
   npm run dev
   ```

   This launches the backend on `http://localhost:5000` and the frontend on `http://localhost:5173`.

## API Notes

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET /api/pricing/mine`
- `POST /api/pricing/mine`
- `GET /api/pricing`
- `GET /api/payments`
- `GET /api/payments/summary`
- `POST /api/payments`
- `GET /api/patients`
- `GET /api/patients/admitted`
- `POST /api/patients`
- `PATCH /api/patients/:id`
- `POST /api/patients/:id/prescription`
- `GET /api/operations`
- `POST /api/operations`
- `PATCH /api/operations/:id`
- `GET /api/appointments`
- `GET /api/appointments/today`
- `POST /api/appointments`
- `GET /api/users/doctors`
- `GET /api/medical-images`
- `GET /api/medical-images/public`
- `GET /api/medical-images/:id`
- `POST /api/medical-images`
- `PATCH /api/medical-images/:id/report`
- `DELETE /api/medical-images/:id`

## Imaging Flow

1. Doctor or staff opens `Medical Imaging`.
2. Select a patient, doctor, optional appointment, image type, body part, and scan date.
3. Upload one or more scan files.
4. Open a scan inline, zoom it, add doctor findings, and save as draft or finalize it.
5. Finalized reports are read-only.
6. Admin can delete scans when needed.
7. Patients can open the public imaging access page with patient ID and phone to view their own scans and reports.

## Print Flow

1. Doctor opens a patient record.
2. Doctor writes diagnosis and prescription.
3. Save redirects to the printable prescription view.
4. Use the `Print Prescription` button or the browser print dialog.

## Billing Flow

1. Doctor opens `Pricing & Transactions` and sets OPD, IPD AC, and IPD Non-AC fees.
2. Staff opens `Payments` and selects patient, doctor, and billing type.
3. The amount auto-fills from the doctor pricing.
4. Staff saves the transaction and the patient payment status updates to `Paid`.
5. Doctor can review collected transactions and total revenue from the same billing page.

## IPD Admission Flow

1. An IPD patient is created with status `Admitted` by default.
2. Doctor dashboard shows admitted IPD count and a recent admitted patient table.
3. Doctor can open `Admitted Patients` to review full IPD admission details.
4. Both doctor and staff can open `Operations` to record surgery or procedure details.
5. Operation records include operation name, type, schedule, theatre, anesthesia, diagnosis, notes, and estimated cost.

## Discharge Flow

1. Open an admitted IPD patient.
2. Use `Discharge` to add the discharge date and discharge summary.
3. The patient status becomes `Discharged`.
4. Discharged records remain in the patient list for later review.

## Operation Print Flow

1. Open `Operations`.
2. Use `Print` on any operation record.
3. The printable surgery sheet includes hospital name, patient info, doctor, operation details, notes, estimated cost, and signature space.

## Notes

- The seed script is idempotent and only creates demo users if they do not already exist.
- Prescription printing uses a dedicated print layout with hospital header, patient info, doctor's notes, date, and signature placeholder.
- The app is ready to extend with more clinical modules such as billing, lab reports, and discharge summaries.
