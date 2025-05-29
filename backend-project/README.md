# Car Wash Management System (CWSMS) Backend

## Overview
This is the backend API for the Car Wash Management System for SmartPark in Rubavu District, Rwanda. The system manages car washing services, packages, payments, and generates reports.

## Features
- User authentication with session management
- Car registration and management
- Service package management
- Service recording and tracking
- Payment processing
- Bill generation
- Daily and monthly reports
- Input validation and error handling

## Database Setup
1. Create a MySQL database named `smart-park`
2. Run the SQL script in `../database_setup.sql` to create tables and insert sample data

## Installation
1. Install dependencies: `npm install`
2. Configure environment variables in `.env` file
3. Start the server: `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/status` - Check authentication status

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get package by ID
- `POST /api/packages` - Create new package
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:plateNumber` - Get car by plate number
- `POST /api/cars` - Register new car
- `PUT /api/cars/:plateNumber` - Update car
- `DELETE /api/cars/:plateNumber` - Delete car

### Services
- `GET /api/services` - Get all services with details
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Bills & Reports
- `GET /api/bill/:paymentId` - Generate bill for payment
- `GET /api/reports/daily/:date` - Daily report (YYYY-MM-DD)
- `GET /api/reports/monthly/:year/:month` - Monthly report

## Validation Rules

### Username
- Must contain only letters
- Must start with a letter
- Cannot be numbers only

### Password
- Minimum 6 characters
- Must contain letters and numbers
- Must have at least one capital letter

## Error Handling
All endpoints return standardized JSON responses:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {} // Only on success
}
```

## Security Features
- Password hashing with bcrypt
- Session-based authentication
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- CORS configuration for frontend integration
