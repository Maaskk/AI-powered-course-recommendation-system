# API Reference

Complete API documentation for the Academic Recommendation System backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

---

## Students Endpoints

### Create Student

Create a new student profile.

**Endpoint:** `POST /students`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "age": 20,
  "gender": "Male",
  "major": "Computer Science",
  "gpa": 3.5,
  "semester": 4,
  "attendance_rate": 85.5,
  "study_hours_per_week": 20
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "age": 20,
  "gender": "Male",
  "major": "Computer Science",
  "gpa": 3.5,
  "semester": 4,
  "attendance_rate": 85.5,
  "study_hours_per_week": 20,
  "created_at": "2024-03-10T10:30:00.000Z",
  "updated_at": "2024-03-10T10:30:00.000Z"
}
```

### Get All Students

Retrieve all student profiles.

**Endpoint:** `GET /students`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "major": "Computer Science",
    "gpa": 3.5,
    "semester": 4,
    "created_at": "2024-03-10T10:30:00.000Z"
  }
]
```

### Get Single Student

Retrieve a specific student by ID.

**Endpoint:** `GET /students/:id`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "age": 20,
  "gender": "Male",
  "major": "Computer Science",
  "gpa": 3.5,
  "semester": 4,
  "attendance_rate": 85.5,
  "study_hours_per_week": 20,
  "recommendations": []
}
```

### Update Student

Update student information.

**Endpoint:** `PATCH /students/:id`

**Request Body:**
```json
{
  "gpa": 3.7,
  "semester": 5
}
```

**Response:** `200 OK`

### Delete Student

Delete a student profile.

**Endpoint:** `DELETE /students/:id`

**Response:** `200 OK`

### Get Student Statistics

Get aggregate statistics for all students.

**Endpoint:** `GET /students/statistics`

**Response:** `200 OK`
```json
{
  "total_students": 150,
  "average_gpa": 3.2,
  "average_attendance": 82.5
}
```

---

## Recommendations Endpoints

### Generate Recommendations

Generate AI-powered recommendations for a student.

**Endpoint:** `POST /recommendations/generate/:studentId`

**Response:** `201 Created`
```json
[
  {
    "id": 1,
    "student_id": 1,
    "item_id": 42,
    "score": 0.876,
    "model_version": "1.0",
    "created_at": "2024-03-10T10:35:00.000Z"
  }
]
```

### Get Student Recommendations

Retrieve all recommendations for a specific student.

**Endpoint:** `GET /recommendations/student/:studentId`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "student_id": 1,
    "item_id": 42,
    "item_title": "Advanced Machine Learning",
    "score": 0.876,
    "created_at": "2024-03-10T10:35:00.000Z"
  }
]
```

### Get All Recommendations

Retrieve all recommendations in the system.

**Endpoint:** `GET /recommendations`

**Response:** `200 OK`

### Get Recent Recommendations

Get the most recent recommendations.

**Endpoint:** `GET /recommendations/recent?limit=10`

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 10)

**Response:** `200 OK`

### Get Top Recommended Items

Get the most frequently recommended items.

**Endpoint:** `GET /recommendations/top-items?limit=10`

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 10)

**Response:** `200 OK`
```json
[
  {
    "item_id": 42,
    "item_title": "Advanced Machine Learning",
    "recommendation_count": 125,
    "avg_score": 0.834
  }
]
```

---

## Analytics Endpoints

### Get Overview Statistics

Get high-level system statistics.

**Endpoint:** `GET /analytics/overview`

**Response:** `200 OK`
```json
{
  "total_students": 150,
  "total_recommendations": 1500,
  "average_recommendation_score": 0.782,
  "recent_activity_7days": 245
}
```

### Get Recommendation Trends

Get recommendation trends over time.

**Endpoint:** `GET /analytics/trends?days=30`

**Query Parameters:**
- `days` (optional): Number of days to include (default: 30)

**Response:** `200 OK`
```json
[
  {
    "date": "2024-03-01",
    "count": 45,
    "avg_score": 0.798
  },
  {
    "date": "2024-03-02",
    "count": 52,
    "avg_score": 0.805
  }
]
```

### Get Student Distribution

Get distribution of students by GPA and gender.

**Endpoint:** `GET /analytics/distribution`

**Response:** `200 OK`
```json
{
  "gpa_distribution": [
    { "category": "Excellent", "count": 45 },
    { "category": "Good", "count": 62 },
    { "category": "Average", "count": 35 },
    { "category": "Below Average", "count": 8 }
  ],
  "gender_distribution": [
    { "gender": "Male", "count": 85 },
    { "gender": "Female", "count": 60 },
    { "gender": "Other", "count": 5 }
  ]
}
```

### Get Item Popularity

Get popularity metrics for recommended items.

**Endpoint:** `GET /analytics/item-popularity?limit=20`

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 20)

**Response:** `200 OK`
```json
[
  {
    "item_id": 42,
    "item_title": "Advanced Machine Learning",
    "recommendation_count": 125,
    "avg_score": 0.834
  }
]
```

---

## ML Endpoints

### Check ML Service Health

Check if the ML service is running and models are loaded.

**Endpoint:** `GET /ml/health`

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "models_loaded": ["cf", "perf", "scaler"]
}
```

### Predict Student Performance

Predict student performance based on features.

**Endpoint:** `POST /ml/predict-performance`

**Request Body:**
```json
{
  "features": {
    "age": 20,
    "attendance_rate": 85,
    "study_hours_per_week": 20,
    "gpa": 3.5
  }
}
```

**Response:** `200 OK`
```json
{
  "prediction": 1,
  "probabilities": [0.23, 0.77]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["name must be a string", "gpa must be between 0 and 4"],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Student with ID 999 not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
