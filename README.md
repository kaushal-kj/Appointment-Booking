# Appointment Booking System

A comprehensive appointment booking web application designed to streamline the scheduling process for various businesses and service providers. Built with modern web technologies to provide an efficient, user-friendly platform for both clients and service providers to manage appointments seamlessly.

## 🌟 Features

### Student Features
- **User Registration & Authentication** - Secure account creation and login system
- **Appointment Booking** - Easy scheduling interface with real-time availability
- **Calendar Integration** - Interactive calendar view for appointment management
- **Appointment Management** - View, reschedule, and cancel appointments
- **User Profile** - Manage personal information and preferences
- **Appointment History** - Track past and upcoming appointments

### Teacher Features
- **Teacher Dashboard** - Comprehensive management interface
- **Schedule Management** - Set availability, working hours, and time slots
- **Appointment Overview** - View and manage all scheduled appointments
- **appointment Configuration** - Add, edit, and manage appointments
- **Calendar Synchronization** - Sync with external calendar applications

### Admin Features
- **System Administration** - Manage users, providers, and system settings
- **Booking Management** - Oversee all appointments across the platform
- **User Management** - Handle user accounts and permissions
- **Analytics Dashboard** - System-wide statistics and performance metrics

## 🚀 Demo

🔗 [Live Demo](https://edu-connect-kk.vercel.app/)

## 🛠️ Tech Stack

### Frontend
- **JavaScript (99.2%)** - Core client-side functionality and interactivity
- **HTML/CSS** - Structure, styling, and responsive design
- **React.js** - Modern UI component library (assumed based on demo URL)
- **Bootstrap/Tailwind CSS** - Responsive design framework

### Backend
- **Node.js** - Server-side runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database for storing appointments and user data
- **Mongoose** - MongoDB object modeling

### Additional Technologies
- **JWT** - Authentication and authorization
- **bcrypt** - Password hashing and security
- **Nodemailer** - Email notifications and confirmations
- **Moment.js/Day.js** - Date and time manipulation

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Clone the repository:
git clone https://github.com/kaushal-kj/Appointment-Booking.git \
cd Appointment-Booking



2. Navigate to server directory:
cd server



3. Install server dependencies:
npm install



4. Create a `.env` file in the server directory:\
PORT=5000\
MONGO_URI=your_mongodb_connection_string\
JWT_SECRET=your_jwt_secret_key\
EMAIL_USER=your_email_for_notifications\
EMAIL_PASS=your_email_password\
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=you_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
TZ=timezone



6. Start the backend server:
npm start

or for development
npm run dev



### Frontend Setup

1. Navigate to client directory:
cd client



2. Install client dependencies:
npm install



3. Create a `.env` file in the client directory:
VITE_SERVER_URL=http://localhost:5000/api



4. Start the frontend development server:
npm start



The application will be available at `http://localhost:5173`

## 🖥️ Usage

### For Students
1. **Register/Login** - Create an account or sign in to existing account
2. **Browse Appointments** - Explore available services and providers
3. **Book Appointment** - Select date, time, and service preferences
4. **Manage Bookings** - View, modify, or cancel upcoming appointments

### For Teachers
1. **Setup Profile** - Complete Teacher profile with services and availability
2. **Manage Schedule** - Set working hours, breaks, and time slots
3. **Handle Bookings** - Accept, reschedule, or decline appointment requests
4. **Student Communication** - Communicate with students through the platform
5. **Track Performance** - View booking statistics and student feedback

## 🗂️ Project Structure

Appointment-Booking/\
├── client/\
│ ├── public/\
│ ├── src/\
│ │ ├── components/ # Reusable React components\
│ │ ├── pages/ # Page components\
│ │ ├── context/ # Context providers for state management\
│ │ ├── utils/ # Utility functions and helpers\
│ │ ├── styles/ # CSS and styling files\
│ │ └── App.js # Main App component\
│ └── package.json\
├── server/\
│ ├── controllers/ # Route controllers\
│ ├── middleware/ # Custom middleware functions\
│ ├── models/ # MongoDB schemas\
│ ├── routes/ # Express routes\
│ ├── utils/ # Utility functions\
│ └── server.js # Main server file\
└── README.md



---

⭐ If you found this project helpful, please give it a star on GitHub!
