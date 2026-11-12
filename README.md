# Backend Contact Form API

A secure REST API for receiving contact form messages and managing them through protected admin endpoints. It uses JWT authentication in an HttpOnly cookie and stores submissions in MongoDB.

## Features

- Public contact form submission
- Protected admin login and logout
- Secret-protected admin registration for initial setup
- Admin registration closes after the first admin account is created
- Admin-only contact listing and single-contact access
- Contact status updates: `new`, `read`, and `resolved`
- Contact deletion
- Input validation and length limits
- Rate limiting for authentication and public contact submissions
- Pagination for admin contact lists
- Environment-based CORS and secure production cookies
- Automated API tests with an in-memory MongoDB test database

## Tech Stack

- Node.js
- Express.js
- MongoDB and Mongoose
- bcryptjs
- jsonwebtoken
- cookie-parser
- cors
- express-rate-limit
- helmet

## Project Structure

```text
backend-contact-form-api/
├── src/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── contact.controller.js
│   ├── middlewares/auth.middleware.js
│   ├── models/
│   │   ├── admin.model.js
│   │   └── contact.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── contact.routes.js
│   ├── app.js
│   └── index.js
├── rest.http
├── test/contact-api.test.js
├── .env.example
└── package.json
```

## Setup

### Requirements

- Node.js 20.19 or newer
- npm
- MongoDB or MongoDB Atlas

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and set private values:

```env
PORT=1198
MONGO_URI=mongodb://127.0.0.1:27017/backend_contact_form_api
JWT_SECRET=change_me_generate_a_random_secret_of_at_least_32_chars
ADMIN_REGISTRATION_SECRET=change_me_generate_a_second_random_secret_of_at_least_32_chars
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Replace both example secrets with unique random values of at least 32 characters before starting the API. Admin registration is available only until the first admin has been created. In production, set `NODE_ENV=production` and configure one or more comma-separated frontend origins in `CLIENT_ORIGIN`.

Start the API:

```bash
# Development
npm run dev

# Normal start
npm start
```

The API runs at `http://localhost:1198` by default.

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Setup secret header | Create an admin during setup |
| `POST` | `/api/auth/login` | No | Log in an admin and set the auth cookie |
| `POST` | `/api/auth/logout` | No | Clear the auth cookie |

Initial admin registration requires this header:

```http
x-admin-registration-secret: YOUR_ADMIN_REGISTRATION_SECRET
```

### Contacts

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/contacts` | No | Submit a contact message |
| `GET` | `/api/contacts` | Admin cookie | List contacts with pagination |
| `GET` | `/api/contacts/:id` | Admin cookie | Get one contact |
| `PUT` | `/api/contacts/:id/status` | Admin cookie | Update contact status |
| `DELETE` | `/api/contacts/:id` | Admin cookie | Delete a contact |

### Submit a contact message

```json
{
  "name": "Ashish Ranjan",
  "email": "ash.ranjan09@gmail.com",
  "subject": "Website inquiry",
  "message": "I would like to discuss a project for https://ashishranjan.in/."
}
```

The public response returns a confirmation and `contactId`, not the stored message document.

### List contacts

Use optional query parameters:

```text
GET /api/contacts?page=1&limit=20
```

The limit is capped at 100 records per request.

## Response and logging convention

Every JSON response starts with an `apiUrl` field containing the request path. The server also logs each completed request with its HTTP method, URL, and status code.

## Authentication behavior

Successful initial registration and login set a `token` cookie containing a seven-day HS256 JWT with the `HttpOnly` flag. Admin passwords must be 8-72 UTF-8 bytes and are hashed with bcrypt. In development the cookie uses `SameSite=Lax`; in production it uses `SameSite=None; Secure` so a separately hosted frontend can send it over HTTPS. Production deployments must use HTTPS and set one or more exact frontend origins in `CLIENT_ORIGIN`.

Requests with an `Origin` header to state-changing methods (`POST`, `PUT`, `PATCH`, and `DELETE`) are accepted only from configured frontend origins. Browser clients must send credentialed requests with `credentials: "include"` or Axios `withCredentials: true`.

## Manual testing

The [`rest.http`](rest.http) file contains example requests. Set the registration secret header, register one admin, log in, and then use the saved cookie for protected contact-management requests.

Run the automated API tests with:

```bash
npm test
```

The tests use Supertest and an in-memory MongoDB instance, so they do not modify the development database.

## Scope and limitations

This project does not include email delivery, email verification, password reset, refresh-token rotation, or role management. Rate limiting currently uses in-memory process state, so a distributed deployment should use a shared limiter store.

## Author

**Ashish Ranjan**
Full-Stack Web Developer

## Links

- Portfolio: [ashishranjan.in](https://ashishranjan.in/)
- GitHub: [github.com/a2rp](https://github.com/a2rp)
- CodePen: [codepen.io/ash1198](https://codepen.io/ash1198)
- LinkedIn: [linkedin.com/in/aashishranjan](https://www.linkedin.com/in/aashishranjan)
- Facebook: [facebook.com/theash.ashish](https://www.facebook.com/theash.ashish/)
- YouTube: [Ashish Ranjan](https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1)
- Email: [ash.ranjan09@gmail.com](mailto:ash.ranjan09@gmail.com)

## Support

- [Support page](https://a2rp-donation-page.netlify.app/)
- [Buy Me a Coffee](https://buymeacoffee.com/a2rp)
- [Patreon](https://www.patreon.com/a2rp)

## License

This project is distributed under the [MIT License](LICENSE).
