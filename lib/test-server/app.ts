import { NoreaBootstrap } from "@noreajs/core";
import apiRoutes from "./api.routes";
import I18n from "../i18n/I18n";

const i18n = new I18n({
  locales: ["en-US", "en-FR"],
  fallback: "en-fr",
});

i18n.setLocale("en-US");

console.log("say hello", i18n.t("users.index.empty"));

const api = new NoreaBootstrap(apiRoutes, {
  appName: "I18n test server",
  beforeStart: () => {},
});

api.start();
