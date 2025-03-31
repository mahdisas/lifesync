// LifeSync - Calendar Manager
// Handles calendar functionality

export class CalendarManager {
    constructor(storage) {
        this.storage = storage;
        this.events = this.storage.getData('events') || [];
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }
    
    // Add new event
    addEvent() {
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const description = document.getElementById('event-description').value;
        
        const event = {
            title,
            date,
            time,
            description,
            createdAt: new Date().toISOString()
        };
        
        const savedEvent = this.storage.addItem('events', event);
        
        if (savedEvent) {
            this.renderCalendar();
            window.app.showToast('success', 'Success', 'Event added successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to add event');
            return false;
        }
    }
    
    // Get event by ID
    getEvent(id) {
        return this.events.find(event => event.id === id);
    }
    
    // Update event
    updateEvent(id, updates) {
        const success = this.storage.updateItem('events', id, updates);
        
        if (success) {
            this.events = this.storage.getData('events');
            this.renderCalendar();
            window.app.showToast('success', 'Success', 'Event updated successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to update event');
            return false;
        }
    }
    
    // Delete event
    deleteEvent(id) {
        const success = this.storage.removeItem('events', id);
        
        if (success) {
            this.events = this.storage.getData('events');
            this.renderCalendar();
            window.app.showToast('success', 'Success', 'Event deleted successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to delete event');
            return false;
        }
    }
    
    // Navigate to previous month
    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }
    
    // Navigate to next month
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }
    
    // Get days in month
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    
    // Get first day of month (0 = Sunday)
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }
    
    // Get events for a specific date
    getEventsForDate(date) {
        return this.events.filter(event => event.date === date)
            .sort((a, b) => {
                if (!a.time && !b.time) return 0;
                if (!a.time) return 1;
                if (!b.time) return -1;
                return a.time.localeCompare(b.time);
            });
    }
    
    // Format time for display
    formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes} ${period}`;
    }
    
    // Render calendar
    renderCalendar() {
        // Update month/year display
        const monthYearEl = document.getElementById('current-month');
        monthYearEl.textContent = `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Get calendar details
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = new Date();
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDay = this.getFirstDayOfMonth(year, month);
        
        // Get last days of previous month
        const lastMonth = new Date(year, month, 0);
        const daysInLastMonth = lastMonth.getDate();
        
        // Clear calendar
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // Add days from previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayNum = daysInLastMonth - i;
            const dayEl = this.createDayElement(dayNum, 'other-month');
            calendarDays.appendChild(dayEl);
        }
        
        // Add days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = i === today.getDate() && 
                           month === today.getMonth() && 
                           year === today.getFullYear();
            const isSelected = i === this.selectedDate.getDate() && 
                             month === this.selectedDate.getMonth() && 
                             year === this.selectedDate.getFullYear();
            
            const dayEl = this.createDayElement(i, isToday ? 'today' : '', isSelected ? 'selected' : '', date);
            
            // Add event indicator if there are events
            const events = this.getEventsForDate(date);
            if (events.length > 0) {
                dayEl.querySelector('.event-indicators').innerHTML = 
                    '<div class="event-indicator"></div>'.repeat(Math.min(events.length, 3));
            }
            
            calendarDays.appendChild(dayEl);
        }
        
        // Add days from next month
        const totalDays = firstDay + daysInMonth;
        const remainingDays = 42 - totalDays; // 42 = 6 rows × 7 days
        
        for (let i = 1; i <= remainingDays; i++) {
            const dayEl = this.createDayElement(i, 'other-month');
            calendarDays.appendChild(dayEl);
        }
        
        // Update events list for selected date
        this.updateEventsList();
    }
    
    // Create day element
    createDayElement(dayNum, ...classes) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        classes.filter(Boolean).forEach(cls => dayEl.classList.add(cls));
        
        dayEl.innerHTML = `
            <span class="day-number">${dayNum}</span>
            <div class="event-indicators"></div>
        `;
        
        dayEl.addEventListener('click', () => this.selectDate(dayEl));
        
        return dayEl;
    }
    
    // Select a date
    selectDate(dayEl) {
        // Remove selection from previously selected day
        document.querySelectorAll('.calendar-day').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to clicked day
        dayEl.classList.add('selected');
        
        // Update selected date
        const dayNum = parseInt(dayEl.querySelector('.day-number').textContent);
        const isOtherMonth = dayEl.classList.contains('other-month');
        
        if (isOtherMonth) {
            if (dayNum > 20) {
                // Previous month
                this.selectedDate = new Date(this.currentDate.getFullYear(), 
                                          this.currentDate.getMonth() - 1, 
                                          dayNum);
                this.prevMonth();
            } else {
                // Next month
                this.selectedDate = new Date(this.currentDate.getFullYear(), 
                                          this.currentDate.getMonth() + 1, 
                                          dayNum);
                this.nextMonth();
            }
        } else {
            this.selectedDate = new Date(this.currentDate.getFullYear(), 
                                       this.currentDate.getMonth(), 
                                       dayNum);
            this.updateEventsList();
        }
    }
    
    // Update events list for selected date
    updateEventsList() {
        const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
        const events = this.getEventsForDate(selectedDateStr);
        
        // Update selected date display
        const dateStr = this.selectedDate.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('selected-date').textContent = `Events for ${dateStr}`;
        
        // Update events list
        const eventsList = document.getElementById('events-list');
        
        if (events.length === 0) {
            eventsList.innerHTML = '<li class="placeholder-text">No events for this day</li>';
            return;
        }
        
        eventsList.innerHTML = events.map(event => `
            <li class="event-item">
                <div class="event-time">${this.formatTime(event.time)}</div>
                <div class="event-content">
                    <div class="event-title">${event.title}</div>
                    ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                </div>
                <div class="event-actions">
                    <button class="btn-icon delete-event" data-id="${event.id}" title="Delete event">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');
        
        // Add event listeners for delete buttons
        eventsList.querySelectorAll('.delete-event').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this event?')) {
                    this.deleteEvent(btn.dataset.id);
                }
            });
        });
    }
    
    // Render upcoming events (for dashboard)
    renderUpcomingEvents() {
        const upcomingEvents = document.getElementById('upcoming-events');
        const today = new Date().toISOString().split('T')[0];
        
        // Get next 5 upcoming events
        const futureEvents = this.events
            .filter(event => event.date >= today)
            .sort((a, b) => {
                if (a.date === b.date) {
                    if (!a.time && !b.time) return 0;
                    if (!a.time) return 1;
                    if (!b.time) return -1;
                    return a.time.localeCompare(b.time);
                }
                return a.date.localeCompare(b.date);
            })
            .slice(0, 5);
        
        if (futureEvents.length === 0) {
            upcomingEvents.innerHTML = '<li class="placeholder-text">No upcoming events</li>';
            return;
        }
        
        upcomingEvents.innerHTML = futureEvents.map(event => {
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            });
            
            return `
                <li class="event-item">
                    <div class="event-date">${dateStr}</div>
                    <div class="event-time">${this.formatTime(event.time)}</div>
                    <div class="event-title">${event.title}</div>
                </li>
            `;
        }).join('');
    }
    
    // Get count of today's events
    getTodayEventsCount() {
        const today = new Date().toISOString().split('T')[0];
        return this.events.filter(event => event.date === today).length;
    }
}
