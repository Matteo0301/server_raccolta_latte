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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../lib/database");
const moongoose_1 = require("../lib/moongoose");
const logger_1 = __importDefault(require("../lib/logger"));
require("dotenv").config();
const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://user:password@127.0.0.1:27017/raccolta_latte?authSource=raccolta_latte/";
const DATABASE = process.env.DATABASE || 'raccolta_latte';
const port = process.env.PORT;
describe("Database", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, database_1.connect)(CONNECTION_STRING, DATABASE);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, database_1.close)();
    }));
    it("Database", () => __awaiter(void 0, void 0, void 0, function* () {
        let users = yield (0, moongoose_1.getUsers)();
        logger_1.default.debug(users);
        expect(users).not.toBeNull();
    }));
});
