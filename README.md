# 🚀 AIMS POS & Inventory System

Welcome to the AIMS POS & Inventory Management System repository. Follow the instructions below to clone, configure, and run the project locally on your machine.

---

## 📋 Prerequisites

Ensure you have the following installed before proceeding:
* Node.js (v18 or higher)
* Git
* PostgreSQL installed and running locally

---

## ⚙️ Getting Started

### 1. Clone the Repository
Open your terminal or command prompt and run:

git clone <YOUR-GITHUB-REPO-URL>
cd aims-pos-inventory

---

### 2. Set Up Your Local PostgreSQL Database
Ensure your PostgreSQL service is active, then create the database specified in the project configuration:

* Database Name: aims-pos-ims-db
* Default Database User: postgres
* Default Database Password: admin123

Note: If your local PostgreSQL password is different from admin123, update the password in your local backend/.env file.

To create the database via psql terminal:
CREATE DATABASE "aims-pos-ims-db";

---

### 3. Backend Setup & Startup

1. Navigate to the backend directory:
   cd backend

2. Install all backend dependencies:
   npm install

3. Push the Prisma schema to generate client models and create database tables automatically:
   npx prisma db push

4. Start the backend development server:
   npm run dev

---

### 4. Frontend Setup & Startup

1. Open a new terminal window or tab.

2. Navigate to the frontend directory:
   cd frontend

3. Install frontend dependencies:
   npm install

4. Start the React development server:
   npm run dev

---

## 🌐 Application Endpoints

Once both servers are running:
* Backend API: Available at http://localhost:5000
* Frontend App: Available at http://localhost:5173
