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
const morganMiddleware_1 = __importDefault(require("./lib/util/morganMiddleware"));
const logger_1 = __importDefault(require("./lib/util/logger"));
require("./lib/util/token");
const token_1 = require("./lib/util/token");
const mongoose_1 = require("./lib/mongoose");
const crypto_1 = require("crypto");
const users_1 = __importDefault(require("./lib/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT;
const CONNECTION_STRING = process.env.CONNECTION_STRING || "mongodb://user:password@mongodb:27017/raccolta_latte?authSource=raccolta_latte/";
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`⚡️[server]: Server is running at http://localhost:${port}`);
        if (process.env.NODE_ENV === 'production')
            yield (0, mongoose_1.connect)(CONNECTION_STRING);
        const random_secret = (0, crypto_1.randomBytes)(64).toString('hex');
        let secret = process.env.TOKEN_SECRET || random_secret;
        (0, token_1.setSecret)(secret);
        logger_1.default.info("MongoDB connection successful");
    });
}
exports.startServer = initServer;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use(morganMiddleware_1.default);
app.use('/users', users_1.default);
if (process.env.NODE_ENV === 'production') {
    https_1.default.createServer({
        key: fs_1.default.readFileSync('key.pem'),
        cert: fs_1.default.readFileSync('cert.pem')
    }, app).listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
        initServer();
    }));
}
