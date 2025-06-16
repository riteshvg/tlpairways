# TLAirways - Airline Booking System

A dummy airline website that simulates core functionalities of an airline booking and check-in system. This project is intended as a learning tool and uses mock data.

## Features

- Flight Search with IATA codes
- Passenger Management
- Flight Booking Simulation
- Check-in Process

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express.js
- Database: MongoDB with Mongoose
- State Management: React Context API

## Project Structure

```
tlpairways/
├── frontend/           # React frontend application
├── backend/           # Node.js/Express backend
└── package.json       # Root package.json for project management
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Start the development servers:
   ```bash
   npm start
   ```

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5000

## Environment Variables

Create `.env` files in both frontend and backend directories with the following variables:

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tlairways
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## License

ISC 