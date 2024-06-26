import { Server, get } from "http";
import { app, startServer } from "../app";
import { addCollection, addOrigin, addUser, clear, getCollectionByUser, getCollections, getCollectionsByOrigin, getOrigin, getOrigins } from "../lib/mongoose";
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
const origin2 = "secondsecond"
const origin3 = "third"
const originSpecial = "origin special 1"


beforeAll(async () => {
    server = app.listen(port, async () => {
        startServer()

    })
    await clear()
    addUser(adminName, "admin", true)
    addUser(nonAdminName, "psw", false)
    addOrigin(origin1, 0, 0)
    adminToken = "Bearer " + generateAccessToken(adminName, true)
    nonAdminToken = "Bearer " + generateAccessToken(nonAdminName, false)
})
afterAll(() => {
    server.close()
})

describe("Add origin", () => {
    test.concurrent("should add origin if admin", async () => {
        const res = await request(server).post("/origins/" + origin2 + "/0/0").set('Authorization', adminToken).send()
        expect(res.status).toBe(201)
        const o = await getOrigins()
        const r = o.map((o: any) => o.name);
        expect(r).toContain(origin2)
    })
    test.concurrent("should add origin with spaces and numbers", async () => {
        const res = await request(server).post("/origins/" + originSpecial + "/0/0").set('Authorization', adminToken).send()
        expect(res.status).toBe(201)
        const o = await getOrigins()
        const r = o.map((o: any) => o.name);
        expect(r).toContain(originSpecial)
    })
    test.concurrent("should not add origin if not admin", async () => {
        const res = await request(server).post("/origins/" + origin3 + "/0/0").set('Authorization', nonAdminToken).send()
        expect(res.status).toBe(403)
        const o = await getOrigins()
        const r = o.map((o: any) => o.name);
        expect(r).not.toContain(origin3)
    })
    test.concurrent("should not add origin if already present", async () => {
        const res = await request(server).post("/origins/" + origin1 + "/0/0").set('Authorization', adminToken).send()
        expect(res.status).toBe(409)
    })
})

describe("Delete origin", () => {
    test.concurrent("should not delete origin if not admin", async () => {
        const res = await request(server).delete("/origins/" + origin2).set('Authorization', nonAdminToken).send()
        expect(res.status).toBe(403)
        const o = await getOrigins()
        const r = o.map((o: any) => o.name);
        expect(r).toContain(origin2)
    })
    test.concurrent("should delete origin if admin", async () => {
        const res = await request(server).delete("/origins/" + origin1).set('Authorization', adminToken).send()
        expect(res.status).toBe(201)
        const o = await getOrigins()
        const r = o.map((o: any) => o.name);
        expect(r).not.toContain(origin1)
    })

    test.concurrent("should delete origin wit spaces and numbers", async () => {
        const res = await request(server).delete("/origins/" + originSpecial).set('Authorization', adminToken).send()
        expect(res.status).toBe(201)
        const o = await getOrigins()
        const r = o.map((o: any) => o.name);
        expect(r).not.toContain(originSpecial)
    })

    test.concurrent("should not delete origin if not present", async () => {
        const res = await request(server).delete("/origins/" + origin3).set('Authorization', adminToken).send()
        expect(res.status).toBe(409)
    })
})

describe("Get origins", () => {
    test("should get origins", async () => {
        const res = await request(server).get("/origins").set('Authorization', adminToken).send()
        expect(res.status).toBe(200)
    })

    test("should get origins if not logged", async () => {
        const o = "byOrigin"
        addOrigin(o, 0, 0)
        addCollection(new Date(), 2, 1, adminName, o)
        addCollection(new Date(), 3, 2, adminName, o)
        const res = await request(server).get("/origins/" + o).set('Authorization', adminToken).send()
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(2)
    })
})

describe("Update origins", () => {
    test.concurrent("should update origin", async () => {

        const name = "toChange"
        const newName = "changed 1"
        const newLat = 1
        const newLng = 1
        addOrigin(name, 0, 0)
        const res = await request(server).patch("/origins/" + name).set('Authorization', adminToken).send({ name: newName, lat: newLat, lng: newLng })
        expect(res.status).toBe(204)
        const o = await getOrigin(newName)
        expect(o).not.toBeNull()
        if (o != null) {
            expect(o.lng).toBe(newLng)
            expect(o.lat).toBe(newLat)
        }
    })
})

