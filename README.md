# Regression Metrics Dashboard

A comprehensive dashboard for tracking regression testing metrics across different teams with role-based access control.

## Features

- **Role-based Access Control**
  - Whole Manager: Can view all teams' metrics and filter by team
  - Team Manager: Can only view and upload their team's metrics

- **Interactive Charts**
  - Bar chart for Bugs Filed per month
  - Line chart for Testcases Automated trends
  - Pie chart for latest month distribution

- **Real-time Data**
  - Upload monthly metrics
  - View aggregated statistics
  - Responsive design

## Tech Stack

- **Frontend**: React + Next.js + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Node.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT
- **Charts**: Recharts

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd regression-metrics-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/regression-metrics
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the backend server**
   ```bash
   node server.js
   ```

6. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Users

After running the seed script, you can login with:

- **Whole Manager**: `whole@company.com` / `password123`
- **Frontend Manager**: `frontend@company.com` / `password123`
- **Backend Manager**: `backend@company.com` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Metrics
- `GET /api/metrics` - Get metrics (filtered by role)
- `POST /api/metrics` - Upload metrics (team_manager only)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   └── signup/           # Signup page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── dashboard.tsx    # Main dashboard component
│   ├── metrics-chart.tsx # Chart components
│   └── upload-form.tsx  # Metrics upload form
├── lib/                 # Utility functions
├── models/              # MongoDB models
├── routes/              # Express.js routes
├── middleware/          # Authentication middleware
├── scripts/             # Database seeding
└── server.js           # Express.js server
```

## Development

### Backend Development
```bash
# Start server with nodemon (auto-restart on changes)
npx nodemon server.js
```

### Frontend Development
```bash
# Start Next.js development server
npm run dev
```

### Database
```bash
# Seed database with sample data
npm run seed

# Clear and reseed database
npm run seed
```

## Deployment

### Backend Deployment
1. Set up MongoDB (Atlas recommended for production)
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
