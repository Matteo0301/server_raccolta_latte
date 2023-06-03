import { Server } from "http";
import { app, startServer } from "../app";
import { connect, close } from "../lib/mongoose"

const request = require("supertest")
let server: Server

require("dotenv").config()

const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://user:password@127.0.0.1:27017/raccolta_latte?authSource=raccolta_latte"
const port = process.env.PORT




describe("GET /auth/admin/admin", () => {

    beforeAll(async () => {
        await connect(CONNECTION_STRING);
        server = app.listen(port, async () => {
            startServer()
        })
    })

    afterAll(async () => {
        server.close(async () => {
            await close()
        })
    })

    it("Authentication", async () => {
        await request(server).get("/auth/admin/admin").expect(200)
    })

})