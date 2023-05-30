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
exports.startServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const morganMiddleware_1 = __importDefault(require("./lib/morganMiddleware"));
const logger_1 = __importDefault(require("./lib/logger"));
require("./lib/token");
const token_1 = require("./lib/token");
const database_1 = require("./lib/database");
const auth_1 = require("./lib/auth");
const database_2 = require("./lib/database");
const crypto_1 = require("crypto");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT;
const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://user:password@127.0.0.1:27017/raccolta_latte?authSource=raccolta_latte/";
const DATABASE = process.env.DATABASE || 'raccolta_latte';
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use(morganMiddleware_1.default);
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`⚡️[server]: Server is running at http://localhost:${port}`);
        if (process.env.NODE_ENV === 'production')
            yield (0, database_1.connect)(CONNECTION_STRING, DATABASE);
        const random_secret = (0, crypto_1.randomBytes)(64).toString('hex');
        let secret = process.env.TOKEN_SECRET || random_secret;
        (0, token_1.setSecret)(secret);
        logger_1.default.info("MongoDB connection successful");
    });
}
exports.startServer = startServer;
app.get('/auth/:username/:password', auth_1.authenticateUser, (req, res) => {
    logger_1.default.debug('Authentication');
    logger_1.default.debug("username " + req.user + ', admin: ' + req.admin);
    const token = (0, token_1.generateAccessToken)(req.user, req.admin);
    res.json(token);
});
app.get('/api', token_1.authenticateToken, (req, res) => {
    res.json({ message: 'Hello from a private endpoint! You need to be authenticated to see this.' });
});
app.post('/api/user', [token_1.authenticateToken, auth_1.checkAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.username === null || req.body.password === null || req.body.admin === null) {
        res.sendStatus(400);
        return;
    }
    const username = req.body.username;
    const password = req.body.password;
    const admin = req.body.admin;
    logger_1.default.debug('Adding user ' + username + ' with password ' + password + ' and admin ' + admin);
    yield (0, database_2.addUser)(username, password, admin);
    res.status(201).send('/api/user/' + username);
}));
app.get('/api/user', [token_1.authenticateToken, auth_1.checkAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, database_2.getUsers)();
    res.json(users);
}));
app.patch('/api/user/:username', [token_1.authenticateToken, auth_1.checkAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.password && !req.body.admin) {
        res.sendStatus(400);
        return;
    }
    const user = yield (0, database_2.getUser)(req.params.username);
    if (!user) {
        res.sendStatus(404);
        return;
    }
    const password = (req.body.password !== null) ? req.body.password : user.password;
    const admin = (req.body.admin !== null) ? req.body.admin : user.admin;
    logger_1.default.debug('Updating user ' + req.params.username + ' with password ' + password + ' and admin ' + admin);
    yield (0, database_2.updateUser)(req.params.username, password, admin);
    res.status(204).send();
}));
app.delete('/api/user/:username', [token_1.authenticateToken, auth_1.checkAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, database_2.getUser)(req.params.username);
    if (!user) {
        res.sendStatus(404);
        return;
    }
    logger_1.default.debug('Deleting user ' + req.params.username);
    yield (0, database_1.deleteUser)(req.params.username);
    res.status(204).send();
}));
if (process.env.NODE_ENV === 'production') {
    https_1.default.createServer({
        key: fs_1.default.readFileSync('key.pem'),
        cert: fs_1.default.readFileSync('cert.pem')
    }, app).listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
        startServer();
    }));
}
