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
exports.setSecret = exports.authenticateToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const logger_1 = __importDefault(require("./logger"));
const database_1 = require("./database");
let secret = "";
function generateAccessToken(username, admin) {
    logger_1.default.debug('Secret: ' + secret);
    return (0, jsonwebtoken_1.sign)({ username: username, admin: admin }, secret, { expiresIn: '24h' });
}
exports.generateAccessToken = generateAccessToken;
function setSecret(new_secret) {
    secret = new_secret;
}
exports.setSecret = setSecret;
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let token;
        const header = req.headers['authorization'];
        logger_1.default.debug(header);
        if (header && typeof header === 'string') {
            token = header.split(' ')[1];
        }
        else {
            res.sendStatus(401);
            return;
        }
        //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNjg0NjYyMDYxLCJleHAiOjE2ODQ3NDg0NjF9.jvQLv78byAd_JDJJIciqdpdQVTnW4z0dtHbhPJy8u3s"
        if (token == null) {
            logger_1.default.info('Token is null');
            return res.sendStatus(401);
        }
        (0, jsonwebtoken_1.verify)(token, secret, (err, user) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                logger_1.default.error(err);
                logger_1.default.debug('Authentication failed');
                return res.sendStatus(403);
            }
            const db_user = yield (0, database_1.getUser)(user.username);
            if (!db_user) {
                logger_1.default.debug('Authentication failed: ' + user.username + ' is not in the database');
                return res.sendStatus(403);
            }
            req.user = user.username;
            req.admin = user.admin;
            logger_1.default.info('Authentication successful: ' + req.user);
            next();
        }));
    });
}
exports.authenticateToken = authenticateToken;
