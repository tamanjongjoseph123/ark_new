# Church Application API

This is the backend API for a church application that serves both a React admin panel and a React Native mobile app.

## Features

- User authentication (Admin and Regular users)
- Church projects management
- Video content management (YouTube videos)
- Inspirational quotes
- Prayer requests
- Testimonies
- Upcoming events
- Media file handling

## Setup Instructions

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Apply migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```
6. Run the development server:
   ```bash
   python manage.py runserver
   ```

## API Documentation

### Authentication

#### Login
- **URL**: `/api/login/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "token": "string",
    "refresh": "string",
    "user": {
      "id": "integer",
      "name": "string",
      "country": "string",
      "email": "string",
      "contact": "string",
      "username": "string"
    }
  }
  ```
- **Error Response**:
  ```json
  {
    "error": "Invalid credentials"
  }
  ```

#### Refresh Token
- **URL**: `/api/token/refresh/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "refresh": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "access": "string"
  }
  ```

### Users

#### Register User
- **URL**: `/api/users/`
- **Method**: `POST`
- **Permission**: AllowAny
- **Request Body**:
  ```json
  {
    "username": "string",
    "country": "string",
    "email": "string",
    "contact": "string",
    "password": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "id": "integer",
    "username": "string",
    "country": "string",
    "email": "string",
    "contact": "string"
  }
  ```

#### Get User List
- **URL**: `/api/users/`
- **Method**: `GET`
- **Permission**: IsAuthenticated
- **Success Response**:
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "country": "string",
      "email": "string",
      "contact": "string",
      "username": "string"
    }
  ]
  ```

### Church Projects

#### List/Create Church Projects
- **URL**: `/api/church-projects/`
- **Methods**: `GET`, `POST`
- **Permission**: GET: AllowAny, POST: IsAdminUser
- **POST Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "image": "file"
  }
  ```
- **Success Response**:
  ```json
  {
    "id": "integer",
    "title": "string",
    "description": "string",
    "image": "string (url)",
    "created_at": "datetime"
  }
  ```

### Videos

#### List/Create Videos
- **URL**: `/api/videos/`
- **Methods**: `GET`, `POST`
- **Permission**: GET: AllowAny, POST: IsAdminUser
- **POST Request Body**:
  ```json
  {
    "title": "string",
    "youtube_url": "string",
    "category": "string (choices: prophecy, crusades, testimonies, healings, prayers, mass_prayers, deliverance, charities, praise, worship)"
  }
  ```
- **Success Response**:
  ```json
  {
    "id": "integer",
    "title": "string",
    "youtube_url": "string",
    "category": "string",
    "created_at": "datetime"
  }
  ```

#### Get Videos by Category
- **URL**: `/api/videos/by_category/?category=<category_name>`
- **Method**: `GET`
- **Permission**: AllowAny
- **Success Response**:
  ```json
  [
    {
      "id": "integer",
      "title": "string",
      "youtube_url": "string",
      "category": "string",
      "created_at": "datetime"
    }
  ]
  ```

### Inspiration Quotes

#### List/Create Quotes
- **URL**: `/api/inspiration-quotes/`
- **Methods**: `GET`, `POST`
- **Permission**: GET: AllowAny, POST: IsAdminUser
- **POST Request Body**:
  ```json
  {
    "quote": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "id": "integer",
    "quote": "string",
    "created_at": "datetime"
  }
  ```

### Prayer Requests

#### Submit Prayer Request
- **URL**: `/api/prayer-requests/`
- **Method**: `POST`
- **Permission**: AllowAny
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "phone_number": "string",
    "country": "string",
    "request": "string"
  }
  ```
- **Success Response**:
  ```json
  {
    "id": "integer",
    "name": "string",
    "email": "string",
    "phone_number": "string",
    "country": "string",
    "request": "string",
    "created_at": "datetime"
  }
  ```

### Testimonies

#### List/Create Testimonies
- **URL**: `/api/testimonies/`
- **Methods**: `GET`, `POST`
- **Permission**: GET: AllowAny, POST: IsAuthenticated
- **POST Request Body**:
  ```json
  {
    "name": "string",
    "testimony_text": "string",
    "testimony_video": "file (optional)"
  }
  ```
- **Success Response**:
  ```json
  {
    "id": "integer",
    "name": "string",
    "testimony_text": "string",
    "testimony_video": "string (url)",
    "created_at": "datetime",
 
  }
  ```

### Upcoming Events

#### List/Create Events
- **URL**: `/api/upcoming-events/`
- **Methods**: `GET`, `POST`
- **Permission**: GET: AllowAny, POST: IsAdminUser
- **POST Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "image": "file",
    "event_date": "datetime"
  }
  ```
- **Success Response**:
  ```json
  {
    "id": "integer",
    "title": "string",
    "description": "string",
    "image": "string (url)",
    "event_date": "datetime",
    "created_at": "datetime"
  }
  ```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## File Upload Guidelines

For endpoints that accept file uploads (images, videos):
- Use `multipart/form-data` content type
- Maximum file size: 10MB for images, 100MB for videos
- Supported image formats: JPG, PNG, GIF
- Supported video formats: MP4, MOV

## Error Responses

The API returns appropriate HTTP status codes:

- 200: Successful request
- 201: Resource created successfully
- 400: Bad request / Invalid data
- 401: Unauthorized
- 403: Forbidden
- 404: Resource not found
- 500: Server error

Error response format:
```json
{
    "error": "Detailed error message"
}
```

## Development Guidelines

- Set `DEBUG=True` in development
- Use `python manage.py test` to run tests
- Make sure to handle CORS properly in production
- Keep sensitive information in environment variables
- Regular backups of media files and database recommended 