import { NoreaBootstrap } from "@noreajs/core";
import apiRoutes from "./api.routes";

const api = new NoreaBootstrap(apiRoutes, {
  appName: "I18n test server",
});

api.start();
