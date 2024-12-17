# Finance Tracker App

## Description
Finance Tracker App is a web application that helps users manage their finances by tracking transactions. It is built using Node.js, Express, and Prisma with a MySQL database.

## Features
- User authentication
- Transaction management (add, read, update, delete)
- Error handling
- Google Authentication
- Password reset using email

## Technologies Used
- Node.js
- Express
- Prisma
- MySQL
- JavaScript
- npm
- passport (OAuth)
- NodeMailer (Email)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Logic1710/finance_tracker_app.git
   cd finance-tracker-app
    ```
2. Install the dependencies:
    ```sh
    npm install
    ```
3. Create a `.env` file in the root directory and add the following environment variables:
    ```sh
    DATABASE_URL="mysql://<username>:<password>@localhost:3306/<database-name>?schema=public"
    TOKEN_SECRET=45BgR
    ```
   ###### Note: The OAuth and Reset password function will  not work due to its credentials is personal and not shared.
4. Initialize Prisma:
    ```sh
    npx prisma init
    ```   
5. Generate Prisma client:
    ```sh
    npx prisma generate
    ```
6. Run Prisma Migrate to create the database schema:
    ```sh
    npx prisma migrate dev --name init
    ```
    
## Usage

1. Start the server:
    ```sh
    npm start
    ```
2. The server will start on `http://localhost:8080`.

## API Endpoints

### User Routes

- POST `/user` - Register a new user
   - **Body**: `{ "username": "string", "fullname": "string", "email": "string", "newpassword": "string", "confpassword": "string", "balance": "number" }`
   - **Authorization**: None
- PUT `/user` - Update a user
   - **Body**: `{ "username": "string", "fullname": "string", "email": "string", "balance": "number" }`
   - **Authorization**: Bearer token
- DELETE `/user` - Delete user
   - **Authorization**: Bearer token
- POST `/user/changepassword` - Change user password
   - **Body**: `{ "oldPassword": "string", "newPassword": "string", "confPassword": "string" }`
   - **Authorization**: Bearer token
- GET `/user` - Get user
   - **Authorization**: Bearer token
- POST `/user/login` - Login a user
   - **Body**: `{ "emailorusername": "string", "password": "string" }`
   - **Authorization**: None
- GET `/user/logout` - Logout a user
   - **Authorization**: Bearer token
- POST `/user/reset-password/:reset password token` - Password reset
   - **Body**: `{ "newPassword": "string" }`
   - **Authorization**: None
- POST `/user/forgot-password` - Request password reset link
   - **Body**: `{ "email": "string" }`
   - **Authorization**: None
- GET `/user/google` - Google OAuth
   - **Authorization**: None
   - **NOTE**: still in development and using localhost:3000 in the cors in google console

### Transaction Routes

- POST `/transaction` - Add a new transaction
   - **Body**: `{ "name": "string", "type": "string", "category": "string", "amount": "number", "date": "string" }`
   - **Authorization**: Bearer token
- PUT `/transaction?q=<Transaction UID>` - Update a transaction
   - **Body**: `{ "name": "string", "type": "string", "category": "string", "amount": "number", "date": "string" }`
   - **Authorization**: Bearer token
- DELETE `/transaction?q=<Transaction UID>` - Delete a transaction
   - **Authorization**: Bearer token
- GET `/transaction` - Get all transactions
   - **Authorization**: Bearer token
   
   
