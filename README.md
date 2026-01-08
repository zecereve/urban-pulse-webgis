# Urban Pulse Web-GIS

Urban Pulse is a web-based GIS application designed to visualize and analyze urban data such as air quality, traffic intensity, and urban scores for the districts of Ankara.

## Features Implemented

### 1. User Types & Authentication (20% + 15%)
- **Roles**: 
    - **Citizen**: Can view map, details, and submit feedback (rating, comment, photo).
    - **Analyst**: Can view map, statistics, and detailed citizen feedback.
    - **Admin**: Has full access. Can CRUD (Create, Read, Update, Delete) locations and moderate (Useful/Harmful) citizen feedback.
- **Authentication**: JWT-based (simulated via session/db) login system. Registration defaults to 'citizen'.

### 2. NoSQL Database (25%)
- **MongoDB**: Used to store potentially unstructured or semi-structured data like user feedback and location attributes.
- **Collections**: `users`, `locations`, `feedbacks`.

### 3. API Development (25%)
- **RESTful API**: Built with Node.js & Express.
- **Endpoints**:
    - `GET /urban/locations`: Retrieve spatial data.
    - `POST /locations`: Create new spatial feature (Admin).
    - `PUT /locations/:id`: Update attributes (Admin).
    - `DELETE /locations/:id`: Remove feature (Admin).
- **Documentation**: Swagger UI integrated at `/api-docs`.

### 4. CRUD Operations (15%)
- Full CRUD capabilities implemented for the Admin user on the `locations` layer.

### 5. Citizen Feedback System
- Interactive feedback mechanism allowing citizens to upload photos and rate districts.
- Admin moderation tools to filter "Harmful" content.

## Tech Stack
- **Frontend**: React, Leaflet (React-Leaflet)
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Tools**: Swagger (Documentation), Multer (File Uploads)

## 6. Performance Monitoring (Experiment Results)
**Objective**: Measure the impact of Geospatial Indexing (2dsphere).
- **Setup**: A `2dsphere` index was created on the `locations` collection.
- **Hypothesis**: Queries utilizing `$near` or `$geoWithin` should differ in execution time for large datasets.
- **Observation**: For our current dataset of ~40 districts, the query time is negligible (<5ms) in both cases. However, the `explain()` plan confirms that the index is used (`IXSCAN`) versus a full collection scan (`COLLSCAN`), ensuring scalability as data grows to thousands of points.

## 7. Performance Testing (Load Test)
**Objective**: Test system stability under load using a custom Node.js script (`src/load_test.js`).
- **Configuration**: 500 requests, Concurrency 20.
- **Results**:
  - **Total Requests**: 500
  - **Success Rate**: 100%
  - **Requests Per Second (RPS)**: ~350 req/s (Local environment)
- **Conclusion**: The Node.js Event Loop handles concurrent I/O efficiently for this workload.

## 8. Swagger Documentation / API
The API is fully documented using Swagger.
- Access: `http://localhost:5050/api-docs`
- Includes schemas for Users, Locations, and Issues.

## Installation

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Usage
- **Admin**: `admin@example.com` / `password123`
- **Analyst**: `analyst@example.com` / `password123`
- **Citizen**: Register a new account or use `citizen@example.com` / `password123`
