# CarePoint Services - Service Appointment Management Interface

> **VESA Skill Development Program | Project 3: Service Appointment Management Interface**  
> **Client:** CarePoint Services  
> **Domain:** Frontend Development (HTML5, CSS3, JavaScript)

---

## 1. Problem Understanding

CarePoint Services is an appointment-based service organization providing professional services (consultations, medical advice, and technical support) to customers. Previously, appointments were scheduled manually via phone calls and messaging applications, leading to significant operational challenges:

- **Lack of Visibility:** Customers could not easily discover available services, provider availability, or open time slots.
- **Scheduling Conflicts:** Staff members manually managed records in spreadsheets, leading to accidental double bookings.
- **Communication Overhead:** Rescheduling and cancellations required redundant manual phone calls.
- **Lack of Centralization:** Staff lacked a real-time, consolidated daily operational dashboard to track appointment statuses (Booked, Confirmed, In Progress, Completed, Cancelled).

---

## 2. Solution Overview

The **Service Appointment Management Interface** is a modern, responsive, client-side web application designed to serve user roles through dedicated, separate pages:

1. **Landing Portal Hub (`#loginGateView`):** On initial launch, users are presented with a starting portal offering 3 distinct entry cards: **Customer Login**, **Register New Account**, and **Staff Portal Login**.
2. **Dedicated Customer Login Page (`#customerLoginView`):** Full page for returning customers with Email & Password authentication. Includes a link to Register and a "Back to Options Menu" button.
3. **Dedicated Customer Registration Page (`#customerRegisterView`):** Full page for new user registration with Full Name, Email, Password, and Confirm Password (with exact match validation). Includes a link to Login and a "Back to Options Menu" button.
4. **Dedicated Staff Login Page (`#staffLoginView`):** Restricted full page for authorized staff members requiring Staff ID (`STAFF101`) & PIN (`1234`).
5. **Customer Portal (`#customerView`):** Allows authenticated customers to browse service catalogs, filter by categories, select qualified Indian specialists (Dr. Ananya Sharma, Rajesh Kumar, Dr. Vikram Malhotra, Sunita Patel), pick fresh available time slots, complete bookings, view booking confirmation receipts with a **"Back to Main Screen"** button, and manage existing appointments (reschedule/cancel). Customers cannot view or access the Staff Dashboard.
6. **Staff Dashboard (`#staffView`):** Gives staff full operational oversight with KPI statistics, multi-attribute filter toolbars (by customer name, date, provider, service, status), toggleable table/grid views, and instant status updates.

The application runs purely in the browser using client-side JavaScript and `localStorage` for state persistence without requiring a backend server.

---

## 3. Key Features

- **Dedicated Separate Pages for Login & Registration:**
  - *Customer Login Page:* Email Address & Password validation.
  - *Customer Register Page:* Full Name, Email Address, Enter Password, and Confirm Password (validates that Password and Confirm Password match exactly).
  - *Staff Login Page:* Staff ID & Security PIN authentication.
  - *Landing Hub:* Clear 3-card entry menu.
- **Booking Confirmation "Back to Main Screen" Button:** Added navigation control on the confirmed booking receipt modal so customers can easily return to their main web screen.
- **Strict Role Isolation:** Customer view hides all staff dashboard navigation controls.
  - Staff Login Demo Credentials: **ID: `STAFF101` | PIN: `1234`**.
- **100% Indian Specialist Team:**
  - **Dr. Ananya Sharma:** Senior Medical Advisor (General Health & Preventive Care)
  - **Rajesh Kumar:** Lead Systems Specialist (Technical Systems & Support)
  - **Dr. Vikram Malhotra:** Chief Assessment Consultant (Clinical & Occupational Assessments)
  - **Sunita Patel:** Client Care Specialist (Client Guidance & Technical Care)
- **Fresh Slot Initialization:** Starts with unbooked fresh slots so users can book initial appointments themselves.
- **Interactive Multi-Step Booking Wizard:**
  - *Step 1:* Provider Selection (filtered by service specialty).
  - *Step 2:* Date Picker (automatically enforces provider working days and disables past dates).
  - *Step 3:* Interactive Slot Grid (30/45/60 min duration calculation; visually distinguishes Available, Booked, Unavailable, and Selected slots).
  - *Step 4:* Form & Validation (inline error feedback for full name, email format, and phone number).
- **Printable Booking Receipt:** Instant receipt ticket with unique Appointment ID (`APT-XXXX`) and printable format option.
- **Customer Appointment Management:** Dedicated "My Appointments" section with tabs for All, Upcoming, Completed, and Cancelled appointments. Supports instant rescheduling and cancellations.
- **Staff Operations & KPI Cards:** Real-time summary statistics for Total, Confirmed, In Progress, Completed, and Cancelled bookings.
- **Client-Side State Persistence:** All created, rescheduled, and cancelled appointments are synchronized with `localStorage`.
- **Responsive & Accessible Design:** Touch-friendly controls, visible focus states, semantic HTML5, and Dark/Light Mode theme toggle.

---

## 4. Technology Stack

- **HTML5:** Semantic markup (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<dialog>`).
- **CSS3:** Custom properties (CSS variables) for light/dark themes, Flexbox, Grid, glassmorphic header, animations, and media queries.
- **JavaScript (ES6+):** Pure Vanilla JS DOM manipulation, client-side state management, slot availability algorithms, inline validation, and `localStorage` wrapper.
- **Typography & Icons:** Google Fonts (`Plus Jakarta Sans`) & FontAwesome 6 Icons.

---

## 5. Application Structure

All source files are located directly in the root workspace directory without any subfolders:

```text
Service Appointment Management Interface/
├── index.html        # Landing Hub, Dedicated Customer Login, Register, Staff Login, Customer View & Staff Dashboard
├── styles.css        # Core stylesheet, CSS variables, dark/light mode & responsive design
├── app.js            # Main application engine, Indian provider definitions, page router & state
└── README.md         # Comprehensive project documentation
```

---

## 6. How to Run the Project

1. **Direct Browser Execution:**
   Double-click `index.html` or open it directly in any modern browser (Chrome, Firefox, Edge, Safari).

2. **Using a Local Development Server (Optional):**
   Run any simple HTTP server in the project directory:
   ```bash
   npx serve -p 3000
   ```
   Navigate to `http://localhost:3000` in your web browser.

---

## 7. Demo Login Credentials

- **Customer Login:** Enter Email & Password, or click **Register New Account** (where Confirm Password MUST match Enter Password).
- **Staff Dashboard:**
  - **Staff ID:** `STAFF101` (or `STAFF102`)
  - **Security PIN:** `1234`
