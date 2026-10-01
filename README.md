# Integration Testing E-commerce Project

A full-stack E-commerce application built to demonstrate and test integrations with various third-party services.

## Features

- **Frontend**: Built with Next.js and React.
- **Backend**: Built with Node.js, Express, and MongoDB.
- **Email Integrations**: Seamlessly switch between different email providers for testing:
  - Resend
  - Brevo
  - Mailjet
  - Mailtrap (SMTP via Nodemailer)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   - `PORT`: 5000
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key for authentication
   - Email API Keys: `RESEND_API_KEY`, `BREVO_API_KEY`, `MAILJET_API_KEY`, `MAILJET_API_SECRET`
   - Mailtrap SMTP: `MAILTRAP_SMTP_USER`, `MAILTRAP_SMTP_PASSWORD`
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Access the app at `http://localhost:3000`.

## API Configuration

The frontend is configured to point to the deployed Render backend (`https://integration-testing-yjx4.onrender.com`) when running in a production environment (`NODE_ENV === 'production'`). During local development, it automatically falls back to `http://localhost:5000`.