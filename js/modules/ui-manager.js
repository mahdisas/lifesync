// LifeSync - UI Manager
// Handles general UI interactions and utilities

export class UIManager {
    constructor(app) {
        this.app = app;
        this.setupListeners();
        this.setupResizeHandler();
    }
    
    // Set up event listeners
    setupListeners() {
        // Handle mobile menu toggle
        this.setupMobileMenu();
        
        // Handle modals
        this.setupModals();
        
        // Handle form submissions
        this.setupForms();
        
        // Handle keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    // Set up mobile menu functionality
    setupMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.getElementById('mobile-menu-toggle');
        
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('mobile-open') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
    
    // Set up modal functionality
    setupModals() {
        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.hideModal(activeModal.id);
                }
            }
        });
        
        // Reset form when closing modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                }
            });
        });
    }
    
    // Set up form handling
    setupForms() {
        // Prevent default form submission
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        });
        
        // Handle input validation
        document.querySelectorAll('input[required], textarea[required]').forEach(input => {
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                this.showInputError(input);
            });
            
            input.addEventListener('input', () => {
                this.clearInputError(input);
            });
        });
    }
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when no modal is open
            if (document.querySelector('.modal.active')) {
                return;
            }
            
            // Ctrl/Cmd + key shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 't':
                        e.preventDefault();
                        this.app.showModal('task-modal');
                        break;
                    case 'n':
                        e.preventDefault();
                        this.app.showModal('note-modal');
                        break;
                    case 'e':
                        e.preventDefault();
                        this.app.showModal('event-modal');
                        break;
                }
            }
        });
    }
    
    // Set up resize handler
    setupResizeHandler() {
        let resizeTimer;
        
        window.addEventListener('resize', () => {
            // Add resize class during resize
            document.body.classList.add('resizing');
            
            // Clear previous timeout
            clearTimeout(resizeTimer);
            
            // Remove resize class after resize is complete
            resizeTimer = setTimeout(() => {
                document.body.classList.remove('resizing');
                this.handleResize();
            }, 250);
        });
    }
    
    // Handle window resize
    handleResize() {
        const isMobile = window.innerWidth < 768;
        const sidebar = document.querySelector('.sidebar');
        
        if (isMobile) {
            sidebar.classList.remove('mobile-open');
        }
        
        // Adjust calendar grid
        this.adjustCalendarGrid();
        
        // Refresh charts
        if (this.app.finance.chart) {
            this.app.finance.renderCharts();
        }
    }
    
    // Adjust calendar grid for better mobile display
    adjustCalendarGrid() {
        const calendarDays = document.getElementById('calendar-days');
        if (!calendarDays) return;
        
        const isMobile = window.innerWidth < 768;
        const gridGap = isMobile ? 2 : 5;
        
        calendarDays.style.gap = gridGap + 'px';
    }
    
    // Show input error
    showInputError(input) {
        input.classList.add('error');
        
        const errorMessage = input.dataset.errorMessage || 'This field is required';
        
        let errorEl = input.nextElementSibling;
        if (!errorEl || !errorEl.classList.contains('error-message')) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            input.parentNode.insertBefore(errorEl, input.nextSibling);
        }
        
        errorEl.textContent = errorMessage;
    }
    
    // Clear input error
    clearInputError(input) {
        input.classList.remove('error');
        
        const errorEl = input.nextElementSibling;
        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.remove();
        }
    }
    
    // Show loading spinner
    showLoading(container) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        
        container.appendChild(spinner);
    }
    
    // Hide loading spinner
    hideLoading(container) {
        const spinner = container.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
    
    // Format date for display
    formatDate(date, format = 'long') {
        if (!date) return '';
        
        const d = new Date(date);
        
        switch (format) {
            case 'short':
                return d.toLocaleDateString();
            case 'medium':
                return d.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            case 'long':
                return d.toLocaleDateString(undefined, { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                });
            default:
                return d.toLocaleDateString();
        }
    }
    
    // Format time for display
    formatTime(time, format = '12h') {
        if (!time) return '';
        
        const [hours, minutes] = time.split(':');
        const d = new Date();
        d.setHours(parseInt(hours));
        d.setMinutes(parseInt(minutes));
        
        switch (format) {
            case '12h':
                return d.toLocaleTimeString(undefined, { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
            case '24h':
                return d.toLocaleTimeString(undefined, { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                });
            default:
                return time;
        }
    }
    
    // Format currency for display
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    // Show confirmation dialog
    showConfirmation(message) {
        return new Promise((resolve) => {
            const confirmed = window.confirm(message);
            resolve(confirmed);
        });
    }
    
    // Show custom dialog
    showDialog(options) {
        const dialog = document.createElement('div');
        dialog.className = 'modal custom-dialog active';
        
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${options.title}</h3>
                    ${options.showClose ? '<button class="close-modal">&times;</button>' : ''}
                </div>
                <div class="modal-body">
                    ${options.message}
                </div>
                <div class="modal-footer">
                    ${options.buttons.map(btn => `
                        <button class="btn ${btn.class || 'secondary'}" data-action="${btn.action}">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        return new Promise((resolve) => {
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.remove();
                    resolve(null);
                }
            });
            
            dialog.querySelectorAll('.modal-footer button').forEach(btn => {
                btn.addEventListener('click', () => {
                    dialog.remove();
                    resolve(btn.dataset.action);
                });
            });
            
            if (options.showClose) {
                dialog.querySelector('.close-modal').addEventListener('click', () => {
                    dialog.remove();
                    resolve(null);
                });
            }
        });
    }
}
