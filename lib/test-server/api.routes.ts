import { AppRoutes } from "@noreajs/core";

export default new AppRoutes({
    routes: (app) => {
        app.route("/").get((req, res) => {
            res.status(200).json({
                message: "i18n test server"
            })
        })
    },
    middlewares: (app) => {

    }
})