import { Server, get } from "http";
import { app, startServer } from "../app";
import { addCollection, addUser, clear, getCollectionByUser, getCollections } from "../lib/mongoose";

const request = require("supertest")
let server: Server

require("dotenv").config()

const port = 3002
let adminToken = ""
let nonAdminToken = ""

beforeAll(async () => {
    server = app.listen(port, async () => {
        startServer()

    })
    await clear()
    addUser("admin", "admin", true)
    addUser("non_admin", "psw", false)
    const adminRes = await request(server).get("/users/auth/admin/admin")
    adminToken = "Bearer " + adminRes.body.token
    const nonAdminRes = await request(server).get("/users/auth/non_admin/psw")
    nonAdminToken = "Bearer " + nonAdminRes.body.token
})
afterAll(() => {
    server.close()
})

describe("Add collection", () => {
    test.concurrent("should add collection", async () => {
        const res = await request(server).post("/collections/admin").set('Authorization', adminToken).send({ quantity: 1 })
        expect(res.status).toBe(201)
        const c = await getCollections()
        for (const coll of c) {
            if (coll.user == "admin") {
                expect(coll.quantity).toBe(1)
            }
        }
    })
    test.concurrent("should add collection to other user if admin", async () => {
        const res = await request(server).post("/collections/non_admin").set('Authorization', adminToken).send({ quantity: 1 })
        expect(res.status).toBe(201)
        const c = await getCollections()
        for (const coll of c) {
            if (coll.user == "non_admin") {
                expect(coll.quantity).toBe(1)
            }
        }
    })
    test.concurrent("should not add collection to other user if not admin", async () => {
        const res = await request(server).post("/collections/admin").set('Authorization', nonAdminToken).send({ quantity: 1 })
        expect(res.status).toBe(403)
    })
})

describe("Get collection", () => {



    test("should get collection", async () => {
        const admin = await getCollectionByUser("admin")
        const res = await request(server).get("/collections/admin").set('Authorization', adminToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(admin.length)
    })
    test("should get collection of other user if admin", async () => {
        const nonAdmin = await getCollectionByUser("non_admin")
        const res = await request(server).get("/collections/non_admin").set('Authorization', adminToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(nonAdmin.length)
    })
    test("should not get collection of other user if not admin", async () => {
        const res = await request(server).get("/collections/admin").set('Authorization', nonAdminToken)
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
        await addCollection(new Date(), 1, "admin")
        await addCollection(new Date(), 2, "admin")
        const c = await getCollectionByUser("admin")
        const id = c[0]._id
        const res = await request(server).delete("/collections/" + id).set('Authorization', adminToken)
        expect(res.status).toBe(204)
        const c2 = await getCollectionByUser("admin")
        expect(c2.length).toBe(c.length - 1)
    })
    test("should delete collection of other user if admin", async () => {
        await addCollection(new Date(), 1, "non_admin")
        await addCollection(new Date(), 2, "non_admin")
        const c = await getCollectionByUser("non_admin")
        const id = c[0]._id
        const res = await request(server).delete("/collections/" + id).set('Authorization', adminToken)
        expect(res.status).toBe(204)
        const c2 = await getCollectionByUser("non_admin")
        expect(c2.length).toBe(c.length - 1)
    })
    test("should not delete collection of other user if not admin", async () => {
        const c = await getCollectionByUser("admin")
        const id = c[0]._id
        const res = await request(server).delete("/collections/" + id).set('Authorization', nonAdminToken)
        expect(res.status).toBe(403)
    })
    test("should not delete non existent collection", async () => {
        const res = await request(server).delete("/collections/123456789012").set('Authorization', adminToken)
        expect(res.status).toBe(404)
    })
})