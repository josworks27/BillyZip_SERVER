"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const server = index_1.default.listen(index_1.default.get('port'), () => console.log(`BillyZip App Listening on PORT ${index_1.default.get('port')}!`));
exports.default = server;
