import { Server } from "http";
import { app, startServer } from "../app";
import { addCollection, addImage, addOrigin, addUser, clear, getCollectionByUser, getCollections } from "../lib/mongoose";
import { generateAccessToken } from "../lib/util/token";

const request = require("supertest")
let server: Server

require("dotenv").config()

const port = 3002
let adminToken = ""
let nonAdminToken = ""
const nonAdminName = "notadmin"
const adminName = "admin"
const origin1 = "first"
const origin2 = "second"
const image = "SGVsbG8="

beforeAll(async () => {
    server = app.listen(port, async () => {
        startServer()
    })
    await clear()
    addUser(adminName, "admin", true)
    addUser(nonAdminName, "psw", false)
    addOrigin(origin1, 0, 0)
    addOrigin(origin2, 0, 0)
    adminToken = "Bearer " + generateAccessToken(adminName, true)
    nonAdminToken = "Bearer " + generateAccessToken(nonAdminName, false)
})
afterAll(() => {
    server.close()
})

describe("Add collection", () => {
    const now = new Date()
    test.concurrent("should add collection", async () => {
        const res = await request(server).post("/collections/" + adminName + "/" + origin1).set('Authorization', adminToken).send({ quantity: 2, quantity2: 1, date: now.toISOString(), image: image })
        expect(res.status).toBe(201)
        const c = await getCollections(now, new Date())
        for (const coll of c) {
            if (coll.user == "admin") {
                expect(coll.quantity).toBe(2)
                expect(coll.quantity2).toBe(1)
            }
        }
    })

    test.concurrent("should not add collection if missing quantity", async () => {
        const res = await request(server).post("/collections/" + adminName + "/" + origin1).set('Authorization', adminToken).send({ quantity2: 1 })
        expect(res.status).toBe(400)
    })

    test.concurrent("should not add collection if missing quantity2", async () => {
        const res = await request(server).post("/collections/" + adminName + "/" + origin1).set('Authorization', adminToken).send({ quantity: 1 })
        expect(res.status).toBe(400)
    })

    test.concurrent("should not add collection if quantity < quantity2", async () => {
        const res = await request(server).post("/collections/" + adminName + "/" + origin1).set('Authorization', adminToken).send({ quantity: 1, quantity2: 2 })
        expect(res.status).toBe(400)
    })

    test.concurrent("should add collection to other user if admin", async () => {
        const res = await request(server).post("/collections/" + nonAdminName + "/" + origin1).set('Authorization', adminToken).send({ quantity: 2, quantity2: 1, date: now.toISOString(), image: image })
        expect(res.status).toBe(201)
        const c = await getCollections(now, new Date())
        for (const coll of c) {
            if (coll.user == "non_admin") {
                expect(coll.quantity).toBe(2)
                expect(coll.quantity2).toBe(1)
            }
        }
    })
    test.concurrent("should not add collection to other user if not admin", async () => {
        const res = await request(server).post("/collections/" + adminName + "/" + origin1).set('Authorization', nonAdminToken).send({ quantity: 1 })
        expect(res.status).toBe(403)
    })
})

describe("Get collection", () => {

    const now = new Date()

    test("should get collection", async () => {
        const admin = await getCollectionByUser("admin", now, new Date())
        const res = await request(server).get("/collections/byuser/" + adminName + "/" + now.toISOString() + "/" + (new Date).toISOString()).set('Authorization', adminToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(admin.length)
    })
    test("should get collection of other user if admin", async () => {
        const nonAdmin = await getCollectionByUser(nonAdminName, now, new Date())
        const res = await request(server).get("/collections/byuser/" + nonAdminName + "/" + now.toISOString() + "/" + (new Date).toISOString()).set('Authorization', adminToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(nonAdmin.length)
    })
    test("should not get collection of other user if not admin", async () => {
        const res = await request(server).get("/collections/byuser/" + adminName + "/" + now.toISOString() + "/" + (new Date).toISOString()).set('Authorization', nonAdminToken)
        expect(res.status).toBe(403)
    })

    test("should get all collections if admin", async () => {
        const all = await getCollections(now, new Date())
        const res = await request(server).get("/collections/" + now.toISOString() + "/" + (new Date).toISOString()).set('Authorization', adminToken)
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(all.length)
    })

    test("should not get all collections if not admin", async () => {
        const res = await request(server).get("/collections/" + now.toISOString() + "/" + (new Date).toISOString()).set('Authorization', nonAdminToken)
        expect(res.status).toBe(403)
    })

    test("should get image", async () => {
        await addImage(image, now)
        const res = await request(server).get("/collections/" + now.toISOString()).set('Authorization', nonAdminToken)
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual(Buffer.from(image,'base64'))
    })

})

describe("Delete collection", () => {
    const now = new Date()
    test("should delete collection", async () => {
        await addCollection(new Date(), 2, 1, adminName, origin1)
        await addCollection(new Date(), 3, 2, adminName, origin1)
        const c = await getCollectionByUser(adminName, now, new Date())
        const id = c[0]._id
        const res = await request(server).delete("/collections/" + id).set('Authorization', adminToken)
        expect(res.status).toBe(204)
        const c2 = await getCollectionByUser(adminName, now, new Date())
        expect(c2.length).toBe(c.length - 1)
    })
    test("should delete collection of other user if admin", async () => {
        await addCollection(new Date(), 2, 1, nonAdminName, origin1)
        await addCollection(new Date(), 3, 2, nonAdminName, origin1)
        const c = await getCollectionByUser(nonAdminName, now, new Date())
        const id = c[0]._id
        const res = await request(server).delete("/collections/" + id).set('Authorization', adminToken)
        expect(res.status).toBe(204)
        const c2 = await getCollectionByUser(nonAdminName, now, new Date())
        expect(c2.length).toBe(c.length - 1)
    })
    test("should not delete collection of other user if not admin", async () => {
        const c = await getCollectionByUser(adminName, now, new Date())
        const id = c[0]._id
        const res = await request(server).delete("/collections/" + id).set('Authorization', nonAdminToken)
        expect(res.status).toBe(403)
    })
    test("should not delete non existent collection", async () => {
        const res = await request(server).delete("/collections/123456789012").set('Authorization', adminToken)
        expect(res.status).toBe(404)
    })
})