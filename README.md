# Rada Votes Analytics 📊

An analytics platform for visualizing and analyzing voting data from the Kyiv City Council.

## 🚀 Features

- Real-time data fetching from the Kyiv City Council website
- Interactive visualizations of voting patterns
- Faction-based analysis
- Historical voting data trends
- Detailed deputy participation statistics

## 🛠 Tech Stack

- Frontend: Angular 19
- Backend: Node.js with Express
- TypeScript
- Charts: (TBD - will be implemented with D3.js or Chart.js)
- Styling: SCSS

## 📦 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (latest version)

## 🔧 Installation

1. Clone the repository:

```bash
git clone [your-repo-url]
cd rada-votes-Ang
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Backend

1. Create a `.env` file in the backend directory (use `.env.example` as a template)
2. Start the development server:

```bash
cd backend
npm run dev
```

### Frontend

1. Start the Angular development server:

```bash
cd frontend
ng serve
```

The application will be available at `http://localhost:4200`

## 📝 API Documentation

### Endpoints

- `GET /api/voting` - Get all voting sessions
- `GET /api/voting/:id` - Get specific voting session
- `GET /api/voting/statistics/summary` - Get overall voting statistics
- `GET /api/voting/statistics/faction/:factionName` - Get faction-specific statistics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
