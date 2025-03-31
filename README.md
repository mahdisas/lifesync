# LifeSync

A comprehensive life management web application with task management, notes, calendar, finance tracking, and AI-powered scheduling.

## Features

- Task Management
- Note Taking
- Calendar & Events
- Finance Tracking
- AI-powered Smart Planner
- Dark Mode & Themes
- Responsive Design
- Local Data Storage

## Prerequisites

- Node.js installed on your system
- (Optional) Gemini API key for AI features

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd lifesync
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

## Scripts

- `npm start`: Run the server in production mode
- `npm run dev`: Run the server in development mode with auto-reload

## File Structure

```
lifesync/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styles
├── js/
│   ├── app.js         # Main application file
│   └── modules/       # JavaScript modules
│       ├── task-manager.js
│       ├── note-manager.js
│       ├── calendar-manager.js
│       ├── finance-manager.js
│       ├── smart-planner.js
│       ├── settings-manager.js
│       ├── ui-manager.js
│       └── storage-manager.js
├── server.js          # Local development server
└── package.json       # Project configuration
```

## Browser Support

The application uses modern JavaScript features (ES6+ modules) and requires a modern browser:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development

The application is built using vanilla JavaScript with ES6 modules. The main entry point is `app.js`, which imports various modules for different functionalities. Each module is responsible for a specific feature and follows a consistent pattern:

1. Constructor receives the storage manager instance
2. Initializes its data from storage
3. Provides methods for its specific functionality
4. Updates storage when data changes
5. Updates UI as needed

## Smart Planner Setup

To use the AI-powered Smart Planner:

1. Get a Gemini API key from Google AI Studio
2. Go to Settings in the application
3. Enter your API key in the Smart Planner section
4. Configure your preferences for optimal scheduling

## Building for Production

For production deployment:

1. Ensure all files are present
2. (Optional) Minify CSS and JavaScript
3. Deploy to any static hosting service (e.g., Netlify, Vercel)

## License

MIT
