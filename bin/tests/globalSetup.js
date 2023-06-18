"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose = __importStar(require("mongoose"));
const config_1 = require("./config");
module.exports = function globalSetup() {
    return __awaiter(this, void 0, void 0, function* () {
        if (config_1.config.Memory) { // Config to decided if an mongodb-memory-server instance should be used
            // it's needed in global space, because we don't want to create a new instance every test-suite
            const instance = yield mongodb_memory_server_1.MongoMemoryServer.create();
            const uri = instance.getUri();
            global.__MONGOINSTANCE = instance;
            process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
        }
        else {
            process.env.MONGO_URI = `mongodb://${config_1.config.IP}:${config_1.config.Port}`;
        }
        // The following is to make sure the database is clean before an test starts
        let res = yield mongoose.connect(`${process.env.MONGO_URI}/${config_1.config.Database}`);
        yield res.connection.db.dropDatabase();
        yield res.disconnect();
    });
};
