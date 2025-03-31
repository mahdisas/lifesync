// LifeSync - Life Management App
// Main JavaScript file

// Import modules
import { TaskManager } from './modules/task-manager.js';
import { NoteManager } from './modules/note-manager.js';
import { CalendarManager } from './modules/calendar-manager.js';
import { FinanceManager } from './modules/finance-manager.js';
import { SmartPlanner } from './modules/smart-planner.js';
import { SettingsManager } from './modules/settings-manager.js';
import { UIManager } from './modules/ui-manager.js';
import { StorageManager } from './modules/storage-manager.js';

// Main App Class
class LifeSyncApp {
    constructor() {
        // Initialize storage manager first to load saved data
        this.storage = new StorageManager();
        
        // Initialize managers with stored data
        this.tasks = new TaskManager(this.storage);
        this.notes = new NoteManager(this.storage);
        this.calendar = new CalendarManager(this.storage);
        this.finance = new FinanceManager(this.storage);
        this.smartPlanner = new SmartPlanner(this.storage);
        this.settings = new SettingsManager(this.storage);
        
        // Initialize UI manager last
        this.ui = new UIManager(this);
        
        // Initialize the app
        this.init();
    }
    
    init() {
        // Apply saved settings
        this.settings.applySettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update dashboard
        this.updateDashboard();
        
        // Display current date
        this.displayCurrentDate();
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateToPage(item.dataset.page);
            });
        });
        
        // Mobile menu toggle
        document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('mobile-open');
        });
        
        // Quick task
        document.getElementById('add-quick-task').addEventListener('click', () => {
            this.showModal('task-modal');
        });
        
        // Tasks
        document.getElementById('add-task').addEventListener('click', () => {
            this.showModal('task-modal');
        });
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.tasks.addTask();
            this.hideModal('task-modal');
            this.updateDashboard();
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.tasks.filterTasks(btn.dataset.filter);
            });
        });
        
        // Notes
        document.getElementById('add-note').addEventListener('click', () => {
            this.showModal('note-modal');
        });
        document.getElementById('note-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.notes.addNote();
            this.hideModal('note-modal');
        });
        document.querySelectorAll('.note-color').forEach(color => {
            color.addEventListener('click', () => {
                document.querySelectorAll('.note-color').forEach(c => c.classList.remove('active'));
                color.classList.add('active');
            });
        });
        
        // Calendar
        document.getElementById('add-event').addEventListener('click', () => {
            this.showModal('event-modal');
        });
        document.getElementById('event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calendar.addEvent();
            this.hideModal('event-modal');
            this.calendar.renderCalendar();
            this.updateDashboard();
        });
        document.getElementById('prev-month').addEventListener('click', () => {
            this.calendar.prevMonth();
        });
        document.getElementById('next-month').addEventListener('click', () => {
            this.calendar.nextMonth();
        });
        
        // Finance
        document.getElementById('add-income').addEventListener('click', () => {
            document.getElementById('transaction-type').value = 'income';
            document.getElementById('transaction-modal-title').textContent = 'Add Income';
            this.finance.populateCategories('income');
            this.showModal('transaction-modal');
        });
        document.getElementById('add-expense').addEventListener('click', () => {
            document.getElementById('transaction-type').value = 'expense';
            document.getElementById('transaction-modal-title').textContent = 'Add Expense';
            this.finance.populateCategories('expense');
            this.showModal('transaction-modal');
        });
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.finance.addTransaction();
            this.hideModal('transaction-modal');
            this.updateDashboard();
        });
        
        // Smart Planner
        document.getElementById('save-api-key').addEventListener('click', () => {
            this.smartPlanner.saveApiKey();
        });
        document.getElementById('generate-plan').addEventListener('click', () => {
            this.smartPlanner.generatePlan();
        });
        
        // Settings
        document.getElementById('dark-mode-toggle').addEventListener('change', () => {
            this.settings.toggleDarkMode();
        });
        document.querySelectorAll('.color-theme').forEach(theme => {
            theme.addEventListener('click', () => {
                this.settings.setColorTheme(theme.dataset.theme);
            });
        });
        document.getElementById('export-data').addEventListener('click', () => {
            this.storage.exportData();
        });
        document.getElementById('import-data').addEventListener('click', () => {
            this.storage.importData();
        });
        document.getElementById('clear-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                this.storage.clearData();
                window.location.reload();
            }
        });
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            });
        });
        
        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
    
    navigateToPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        document.getElementById(pageId).classList.add('active');
        
        // Update active menu item
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.sidebar-menu li[data-page="${pageId}"]`).classList.add('active');
        
        // Close mobile menu if open
        document.querySelector('.sidebar').classList.remove('mobile-open');
        
        // Special actions for specific pages
        if (pageId === 'calendar') {
            this.calendar.renderCalendar();
        } else if (pageId === 'finance') {
            this.finance.renderCharts();
        }
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
    
    updateDashboard() {
        // Update task count
        const pendingTasks = this.tasks.getPendingTasksCount();
        document.getElementById('pending-tasks').textContent = pendingTasks;
        
        // Update event count
        const todayEvents = this.calendar.getTodayEventsCount();
        document.getElementById('today-events').textContent = todayEvents;
        
        // Update budget
        const budgetRemaining = this.finance.getBudgetRemaining();
        document.getElementById('budget-remaining').textContent = budgetRemaining;
        
        // Update quick tasks list
        this.tasks.renderQuickTasks();
        
        // Update upcoming events
        this.calendar.renderUpcomingEvents();
    }
    
    displayCurrentDate() {
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const currentDate = new Date().toLocaleDateString(undefined, dateOptions);
        document.querySelectorAll('.date-display').forEach(el => {
            el.textContent = currentDate;
        });
    }
    
    showToast(type, title, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '';
        switch (type) {
            case 'success':
                icon = 'check-circle';
                break;
            case 'error':
                icon = 'exclamation-circle';
                break;
            case 'info':
                icon = 'info-circle';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                break;
        }
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LifeSyncApp();
});
