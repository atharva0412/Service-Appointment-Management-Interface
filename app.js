/**
 * CarePoint Services - Service Appointment Management System
 * Core JavaScript Application Engine
 */

(function () {
    'use strict';

    /* ==========================================================================
       1. INITIAL MOCK DATA DEFINITIONS (INDIAN NAMES & FRESH SLOTS)
       ========================================================================== */
    const DEFAULT_SERVICES = [
        {
            id: 'srv-1',
            name: 'Consultation',
            category: 'General Care',
            duration: 30,
            price: 500,
            description: 'Initial health & wellness assessment, medical history review, and expert advisory session with a certified care specialist.',
            providers: ['prov-1', 'prov-4']
        },
        {
            id: 'srv-2',
            name: 'Premium Consultation',
            category: 'Specialist',
            duration: 60,
            price: 900,
            description: 'Comprehensive, in-depth clinical evaluation with senior advisors, diagnostic review, and tailored ongoing care plan.',
            providers: ['prov-1', 'prov-3']
        },
        {
            id: 'srv-3',
            name: 'Technical Support',
            category: 'Technical',
            duration: 45,
            price: 700,
            description: 'Hands-on troubleshooting, hardware/software diagnostic support, and device setup for CarePoint digital equipment.',
            providers: ['prov-2', 'prov-4']
        },
        {
            id: 'srv-4',
            name: 'Professional Assessment',
            category: 'Specialist',
            duration: 60,
            price: 1200,
            description: 'Formal occupational evaluation, structured testing, full documentation, and formal recommendation reports.',
            providers: ['prov-3']
        }
    ];

    // Providers with 100% Indian Names
    const DEFAULT_PROVIDERS = [
        {
            id: 'prov-1',
            name: 'Dr. Ananya Sharma',
            title: 'Senior Medical Advisor',
            specialization: 'General Health & Preventive Care',
            avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&q=80',
            workingDays: [1, 2, 3, 4, 5], // Mon - Fri
            workingDaysText: 'Mon - Fri',
            workingHours: { start: '09:00', end: '17:00' },
            servicesOffered: ['srv-1', 'srv-2']
        },
        {
            id: 'prov-2',
            name: 'Rajesh Kumar',
            title: 'Lead Systems Specialist',
            specialization: 'Technical Systems & Support',
            avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
            workingDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
            workingDaysText: 'Mon - Sat',
            workingHours: { start: '10:00', end: '18:00' },
            servicesOffered: ['srv-3']
        },
        {
            id: 'prov-3',
            name: 'Dr. Vikram Malhotra',
            title: 'Chief Assessment Consultant',
            specialization: 'Clinical & Occupational Assessments',
            avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=250&q=80',
            workingDays: [2, 3, 4, 5, 6], // Tue - Sat
            workingDaysText: 'Tue - Sat',
            workingHours: { start: '09:00', end: '16:00' },
            servicesOffered: ['srv-2', 'srv-4']
        },
        {
            id: 'prov-4',
            name: 'Sunita Patel',
            title: 'Client Care Specialist',
            specialization: 'Client Guidance & Technical Care',
            avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&w=250&q=80',
            workingDays: [1, 3, 5], // Mon, Wed, Fri
            workingDaysText: 'Mon, Wed, Fri',
            workingHours: { start: '08:00', end: '15:00' },
            servicesOffered: ['srv-1', 'srv-3']
        }
    ];

    // Fresh start: No demo pre-booked appointments!
    const DEFAULT_APPOINTMENTS = [];

    // Valid Staff Authentication Credentials
    const STAFF_CREDENTIALS = [
        { id: 'STAFF101', pin: '1234', name: 'Dr. Ananya Sharma' },
        { id: 'STAFF102', pin: '1234', name: 'Rajesh Kumar' },
        { id: 'ADMIN', pin: 'admin123', name: 'System Administrator' }
    ];

    function getOffsetDateStr(offsetDays = 0) {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().split('T')[0];
    }

    /* ==========================================================================
       2. STATE & STORAGE CONTROLLER
       ========================================================================== */
    const STORAGE_KEY_APPTS = 'carepoint_appointments_v2';
    const STORAGE_KEY_THEME = 'carepoint_theme_v1';
    const STORAGE_KEY_USERS = 'carepoint_registered_users_v1';

    let state = {
        services: DEFAULT_SERVICES,
        providers: DEFAULT_PROVIDERS,
        appointments: [],
        registeredUsers: [],
        currentUser: null, // { role: 'customer'|'staff', name: '', email: '' }
        activeView: 'loginGate', // 'loginGate' | 'customerLogin' | 'customerRegister' | 'staffLogin' | 'customer' | 'staff'
        customerTab: 'catalog', // 'catalog' | 'my-appointments'
        customerSearch: '',
        customerCategory: 'all',
        customerStatusFilter: 'all',
        staffFilters: {
            search: '',
            date: '',
            provider: 'all',
            service: 'all',
            status: 'all'
        },
        staffViewMode: 'list', // 'list' | 'grid'
        bookingWizard: {
            step: 1,
            selectedService: null,
            selectedProvider: null,
            selectedDate: '',
            selectedSlot: '',
            customerInfo: { fullName: '', email: '', phone: '', notes: '' }
        },
        activeRescheduleId: null,
        activeCancelId: null
    };

    function initStorage() {
        try {
            const storedAppts = localStorage.getItem(STORAGE_KEY_APPTS);
            if (storedAppts) {
                state.appointments = JSON.parse(storedAppts);
            } else {
                state.appointments = DEFAULT_APPOINTMENTS;
                saveAppointments();
            }

            const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
            if (storedUsers) {
                state.registeredUsers = JSON.parse(storedUsers);
            } else {
                state.registeredUsers = [
                    { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', password: 'password123' }
                ];
                saveUsers();
            }
        } catch (e) {
            console.error('LocalStorage load error:', e);
            state.appointments = DEFAULT_APPOINTMENTS;
        }

        const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function saveAppointments() {
        try {
            localStorage.setItem(STORAGE_KEY_APPTS, JSON.stringify(state.appointments));
        } catch (e) {
            console.error('LocalStorage save error:', e);
        }
    }

    function saveUsers() {
        try {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(state.registeredUsers));
        } catch (e) {
            console.error('LocalStorage save users error:', e);
        }
    }

    /* ==========================================================================
       3. DOM ELEMENTS REFERENCES
       ========================================================================== */
    const elements = {
        // Header Controls
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        userSessionBadge: document.getElementById('userSessionBadge'),
        userNameDisplay: document.getElementById('userNameDisplay'),
        userRoleBadge: document.getElementById('userRoleBadge'),
        logoutBtn: document.getElementById('logoutBtn'),

        // View Sections
        loginGateView: document.getElementById('loginGateView'),
        customerLoginView: document.getElementById('customerLoginView'),
        customerRegisterView: document.getElementById('customerRegisterView'),
        staffLoginView: document.getElementById('staffLoginView'),
        customerView: document.getElementById('customerView'),
        staffView: document.getElementById('staffView'),

        // Landing Portal Hub Action Buttons
        gotoCustLoginBtn: document.getElementById('gotoCustLoginBtn'),
        gotoCustRegBtn: document.getElementById('gotoCustRegBtn'),
        gotoStaffLoginBtn: document.getElementById('gotoStaffLoginBtn'),
        backToHubBtns: document.querySelectorAll('.backToHubAction'),

        // Inter-page links
        linkToRegister: document.getElementById('linkToRegister'),
        linkToLogin: document.getElementById('linkToLogin'),

        // Forms
        customerLoginForm: document.getElementById('customerLoginForm'),
        customerRegisterForm: document.getElementById('customerRegisterForm'),
        staffLoginForm: document.getElementById('staffLoginForm'),

        // Auth Inputs
        loginCustEmail: document.getElementById('loginCustEmail'),
        loginCustPass: document.getElementById('loginCustPass'),
        custLoginError: document.getElementById('custLoginError'),

        regCustName: document.getElementById('regCustName'),
        regCustEmail: document.getElementById('regCustEmail'),
        regCustPass: document.getElementById('regCustPass'),
        regCustConfirmPass: document.getElementById('regCustConfirmPass'),
        custRegError: document.getElementById('custRegError'),

        loginStaffId: document.getElementById('loginStaffId'),
        loginStaffPin: document.getElementById('loginStaffPin'),
        staffLoginError: document.getElementById('staffLoginError'),

        // Customer View Elements
        custTabBtns: document.querySelectorAll('.cust-tab-btn'),
        tabCatalog: document.getElementById('tabCatalog'),
        tabMyAppointments: document.getElementById('tabMyAppointments'),
        serviceSearchInput: document.getElementById('serviceSearchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        categoryPills: document.getElementById('categoryPills'),
        servicesGrid: document.getElementById('servicesGrid'),
        myApptBadge: document.getElementById('myApptBadge'),
        myAppointmentsList: document.getElementById('myAppointmentsList'),
        customerStatusTabs: document.getElementById('customerStatusTabs'),

        // Counts
        countAll: document.getElementById('countAll'),
        countUpcoming: document.getElementById('countUpcoming'),
        countCompleted: document.getElementById('countCompleted'),
        countCancelled: document.getElementById('countCancelled'),

        // Staff Dashboard Elements
        todayDateString: document.getElementById('todayDateString'),
        kpiTotal: document.getElementById('kpiTotal'),
        kpiConfirmed: document.getElementById('kpiConfirmed'),
        kpiInProgress: document.getElementById('kpiInProgress'),
        kpiCompleted: document.getElementById('kpiCompleted'),
        kpiCancelled: document.getElementById('kpiCancelled'),
        staffSearchInput: document.getElementById('staffSearchInput'),
        staffDateFilter: document.getElementById('staffDateFilter'),
        staffProviderFilter: document.getElementById('staffProviderFilter'),
        staffServiceFilter: document.getElementById('staffServiceFilter'),
        staffStatusFilter: document.getElementById('staffStatusFilter'),
        resetStaffFiltersBtn: document.getElementById('resetStaffFiltersBtn'),
        viewListBtn: document.getElementById('viewListBtn'),
        viewGridBtn: document.getElementById('viewGridBtn'),
        staffAppointmentsContainer: document.getElementById('staffAppointmentsContainer'),

        // Booking Wizard Controls
        bookingModal: document.getElementById('bookingModal'),
        closeBookingModalBtn: document.getElementById('closeBookingModalBtn'),
        stepIndicator: document.getElementById('stepIndicator'),
        wizardProgressFill: document.getElementById('wizardProgressFill'),
        selectedServiceSummaryStrip: document.getElementById('selectedServiceSummaryStrip'),
        providersSelectionGrid: document.getElementById('providersSelectionGrid'),
        bookingDatePicker: document.getElementById('bookingDatePicker'),
        providerWorkingDaysInfo: document.getElementById('providerWorkingDaysInfo'),
        slotDurationNotice: document.getElementById('slotDurationNotice'),
        timeSlotsGrid: document.getElementById('timeSlotsGrid'),
        prevStepBtn: document.getElementById('prevStepBtn'),
        nextStepBtn: document.getElementById('nextStepBtn'),
        submitBookingBtn: document.getElementById('submitBookingBtn'),
        
        // Validation Inputs
        custFullName: document.getElementById('custFullName'),
        custEmail: document.getElementById('custEmail'),
        custPhone: document.getElementById('custPhone'),
        custNotes: document.getElementById('custNotes'),
        finalCheckoutSummary: document.getElementById('finalCheckoutSummary'),

        // Errors
        errProvider: document.getElementById('errProvider'),
        errDate: document.getElementById('errDate'),
        errSlot: document.getElementById('errSlot'),
        errFullName: document.getElementById('errFullName'),
        errEmail: document.getElementById('errEmail'),
        errPhone: document.getElementById('errPhone'),

        // Modals
        confirmationModal: document.getElementById('confirmationModal'),
        receiptTicketBody: document.getElementById('receiptTicketBody'),
        backToHomeBtn: document.getElementById('backToHomeBtn'),
        printReceiptBtn: document.getElementById('printReceiptBtn'),
        goToMyApptsBtn: document.getElementById('goToMyApptsBtn'),
        
        detailsModal: document.getElementById('detailsModal'),
        closeDetailsModalBtn: document.getElementById('closeDetailsModalBtn'),
        detailsModalTitle: document.getElementById('detailsModalTitle'),
        detailsModalBody: document.getElementById('detailsModalBody'),
        detailsModalFooter: document.getElementById('detailsModalFooter'),

        rescheduleModal: document.getElementById('rescheduleModal'),
        closeRescheduleModalBtn: document.getElementById('closeRescheduleModalBtn'),
        cancelRescheduleBtn: document.getElementById('cancelRescheduleBtn'),
        confirmRescheduleBtn: document.getElementById('confirmRescheduleBtn'),
        rescheduleDatePicker: document.getElementById('rescheduleDatePicker'),
        rescheduleSlotsGrid: document.getElementById('rescheduleSlotsGrid'),
        errRescheduleSlot: document.getElementById('errRescheduleSlot'),
        rescheduleSubtext: document.getElementById('rescheduleSubtext'),

        cancelConfirmModal: document.getElementById('cancelConfirmModal'),
        dismissCancelBtn: document.getElementById('dismissCancelBtn'),
        confirmCancelBtn: document.getElementById('confirmCancelBtn'),

        // Toast Container
        toastContainer: document.getElementById('toastContainer')
    };

    /* ==========================================================================
       4. HELPER & UTILITY FUNCTIONS
       ========================================================================== */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-circle-info';
        if (type === 'success') iconClass = 'fa-circle-check';
        if (type === 'error') iconClass = 'fa-circle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <span class="toast-message">${escapeHTML(message)}</span>
        `;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
    }

    function updateThemeIcon(theme) {
        const icon = elements.themeToggleBtn.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    /* ==========================================================================
       5. SCHEDULING & TIME SLOT AVAILABILITY ENGINE
       ========================================================================== */
    function generateTimeSlots(startTimeStr, endTimeStr) {
        const slots = [];
        let [startH, startM] = startTimeStr.split(':').map(Number);
        let [endH, endM] = endTimeStr.split(':').map(Number);

        let currentMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;

        while (currentMins < endMins) {
            const h = Math.floor(currentMins / 60);
            const m = currentMins % 60;
            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            slots.push(timeStr);
            currentMins += 30;
        }
        return slots;
    }

    function getSlotAvailability(providerId, dateStr, serviceDuration, excludeApptId = null) {
        const provider = state.providers.find(p => p.id === providerId);
        if (!provider || !dateStr) return [];

        const selectedDate = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = selectedDate.getDay();

        if (!provider.workingDays.includes(dayOfWeek)) {
            return [];
        }

        const rawSlots = generateTimeSlots(provider.workingHours.start, provider.workingHours.end);

        const activeBookings = state.appointments.filter(a =>
            a.providerId === providerId &&
            a.date === dateStr &&
            a.status !== 'Cancelled' &&
            a.status !== 'No Show' &&
            a.appointmentId !== excludeApptId
        );

        const now = new Date();
        const isToday = dateStr === getOffsetDateStr(0);
        const currentMinsNow = now.getHours() * 60 + now.getMinutes();

        return rawSlots.map(slotTime => {
            const [sH, sM] = slotTime.split(':').map(Number);
            const slotStartMins = sH * 60 + sM;
            const slotEndMins = slotStartMins + serviceDuration;

            const [eH, eM] = provider.workingHours.end.split(':').map(Number);
            const provEndMins = eH * 60 + eM;
            if (slotEndMins > provEndMins) {
                return { time: slotTime, available: false, reason: 'Exceeds working hours' };
            }

            if (isToday && slotStartMins <= currentMinsNow) {
                return { time: slotTime, available: false, reason: 'Time passed' };
            }

            const isBooked = activeBookings.some(booking => {
                const [bH, bM] = booking.time.split(':').map(Number);
                const bStartMins = bH * 60 + bM;
                const bEndMins = bStartMins + booking.duration;
                return (slotStartMins < bEndMins && slotEndMins > bStartMins);
            });

            return {
                time: slotTime,
                available: !isBooked,
                reason: isBooked ? 'Already booked' : 'Available'
            };
        });
    }

    /* ==========================================================================
       6. ROLE & VIEW SWITCHING ENGINE
       ========================================================================== */
    function navigateToView(viewName) {
        state.activeView = viewName;

        const authViews = ['loginGate', 'customerLogin', 'customerRegister', 'staffLogin'];
        const isAuthView = authViews.includes(viewName);

        elements.loginGateView.classList.toggle('active', viewName === 'loginGate');
        elements.customerLoginView.classList.toggle('active', viewName === 'customerLogin');
        elements.customerRegisterView.classList.toggle('active', viewName === 'customerRegister');
        elements.staffLoginView.classList.toggle('active', viewName === 'staffLogin');
        elements.customerView.classList.toggle('active', viewName === 'customer');
        elements.staffView.classList.toggle('active', viewName === 'staff');

        if (isAuthView) {
            elements.userSessionBadge.classList.add('hidden');
            elements.logoutBtn.classList.add('hidden');
        } else {
            elements.userSessionBadge.classList.remove('hidden');
            elements.logoutBtn.classList.remove('hidden');
            elements.userNameDisplay.textContent = state.currentUser.name;
            elements.userRoleBadge.textContent = state.currentUser.role === 'customer' ? 'Customer' : 'Staff';
        }

        if (viewName === 'customer') {
            renderServicesCatalog();
            renderMyAppointments();
        } else if (viewName === 'staff') {
            renderStaffDashboard();
        }
    }

    function logoutUser() {
        state.currentUser = null;
        navigateToView('loginGate');
        showToast('Logged out successfully.', 'info');
    }

    /* ==========================================================================
       7. CUSTOMER PORTAL RENDERING
       ========================================================================== */
    function renderServicesCatalog() {
        const query = state.customerSearch.toLowerCase().trim();
        const cat = state.customerCategory;

        const filtered = state.services.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query);
            const matchesCat = cat === 'all' || s.category === cat;
            return matchesSearch && matchesCat;
        });

        if (filtered.length === 0) {
            elements.servicesGrid.innerHTML = `
                <div class="empty-state-text full-width" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No Services Found</h3>
                    <p>Try adjusting your search criteria or category filter.</p>
                </div>
            `;
            return;
        }

        elements.servicesGrid.innerHTML = filtered.map(service => {
            const availProvidersCount = service.providers.length;
            return `
                <div class="service-card" data-service-id="${service.id}">
                    <div>
                        <div class="service-card-header">
                            <h3 class="service-title">${escapeHTML(service.name)}</h3>
                            <span class="service-cat-badge">${escapeHTML(service.category)}</span>
                        </div>
                        <p class="service-desc">${escapeHTML(service.description)}</p>
                    </div>
                    <div>
                        <div class="service-meta-strip">
                            <div class="meta-item">
                                <i class="fa-regular fa-clock"></i>
                                <span><strong>${service.duration}</strong> mins</span>
                            </div>
                            <div class="meta-item">
                                <i class="fa-solid fa-user-doctor"></i>
                                <span><strong>${availProvidersCount}</strong> specialist(s)</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <span class="service-price">${formatCurrency(service.price)}</span>
                            <button class="btn btn-primary btn-sm book-service-btn" data-service-id="${service.id}">
                                Book Now <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderMyAppointments() {
        const filter = state.customerStatusFilter;

        const allAppts = state.appointments;
        const upcomingAppts = allAppts.filter(a => ['Booked', 'Confirmed', 'In Progress'].includes(a.status));
        const completedAppts = allAppts.filter(a => a.status === 'Completed');
        const cancelledAppts = allAppts.filter(a => ['Cancelled', 'No Show'].includes(a.status));

        elements.countAll.textContent = allAppts.length;
        elements.countUpcoming.textContent = upcomingAppts.length;
        elements.countCompleted.textContent = completedAppts.length;
        elements.countCancelled.textContent = cancelledAppts.length;
        elements.myApptBadge.textContent = upcomingAppts.length;

        let displayAppts = allAppts;
        if (filter === 'upcoming') displayAppts = upcomingAppts;
        if (filter === 'Completed') displayAppts = completedAppts;
        if (filter === 'Cancelled') displayAppts = cancelledAppts;

        if (displayAppts.length === 0) {
            elements.myAppointmentsList.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; background: var(--bg-secondary); border-radius: 1rem; border: 1px solid var(--border-color);">
                    <i class="fa-regular fa-calendar-xmark" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No Appointments Found</h3>
                    <p style="color: var(--text-secondary);">You do not have any ${filter === 'all' ? '' : filter} appointments listed.</p>
                </div>
            `;
            return;
        }

        displayAppts.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

        elements.myAppointmentsList.innerHTML = displayAppts.map(appt => {
            const provider = state.providers.find(p => p.id === appt.providerId) || {};
            const isUpcoming = ['Booked', 'Confirmed'].includes(appt.status);

            return `
                <div class="appointment-card" data-id="${appt.appointmentId}">
                    <div class="appt-main-info">
                        <img src="${provider.avatar || 'https://via.placeholder.com/60'}" alt="${escapeHTML(appt.providerName)}" class="provider-avatar-circle">
                        <div class="appt-details">
                            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.2rem;">
                                <h4>${escapeHTML(appt.serviceName)}</h4>
                                ${getStatusBadgeHTML(appt.status)}
                            </div>
                            <div class="appt-subtext">
                                <span><i class="fa-solid fa-user-doctor"></i> ${escapeHTML(appt.providerName)}</span>
                                <span><i class="fa-regular fa-calendar"></i> ${formatDate(appt.date)} at <strong>${appt.time}</strong></span>
                                <span><i class="fa-solid fa-tag"></i> ${formatCurrency(appt.price)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="appt-actions">
                        <button class="btn btn-secondary btn-sm view-appt-btn" data-id="${appt.appointmentId}">
                            <i class="fa-solid fa-eye"></i> Details
                        </button>
                        ${isUpcoming ? `
                            <button class="btn btn-outline btn-sm reschedule-appt-btn" data-id="${appt.appointmentId}">
                                <i class="fa-solid fa-arrows-rotate"></i> Reschedule
                            </button>
                            <button class="btn btn-danger btn-sm cancel-appt-btn" data-id="${appt.appointmentId}">
                                <i class="fa-solid fa-ban"></i> Cancel
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function getStatusBadgeHTML(status) {
        const statusClassMap = {
            'Booked': 'badge-booked',
            'Confirmed': 'badge-confirmed',
            'In Progress': 'badge-in-progress',
            'Completed': 'badge-completed',
            'Cancelled': 'badge-cancelled',
            'No Show': 'badge-noshow'
        };
        const cls = statusClassMap[status] || 'badge-completed';
        return `<span class="badge ${cls}">${escapeHTML(status)}</span>`;
    }

    /* ==========================================================================
       8. BOOKING WIZARD ENGINE
       ========================================================================== */
    function openBookingModal(serviceId) {
        const service = state.services.find(s => s.id === serviceId);
        if (!service) return;

        state.bookingWizard = {
            step: 1,
            selectedService: service,
            selectedProvider: null,
            selectedDate: getOffsetDateStr(0),
            selectedSlot: '',
            customerInfo: {
                fullName: state.currentUser ? state.currentUser.name : '',
                email: state.currentUser ? (state.currentUser.email || '') : '',
                phone: '',
                notes: ''
            }
        };

        elements.custFullName.value = state.currentUser ? state.currentUser.name : '';
        elements.custEmail.value = state.currentUser ? (state.currentUser.email || '') : '';
        elements.custPhone.value = '';
        elements.custNotes.value = '';
        clearValidationErrors();

        elements.selectedServiceSummaryStrip.innerHTML = `
            <div class="strip-info">
                <h4><i class="fa-solid fa-briefcase"></i> ${escapeHTML(service.name)}</h4>
                <div class="strip-meta">${service.duration} Minutes &bull; ${service.category}</div>
            </div>
            <div style="font-weight: 800; font-size: 1.1rem; color: var(--brand-primary);">
                ${formatCurrency(service.price)}
            </div>
        `;

        elements.slotDurationNotice.textContent = `${service.duration} mins`;
        elements.bookingDatePicker.value = state.bookingWizard.selectedDate;
        elements.bookingDatePicker.min = getOffsetDateStr(0);

        updateWizardUI();
        elements.bookingModal.setAttribute('aria-hidden', 'false');
    }

    function closeBookingModal() {
        elements.bookingModal.setAttribute('aria-hidden', 'true');
    }

    function updateWizardUI() {
        const step = state.bookingWizard.step;
        elements.stepIndicator.textContent = `Step ${step} of 4`;
        elements.wizardProgressFill.style.width = `${(step / 4) * 100}%`;

        document.querySelectorAll('.wizard-step').forEach(el => {
            el.classList.toggle('active', parseInt(el.dataset.step) === step);
        });

        if (step === 1) renderProviderSelection();
        if (step === 2 && state.bookingWizard.selectedProvider) {
            const p = state.bookingWizard.selectedProvider;
            elements.providerWorkingDaysInfo.innerHTML = `<i class="fa-solid fa-clock"></i> Provider Schedule: <strong>${p.workingDaysText} (${p.workingHours.start} - ${p.workingHours.end})</strong>`;
        }
        if (step === 3) renderTimeSlots();
        if (step === 4) renderCheckoutSummary();

        elements.prevStepBtn.disabled = step === 1;
        if (step === 4) {
            elements.nextStepBtn.classList.add('hidden');
            elements.submitBookingBtn.classList.remove('hidden');
        } else {
            elements.nextStepBtn.classList.remove('hidden');
            elements.submitBookingBtn.classList.add('hidden');
        }
    }

    function renderProviderSelection() {
        const service = state.bookingWizard.selectedService;
        const availableProviders = state.providers.filter(p => service.providers.includes(p.id));

        elements.providersSelectionGrid.innerHTML = availableProviders.map(p => {
            const isSelected = state.bookingWizard.selectedProvider && state.bookingWizard.selectedProvider.id === p.id;
            return `
                <div class="provider-select-card ${isSelected ? 'selected' : ''}" data-provider-id="${p.id}">
                    <img src="${p.avatar}" alt="${escapeHTML(p.name)}" class="prov-img">
                    <div class="prov-details">
                        <h5>${escapeHTML(p.name)}</h5>
                        <p>${escapeHTML(p.specialization)}</p>
                        <span style="font-size: 0.75rem; color: var(--brand-primary); font-weight: 700;">${p.workingDaysText}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderTimeSlots() {
        const p = state.bookingWizard.selectedProvider;
        const d = state.bookingWizard.selectedDate;
        const duration = state.bookingWizard.selectedService.duration;

        if (!p || !d) {
            elements.timeSlotsGrid.innerHTML = `<div class="empty-state-text full-width">Please pick a provider and date first.</div>`;
            return;
        }

        const slotList = getSlotAvailability(p.id, d, duration);

        if (slotList.length === 0) {
            elements.timeSlotsGrid.innerHTML = `
                <div class="empty-state-text full-width" style="grid-column: 1 / -1; text-align: center; color: #e11d48; padding: 1.5rem 0;">
                    <i class="fa-solid fa-calendar-minus" style="font-size: 2rem; margin-bottom: 0.5rem;"></i><br>
                    <strong>Provider Unavailable</strong><br>
                    ${escapeHTML(p.name)} does not work on this day (${formatDate(d)}). Please choose another date.
                </div>
            `;
            return;
        }

        elements.timeSlotsGrid.innerHTML = slotList.map(slot => {
            const isSelected = state.bookingWizard.selectedSlot === slot.time;
            const stateCls = isSelected ? 'selected' : (slot.available ? 'available' : 'booked');
            
            return `
                <button type="button" 
                    class="slot-btn ${stateCls}" 
                    data-slot="${slot.time}" 
                    ${!slot.available ? 'disabled title="' + slot.reason + '"' : ''}>
                    ${slot.time}
                </button>
            `;
        }).join('');
    }

    function renderCheckoutSummary() {
        const bw = state.bookingWizard;
        elements.finalCheckoutSummary.innerHTML = `
            <div class="summary-row">
                <span class="label">Service:</span>
                <span class="value">${escapeHTML(bw.selectedService.name)}</span>
            </div>
            <div class="summary-row">
                <span class="label">Provider:</span>
                <span class="value">${escapeHTML(bw.selectedProvider.name)}</span>
            </div>
            <div class="summary-row">
                <span class="label">Date & Time:</span>
                <span class="value">${formatDate(bw.selectedDate)} at ${bw.selectedSlot}</span>
            </div>
            <div class="summary-row">
                <span class="label">Duration:</span>
                <span class="value">${bw.selectedService.duration} minutes</span>
            </div>
            <div class="summary-row total">
                <span class="label">Total Price:</span>
                <span class="value">${formatCurrency(bw.selectedService.price)}</span>
            </div>
        `;
    }

    function clearValidationErrors() {
        elements.errProvider.textContent = '';
        elements.errDate.textContent = '';
        elements.errSlot.textContent = '';
        elements.errFullName.textContent = '';
        elements.errEmail.textContent = '';
        elements.errPhone.textContent = '';
    }

    function validateStep(step) {
        clearValidationErrors();
        let valid = true;

        if (step === 1) {
            if (!state.bookingWizard.selectedProvider) {
                elements.errProvider.textContent = 'Please select a service provider to continue.';
                valid = false;
            }
        } else if (step === 2) {
            if (!state.bookingWizard.selectedDate) {
                elements.errDate.textContent = 'Please choose a valid appointment date.';
                valid = false;
            }
        } else if (step === 3) {
            if (!state.bookingWizard.selectedSlot) {
                elements.errSlot.textContent = 'Please select an available time slot.';
                valid = false;
            }
        } else if (step === 4) {
            const name = elements.custFullName.value.trim();
            const email = elements.custEmail.value.trim();
            const phone = elements.custPhone.value.trim();

            if (!name || name.length < 2) {
                elements.errFullName.textContent = 'Please enter a valid full name.';
                valid = false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                elements.errEmail.textContent = 'Please enter a valid email address.';
                valid = false;
            }

            const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{7,}$/;
            if (!phone || !phoneRegex.test(phone)) {
                elements.errPhone.textContent = 'Please enter a valid phone number (min 7 digits).';
                valid = false;
            }
        }

        return valid;
    }

    function handleBookingSubmission() {
        if (!validateStep(4)) return;

        const bw = state.bookingWizard;
        const newAppointment = {
            appointmentId: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
            customerName: elements.custFullName.value.trim(),
            customerEmail: elements.custEmail.value.trim(),
            customerPhone: elements.custPhone.value.trim(),
            serviceId: bw.selectedService.id,
            serviceName: bw.selectedService.name,
            providerId: bw.selectedProvider.id,
            providerName: bw.selectedProvider.name,
            date: bw.selectedDate,
            time: bw.selectedSlot,
            duration: bw.selectedService.duration,
            price: bw.selectedService.price,
            status: 'Booked',
            notes: elements.custNotes.value.trim()
        };

        state.appointments.unshift(newAppointment);
        saveAppointments();

        closeBookingModal();
        showConfirmationReceipt(newAppointment);
        showToast('Appointment booked successfully!', 'success');

        renderMyAppointments();
        renderStaffDashboard();
    }

    function showConfirmationReceipt(appt) {
        elements.receiptTicketBody.innerHTML = `
            <div class="receipt-row">
                <span class="label">Appointment ID</span>
                <span class="value" style="color: var(--brand-primary);">${appt.appointmentId}</span>
            </div>
            <div class="receipt-row">
                <span class="label">Customer Name</span>
                <span class="value">${escapeHTML(appt.customerName)}</span>
            </div>
            <div class="receipt-row">
                <span class="label">Service</span>
                <span class="value">${escapeHTML(appt.serviceName)}</span>
            </div>
            <div class="receipt-row">
                <span class="label">Provider</span>
                <span class="value">${escapeHTML(appt.providerName)}</span>
            </div>
            <div class="receipt-row">
                <span class="label">Date & Time</span>
                <span class="value">${formatDate(appt.date)} at ${appt.time}</span>
            </div>
            <div class="receipt-row">
                <span class="label">Duration</span>
                <span class="value">${appt.duration} mins</span>
            </div>
            <div class="receipt-row">
                <span class="label">Total Fee</span>
                <span class="value" style="color: var(--brand-primary);">${formatCurrency(appt.price)}</span>
            </div>
            <div class="receipt-row">
                <span class="label">Status</span>
                <span class="value">${getStatusBadgeHTML(appt.status)}</span>
            </div>
        `;

        elements.confirmationModal.setAttribute('aria-hidden', 'false');
    }

    /* ==========================================================================
       9. STAFF DASHBOARD ENGINE
       ========================================================================== */
    function initStaffFiltersOptions() {
        elements.staffProviderFilter.innerHTML = `<option value="all">All Providers</option>` +
            state.providers.map(p => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join('');

        elements.staffServiceFilter.innerHTML = `<option value="all">All Services</option>` +
            state.services.map(s => `<option value="${s.id}">${escapeHTML(s.name)}</option>`).join('');

        elements.todayDateString.textContent = formatDate(getOffsetDateStr(0));
    }

    function renderStaffDashboard() {
        const appts = state.appointments;

        const total = appts.length;
        const confirmed = appts.filter(a => a.status === 'Confirmed').length;
        const inProgress = appts.filter(a => a.status === 'In Progress').length;
        const completed = appts.filter(a => a.status === 'Completed').length;
        const cancelled = appts.filter(a => ['Cancelled', 'No Show'].includes(a.status)).length;

        elements.kpiTotal.textContent = total;
        elements.kpiConfirmed.textContent = confirmed;
        elements.kpiInProgress.textContent = inProgress;
        elements.kpiCompleted.textContent = completed;
        elements.kpiCancelled.textContent = cancelled;

        const sf = state.staffFilters;
        const search = sf.search.toLowerCase().trim();

        const filtered = appts.filter(a => {
            const matchesSearch = !search ||
                a.customerName.toLowerCase().includes(search) ||
                a.customerEmail.toLowerCase().includes(search) ||
                a.appointmentId.toLowerCase().includes(search);
            
            const matchesDate = !sf.date || a.date === sf.date;
            const matchesProvider = sf.provider === 'all' || a.providerId === sf.provider;
            const matchesService = sf.service === 'all' || a.serviceId === sf.service;
            const matchesStatus = sf.status === 'all' || a.status === sf.status;

            return matchesSearch && matchesDate && matchesProvider && matchesService && matchesStatus;
        });

        if (state.staffViewMode === 'list') {
            renderStaffTable(filtered);
        } else {
            renderStaffGrid(filtered);
        }
    }

    function renderStaffTable(appointments) {
        if (appointments.length === 0) {
            elements.staffAppointmentsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; background: var(--bg-secondary); border-radius: 1rem; border: 1px solid var(--border-color);">
                    <i class="fa-solid fa-filter-circle-xmark" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No Appointments Found</h3>
                    <p style="color: var(--text-secondary);">No appointments found in the system matching filters.</p>
                </div>
            `;
            return;
        }

        elements.staffAppointmentsContainer.innerHTML = `
            <div class="table-responsive">
                <table class="staff-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Provider</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appointments.map(a => `
                            <tr data-id="${a.appointmentId}">
                                <td><strong style="color: var(--brand-primary);">${a.appointmentId}</strong></td>
                                <td>
                                    <div><strong>${escapeHTML(a.customerName)}</strong></div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHTML(a.customerEmail)}</div>
                                </td>
                                <td>${escapeHTML(a.serviceName)}</td>
                                <td>${escapeHTML(a.providerName)}</td>
                                <td>${formatDate(a.date)} <br><small><strong>${a.time}</strong> (${a.duration} min)</small></td>
                                <td>
                                    <select class="status-select-inline" data-id="${a.appointmentId}">
                                        <option value="Booked" ${a.status === 'Booked' ? 'selected' : ''}>Booked</option>
                                        <option value="Confirmed" ${a.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                        <option value="In Progress" ${a.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                        <option value="Completed" ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                        <option value="Cancelled" ${a.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                        <option value="No Show" ${a.status === 'No Show' ? 'selected' : ''}>No Show</option>
                                    </select>
                                </td>
                                <td>
                                    <button class="btn btn-secondary btn-sm view-appt-btn" data-id="${a.appointmentId}">
                                        <i class="fa-solid fa-eye"></i> Details
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderStaffGrid(appointments) {
        if (appointments.length === 0) {
            elements.staffAppointmentsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; background: var(--bg-secondary); border-radius: 1rem; border: 1px solid var(--border-color);">
                    <h3>No Appointments Found</h3>
                </div>
            `;
            return;
        }

        elements.staffAppointmentsContainer.innerHTML = `
            <div class="services-grid">
                ${appointments.map(a => `
                    <div class="appointment-card" data-id="${a.appointmentId}">
                        <div style="width: 100%;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <strong style="color: var(--brand-primary);">${a.appointmentId}</strong>
                                ${getStatusBadgeHTML(a.status)}
                            </div>
                            <h4 style="margin-bottom: 0.25rem;">${escapeHTML(a.customerName)}</h4>
                            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                                ${escapeHTML(a.serviceName)} with <strong>${escapeHTML(a.providerName)}</strong>
                            </p>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
                                <i class="fa-regular fa-calendar"></i> ${formatDate(a.date)} at ${a.time}
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <select class="status-select-inline" data-id="${a.appointmentId}">
                                    <option value="Booked" ${a.status === 'Booked' ? 'selected' : ''}>Booked</option>
                                    <option value="Confirmed" ${a.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                    <option value="In Progress" ${a.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="Completed" ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                    <option value="Cancelled" ${a.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                    <option value="No Show" ${a.status === 'No Show' ? 'selected' : ''}>No Show</option>
                                </select>
                                <button class="btn btn-secondary btn-sm view-appt-btn" data-id="${a.appointmentId}">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function handleStatusUpdate(apptId, newStatus) {
        const appt = state.appointments.find(a => a.appointmentId === apptId);
        if (!appt) return;

        appt.status = newStatus;
        saveAppointments();

        showToast(`Updated ${apptId} status to "${newStatus}"`, 'success');
        renderStaffDashboard();
        renderMyAppointments();
    }

    /* ==========================================================================
       10. DETAILS, RESCHEDULE, AND CANCEL MODALS
       ========================================================================== */
    function openDetailsModal(apptId) {
        const appt = state.appointments.find(a => a.appointmentId === apptId);
        if (!appt) return;

        elements.detailsModalTitle.textContent = `Appointment Details (${appt.appointmentId})`;
        elements.detailsModalBody.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                <div>
                    <h3 style="font-size: 1.2rem;">${escapeHTML(appt.serviceName)}</h3>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">${escapeHTML(appt.providerName)}</span>
                </div>
                ${getStatusBadgeHTML(appt.status)}
            </div>

            <div class="receipt-ticket">
                <div class="receipt-row">
                    <span class="label">Customer Name</span>
                    <span class="value">${escapeHTML(appt.customerName)}</span>
                </div>
                <div class="receipt-row">
                    <span class="label">Email Address</span>
                    <span class="value">${escapeHTML(appt.customerEmail)}</span>
                </div>
                <div class="receipt-row">
                    <span class="label">Phone Number</span>
                    <span class="value">${escapeHTML(appt.customerPhone)}</span>
                </div>
                <div class="receipt-row">
                    <span class="label">Date & Time</span>
                    <span class="value">${formatDate(appt.date)} at ${appt.time}</span>
                </div>
                <div class="receipt-row">
                    <span class="label">Duration & Price</span>
                    <span class="value">${appt.duration} mins (${formatCurrency(appt.price)})</span>
                </div>
                ${appt.notes ? `
                    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color);">
                        <span class="label" style="display: block; margin-bottom: 0.25rem;">Notes / Special Instructions:</span>
                        <p style="font-size: 0.85rem; color: var(--text-primary); font-style: italic;">"${escapeHTML(appt.notes)}"</p>
                    </div>
                ` : ''}
            </div>
        `;

        const isUpcoming = ['Booked', 'Confirmed'].includes(appt.status);
        const isCustomerRole = state.currentUser && state.currentUser.role === 'customer';

        elements.detailsModalFooter.innerHTML = `
            ${(isUpcoming && isCustomerRole) ? `
                <button class="btn btn-outline reschedule-from-modal-btn" data-id="${appt.appointmentId}">
                    <i class="fa-solid fa-arrows-rotate"></i> Reschedule
                </button>
                <button class="btn btn-danger cancel-from-modal-btn" data-id="${appt.appointmentId}">
                    <i class="fa-solid fa-ban"></i> Cancel
                </button>
            ` : ''}
            <button class="btn btn-secondary close-modal-action-btn">Close</button>
        `;

        elements.detailsModal.setAttribute('aria-hidden', 'false');
    }

    function openRescheduleModal(apptId) {
        const appt = state.appointments.find(a => a.appointmentId === apptId);
        if (!appt) return;

        state.activeRescheduleId = apptId;
        elements.rescheduleSubtext.textContent = `Rescheduling "${appt.serviceName}" with ${appt.providerName}`;
        elements.rescheduleDatePicker.value = appt.date;
        elements.rescheduleDatePicker.min = getOffsetDateStr(0);

        renderRescheduleSlots();
        elements.rescheduleModal.setAttribute('aria-hidden', 'false');
    }

    function renderRescheduleSlots() {
        const appt = state.appointments.find(a => a.appointmentId === state.activeRescheduleId);
        if (!appt) return;

        const selectedDate = elements.rescheduleDatePicker.value;
        const slotList = getSlotAvailability(appt.providerId, selectedDate, appt.duration, appt.appointmentId);

        if (slotList.length === 0) {
            elements.rescheduleSlotsGrid.innerHTML = `
                <div class="empty-state-text full-width" style="grid-column: 1 / -1; text-align: center; color: #e11d48;">
                    No slots available on this date for ${escapeHTML(appt.providerName)}. Please choose another day.
                </div>
            `;
            return;
        }

        elements.rescheduleSlotsGrid.innerHTML = slotList.map(slot => {
            const isCurrentApptSlot = (selectedDate === appt.date && slot.time === appt.time);
            return `
                <button type="button" 
                    class="slot-btn ${slot.available ? 'available' : 'booked'}" 
                    data-reschedule-slot="${slot.time}" 
                    ${!slot.available ? 'disabled' : ''}>
                    ${slot.time} ${isCurrentApptSlot ? '(Current)' : ''}
                </button>
            `;
        }).join('');
    }

    function openCancelConfirmModal(apptId) {
        state.activeCancelId = apptId;
        elements.cancelConfirmModal.setAttribute('aria-hidden', 'false');
    }

    /* ==========================================================================
       11. EVENT LISTENERS SETUP & AUTHENTICATION
       ========================================================================== */
    function setupEventListeners() {
        // Theme Toggle
        elements.themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
            updateThemeIcon(nextTheme);
        });

        // Logout Button
        elements.logoutBtn.addEventListener('click', logoutUser);

        // Landing Hub Action Buttons
        elements.gotoCustLoginBtn.addEventListener('click', () => navigateToView('customerLogin'));
        elements.gotoCustRegBtn.addEventListener('click', () => navigateToView('customerRegister'));
        elements.gotoStaffLoginBtn.addEventListener('click', () => navigateToView('staffLogin'));

        // Back to Options Hub buttons
        elements.backToHubBtns.forEach(btn => {
            btn.addEventListener('click', () => navigateToView('loginGate'));
        });

        // Inter-page links
        if (elements.linkToRegister) {
            elements.linkToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToView('customerRegister');
            });
        }

        if (elements.linkToLogin) {
            elements.linkToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToView('customerLogin');
            });
        }

        // Customer Login Form Handler
        elements.customerLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = elements.loginCustEmail.value.trim().toLowerCase();
            const pass = elements.loginCustPass.value.trim();

            elements.custLoginError.textContent = '';

            const user = state.registeredUsers.find(u => u.email.toLowerCase() === email);
            if (user) {
                if (user.password !== pass) {
                    elements.custLoginError.textContent = 'Incorrect password. Please try again.';
                    return;
                }
                state.currentUser = { role: 'customer', name: user.name, email: user.email };
            } else {
                const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
                const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
                state.currentUser = { role: 'customer', name: formattedName || 'Aarav Sharma', email: email };
                
                state.registeredUsers.push({ name: state.currentUser.name, email: email, password: pass });
                saveUsers();
            }

            showToast(`Welcome back, ${state.currentUser.name}!`, 'success');
            navigateToView('customer');
        });

        // Customer Register Form Handler
        elements.customerRegisterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = elements.regCustName.value.trim();
            const email = elements.regCustEmail.value.trim().toLowerCase();
            const pass = elements.regCustPass.value.trim();
            const confirmPass = elements.regCustConfirmPass.value.trim();

            elements.custRegError.textContent = '';

            if (pass !== confirmPass) {
                elements.custRegError.textContent = 'Confirm password must match Enter Password!';
                return;
            }

            if (pass.length < 6) {
                elements.custRegError.textContent = 'Password must be at least 6 characters long.';
                return;
            }

            const existingUser = state.registeredUsers.find(u => u.email.toLowerCase() === email);
            if (existingUser) {
                existingUser.name = name;
                existingUser.password = pass;
            } else {
                state.registeredUsers.push({ name, email, password: pass });
            }
            saveUsers();

            state.currentUser = { role: 'customer', name: name, email: email };
            showToast(`Account registered successfully! Welcome, ${name}.`, 'success');
            navigateToView('customer');
        });

        // Staff Login Form Submission
        elements.staffLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const staffId = elements.loginStaffId.value.trim().toUpperCase();
            const pin = elements.loginStaffPin.value.trim();

            const foundStaff = STAFF_CREDENTIALS.find(s => s.id === staffId && s.pin === pin);
            if (!foundStaff) {
                elements.staffLoginError.textContent = 'Invalid Staff ID or PIN. Use ID: STAFF101 | PIN: 1234';
                return;
            }

            elements.staffLoginError.textContent = '';
            state.currentUser = { role: 'staff', name: foundStaff.name, id: foundStaff.id };
            showToast(`Welcome, ${foundStaff.name}! Staff access granted.`, 'success');
            navigateToView('staff');
        });

        // Customer Navigation Tabs
        elements.custTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                state.customerTab = tab;
                elements.custTabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

                elements.tabCatalog.classList.toggle('active', tab === 'catalog');
                elements.tabMyAppointments.classList.toggle('active', tab === 'my-appointments');

                if (tab === 'my-appointments') {
                    renderMyAppointments();
                }
            });
        });

        // Search & Category Filters
        elements.serviceSearchInput.addEventListener('input', (e) => {
            state.customerSearch = e.target.value;
            elements.clearSearchBtn.classList.toggle('hidden', !e.target.value);
            renderServicesCatalog();
        });

        elements.clearSearchBtn.addEventListener('click', () => {
            elements.serviceSearchInput.value = '';
            state.customerSearch = '';
            elements.clearSearchBtn.classList.add('hidden');
            renderServicesCatalog();
        });

        elements.categoryPills.addEventListener('click', (e) => {
            if (e.target.classList.contains('cat-pill')) {
                document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                state.customerCategory = e.target.dataset.category;
                renderServicesCatalog();
            }
        });

        // Customer Status Filters
        elements.customerStatusTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.status-tab');
            if (btn) {
                document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                state.customerStatusFilter = btn.dataset.status;
                renderMyAppointments();
            }
        });

        // Book Service click
        elements.servicesGrid.addEventListener('click', (e) => {
            const bookBtn = e.target.closest('.book-service-btn');
            if (bookBtn) {
                openBookingModal(bookBtn.dataset.serviceId);
            }
        });

        // Modal Close triggers
        elements.closeBookingModalBtn.addEventListener('click', closeBookingModal);
        elements.closeDetailsModalBtn.addEventListener('click', () => elements.detailsModal.setAttribute('aria-hidden', 'true'));
        elements.closeRescheduleModalBtn.addEventListener('click', () => elements.rescheduleModal.setAttribute('aria-hidden', 'true'));
        elements.cancelRescheduleBtn.addEventListener('click', () => elements.rescheduleModal.setAttribute('aria-hidden', 'true'));
        elements.dismissCancelBtn.addEventListener('click', () => elements.cancelConfirmModal.setAttribute('aria-hidden', 'true'));

        // Wizard Navigation
        elements.nextStepBtn.addEventListener('click', () => {
            if (validateStep(state.bookingWizard.step)) {
                state.bookingWizard.step++;
                updateWizardUI();
            }
        });

        elements.prevStepBtn.addEventListener('click', () => {
            if (state.bookingWizard.step > 1) {
                state.bookingWizard.step--;
                updateWizardUI();
            }
        });

        elements.submitBookingBtn.addEventListener('click', handleBookingSubmission);

        // Step 1 Provider Selection
        elements.providersSelectionGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.provider-select-card');
            if (card) {
                const provId = card.dataset.providerId;
                state.bookingWizard.selectedProvider = state.providers.find(p => p.id === provId);
                state.bookingWizard.selectedSlot = '';
                renderProviderSelection();
            }
        });

        // Step 2 Date Picker
        elements.bookingDatePicker.addEventListener('change', (e) => {
            state.bookingWizard.selectedDate = e.target.value;
            state.bookingWizard.selectedSlot = '';
        });

        // Step 3 Slot Click
        elements.timeSlotsGrid.addEventListener('click', (e) => {
            const slotBtn = e.target.closest('.slot-btn.available');
            if (slotBtn) {
                state.bookingWizard.selectedSlot = slotBtn.dataset.slot;
                document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
                slotBtn.classList.add('selected');
            }
        });

        // Confirmation Actions: Back to Home Button
        elements.backToHomeBtn.addEventListener('click', () => {
            elements.confirmationModal.setAttribute('aria-hidden', 'true');
            switchRoleOrTab('catalog');
        });

        function switchRoleOrTab(tabName) {
            elements.custTabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
            elements.tabCatalog.classList.toggle('active', tabName === 'catalog');
            elements.tabMyAppointments.classList.toggle('active', tabName === 'my-appointments');
        }

        elements.printReceiptBtn.addEventListener('click', () => window.print());
        elements.goToMyApptsBtn.addEventListener('click', () => {
            elements.confirmationModal.setAttribute('aria-hidden', 'true');
            switchRoleOrTab('my-appointments');
            renderMyAppointments();
        });

        // My Appointments Card Actions
        elements.myAppointmentsList.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-appt-btn');
            const reschBtn = e.target.closest('.reschedule-appt-btn');
            const cancelBtn = e.target.closest('.cancel-appt-btn');

            if (viewBtn) openDetailsModal(viewBtn.dataset.id);
            if (reschBtn) openRescheduleModal(reschBtn.dataset.id);
            if (cancelBtn) openCancelConfirmModal(cancelBtn.dataset.id);
        });

        // Details Modal Actions
        elements.detailsModalFooter.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal-action-btn')) {
                elements.detailsModal.setAttribute('aria-hidden', 'true');
            }
            const resch = e.target.closest('.reschedule-from-modal-btn');
            const cancel = e.target.closest('.cancel-from-modal-btn');
            if (resch) {
                elements.detailsModal.setAttribute('aria-hidden', 'true');
                openRescheduleModal(resch.dataset.id);
            }
            if (cancel) {
                elements.detailsModal.setAttribute('aria-hidden', 'true');
                openCancelConfirmModal(cancel.dataset.id);
            }
        });

        // Reschedule Slots Click
        elements.rescheduleDatePicker.addEventListener('change', renderRescheduleSlots);
        elements.rescheduleSlotsGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.slot-btn.available');
            if (btn) {
                document.querySelectorAll('#rescheduleSlotsGrid .slot-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            }
        });

        elements.confirmRescheduleBtn.addEventListener('click', () => {
            const selectedBtn = elements.rescheduleSlotsGrid.querySelector('.slot-btn.selected');
            if (!selectedBtn) {
                elements.errRescheduleSlot.textContent = 'Please select a new available time slot.';
                return;
            }

            const appt = state.appointments.find(a => a.appointmentId === state.activeRescheduleId);
            if (appt) {
                appt.date = elements.rescheduleDatePicker.value;
                appt.time = selectedBtn.dataset.rescheduleSlot;
                saveAppointments();
                showToast(`Appointment ${appt.appointmentId} rescheduled to ${formatDate(appt.date)} at ${appt.time}`, 'success');
                elements.rescheduleModal.setAttribute('aria-hidden', 'true');
                renderMyAppointments();
                renderStaffDashboard();
            }
        });

        // Cancel Confirmation Action
        elements.confirmCancelBtn.addEventListener('click', () => {
            const appt = state.appointments.find(a => a.appointmentId === state.activeCancelId);
            if (appt) {
                appt.status = 'Cancelled';
                saveAppointments();
                showToast(`Appointment ${appt.appointmentId} cancelled.`, 'info');
                elements.cancelConfirmModal.setAttribute('aria-hidden', 'true');
                renderMyAppointments();
                renderStaffDashboard();
            }
        });

        // Staff Dashboard Filters & Actions
        elements.staffSearchInput.addEventListener('input', (e) => {
            state.staffFilters.search = e.target.value;
            renderStaffDashboard();
        });

        elements.staffDateFilter.addEventListener('change', (e) => {
            state.staffFilters.date = e.target.value;
            renderStaffDashboard();
        });

        elements.staffProviderFilter.addEventListener('change', (e) => {
            state.staffFilters.provider = e.target.value;
            renderStaffDashboard();
        });

        elements.staffServiceFilter.addEventListener('change', (e) => {
            state.staffFilters.service = e.target.value;
            renderStaffDashboard();
        });

        elements.staffStatusFilter.addEventListener('change', (e) => {
            state.staffFilters.status = e.target.value;
            renderStaffDashboard();
        });

        elements.resetStaffFiltersBtn.addEventListener('click', () => {
            state.staffFilters = { search: '', date: '', provider: 'all', service: 'all', status: 'all' };
            elements.staffSearchInput.value = '';
            elements.staffDateFilter.value = '';
            elements.staffProviderFilter.value = 'all';
            elements.staffServiceFilter.value = 'all';
            elements.staffStatusFilter.value = 'all';
            renderStaffDashboard();
        });

        elements.viewListBtn.addEventListener('click', () => {
            state.staffViewMode = 'list';
            elements.viewListBtn.classList.add('active');
            elements.viewGridBtn.classList.remove('active');
            renderStaffDashboard();
        });

        elements.viewGridBtn.addEventListener('click', () => {
            state.staffViewMode = 'grid';
            elements.viewGridBtn.classList.add('active');
            elements.viewListBtn.classList.remove('active');
            renderStaffDashboard();
        });

        elements.staffAppointmentsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('status-select-inline')) {
                const apptId = e.target.dataset.id;
                const newStatus = e.target.value;
                handleStatusUpdate(apptId, newStatus);
            }
        });

        elements.staffAppointmentsContainer.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-appt-btn');
            if (viewBtn) openDetailsModal(viewBtn.dataset.id);
        });
    }

    /* ==========================================================================
       12. INITIALIZATION ENTRY POINT
       ========================================================================== */
    function init() {
        initStorage();
        initStaffFiltersOptions();
        setupEventListeners();
        navigateToView('loginGate'); // Always start at Landing Portal Hub
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
