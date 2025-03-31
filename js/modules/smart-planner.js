// LifeSync - Smart Planner
// Handles AI-powered schedule optimization using Gemini API

export class SmartPlanner {
    constructor(storage) {
        this.storage = storage;
        this.smartPlanner = this.storage.getData('smartPlanner') || {};
        this.tasks = this.storage.getData('tasks') || [];
        this.events = this.storage.getData('events') || [];
    }
    
    // Save Gemini API key
    saveApiKey() {
        const apiKey = document.getElementById('gemini-api-key').value.trim();
        
        if (!apiKey) {
            window.app.showToast('error', 'Error', 'Please enter an API key');
            return false;
        }
        
        this.smartPlanner.apiKey = apiKey;
        const success = this.storage.updateData('smartPlanner', { apiKey });
        
        if (success) {
            // Hide API setup and show preferences
            document.getElementById('api-setup').style.display = 'none';
            document.getElementById('planner-preferences').style.display = 'block';
            
            window.app.showToast('success', 'Success', 'API key saved successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to save API key');
            return false;
        }
    }
    
    // Update preferences
    updatePreferences() {
        const preferences = {
            productivityHours: document.getElementById('productivity-hours').value,
            breakFrequency: document.getElementById('break-frequency').value,
            workLifeBalance: parseInt(document.getElementById('work-life-balance').value)
        };
        
        this.smartPlanner.preferences = preferences;
        const success = this.storage.updateData('smartPlanner', { preferences });
        
        if (success) {
            window.app.showToast('success', 'Success', 'Preferences updated successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to update preferences');
            return false;
        }
    }
    
    // Generate optimized schedule
    async generatePlan() {
        if (!this.smartPlanner.apiKey) {
            window.app.showToast('error', 'Error', 'Please set up your Gemini API key first');
            return;
        }
        
        const planContainer = document.getElementById('generated-plan');
        const timeline = document.getElementById('ai-timeline');
        
        try {
            // Show loading state
            planContainer.style.display = 'block';
            timeline.innerHTML = '<div class="loading">Generating your optimized schedule...</div>';
            
            // Get today's date
            const today = new Date().toISOString().split('T')[0];
            
            // Get tasks and events
            const todayTasks = this.tasks.filter(task => 
                !task.completed && (!task.dueDate || task.dueDate >= today)
            );
            
            const todayEvents = this.events.filter(event => 
                event.date === today
            );
            
            // Get user preferences
            const preferences = this.smartPlanner.preferences;
            
            // Prepare data for AI
            const prompt = {
                tasks: todayTasks.map(task => ({
                    title: task.title,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    description: task.description
                })),
                events: todayEvents.map(event => ({
                    title: event.title,
                    time: event.time,
                    description: event.description
                })),
                preferences: {
                    productivityHours: preferences.productivityHours,
                    breakFrequency: preferences.breakFrequency,
                    workLifeBalance: preferences.workLifeBalance
                }
            };
            
            // Call Gemini API
            const response = await this.callGeminiAPI(prompt);
            
            // Process and display the schedule
            this.displaySchedule(response);
            
        } catch (error) {
            console.error('Error generating schedule:', error);
            timeline.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to generate schedule. Please try again later.</p>
                </div>
            `;
            window.app.showToast('error', 'Error', 'Failed to generate schedule');
        }
    }
    
    // Call Gemini API
    async callGeminiAPI(prompt) {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        
        const response = await fetch(`${apiUrl}?key=${this.smartPlanner.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `As an AI schedule optimizer, create an optimized daily schedule based on the following tasks, events, and preferences. Consider task priorities, due dates, and the user's preferred working hours and break patterns.

Tasks:
${prompt.tasks.map(task => 
    `- ${task.title} (Priority: ${task.priority}${task.dueDate ? `, Due: ${task.dueDate}` : ''})`
).join('\n')}

Events:
${prompt.events.map(event => 
    `- ${event.title} at ${event.time || 'flexible time'}`
).join('\n')}

Preferences:
- Productivity Hours: ${prompt.preferences.productivityHours}
- Break Frequency: ${prompt.preferences.breakFrequency}
- Work-Life Balance: ${prompt.preferences.workLifeBalance}/10

Please generate a detailed schedule that:
1. Accounts for fixed events
2. Allocates tasks during optimal productivity hours
3. Includes appropriate breaks
4. Maintains work-life balance
5. Provides specific time slots for each activity
6. Includes brief explanations for the scheduling decisions

Format the response as a JSON array of schedule items, where each item has:
- time: "HH:MM" (24-hour format)
- title: "Activity title"
- type: "event", "task", "break", or "suggestion"
- description: "Brief explanation or context"
`}]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error('API call failed');
        }
        
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
    }
    
    // Display generated schedule
    displaySchedule(schedule) {
        const timeline = document.getElementById('ai-timeline');
        
        if (!Array.isArray(schedule) || schedule.length === 0) {
            timeline.innerHTML = '<div class="placeholder-text">No schedule generated</div>';
            return;
        }
        
        timeline.innerHTML = schedule.map(item => `
            <div class="timeline-item">
                <div class="timeline-time">${this.formatTime(item.time)}</div>
                <div class="timeline-dot">
                    <i class="fas fa-${this.getTimelineIcon(item.type)}"></i>
                </div>
                <div class="timeline-content ${item.type}">
                    <div class="timeline-title">${item.title}</div>
                    <div class="timeline-description">${item.description}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Format time for display
    formatTime(time) {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        
        return date.toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
    // Get icon for timeline item
    getTimelineIcon(type) {
        switch (type) {
            case 'event':
                return 'calendar';
            case 'task':
                return 'tasks';
            case 'break':
                return 'coffee';
            case 'suggestion':
                return 'lightbulb';
            default:
                return 'circle';
        }
    }
}
