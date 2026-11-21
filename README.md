 
# Doctor Tracker – Backend

A secure RESTful API for the Doctor Tracker Healthcare Management System. The backend manages administrator authentication, doctor profiles, patient records, and database operations using Node.js, Express.js, and MongoDB.

## Features

- **Authentication:** JWT-based administrator authentication.
- **Doctor Management:** Create, retrieve, and deactivate doctor records.
- **Patient Management:** Add, retrieve, and remove patients assigned to doctors.
- **Database Integration:** MongoDB Atlas for persistent data storage.
- **Data Validation:** Validates incoming doctor and patient information.
- **Error Handling:** Centralized API error handling.
- **Security:** Protected administrative operations and environment-based configuration.
- **CORS Configuration:** Allows communication with the frontend application.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| JSON Web Token (JWT) | Authentication |
| bcrypt / bcryptjs | Password hashing, if configured |
| dotenv | Environment configuration |

## Project Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   └── patientController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── Admin.js
│   │   └── Doctor.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── patientRoutes.js
│   │
│   ├── utils/
│   │
│   └── app.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

*Note: This is a suggested structure. Adjust the directory names to match your actual backend implementation.*

## Requirements

Before running the project, make sure you have installed:

- Node.js (LTS version recommended)
- npm
- MongoDB Atlas account
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/faisalahmed3/doctor-tracker-backend
```

### 2. Navigate to the Backend Directory

```bash
cd backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend root directory.

Copy the example configuration:

```bash
cp .env.example .env
```

Update the environment variables with your own credentials.

### Environment Variables

| Variable | Description |
|---|---|
| PORT | Backend server port |
| NODE_ENV | Application environment |
| FRONTEND_URL | Frontend application URL |
| MONGODB_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key used for JWT signing |
| ADMIN_NAME | Default administrator name |
| ADMIN_EMAIL | Default administrator email |
| ADMIN_PASSWORD | Default administrator password |

Example:

```env
PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret

ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

**Important:** Never upload your actual `.env` file or expose database credentials and JWT secrets in a public repository.

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

These commands assume the corresponding scripts are configured in `package.json`.

The backend will run at:

```text
http://localhost:5000
```

## API Documentation

All API routes use the following base URL:

```text
http://localhost:5000/api/v1
```

### Authentication API

Authentication is handled through JWT-based administrator login.

The authentication route and request format should match the implementation in `authRoutes.js`.

### Doctor Management API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/doctors` | Register a new doctor |
| GET | `/doctors` | Retrieve doctor records |
| GET | `/doctors/:id` | Retrieve a specific doctor |
| DELETE | `/doctors/:id` | Deactivate a doctor |

#### Create Doctor

**POST** `/api/v1/doctors`

Request body:

```json
{
  "name": "Dr. Ayesha Rahman",
  "specialization": "Cardiology",
  "hospital": "Green Valley Medical Center",
  "phone": "+880 1712 345 601",
  "email": "ayesha.rahman@example.com"
}
```

#### Deactivate Doctor

**DELETE** `/api/v1/doctors/:id`

Deactivates the selected doctor while preserving the existing doctor record and assigned patient information.

### Patient Management API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/patients/doctor/:doctorId` | Assign a patient to a doctor |
| DELETE | `/patients/doctor/:doctorId/:patientId` | Remove a patient from a doctor's list |

#### Add Patient

**POST** `/api/v1/patients/doctor/:doctorId`

Request body:

```json
{
  "name": "Nusrat Jahan",
  "age": 38,
  "condition": "Hypertension"
}
```

#### Delete Patient

**DELETE** `/api/v1/patients/doctor/:doctorId/:patientId`

Removes the specified patient from the selected doctor's patient list.

*Note: The API endpoints above are based on the frontend integration. Verify any additional routes against the actual backend route files.*

## Database Structure

The application uses MongoDB Atlas.

### Doctors Collection

Each doctor document contains:

```json
{
  "_id": "MongoDB ObjectId",
  "name": "Dr. Ayesha Rahman",
  "email": "ayesha.rahman@example.com",
  "phone": "+880 1712 345 601",
  "specialization": "Cardiology",
  "hospital": "Green Valley Medical Center",
  "status": "Active",
  "patients": [],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Patient Information

Patient records are embedded within their assigned doctor's document.

Each patient contains:

```json
{
  "id": "PAT-2026-0001",
  "name": "Nusrat Jahan",
  "age": 38,
  "condition": "Hypertension",
  "registeredAt": "Date"
}
```

## Authentication and Security

The application uses JSON Web Tokens (JWT) for administrator authentication.

Security considerations:

- Store sensitive credentials in environment variables.
- Never expose JWT secrets.
- Hash administrator passwords before storing them.
- Validate incoming API requests.
- Protect administrative endpoints with authentication middleware.
- Configure CORS to allow only trusted frontend origins.
- Use HTTPS in production.
- Avoid committing `.env` files to Git.

## Frontend Integration

The backend is designed to communicate with the Doctor Tracker frontend.

Default development configuration:

| Application | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| API Base URL | http://localhost:5000/api/v1 |

The frontend communicates with the backend through HTTP requests and uses JWT authentication for authorized operations.

## Deployment

For production deployment:

1. Deploy the backend to a Node.js-compatible hosting platform.
2. Configure MongoDB Atlas network access and database credentials.
3. Add all required environment variables to the hosting platform.
4. Update `FRONTEND_URL` with the deployed frontend URL.
5. Set `NODE_ENV=production`.
6. Generate a strong JWT secret.
7. Configure HTTPS and verify API connectivity.

## License

This project is developed for the Doctor Tracker Healthcare Management System.

All rights reserved.

---

**Doctor Tracker – Healthcare Management System**

Organizing doctors. Managing patients. Improving healthcare administration.