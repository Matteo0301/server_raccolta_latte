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
exports.checkAdmin = exports.authenticateUser = void 0;
const mongoose_1 = require("../mongoose");
const bcrypt_1 = require("bcrypt");
const logger_1 = __importDefault(require("./logger"));
function authenticateUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const request_user = req.params.username;
        const request_password = req.params.password;
        let user = yield (0, mongoose_1.getUser)(request_user);
        if (user && user.password !== undefined && user.admin !== undefined) {
            if ((0, bcrypt_1.compareSync)(request_password, user.password)) {
                logger_1.default.debug('Login successful for ' + request_user);
                req.user = request_user;
                req.admin = user.admin;
                next();
            }
            else {
                logger_1.default.debug('Login failed: wrong password');
                res.sendStatus(401);
            }
        }
        else {
            logger_1.default.debug('Login failed: ' + request_user + ' is not in the database');
            res.sendStatus(401);
        }
    });
}
exports.authenticateUser = authenticateUser;
function checkAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.admin) {
            next();
        }
        else {
            res.sendStatus(403);
        }
    });
}
exports.checkAdmin = checkAdmin;
