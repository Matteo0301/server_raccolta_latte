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
const express_1 = require("express");
const auth_1 = require("./util/auth");
const logger_1 = __importDefault(require("./util/logger"));
const token_1 = require("./util/token");
const mongoose_1 = require("./mongoose");
const router = (0, express_1.Router)();
router.get('/auth/:username/:password', auth_1.authenticateUser, (req, res) => {
    logger_1.default.debug('Authentication');
    logger_1.default.debug("username " + req.user + ', admin: ' + req.admin);
    const token = { token: (0, token_1.generateAccessToken)(req.user, req.admin) };
    res.json(token);
});
router.post('/', [token_1.authenticateToken, auth_1.checkAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.username === null || req.body.password === null || req.body.admin === null) {
        res.sendStatus(400);
        return;
    }
    const username = req.body.username;
    const password = req.body.password;
    const admin = req.body.admin;
    logger_1.default.debug('Adding user ' + username + ' with password ' + password + ' and admin ' + admin);
    yield (0, mongoose_1.addUser)(username, password, admin);
    res.status(201).send('/users/' + username);
}));
router.get('/', [token_1.authenticateToken, auth_1.checkAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, mongoose_1.getUsers)();
    const r = { users: users };
    res.json(r);
}));
router.patch('/:username', [token_1.authenticateToken, auth_1.checkAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.password && !req.body.admin) {
        res.sendStatus(400);
        return;
    }
    const user = yield (0, mongoose_1.getUser)(req.params.username);
    if (!user) {
        res.sendStatus(404);
        return;
    }
    const password = (req.body.password !== null) ? req.body.password : user.password;
    const admin = (req.body.admin !== null) ? req.body.admin : user.admin;
    logger_1.default.debug('Updating user ' + req.params.username + ' with password ' + password + ' and admin ' + admin);
    yield (0, mongoose_1.updateUser)(req.params.username, password, admin);
    res.status(204).send();
}));
router.delete('/:username', [token_1.authenticateToken, auth_1.checkAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, mongoose_1.getUser)(req.params.username);
    if (!user) {
        res.sendStatus(404);
        return;
    }
    logger_1.default.debug('Deleting user ' + req.params.username);
    yield (0, mongoose_1.deleteUser)(req.params.username);
    res.status(204).send();
}));
exports.default = router;
