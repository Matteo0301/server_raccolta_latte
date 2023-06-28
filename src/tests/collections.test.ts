import { Server, get } from "http";
import { app, startServer } from "../app";
import { addCollection, addUser, clear, getCollectionByUser, getCollections } from "../lib/mongoose";
import { generateAccessToken } from "../lib/util/token";

const request = require("supertest")
let server: Server

require("dotenv").config()

const port = 3002
let adminToken = ""
let nonAdminToken = ""
const nonAdminName = "notadmin"
const adminName = "admin"

beforeAll(async () => {
    server = app.listen(port, async () => {
        startServer()

    })
    await clear()
    addUser(adminName, "admin", true)
    addUser(nonAdminName, "psw", false)
    adminToken = "Bearer " + generateAccessToken(adminName, true)
    nonAdminToken = "Bearer " + generateAccessToken(nonAdminName, false)
})
afterAll(() => {
    server.close()
})

describe("Add collection", () => {
    test.concurrent("should add collection", async () => {
        const res = await request(server).post("/collections/" + adminName).set('Authorization', adminToken).send({ quantity: 1 })
        expect(res.status).toBe(201)
        const c = await getCollections()
        for (const coll of c) {
            if (coll.user == "admin") {
                expect(coll.quantity).toBe(1)
            }
        }
    })
    test.concurrent("should add collection to other user if admin", async () => {
        const res = await request(server).post("/collections/" + nonAdminName).set('Authorization', adminToken).send({ quantity: 1 })
        expect(res.status).toBe(201)
        const c = await getCollections()
        for (const coll of c) {
            if (coll.user == "non_admin") {
                expect(coll.quantity).toBe(1)
            }
        }
    })
    test.concurrent("should not add collection to other user if not admin", async () => {
        const res = await request(server).post("/collections/" + adminName).set('Authorization', nonAdminToken).send({ quantity: 1 })
        expect(res.status).toBe(403)
    })
})

describe("Get collection", () => {



    test("should get collection", async () => {
        const admin = await getCollectionByUser("admin")
        const res = await request(server).get("/collections/" + adminName).set('Authorization', adminToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(admin.length)
    })
    test("should get collection of other user if admin", async () => {
        const nonAdmin = await getCollectionByUser(nonAdminName)
        const res = await request(server).get("/collections/" + nonAdminName).set('Authorization', adminToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(nonAdmin.length)
    })
    test("should not get collection of other user if not admin", async () => {
        const res = await request(server).get("/collections/" + adminName).set('Authorization', nonAdminToken)
        expect(res.status).toBe(403)
    })

    test("should get all collections if admin", async () => {
        const all = await getCollections()
        const res = await request(server).get("/collections").set('Authorization', adminToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(all.length)
    })

    test("should not get all collections if not admin", async () => {
        const res = await request(server).get("/collections").set('Authorization', nonAdminToken)
        expect(res.status).toBe(403)
    })
})

describe("Delete collection", () => {
    test("should delete collection", async () => {
        await addCollection(new Date(), 1, adminName)
        await addCollection(new Date(), 2, adminName)
        const c = await getCollectionByUser(adminName)
        const id = c[0]._id
        const res = await request(server).delete("/collections/" + id).set('Authorization', adminToken)
        expect(res.status).toBe(204)
        const c2 = await getCollectionByUser(adminName)
        expect(c2.length).toBe(c.length - 1)
    })
    test("should delete collection of other user if admin", async () => {
        await addCollection(new Date(), 1, nonAdminName)
        await addCollection(new Date(), 2, nonAdminName)
        const c = await getCollectionByUser(nonAdminName)
        const id = c[0]._id
        const res = await request(server).delete("/collections/" + id).set('Authorization', adminToken)
        expect(res.status).toBe(204)
        const c2 = await getCollectionByUser(nonAdminName)
        expect(c2.length).toBe(c.length - 1)
    })
    test("should not delete collection of other user if not admin", async () => {
        const c = await getCollectionByUser(adminName)
        const id = c[0]._id
        const res = await request(server).delete("/collections/" + id).set('Authorization', nonAdminToken)
        expect(res.status).toBe(403)
    })
    test("should not delete non existent collection", async () => {
        const res = await request(server).delete("/collections/123456789012").set('Authorization', adminToken)
        expect(res.status).toBe(404)
    })
})