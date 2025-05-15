# FurnishFlow

FurnishFlow is a modern, AI-enhanced CRM tailored for furniture sales professionals in retail environments. It helps streamline customer journeys, elevate follow-ups, and turn one-time shoppers into lifelong clients.

## Project Structure

```
furnishflow/
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/         # Main application pages
│   │   ├── components/    # Reusable components
│   │   ├── store/        # Redux store and slices
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Utility functions
│   │   ├── hooks/        # Custom React hooks
│   │   └── assets/       # Static assets
│   └── package.json
│
└── backend/               # FastAPI backend
    ├── app/
    │   ├── models/       # Pydantic models
    │   ├── services/     # Business logic
    │   ├── schemas/      # Database schemas
    │   └── utils/        # Utility functions
    ├── tests/            # Test suite
    └── requirements.txt  # Python dependencies

```

## Getting Started

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Features

- **Dashboard**: KPIs, tasks, and hot leads at a glance
- **Client Management**: Comprehensive client profiles and history
- **Sales Tracking**: Monitor sales pipeline and performance
- **AI-Powered Tools**: Smart follow-ups and client intelligence
- **Task Management**: Stay organized with automated task suggestions
- **Room Sketches**: Upload and analyze room layouts

## Tech Stack

- **Frontend**: React, TypeScript, Redux Toolkit
- **Backend**: Python, FastAPI
- **Database**: Supabase
- **AI Integration**: OpenAI API
