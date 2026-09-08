# Backend Contact Form API Documentation

## Overview

This service accepts public contact form messages and provides an authenticated admin API for reviewing, updating, and deleting those messages. Admin authentication uses a JWT stored in an HttpOnly cookie.

## Requirements and scripts

- Node.js
- npm
- MongoDB

Available scripts:

```text
npm run dev  Starts src/index.js with nodemon
npm start    Starts src/index.js with node
```

The automated test script is `npm test`.

## Configuration

Copy `.env.example` to `.env`:

```env
PORT=1198
MONGO_URI=mongodb://127.0.0.1:27017/backend_contact_form_api
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
ADMIN_REGISTRATION_SECRET=replace_with_a_private_admin_setup_secret
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

The application checks `MONGO_URI`, a JWT secret of at least 32 characters, and an admin registration secret of at least 16 characters before starting. The server connects to MongoDB before listening. `CLIENT_ORIGIN` controls credentialed CORS. Production mode enables secure cookies.

## Rate limits and request size

- JSON request bodies are limited to 10 KB.
- Authentication routes allow up to 10 requests per 15-minute window per process.
- Contact routes allow up to 20 requests per 15-minute window per process.

The rate limiter uses in-memory state. A multi-instance deployment needs a shared store for consistent limits.

## Response and logging convention

Every JSON response starts with an `apiUrl` field containing the request path. The server logs completed requests in this format:

```text
[API] METHOD /request/path -> STATUS_CODE
```

## Authentication

### Admin registration

`POST /api/auth/register` is not an open public registration endpoint. It requires:

```http
x-admin-registration-secret: YOUR_ADMIN_REGISTRATION_SECRET
```

The body must contain a valid name, email, and password with at least six characters. Email values are trimmed and lowercased before lookup and storage. The password is hashed with bcrypt before persistence.

### Admin login

`POST /api/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

Successful login sets a `token` HttpOnly cookie containing a JWT that expires after seven days. Invalid credentials return HTTP `401`.

### Admin logout

`POST /api/auth/logout` clears the `token` cookie. A copied JWT remains valid until its expiry because this project does not maintain a server-side token blacklist.

## Contact endpoints

### Public submission

`POST /api/contacts`

```json
{
  "name": "Ashish Ranjan",
  "email": "ash.ranjan09@gmail.com",
  "subject": "Website inquiry",
  "message": "I would like to discuss a project for https://ashishranjan.in/."
}
```

Name, email, subject, and message must be non-empty strings. Email format is checked, and field lengths are limited to 100 characters for name, 200 for subject, and 5000 for message. The response returns a confirmation and the created contact ID only.

### Admin list

`GET /api/contacts?page=1&limit=20`

Returns newest contacts first with pagination metadata. The limit is clamped between 1 and 100.

### Admin single contact

`GET /api/contacts/:id`

The ID must be a valid MongoDB ObjectId. Invalid IDs return HTTP `400`; valid but missing IDs return HTTP `404`.

### Admin status update

`PUT /api/contacts/:id/status`

```json
{
  "status": "read"
}
```

Allowed statuses are `new`, `read`, and `resolved`.

### Admin deletion

`DELETE /api/contacts/:id`

Deletes the selected contact after admin authentication and ID validation.

## Data models

### Admin

- `name`: required trimmed string
- `email`: required unique lowercase string
- `password`: required string with a minimum length of six before hashing
- `createdAt` and `updatedAt`: managed by Mongoose

### Contact

- `name`: required trimmed string, maximum 100 characters
- `email`: required lowercase string with email format validation
- `subject`: required trimmed string, maximum 200 characters
- `message`: required trimmed string, maximum 5000 characters
- `status`: `new`, `read`, or `resolved`, defaulting to `new`
- `createdAt` and `updatedAt`: managed by Mongoose

An index on `{ status: 1, createdAt: -1 }` supports status-based administrative queries.

## Manual test flow

1. Start MongoDB.
2. Copy `.env.example` to `.env` and set private secrets.
3. Start the API with `npm run dev`.
4. Register an admin using the registration secret header.
5. Log in and retain the `token` cookie.
6. Submit a public contact message.
7. List, read, update, and delete the message using the admin cookie.
8. Log out and confirm that the browser clears the cookie.

The included [`rest.http`](rest.http) file contains matching request examples.

## Scope and limitations

The API does not send email notifications and does not include password reset, email verification, refresh tokens, or role management. Admin registration should be used only as a controlled setup operation, and the setup secret must remain private.

## Automated API tests

Run:

```bash
npm test
```

The test suite uses Node's built-in test runner, Supertest, and an in-memory MongoDB instance. It covers health responses, the API URL response field, malformed JSON, admin registration protection, contact submission, protected contact listing, and authentication guards.
