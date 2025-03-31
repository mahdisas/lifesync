// LifeSync - Task Manager
// Handles task management functionality

export class TaskManager {
    constructor(storage) {
        this.storage = storage;
        this.tasks = this.storage.getData('tasks') || [];
    }
    
    // Add new task
    addTask() {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        
        const task = {
            title,
            description,
            dueDate,
            priority,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        const savedTask = this.storage.addItem('tasks', task);
        
        if (savedTask) {
            this.renderTasks();
            window.app.showToast('success', 'Success', 'Task added successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to add task');
            return false;
        }
    }
    
    // Get task by ID
    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }
    
    // Update task
    updateTask(id, updates) {
        const success = this.storage.updateItem('tasks', id, updates);
        
        if (success) {
            this.tasks = this.storage.getData('tasks');
            this.renderTasks();
            window.app.showToast('success', 'Success', 'Task updated successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to update task');
            return false;
        }
    }
    
    // Delete task
    deleteTask(id) {
        const success = this.storage.removeItem('tasks', id);
        
        if (success) {
            this.tasks = this.storage.getData('tasks');
            this.renderTasks();
            window.app.showToast('success', 'Success', 'Task deleted successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to delete task');
            return false;
        }
    }
    
    // Toggle task completion
    toggleTaskCompletion(id) {
        const task = this.getTask(id);
        if (!task) return false;
        
        const updates = {
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : null
        };
        
        return this.updateTask(id, updates);
    }
    
    // Filter tasks
    filterTasks(filter = 'all') {
        const tasksList = document.getElementById('tasks-list');
        const today = new Date().toISOString().split('T')[0];
        
        // Clear current tasks
        tasksList.innerHTML = '';
        
        // Get filtered tasks
        let filteredTasks = [...this.tasks];
        
        switch (filter) {
            case 'today':
                filteredTasks = this.tasks.filter(task => task.dueDate === today && !task.completed);
                break;
            case 'upcoming':
                filteredTasks = this.tasks.filter(task => task.dueDate > today && !task.completed);
                break;
            case 'completed':
                filteredTasks = this.tasks.filter(task => task.completed);
                break;
            default:
                // 'all' - no additional filtering needed
                break;
        }
        
        // Sort tasks by priority and due date
        filteredTasks.sort((a, b) => {
            if (a.completed === b.completed) {
                if (a.priority === b.priority) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                return this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
            }
            return a.completed ? 1 : -1;
        });
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        // Render filtered tasks
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '<li class="placeholder-text">No tasks found</li>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('task-item');
            if (task.completed) li.classList.add('completed');
            
            li.innerHTML = this.getTaskHTML(task);
            
            // Add event listeners
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));
            
            const deleteBtn = li.querySelector('.delete-task');
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(task.id);
                }
            });
            
            tasksList.appendChild(li);
        });
    }
    
    // Get priority value for sorting
    getPriorityValue(priority) {
        switch (priority) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 0;
        }
    }
    
    // Get HTML for a task item
    getTaskHTML(task) {
        const dueDateFormatted = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        
        return `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    <span class="task-date">${dueDateFormatted}</span>
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="delete-task btn-icon" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
    
    // Render all tasks
    renderTasks() {
        this.tasks = this.storage.getData('tasks');
        this.filterTasks('all');
    }
    
    // Render quick tasks (for dashboard)
    renderQuickTasks() {
        const quickTasksList = document.getElementById('quick-tasks-list');
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's incomplete tasks
        const todayTasks = this.tasks.filter(task => 
            task.dueDate === today && !task.completed
        ).sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
        
        // Clear current quick tasks
        quickTasksList.innerHTML = '';
        
        if (todayTasks.length === 0) {
            quickTasksList.innerHTML = '<li class="placeholder-text">No tasks for today</li>';
            return;
        }
        
        // Show up to 5 tasks
        todayTasks.slice(0, 5).forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox">
                <span class="task-priority ${task.priority}"></span>
                <span class="task-title">${task.title}</span>
            `;
            
            // Add event listener for checkbox
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => {
                this.toggleTaskCompletion(task.id);
                window.app.updateDashboard();
            });
            
            quickTasksList.appendChild(li);
        });
        
        // Show count if there are more tasks
        if (todayTasks.length > 5) {
            const li = document.createElement('li');
            li.classList.add('more-tasks');
            li.textContent = `+${todayTasks.length - 5} more tasks`;
            quickTasksList.appendChild(li);
        }
    }
    
    // Get count of pending tasks
    getPendingTasksCount() {
        return this.tasks.filter(task => !task.completed).length;
    }
}
