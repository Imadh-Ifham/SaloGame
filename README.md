# SaloGame - Game Lounge Management System

SaloGame is a comprehensive management system designed for game lounges, providing an efficient platform for managing bookings, layouts, and user interactions.

## Key Features

### 1. **User Booking System**

- Customers can view available machines and make bookings directly through the user interface.
- Real-time machine availability and booking confirmation.

### 2. **Admin Dashboard**

- Manage all lounge operations from a centralized dashboard.
- Monitor real-time booking statuses and manage user accounts.

### 3. **Blueprint Management with Konva.js**

- Interactive 2D layout management using Konva.js.
- Admins can create and customize their lounge layouts using predefined shapes.
- **Shapes Available:**
  - Wall Types: Boundary Wall, Divider, Other
  - Machines: PC, Screen
  - Furniture: Table, Sofa, PC Chair
  - Entrance Door
- Shapes come with predefined styling, except for adjustable lengths on some elements.

### 4. **Booking Management**

- Manage customer bookings efficiently with an intuitive interface.
- Track usage time and machine availability.

### 5. **User Authentication**

- Simplified sign-in using OTP-based phone number verification for customers.
- Admin accounts with email and password for enhanced security.

### 6. **Technology Stack**

- **Frontend:** React with TypeScript, Konva.js for blueprint management
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Hosting:** Firebase for frontend, AWS for backend

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Firebase Account
- AWS Account

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables for Firebase and AWS keys.
4. Run the development server:
   ```bash
   npm run dev
   ```

### Deployment

- Frontend: Deploy using Firebase Hosting
- Backend: Deploy using AWS Lambda or EC2

## Contribution

Contributions are welcome! Please create a pull request for any feature enhancements or bug fixes.
