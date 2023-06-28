import { Server } from "http";
import { app, startServer } from "../app";
import { addUser, clear, getUser, getUsers } from "../lib/mongoose";
import { compareSync } from "bcryptjs";
import { generateAccessToken } from "../lib/util/token";

const request = require("supertest")
let server: Server

require("dotenv").config()

const port = 3001
let token = ""

beforeAll(async () => {
    server = app.listen(port, async () => {
        startServer()

    })
    await clear()
    addUser("admin", "admin", true)
    token = "Bearer " + generateAccessToken("admin", true)
})
afterAll(() => {
    server.close()
})


describe("Authentication", () => {

    test.concurrent("should login as admin", async () => {
        const res = await request(server).get("/users/auth/admin/admin")
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("token")
        expect(res.body.token).not.toBeNull()
    })

    test.concurrent.each([
        ["admin", "a", 401],
        ["a", "admin", 401],
        ["a", "a", 401],
    ])("should not login with wrong credentials: %s %s", async (username, password, status) => {
        await request(server).get("/users/auth/" + username + "/" + password).expect(status)
    })

    test.concurrent("should login as user", async () => {
        await addUser("user", "pass", false)
        const res = await request(server).get("/users/auth/user/pass")
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("token")
        expect(res.body.token).not.toBeNull()
    })
})


describe("Add user", () => {
    test.concurrent("should add user", async () => {
        const res = await request(server).put("/users").set('Authorization', token).send({ username: "newUser", password: "pass", admin: false })
        expect(res.status).toBe(201)
        expect(res.text).toBe("/users/newUser")
        const u = await getUser("newUser")
        expect(u).not.toBeNull()
        if (u != null) {
            expect(u.username).toBe("newUser")
            expect(compareSync("pass", u.password as string)).toBeTruthy()
            expect(u.admin).toBeFalsy()
        }
    })
})

describe("Update user", () => {
    test.concurrent.each([
        ["fromAdmin", "pass", true, "pass", false],
        ["toAdmin", "pass", false, "pass", true],
        ["changePass", "pass", true, "newpass", true],
        ["changeAll", "pass", true, "newpass", false],
    ])(`should change user: %s %s %s to %s %s`, async (username, password, admin, newPass, newAdmin) => {
        addUser(username, password, admin)
        const res = await request(server).patch("/users/" + username).set('Authorization', token).send({ password: newPass, admin: newAdmin })
        expect(res.status).toBe(204)
        const user = await getUser(username)
        expect(user).not.toBeNull()
        if (user != null) {
            expect(user.admin).toBe(newAdmin)
            expect(compareSync(newPass, user.password as string)).toBeTruthy()
        }
    })

    test.concurrent("should not update user with no password or admin", async () => {
        addUser("wrongRequest", "pass", false)
        const res = await request(server).patch("/users/wrongRequest").set('Authorization', token).send()
        expect(res.status).toBe(400)
    })

    test.concurrent("should not update inexistent user", async () => {
        const res = await request(server).patch("/users/inexistent").set('Authorization', token).send({ password: "pass", admin: true })
        expect(res.status).toBe(404)
    })
})

describe("Delete user", () => {
    test.concurrent("should delete user", async () => {
        addUser("toBeDeleted", "pass", false)
        const res = await request(server).delete("/users/toBeDeleted").set('Authorization', token)
        expect(res.status).toBe(204)
        const user = await getUser("toBeDeleted")
        expect(user).toBeNull()
    })

    test("should not delete inexistent user", async () => {
        const res = await request(server).delete("/users/inexistent").set('Authorization', token)
        expect(res.status).toBe(404)
    })
})

describe("Get users", () => {
    test("should get all users", async () => {
        const res = await request(server).get("/users").set('Authorization', token)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("users")
        expect(res.body.users).not.toBeNull()
        const users = (await getUsers())
        expect(res.body.users).toEqual(users)
    })
})