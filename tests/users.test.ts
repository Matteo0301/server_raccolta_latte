import { after } from "node:test";
import express, { Express, Request, Response } from 'express'
import { Server, IncomingMessage, ServerResponse } from "http";
import { app, startServer } from "..";
import { Db, MongoClient } from "mongodb";

const database = require("../lib/database")
const request = require("supertest")
let server: Server

require("dotenv").config()

const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://user:password@127.0.0.1:27017/raccolta_latte?authSource=raccolta_latte"
const DATABASE = process.env.DATABASE || 'raccolta_latte'
const port = process.env.PORT

let client: MongoClient
let db: Db




describe("GET /auth/admin/admin", () => {

    beforeAll(async () => {
        await database.connect(CONNECTION_STRING, DATABASE);
        server = app.listen(port, async () => {
            startServer()
        })
    })

    afterAll(async () => {
        server.close(async () => {
            await database.close()
        })
    })

    it("Authentication", async () => {
        await request(server).get("/auth/admin/admin").expect(200)
    })

})