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
const mongoose_1 = require("../lib/mongoose");
const schemas_1 = require("../lib/schemas");
require("dotenv").config();
describe("Users", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mongoose_1.clear)();
    }));
    test("Get users", () => __awaiter(void 0, void 0, void 0, function* () {
        let users = yield (0, mongoose_1.getUsers)();
        expect(users.toString()).toBe("");
    }));
    test("Add users", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mongoose_1.addUser)("test", "test", false);
        let users = yield (0, mongoose_1.getUser)("test");
        expect(users).not.toBeNull();
        if (users)
            expect(users.admin).toBeFalsy();
    }));
    test("Update users", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mongoose_1.updateUser)("test", "test", true);
        let users = yield (0, mongoose_1.getUser)("test");
        expect(users).not.toBeNull();
        if (users)
            expect(users.admin).toBeTruthy();
    }));
    test("Delete users", () => __awaiter(void 0, void 0, void 0, function* () {
        yield schemas_1.User.deleteOne({ username: "test" }).exec();
        let users = yield (0, mongoose_1.getUser)("test");
        expect(users).toBeNull();
    }));
});
