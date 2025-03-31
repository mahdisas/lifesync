// LifeSync - Settings Manager
// Handles application settings and preferences

export class SettingsManager {
    constructor(storage) {
        this.storage = storage;
        this.settings = this.storage.getData('settings') || {};
    }
    
    // Apply saved settings on app load
    applySettings() {
        // Apply dark mode
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('dark-mode-toggle').checked = true;
        }
        
        // Apply color theme
        this.setColorTheme(this.settings.colorTheme || 'blue', false);
        
        // Apply notification settings
        if (this.settings.notifications) {
            document.getElementById('task-notifications').checked = 
                this.settings.notifications.tasks;
            document.getElementById('event-notifications').checked = 
                this.settings.notifications.events;
        }
    }
    
    // Toggle dark mode
    toggleDarkMode() {
        const isDarkMode = document.getElementById('dark-mode-toggle').checked;
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        this.updateSettings({ darkMode: isDarkMode });
    }
    
    // Set color theme
    setColorTheme(theme, save = true) {
        // Remove existing theme classes
        document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
        
        // Add new theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Update active theme button
        document.querySelectorAll('.color-theme').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // Update CSS variables
        const root = document.documentElement;
        switch (theme) {
            case 'blue':
                root.style.setProperty('--primary-color', '#4361ee');
                root.style.setProperty('--primary-light', '#738eef');
                root.style.setProperty('--primary-dark', '#2f4ad0');
                break;
            case 'green':
                root.style.setProperty('--primary-color', '#2ec4b6');
                root.style.setProperty('--primary-light', '#3ddecf');
                root.style.setProperty('--primary-dark', '#25a99d');
                break;
            case 'purple':
                root.style.setProperty('--primary-color', '#7209b7');
                root.style.setProperty('--primary-light', '#8b0fd8');
                root.style.setProperty('--primary-dark', '#5c079a');
                break;
            case 'orange':
                root.style.setProperty('--primary-color', '#f77f00');
                root.style.setProperty('--primary-light', '#ff8b0d');
                root.style.setProperty('--primary-dark', '#d86d00');
                break;
        }
        
        if (save) {
            this.updateSettings({ colorTheme: theme });
        }
    }
    
    // Update notification settings
    updateNotifications() {
        const notifications = {
            tasks: document.getElementById('task-notifications').checked,
            events: document.getElementById('event-notifications').checked
        };
        
        this.updateSettings({ notifications });
    }
    
    // Update settings in storage
    updateSettings(updates) {
        this.settings = { ...this.settings, ...updates };
        const success = this.storage.updateData('settings', this.settings);
        
        if (success) {
            window.app.showToast('success', 'Success', 'Settings updated successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to update settings');
            return false;
        }
    }
    
    // Check if notifications are enabled
    areNotificationsEnabled(type) {
        return this.settings.notifications?.[type] ?? true;
    }
    
    // Show notification
    showNotification(title, body) {
        // Check if browser supports notifications
        if (!("Notification" in window)) {
            return;
        }
        
        // Check if permission is granted
        if (Notification.permission === "granted") {
            this.createNotification(title, body);
        }
        // Request permission if not decided
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.createNotification(title, body);
                }
            });
        }
    }
    
    // Create notification
    createNotification(title, body) {
        const notification = new Notification(title, {
            body: body,
            icon: '/favicon.ico'
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
    
    // Check for upcoming events and tasks
    checkNotifications() {
        if (!this.areNotificationsEnabled('events') && 
            !this.areNotificationsEnabled('tasks')) {
            return;
        }
        
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Check events
        if (this.areNotificationsEnabled('events')) {
            const events = this.storage.getData('events') || [];
            events.forEach(event => {
                if (event.date === today && event.time) {
                    const eventTime = new Date(`${event.date}T${event.time}`);
                    const timeDiff = eventTime - now;
                    
                    // Notify 15 minutes before event
                    if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
                        this.showNotification(
                            'Upcoming Event',
                            `${event.title} starts in ${Math.round(timeDiff / 60000)} minutes`
                        );
                    }
                }
            });
        }
        
        // Check tasks
        if (this.areNotificationsEnabled('tasks')) {
            const tasks = this.storage.getData('tasks') || [];
            tasks.forEach(task => {
                if (!task.completed && task.dueDate === today) {
                    this.showNotification(
                        'Task Due Today',
                        task.title
                    );
                }
            });
        }
    }
    
    // Start notification checker
    startNotificationChecker() {
        // Check every minute
        setInterval(() => this.checkNotifications(), 60000);
    }
}
