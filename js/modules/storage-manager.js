// LifeSync - Storage Manager
// Handles data persistence using localStorage

export class StorageManager {
    constructor() {
        this.storageKey = 'lifesync_data';
        this.data = this.loadData();
    }
    
    // Load data from localStorage
    loadData() {
        const savedData = localStorage.getItem(this.storageKey);
        
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (error) {
                console.error('Error parsing saved data:', error);
                return this.getDefaultData();
            }
        } else {
            return this.getDefaultData();
        }
    }
    
    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }
    
    // Get default data structure
    getDefaultData() {
        return {
            tasks: [],
            notes: [],
            events: [],
            transactions: [],
            settings: {
                darkMode: false,
                colorTheme: 'blue',
                notifications: {
                    tasks: true,
                    events: true
                }
            },
            smartPlanner: {
                apiKey: '',
                preferences: {
                    productivityHours: 'morning',
                    breakFrequency: 'pomodoro',
                    workLifeBalance: 5
                }
            },
            finance: {
                budget: 1000,
                incomeCategories: [
                    'Salary',
                    'Freelance',
                    'Investments',
                    'Gifts',
                    'Other'
                ],
                expenseCategories: [
                    'Housing',
                    'Food',
                    'Transportation',
                    'Utilities',
                    'Entertainment',
                    'Healthcare',
                    'Shopping',
                    'Education',
                    'Personal Care',
                    'Other'
                ]
            }
        };
    }
    
    // Get data by key
    getData(key) {
        return this.data[key];
    }
    
    // Set data by key
    setData(key, value) {
        this.data[key] = value;
        return this.saveData();
    }
    
    // Update data by key (for objects)
    updateData(key, updates) {
        this.data[key] = { ...this.data[key], ...updates };
        return this.saveData();
    }
    
    // Add item to array data
    addItem(key, item) {
        if (!Array.isArray(this.data[key])) {
            this.data[key] = [];
        }
        
        // Generate a unique ID if not provided
        if (!item.id) {
            item.id = this.generateId();
        }
        
        this.data[key].push(item);
        return this.saveData() ? item : null;
    }
    
    // Update item in array data
    updateItem(key, id, updates) {
        if (!Array.isArray(this.data[key])) {
            return false;
        }
        
        const index = this.data[key].findIndex(item => item.id === id);
        
        if (index === -1) {
            return false;
        }
        
        this.data[key][index] = { ...this.data[key][index], ...updates };
        return this.saveData();
    }
    
    // Remove item from array data
    removeItem(key, id) {
        if (!Array.isArray(this.data[key])) {
            return false;
        }
        
        const initialLength = this.data[key].length;
        this.data[key] = this.data[key].filter(item => item.id !== id);
        
        if (initialLength === this.data[key].length) {
            return false; // No item was removed
        }
        
        return this.saveData();
    }
    
    // Generate a unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Export data as JSON file
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'lifesync_backup_' + new Date().toISOString().split('T')[0] + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Import data from JSON file
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            
            if (!file) {
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = event => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    this.data = importedData;
                    
                    if (this.saveData()) {
                        alert('Data imported successfully. The page will reload to apply changes.');
                        window.location.reload();
                    } else {
                        alert('Error saving imported data.');
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    alert('Error importing data. Please make sure the file is a valid LifeSync backup.');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Clear all data
    clearData() {
        localStorage.removeItem(this.storageKey);
        this.data = this.getDefaultData();
        return true;
    }
}
