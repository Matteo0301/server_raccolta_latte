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
exports.deleteUser = exports.updateUser = exports.getUsers = exports.getUser = exports.addUser = exports.db = exports.close = exports.connect = void 0;
const mongoose_1 = require("mongoose");
Object.defineProperty(exports, "connect", { enumerable: true, get: function () { return mongoose_1.connect; } });
const logger_1 = __importDefault(require("./logger"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const schemas_1 = require("./schemas");
let db;
exports.db = db;
function connect(CONNECTION_STRING, DATABASE) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, mongoose_1.set)("strictQuery", false);
        try {
            /* client = new MongoClient(CONNECTION_STRING)
            await client.connect()
            db = client.db(DATABASE) */
            exports.db = db = yield (0, mongoose_1.connect)(CONNECTION_STRING + DATABASE);
        }
        catch (error) {
            logger_1.default.error("Error connecting to MongoDB: " + error);
            process.exit(1);
        }
    });
}
function close() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.disconnect();
    });
}
exports.close = close;
function generateHash(password) {
    let salt_rounds = 10;
    if (process.env.SALT_ROUNDS) {
        salt_rounds = parseInt(process.env.SALT_ROUNDS);
    }
    return bcrypt_1.default.hashSync(password, bcrypt_1.default.genSaltSync(salt_rounds));
}
function addUser(username, password, admin) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPassword = generateHash(password);
        yield schemas_1.User.create({ username: username, password: hashedPassword, admin: admin });
    });
}
exports.addUser = addUser;
function getUser(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db.collection('utenti').find({ username: username }).exec();
    });
}
exports.getUser = getUser;
function getUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db.collection('utenti').find().exec().toArray();
    });
}
exports.getUsers = getUsers;
function updateUser(username, password, admin) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPassword = generateHash(password);
        yield db.collection('utenti').updateOne({ username: username }, { $set: { password: hashedPassword, admin: admin } });
    });
}
exports.updateUser = updateUser;
function deleteUser(username) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.collection('utenti').deleteOne({ username: username });
    });
}
exports.deleteUser = deleteUser;