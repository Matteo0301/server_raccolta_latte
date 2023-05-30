"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../app");
const database_1 = require("../lib/database");
const request = require("supertest");
let server;
require("dotenv").config();
const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://user:password@127.0.0.1:27017/raccolta_latte?authSource=raccolta_latte";
const DATABASE = process.env.DATABASE || 'raccolta_latte';
const port = process.env.PORT;
let client;
let db;
describe("GET /auth/admin/admin", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, database_1.connect)(CONNECTION_STRING, DATABASE);
        server = app_1.app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
            (0, app_1.startServer)();
        }));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, database_1.close)();
        }));
    }));
    it("Authentication", () => __awaiter(void 0, void 0, void 0, function* () {
        yield request(server).get("/auth/admin/admin").expect(200);
    }));
});
