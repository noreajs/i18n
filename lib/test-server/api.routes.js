"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@noreajs/core");
exports.default = new core_1.AppRoutes({
    routes: function (app) {
        app.route("/").get(function (req, res) {
            res.status(200).json({
                message: "i18n test server"
            });
        });
    },
    middlewares: function (app) {
    }
});
