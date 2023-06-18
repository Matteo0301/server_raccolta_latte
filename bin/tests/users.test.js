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
const mongoose_1 = require("../lib/mongoose");
const bcrypt_1 = require("bcrypt");
const request = require("supertest");
let server;
require("dotenv").config();
const port = process.env.PORT;
let token = "";
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    server = app_1.app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
        (0, app_1.startServer)();
    }));
    yield (0, mongoose_1.clear)();
    (0, mongoose_1.addUser)("admin", "admin", true);
    const res = yield request(server).get("/users/auth/admin/admin");
    token = "Bearer " + res.body.token;
}));
afterAll(() => {
    server.close();
});
describe("Authentication", () => {
    test.concurrent("should login as admin", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(server).get("/users/auth/admin/admin");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.token).not.toBeNull();
        token = "Bearer " + res.body.token;
    }));
    test.concurrent.each([
        ["admin", "a", 401],
        ["a", "admin", 401],
        ["a", "a", 401],
    ])("should not login with wrong credentials: %s %s", (username, password, status) => __awaiter(void 0, void 0, void 0, function* () {
        yield request(server).get("/users/auth/" + username + "/" + password).expect(status);
    }));
    test.concurrent("should login as user", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mongoose_1.addUser)("user", "pass", false);
        const res = yield request(server).get("/users/auth/user/pass");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.token).not.toBeNull();
    }));
    test.concurrent("should add user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(server).post("/users").set('Authorization', token).send({ username: "newUser", password: "pass", admin: false });
        expect(res.status).toBe(201);
        expect(res.text).toBe("/users/newUser");
        const u = yield (0, mongoose_1.getUser)("newUser");
        expect(u).not.toBeNull();
        if (u != null) {
            expect(u.username).toBe("newUser");
            expect((0, bcrypt_1.compareSync)("pass", u.password)).toBeTruthy();
            expect(u.admin).toBeFalsy();
        }
    }));
    test.concurrent.each([
        ["fromAdmin", "pass", true, "pass", false],
        ["toAdmin", "pass", false, "pass", true],
        ["changePass", "pass", true, "newpass", true],
        ["changeAll", "pass", true, "newpass", false],
    ])(`should change user: %s %s %s to %s %s`, (username, password, admin, newPass, newAdmin) => __awaiter(void 0, void 0, void 0, function* () {
        (0, mongoose_1.addUser)(username, password, admin);
        const res = yield request(server).patch("/users/" + username).set('Authorization', token).send({ password: newPass, admin: newAdmin });
        expect(res.status).toBe(204);
        const user = yield (0, mongoose_1.getUser)(username);
        expect(user).not.toBeNull();
        if (user != null) {
            expect(user.admin).toBe(newAdmin);
            expect((0, bcrypt_1.compareSync)(newPass, user.password)).toBeTruthy();
        }
    }));
    test.concurrent("should not update user with no password or admin", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, mongoose_1.addUser)("wrongRequest", "pass", false);
        const res = yield request(server).patch("/users/wrongRequest").set('Authorization', token).send();
        expect(res.status).toBe(400);
    }));
    test.concurrent("should not update inexistent user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(server).patch("/users/inexistent").set('Authorization', token).send({ password: "pass", admin: true });
        expect(res.status).toBe(404);
    }));
    test.concurrent("should delete user", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, mongoose_1.addUser)("toBeDeleted", "pass", false);
        const res = yield request(server).delete("/users/toBeDeleted").set('Authorization', token);
        expect(res.status).toBe(204);
        const user = yield (0, mongoose_1.getUser)("toBeDeleted");
        expect(user).toBeNull();
    }));
    test("should not delete inexistent user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(server).delete("/users/inexistent").set('Authorization', token);
        expect(res.status).toBe(404);
    }));
    test("should get all users", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(server).get("/users").set('Authorization', token);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("users");
        expect(res.body.users).not.toBeNull();
        const users = (yield (0, mongoose_1.getUsers)());
        expect(res.body.users).toEqual(users);
    }));
});
