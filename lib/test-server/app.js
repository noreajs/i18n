"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@noreajs/core");
var api_routes_1 = __importDefault(require("./api.routes"));
var api = new core_1.NoreaBootstrap(api_routes_1.default, {
    appName: "I18n test server",
});
api.start();
