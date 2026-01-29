const API_V1 = '/api/v1';

// Theme & UI Utils
const ui = {
    $(selector) { return document.querySelector(selector); },

    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = 'ri-information-line';
        if (type === 'success') icon = 'ri-checkbox-circle-line';
        if (type === 'error') icon = 'ri-error-warning-line';

        toast.innerHTML = `
            <i class="${icon}" style="font-size: 1.25rem;"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Trigger reflow
        toast.offsetHeight;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    },

    setLoading(btn, isLoading) {
        if (isLoading) {
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = `<div class="spinner"></div> Processing...`;
            btn.disabled = true;
            btn.style.opacity = '0.7';
        } else {
            btn.innerHTML = btn.dataset.originalText;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }
};

// API Service
const api = {
    headers() {
        const token = localStorage.getItem('access_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },

    async request(endpoint, options = {}) {
        const url = `${API_V1}${endpoint}`;
        const headers = { ...options.headers };

        // Add auth header if not login/register
        if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
            const token = localStorage.getItem('access_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle token expiry
                if (response.status === 401 && !url.includes('/auth/login')) {
                    auth.logout();
                }
                throw new Error(data.detail || 'Something went wrong');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }
};

// Auth Logic
const auth = {
    async login(email, password) {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        // Uses fetch directly because of FormData
        const response = await fetch(`${API_V1}/auth/login`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        // Dispatch event for UI updates
        window.dispatchEvent(new Event('auth-change'));
        return data;
    },

    async register(userData) {
        return await api.request('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
    },

    async getProfile() {
        return await api.request('/student/profile');
    },

    logout() {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    },

    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    }
};

// Page Initializers
document.addEventListener('DOMContentLoaded', () => {
    // Check Health
    checkSystemHealth();

    // Check Auth State on Load
    const path = window.location.pathname;
    const isAuth = auth.isAuthenticated();

    // Guest guards
    if ((path === '/login' || path === '/register') && isAuth) {
        window.location.href = '/dashboard';
    }

    // Protected guards
    if (path === '/dashboard' && !isAuth) {
        window.location.href = '/login';
    }

    // Initialize Login Page
    const loginForm = ui.$('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const email = ui.$('#email').value;
            const password = ui.$('#password').value;

            ui.setLoading(btn, true);
            try {
                await auth.login(email, password);
                ui.showToast('Welcome back!', 'success');
                setTimeout(() => window.location.href = '/dashboard', 1000);
            } catch (err) {
                ui.showToast(err.message, 'error');
                ui.setLoading(btn, false);
            }
        });
    }

    // Initialize Register Page
    const registerForm = ui.$('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');

            const userData = {
                first_name: ui.$('#fn').value,
                last_name: ui.$('#ln').value,
                email: ui.$('#email').value,
                phone: ui.$('#phone').value,
                password: ui.$('#password').value
            };

            ui.setLoading(btn, true);
            try {
                await auth.register(userData);
                ui.showToast('Account created! Redirecting...', 'success');
                setTimeout(() => window.location.href = '/login', 1500);
            } catch (err) {
                ui.showToast(err.message, 'error');
                ui.setLoading(btn, false);
            }
        });
    }

    // Initialize Dashboard
    if (path === '/dashboard' || ui.$('#profileSection')) {
        loadDashboardProfile();
    }
});

// Health Helper
async function checkSystemHealth() {
    const statusEl = document.getElementById('sysStatus');
    const dotEl = document.getElementById('sysDot');
    if (!statusEl) return;

    try {
        const res = await fetch(`${API_V1}/health`);
        if (res.ok) {
            const data = await res.json();
            if (data.status === 'online') {
                statusEl.innerText = 'System Online';
                statusEl.style.color = 'var(--success)';
                dotEl.style.backgroundColor = 'var(--success)';
                dotEl.style.boxShadow = '0 0 10px var(--success)';
            }
        }
    } catch (e) {
        statusEl.innerText = 'System Offline';
        statusEl.style.color = 'var(--error)';
        dotEl.style.backgroundColor = 'var(--error)';
    }
}

async function loadDashboardProfile() {
    try {
        const user = await auth.getProfile();
        if (user) {
            // Safe DOM updates
            const set = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            };

            set('welcomeName', `Hi, ${user.first_name}`);
            set('dispName', `${user.first_name} ${user.last_name}`);
            set('dispEmail', user.email);
            set('dispPhone', user.phone);
            set('roleBadge', user.role ? user.role.toUpperCase() : 'STUDENT');
        }
    } catch (err) {
        console.error(err);
        ui.showToast('Failed to load profile', 'error');
    }
}
