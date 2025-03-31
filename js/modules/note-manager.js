// LifeSync - Note Manager
// Handles note management functionality

export class NoteManager {
    constructor(storage) {
        this.storage = storage;
        this.notes = this.storage.getData('notes') || [];
        this.containerEl = document.getElementById('notes-container');
    }
    
    // Add new note
    addNote() {
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        const color = document.querySelector('.note-color.active').dataset.color;
        
        const note = {
            title,
            content,
            color,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const savedNote = this.storage.addItem('notes', note);
        
        if (savedNote) {
            this.renderNotes();
            window.app.showToast('success', 'Success', 'Note added successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to add note');
            return false;
        }
    }
    
    // Get note by ID
    getNote(id) {
        return this.notes.find(note => note.id === id);
    }
    
    // Update note
    updateNote(id, updates) {
        updates.updatedAt = new Date().toISOString();
        const success = this.storage.updateItem('notes', id, updates);
        
        if (success) {
            this.notes = this.storage.getData('notes');
            this.renderNotes();
            window.app.showToast('success', 'Success', 'Note updated successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to update note');
            return false;
        }
    }
    
    // Delete note
    deleteNote(id) {
        const success = this.storage.removeItem('notes', id);
        
        if (success) {
            this.notes = this.storage.getData('notes');
            this.renderNotes();
            window.app.showToast('success', 'Success', 'Note deleted successfully');
            return true;
        } else {
            window.app.showToast('error', 'Error', 'Failed to delete note');
            return false;
        }
    }
    
    // Edit note
    editNote(id) {
        const note = this.getNote(id);
        if (!note) return;
        
        // Set form values
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        
        // Set color
        document.querySelectorAll('.note-color').forEach(colorEl => {
            if (colorEl.dataset.color === note.color) {
                colorEl.classList.add('active');
            } else {
                colorEl.classList.remove('active');
            }
        });
        
        // Show modal
        window.app.showModal('note-modal');
        
        // Update form submission handler
        const form = document.getElementById('note-form');
        const originalSubmitHandler = form.onsubmit;
        
        form.onsubmit = (e) => {
            e.preventDefault();
            
            const updates = {
                title: document.getElementById('note-title').value,
                content: document.getElementById('note-content').value,
                color: document.querySelector('.note-color.active').dataset.color
            };
            
            this.updateNote(id, updates);
            window.app.hideModal('note-modal');
            
            // Restore original handler
            form.onsubmit = originalSubmitHandler;
        };
    }
    
    // Render all notes
    renderNotes() {
        this.notes = this.storage.getData('notes');
        
        // Clear container
        this.containerEl.innerHTML = '';
        
        if (this.notes.length === 0) {
            this.containerEl.innerHTML = '<div class="placeholder-text">No notes yet. Click "Add Note" to create one.</div>';
            return;
        }
        
        // Sort notes by updated date (newest first)
        const sortedNotes = [...this.notes].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        sortedNotes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'card note-card';
            noteEl.style.backgroundColor = note.color;
            
            const isDarkColor = this.isColorDark(note.color);
            if (isDarkColor) {
                noteEl.classList.add('dark-note');
            }
            
            noteEl.innerHTML = this.getNoteHTML(note);
            
            // Add event listeners
            noteEl.querySelector('.edit-note').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editNote(note.id);
            });
            
            noteEl.querySelector('.delete-note').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this note?')) {
                    this.deleteNote(note.id);
                }
            });
            
            this.containerEl.appendChild(noteEl);
        });
    }
    
    // Get HTML for a note card
    getNoteHTML(note) {
        const date = new Date(note.updatedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="card-body">
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-actions">
                        <button class="edit-note btn-icon" title="Edit note">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-note btn-icon" title="Delete note">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${this.formatNoteContent(note.content)}</div>
                <div class="note-date">${date}</div>
            </div>
        `;
    }
    
    // Format note content (convert line breaks to paragraphs)
    formatNoteContent(content) {
        return content
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line}</p>`)
            .join('');
    }
    
    // Check if a color is dark (for text contrast)
    isColorDark(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    }
    
    // Search notes
    searchNotes(query) {
        query = query.toLowerCase();
        
        const filteredNotes = this.notes.filter(note => 
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );
        
        this.renderFilteredNotes(filteredNotes);
    }
    
    // Render filtered notes
    renderFilteredNotes(filteredNotes) {
        this.containerEl.innerHTML = '';
        
        if (filteredNotes.length === 0) {
            this.containerEl.innerHTML = '<div class="placeholder-text">No matching notes found</div>';
            return;
        }
        
        filteredNotes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'card note-card';
            noteEl.style.backgroundColor = note.color;
            
            const isDarkColor = this.isColorDark(note.color);
            if (isDarkColor) {
                noteEl.classList.add('dark-note');
            }
            
            noteEl.innerHTML = this.getNoteHTML(note);
            
            // Add event listeners
            noteEl.querySelector('.edit-note').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editNote(note.id);
            });
            
            noteEl.querySelector('.delete-note').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this note?')) {
                    this.deleteNote(note.id);
                }
            });
            
            this.containerEl.appendChild(noteEl);
        });
    }
}
