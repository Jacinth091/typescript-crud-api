# TypeScript CRUD API

A RESTful API for managing users, built with **TypeScript**, **Express**, **Sequelize**, and **MySQL**.

---

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Runtime    | Node.js                 |
| Language   | TypeScript              |
| Framework  | Express 5               |
| ORM        | Sequelize + MySQL2      |
| Validation | Joi                     |
| Security   | bcryptjs, jsonwebtoken  |

---

## Project Structure

```
src/
├── config.ts              # Centralized environment config
├── server.ts              # App entry point
├── helpers/
│   ├── db.ts              # Sequelize initialization & DB creation
│   └── role.ts            # Role enum (Admin, User)
├── middleware/
│   ├── errorHandler.ts    # Global error handler
│   └── validateRequest.ts # Joi validation middleware
└── users/
    ├── user.model.ts      # Sequelize User model & interfaces
    ├── user.service.ts    # Business logic (CRUD)
    └── users.controller.ts# Route handlers & schemas
```

---

## Setup

### 1. Install Dependencies 
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=typescript_crud_api
JWT_SECRET=your_jwt_secret
PORT=4000
```

> All values are read and centralized in `src/config.ts`, which also sets defaults if any variable is missing.

### 3. Run the Server
```bash
# Development (with auto-reload)
npm run start:dev

# Production
npm run build && npm start
```

> The database `typescript_crud_api` and `users` table are **created automatically** on first startup.

---

## API Endpoints

Base URL: `http://localhost:4000`

| Method | Endpoint     | Description       |
|--------|--------------|-------------------|
| GET    | `/users`     | Get all users     |
| GET    | `/users/:id` | Get user by ID    |
| POST   | `/users`     | Create a user     |
| PUT    | `/users/:id` | Update a user     |
| DELETE | `/users/:id` | Delete a user     |

---

## Testing with cURL

### Create a User
```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "role": "User",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Get All Users
```bash
curl http://localhost:4000/users
```

### Get User by ID
```bash
curl http://localhost:4000/users/1
```

### Update a User
```bash
curl -X PUT http://localhost:4000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Johnny", "email": "johnny@example.com"}'
```

### Delete a User
```bash
curl -X DELETE http://localhost:4000/users/1
```

---

## Testing with Postman

1. Open Postman and create a new request.
2. Set the method and URL (e.g., `POST http://localhost:4000/users`).
3. Go to **Body → raw → JSON** and paste the request body.
4. Click **Send**.

For `PUT` requests, only include the fields you want to update.  
The `password` and `confirmPassword` fields must match when provided.

---

## User Roles

| Role    | Value   |
|---------|---------|
| Admin   | `Admin` |
| Default | `User`  |
