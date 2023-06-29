import { Server, get } from "http";
import { app, startServer } from "../app";
import { addCollection, addOrigin, addUser, clear, getCollectionByUser, getCollections, getCollectionsByOrigin, getOrigins } from "../lib/mongoose";
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
const origin3 = "third"


beforeAll(async () => {
    server = app.listen(port, async () => {
        startServer()

    })
    await clear()
    addUser(adminName, "admin", true)
    addUser(nonAdminName, "psw", false)
    addOrigin(origin1)
    adminToken = "Bearer " + generateAccessToken(adminName, true)
    nonAdminToken = "Bearer " + generateAccessToken(nonAdminName, false)
})
afterAll(() => {
    server.close()
})

describe("Add origin", () => {
    test.concurrent("should add origin if admin", async () => {
        const res = await request(server).post("/origins/" + origin2).set('Authorization', adminToken).send()
        expect(res.status).toBe(201)
        const o = await getOrigins()
        const r = o.map((o: any) => o.name);
        expect(r).toContain(origin2)
    })
    test.concurrent("should not add origin if not admin", async () => {
        const res = await request(server).post("/origins/" + origin3).set('Authorization', nonAdminToken).send()
        expect(res.status).toBe(403)
        const o = await getOrigins()
        const r = o.map((o: any) => o.name);
        expect(r).not.toContain(origin3)
    })
    test.concurrent("should not add origin if already present", async () => {
        const res = await request(server).post("/origins/" + origin1).set('Authorization', adminToken).send()
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
    test("should not get origins if not admin", async () => {
        const res = await request(server).get("/origins").set('Authorization', nonAdminToken).send()
        expect(res.status).toBe(403)
    })

    test("should get origins if not logged", async () => {
        const o = "byOrigin"
        addOrigin(o)
        addCollection(new Date(), 1, adminName, o)
        addCollection(new Date(), 1, adminName, o)
        const res = await request(server).get("/origins/" + o).set('Authorization', adminToken).send()
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(2)
        expect(res.body).toMatchInlineSnapshot(`
[
  {
    "date": "2023-06-29T15:43:17.574Z",
    "origin": "byOrigin",
    "quantity": 1,
    "user": "admin",
  },
  {
    "date": "2023-06-29T15:43:17.575Z",
    "origin": "byOrigin",
    "quantity": 1,
    "user": "admin",
  },
]
`)
    })
})

