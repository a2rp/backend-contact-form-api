require("dotenv").config();

process.env.JWT_SECRET ||= "test_jwt_secret_that_is_longer_than_32_characters";
process.env.ADMIN_REGISTRATION_SECRET ||= "test_admin_registration_secret";
process.env.NODE_ENV = "test";

const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");

let mongoServer;

const assertApiUrlIsFirst = (response, expectedUrl) => {
    assert.equal(response.body.apiUrl, expectedUrl);
    assert.equal(Object.keys(response.body)[0], "apiUrl");
};

test.before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

test.after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
});

test.beforeEach(async () => {
    await mongoose.connection.collection("admins").deleteMany({});
    await mongoose.connection.collection("contacts").deleteMany({});
});

test("returns the API URL first in the health response", async () => {
    const response = await request(app).get("/").expect(200);

    assertApiUrlIsFirst(response, "/");
    assert.equal(response.body.message, "Contact Form API is running");
});

test("rejects malformed JSON with a JSON error response", async () => {
    const response = await request(app)
        .post("/api/contacts")
        .set("Content-Type", "application/json")
        .send("{")
        .expect(400);

    assertApiUrlIsFirst(response, "/api/contacts");
    assert.equal(response.body.message, "Invalid JSON request body");
});

test("requires the admin registration secret", async () => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Admin User",
            email: "admin@example.com",
            password: "123456",
        })
        .expect(403);

    assertApiUrlIsFirst(response, "/api/auth/register");
});

test("supports the protected admin contact workflow", async () => {
    const adminAgent = request.agent(app);

    const registerResponse = await adminAgent
        .post("/api/auth/register")
        .set("x-admin-registration-secret", process.env.ADMIN_REGISTRATION_SECRET)
        .send({
            name: "Admin User",
            email: "admin@example.com",
            password: "123456",
        })
        .expect(201);

    assertApiUrlIsFirst(registerResponse, "/api/auth/register");

    const submitResponse = await request(app)
        .post("/api/contacts")
        .send({
            name: "Ashish Ranjan",
            email: "ash.ranjan09@gmail.com",
            subject: "Website inquiry",
            message: "Please contact me about a project.",
        })
        .expect(201);

    assertApiUrlIsFirst(submitResponse, "/api/contacts");
    assert.ok(submitResponse.body.contactId);

    const listResponse = await adminAgent.get("/api/contacts").expect(200);

    assertApiUrlIsFirst(listResponse, "/api/contacts");
    assert.equal(listResponse.body.contacts.length, 1);
    assert.equal(listResponse.body.pagination.total, 1);
});

test("rejects protected contact access without an admin cookie", async () => {
    const response = await request(app).get("/api/contacts").expect(401);

    assertApiUrlIsFirst(response, "/api/contacts");
    assert.equal(response.body.message, "Not authorized, no token found");
});

test("clears the admin cookie on logout", async () => {
    const adminAgent = request.agent(app);

    await adminAgent
        .post("/api/auth/register")
        .set("x-admin-registration-secret", process.env.ADMIN_REGISTRATION_SECRET)
        .send({
            name: "Admin User",
            email: "admin@example.com",
            password: "123456",
        })
        .expect(201);

    await adminAgent.post("/api/auth/logout").expect(200);

    const response = await adminAgent.get("/api/contacts").expect(401);

    assertApiUrlIsFirst(response, "/api/contacts");
});
