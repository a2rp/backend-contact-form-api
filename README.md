# backend-contact-form-api

Backend API for contact form submissions and admin read panel using JWT and HttpOnly cookies.

## Features

- Public contact form submission API
- Admin register
- Admin login
- Admin logout
- Get all contact submissions
- Get single contact submission
- Update contact submission status
- Delete contact submission
- Protected admin routes
- JWT authentication
- HttpOnly cookie based auth
- MongoDB with Mongoose

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- cookie-parser

## Environment Variables

Create a .env file:

```bash
PORT=1204
MONGO_URI=mongodb://127.0.0.1:27017/backend_contact_form_api
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## API Endpoints

### Auth

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout

### Contacts

- POST /api/contacts
- GET /api/contacts
- GET /api/contacts/:id
- PUT /api/contacts/:id/status
- DELETE /api/contacts/:id

### Contact Fields

- name
- email
- subject
- message
- status → new, read, resolved

## Notes

- Public users can only submit the contact form
- Only admin can read and manage submissions
- Authentication via HttpOnly cookies
- Use withCredentials: true in frontend

## Follow Me

- GitHub: https://github.com/a2rp
- Portfolio: https://www.ashishranjan.net
- LinkedIn: https://www.linkedin.com/in/aashishranjan
- Facebook: https://www.facebook.com/theash.ashish/
- YouTube: https://www.youtube.com/@ashishranjan-ashz
