import { NoreaBootstrap } from "@noreajs/core";
import apiRoutes from "./api.routes";
import I18n from "../i18n/I18n";

const i18n = new I18n({
  locales: ["en-US", "en-FR"],
  fallback: "en-fr",
});

const api = new NoreaBootstrap(apiRoutes, {
  appName: "I18n test server",
  beforeStart: async () => {
    await i18n.loadTranslations((data) => {
      i18n.setLocale("en-fr");
      console.log("t:", i18n.t("home.hello"));
    });
  },
  afterStart: () => {
    
  },
});

api.start();
