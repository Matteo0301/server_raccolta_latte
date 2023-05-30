"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: String,
    password: String,
    admin: Boolean
});
const User = (0, mongoose_1.model)('User', UserSchema, 'utenti');
exports.User = User;
